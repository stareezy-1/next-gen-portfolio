// Feature: next-gen-portfolio-platform, Property 18: Blog search returns exactly the matching posts
//
// Validates: Requirements 13.2, 13.6
//
// Property 18: Blog search returns exactly the matching posts.
// For any set of Blog Posts and any search query, `searchPosts` returns exactly
// the posts whose indexed text matches the query:
//   - soundness:     every returned post matches the query, and
//   - completeness:  every post whose indexed text matches the query is returned.
// When no post matches a non-empty query, the result is empty (the
// empty-results state of Requirement 13.6). An empty/whitespace query matches
// every post (no search).
//
// Oracle: the indexed-text predicate is reimplemented INDEPENDENTLY in this
// test — a post matches iff
//   [title, description, ...tags, category, body]
//     .join(" ").toLowerCase().includes(q.trim().toLowerCase())
// with an empty/whitespace query matching all posts. The test asserts that
// `searchPosts(posts, q)` equals exactly the set the oracle accepts.
//
// Query mix (per generated case): sometimes a real substring of some post's
// indexed text (a guaranteed hit, exercised in mixed case to prove
// case-insensitivity), sometimes random/unlikely text (usually a miss), and
// sometimes empty/whitespace (matches all). A dedicated test pins the
// empty-results case: a query that cannot occur in any post yields `[]`.
//
// Tooling: Vitest + fast-check, numRuns = 200.
import { describe, expect, it } from "vitest";
import * as fc from "fast-check";

import { searchPosts } from "@/lib/blog";
import type { BlogPost } from "@/types";

// ---------------------------------------------------------------------------
// Independent oracle — DO NOT import the implementation's `indexedText`.
// ---------------------------------------------------------------------------

/** Reimplements the indexed text the search matches against (the oracle). */
function oracleIndexedText(post: BlogPost): string {
  return [post.title, post.description, ...post.tags, post.category, post.body]
    .join(" ")
    .toLowerCase();
}

/** The oracle predicate: does `post` match query `q`? */
function oracleMatches(post: BlogPost, q: string): boolean {
  const needle = q.trim().toLowerCase();
  if (needle.length === 0) {
    // Empty/whitespace query is "no search" → every post matches.
    return true;
  }
  return oracleIndexedText(post).includes(needle);
}

// ---------------------------------------------------------------------------
// Generators
// ---------------------------------------------------------------------------

// A small word pool with mixed casing so generated text varies and queries
// sometimes hit and sometimes miss. Mixed case lets the substring-hit query
// (drawn from the lower-cased indexed text) prove case-insensitive matching.
const WORD_POOL = [
  "Alpha",
  "alpha",
  "Beta",
  "GAMMA",
  "delta",
  "React",
  "react",
  "Next",
  "node",
  "Type",
  "test",
  "Blog",
  "seo",
  "MDX",
];

const wordArb = fc.constantFrom(...WORD_POOL);

/** A short space-joined phrase drawn from the word pool (may be empty). */
function phraseArb(maxWords: number): fc.Arbitrary<string> {
  return fc
    .array(wordArb, { minLength: 0, maxLength: maxWords })
    .map((words) => words.join(" "));
}

const blogPostArb: fc.Arbitrary<BlogPost> = fc.record({
  // Fields NOT part of the indexed text — kept realistic but search-irrelevant.
  slug: fc.hexaString({ minLength: 1, maxLength: 8 }),
  heroImage: fc.constant("/images/hero.png"),
  author: fc.constantFrom("Ada", "Linus", "Grace"),
  publishDate: fc.constant("2024-01-01"),
  published: fc.boolean(),
  // Indexed fields — drawn from the word pool so queries can hit or miss.
  title: phraseArb(4),
  description: phraseArb(6),
  tags: fc.array(wordArb, { maxLength: 3 }),
  category: wordArb,
  body: phraseArb(10),
});

const postsArb = fc.array(blogPostArb, { minLength: 0, maxLength: 8 });

/** Tokens that never appear in `WORD_POOL` (or its lower-cased form). */
const MISS_POOL = ["zzqq", "qxqx", "wzwz", "vvvv"];

/**
 * A query that is a real, non-empty substring of some post's (lower-cased)
 * indexed text — a guaranteed oracle hit. The substring is sometimes
 * upper-cased so the test also proves matching is case-insensitive. Falls back
 * to a pool word when no post has indexable text (e.g. all indexed fields empty).
 */
function substringHitArb(posts: BlogPost[]): fc.Arbitrary<string> {
  const indexed = posts
    .map(oracleIndexedText)
    .filter((text) => text.trim().length > 0);

  if (indexed.length === 0) {
    return fc.constantFrom(...WORD_POOL);
  }

  return fc.integer({ min: 0, max: indexed.length - 1 }).chain((postIdx) => {
    const text = indexed[postIdx] ?? "";
    const max = Math.max(text.length - 1, 0);
    return fc
      .record({
        start: fc.integer({ min: 0, max }),
        // Bias toward longer, more meaningful substrings.
        len: fc.integer({ min: 1, max: Math.max(text.length, 1) }),
        upper: fc.boolean(),
      })
      .map(({ start, len, upper }) => {
        const slice = text.substring(start, start + len);
        return upper ? slice.toUpperCase() : slice;
      });
  });
}

/** An empty or whitespace-only query (the "no search" case). */
const blankQueryArb = fc.constantFrom("", " ", "   ", "\t", "\n", "  \t ");

/** Random / unlikely text — usually (but not necessarily) a miss. */
const randomQueryArb = fc.oneof(
  fc.string({ maxLength: 6 }),
  fc
    .array(fc.constantFrom(...MISS_POOL), { minLength: 1, maxLength: 3 })
    .map((w) => w.join(" ")),
);

/** A post set paired with a query drawn from the full query mix. */
const scenarioArb: fc.Arbitrary<{ posts: BlogPost[]; q: string }> =
  postsArb.chain((posts) =>
    fc
      .oneof(blankQueryArb, randomQueryArb, substringHitArb(posts))
      .map((q) => ({ posts, q })),
  );

// ---------------------------------------------------------------------------
// Property
// ---------------------------------------------------------------------------

describe("Property 18: blog search returns exactly the matching posts", () => {
  it("returns exactly the posts whose indexed text matches the query", () => {
    fc.assert(
      fc.property(scenarioArb, ({ posts, q }) => {
        const actual = searchPosts(posts, q);
        const expected = posts.filter((post) => oracleMatches(post, q));

        // Soundness: every returned post matches the query per the oracle.
        for (const post of actual) {
          expect(oracleMatches(post, q)).toBe(true);
        }

        // Completeness (+ order + no extras/duplicates): the returned posts are
        // exactly the oracle-matching posts, in their original relative order.
        expect(actual).toEqual(expected);

        // searchPosts must not mutate or alias-shrink its input.
        expect(actual.length).toBeLessThanOrEqual(posts.length);
      }),
      { numRuns: 200 },
    );
  });

  it("yields an empty result (empty-results state) when no post matches", () => {
    // `~` never appears in any indexed field (the word pool has no `~`), so a
    // query containing it cannot be a substring of any post's indexed text.
    const sentinel = "~~no-such-post~~";

    fc.assert(
      fc.property(postsArb, (posts) => {
        const result = searchPosts(posts, sentinel);
        expect(result).toEqual([]);
      }),
      { numRuns: 100 },
    );
  });
});
