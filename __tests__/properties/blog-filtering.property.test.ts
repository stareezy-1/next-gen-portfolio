// Feature: next-gen-portfolio-platform, Property 17: Blog filtering returns only matching posts
//
// **Validates: Requirements 13.1, 13.3**
//
// Property 17: Blog filtering returns only matching posts.
// For any set of blog posts and any combination of active filters (published
// status, tag, category), every post in the filtered result satisfies all
// active filter criteria (soundness), and every post satisfying all criteria
// appears in the result (completeness).
//
// Contract under test (`@/lib/blog`):
//   filterPosts(posts, tag?, category?): BlogPost[]
//     - conjunctive AND over the *active* filters (an argument is active when
//       it is not `undefined`);
//     - `tag` active  → keep posts whose `tags` array includes that exact tag;
//     - `category` active → keep posts whose `category` equals that exact value;
//     - no active filters → all posts (a defensive copy), original order kept;
//     - never mutates its input; preserves element identity (slice/filter).
//   publishedOnly(posts): BlogPost[]
//     - keeps exactly the posts whose `published` flag is `true`.
//
// The published-status dimension lives in `publishedOnly` (the Blog listing
// restricts its corpus to published posts before applying reader-selected
// tag/category facets). This test therefore exercises all three dimensions:
//   - `filterPosts` for the tag + category facets,
//   - `publishedOnly` for the published facet,
//   - and their composition `filterPosts(publishedOnly(posts), tag, category)`
//     for the full conjunction.
//
// Generated scenario:
//   - a BlogPost[] whose `tags` are drawn from a small pool, whose `category`
//     is drawn from a small pool, and whose `published` flag is arbitrary —
//     small pools force frequent matches and non-matches;
//   - each post gets a unique, index-derived `slug` so identity comparisons are
//     unambiguous;
//   - optional `tag`/`category` filter values that are sometimes `undefined`
//     (inactive), sometimes a pool value (often matching), and sometimes a
//     value absent from the pool (guaranteed non-matching).
//
// All membership checks compare by reference (object identity via Set), so the
// soundness/completeness assertions are exact set equalities.
//
// Tooling: Vitest + fast-check, numRuns = 100.
import { describe, expect, it } from "vitest";
import * as fc from "fast-check";

import { filterPosts, publishedOnly } from "@/lib/blog";
import type { BlogPost } from "@/types";

// --- Pools ------------------------------------------------------------------

/** Small tag pool so generated posts and filters collide frequently. */
const TAG_POOL = ["react", "typescript", "css", "node"] as const;
/** Small category pool so category filters match a meaningful share of posts. */
const CATEGORY_POOL = ["frontend", "backend", "devops"] as const;
/** A tag absent from every post — a guaranteed non-matching filter value. */
const ABSENT_TAG = "__no-such-tag__";
/** A category absent from every post — a guaranteed non-matching filter value. */
const ABSENT_CATEGORY = "__no-such-category__";

// --- Arbitraries ------------------------------------------------------------

/** A short single-line text value for scalar string fields. */
const text = fc
  .array(fc.constantFrom("alpha", "beta", "gamma", "delta", "42", "résumé"), {
    minLength: 0,
    maxLength: 3,
  })
  .map((ws) => ws.join(" "));

/** A BlogPost with pool-drawn tags/category; `slug` is overwritten per-index. */
const basePostArb: fc.Arbitrary<BlogPost> = fc.record({
  slug: text,
  title: text,
  description: text,
  heroImage: text,
  author: text,
  publishDate: fc
    .date({
      min: new Date("1970-01-01T00:00:00.000Z"),
      max: new Date("2100-12-31T00:00:00.000Z"),
    })
    .map((d) => d.toISOString().slice(0, 10)),
  tags: fc.uniqueArray(fc.constantFrom(...TAG_POOL), {
    minLength: 0,
    maxLength: TAG_POOL.length,
  }),
  category: fc.constantFrom(...CATEGORY_POOL),
  published: fc.boolean(),
  body: text,
});

/**
 * An optional filter value: `undefined` (inactive), a pool value (often
 * matching), or an out-of-pool value (guaranteed non-matching).
 */
const tagFilterArb = fc.oneof(
  fc.constant(undefined),
  fc.constantFrom(...TAG_POOL),
  fc.constant(ABSENT_TAG),
);
const categoryFilterArb = fc.oneof(
  fc.constant(undefined),
  fc.constantFrom(...CATEGORY_POOL),
  fc.constant(ABSENT_CATEGORY),
);

/** A filtering scenario: a distinguishable post list plus optional filters. */
const scenarioArb = fc.record({
  posts: fc
    .array(basePostArb, { minLength: 0, maxLength: 40 })
    .map((posts) => posts.map((p, i) => ({ ...p, slug: `post-${i}` }))),
  tag: tagFilterArb,
  category: categoryFilterArb,
});

// --- Oracle -----------------------------------------------------------------

/** True iff `post` satisfies every *active* tag/category filter. */
function matchesFacets(
  post: BlogPost,
  tag: string | undefined,
  category: string | undefined,
): boolean {
  if (tag !== undefined && !post.tags.includes(tag)) return false;
  if (category !== undefined && post.category !== category) return false;
  return true;
}

describe("Property 17: blog filtering returns only matching posts", () => {
  it("filterPosts and publishedOnly are sound and complete over their active filters", () => {
    fc.assert(
      fc.property(scenarioArb, ({ posts, tag, category }) => {
        // --- tag + category facets via filterPosts -----------------------
        const result = filterPosts(posts, tag, category);
        const resultSet = new Set(result);

        // (1) Soundness: every returned post satisfies all active filters.
        for (const post of result) {
          expect(matchesFacets(post, tag, category)).toBe(true);
        }

        // (2) Completeness: every input post satisfying all active filters is
        //     present in the result (compared by reference / identity).
        for (const post of posts) {
          if (matchesFacets(post, tag, category)) {
            expect(resultSet.has(post)).toBe(true);
          }
        }

        // Exact set equality: result holds neither extra nor missing posts.
        const expectedCount = posts.filter((p) =>
          matchesFacets(p, tag, category),
        ).length;
        expect(resultSet.size).toBe(expectedCount);
        expect(result.length).toBe(expectedCount);

        // --- published facet via publishedOnly ---------------------------
        const published = publishedOnly(posts);
        const publishedSet = new Set(published);

        // Soundness: every returned post has published === true.
        for (const post of published) {
          expect(post.published).toBe(true);
        }
        // Completeness: every published input post is returned.
        for (const post of posts) {
          if (post.published) {
            expect(publishedSet.has(post)).toBe(true);
          }
        }

        // --- full conjunction: published + tag + category ----------------
        const composed = filterPosts(publishedOnly(posts), tag, category);
        const composedSet = new Set(composed);
        const fullyMatches = (post: BlogPost) =>
          post.published && matchesFacets(post, tag, category);

        // Soundness: every returned post satisfies all three active filters.
        for (const post of composed) {
          expect(fullyMatches(post)).toBe(true);
        }
        // Completeness: every input post satisfying all three is returned.
        for (const post of posts) {
          if (fullyMatches(post)) {
            expect(composedSet.has(post)).toBe(true);
          }
        }
        const expectedComposed = posts.filter(fullyMatches).length;
        expect(composedSet.size).toBe(expectedComposed);
        expect(composed.length).toBe(expectedComposed);
      }),
      { numRuns: 100 },
    );
  });
});
