// Feature: next-gen-portfolio-platform, Property 9: Blog preview shows the most recent posts
//
// **Validates: Requirements 7.5**
//
// Property 9: Blog preview shows the most recent posts.
// For any set of published blog posts and count N, the result contains the N
// most recent by publishDate, is sorted descending by publishDate, has length
// min(N, posts.length), and every post in the result has a publishDate ≥ every
// post NOT in the result.
//
// Contracts under test (getRecentBlogPosts from @/features/home/selectors):
//
//   1. For any set of posts and count N, result length is min(N, posts.length).
//   2. Result is sorted descending by publishDate.
//   3. Every post in the result has publishDate ≥ every post NOT in the result.
//   4. Result contains no duplicates.
//
// Strategy:
//   Generate arbitrary arrays of BlogPost values with distinct publishDates
//   and arbitrary counts. Run getRecentBlogPosts and assert all invariants.
//
// Tooling: Vitest + fast-check, numRuns = 100.

import { describe, it, expect } from "vitest";
import * as fc from "fast-check";

import { getRecentBlogPosts } from "@/features/home/selectors";
import type { BlogPost } from "@/types/content";

// ---------------------------------------------------------------------------
// Arbitraries
// ---------------------------------------------------------------------------

/** Non-empty string (printable, trimmed). */
const nonEmptyStringArb: fc.Arbitrary<string> = fc
  .string({ minLength: 1, maxLength: 40 })
  .map((s) => s.trim())
  .filter((s) => s.length > 0);

/** URL string. */
const urlArb: fc.Arbitrary<string> = nonEmptyStringArb.map(
  (s) => `https://example.com/${s.replace(/\s/g, "-")}`,
);

/** Non-empty array of non-empty strings. */
const nonEmptyStringArrayArb: fc.Arbitrary<string[]> = fc.array(
  nonEmptyStringArb,
  { minLength: 1, maxLength: 4 },
);

/**
 * ISO date string (YYYY-MM-DD) with a wide range to ensure variety.
 * Uses a fixed range so dates are always valid and comparable.
 */
const isoDateArb: fc.Arbitrary<string> = fc
  .tuple(
    fc.integer({ min: 2000, max: 2030 }),
    fc.integer({ min: 1, max: 12 }),
    fc.integer({ min: 1, max: 28 }),
  )
  .map(
    ([y, m, d]) =>
      `${y}-${String(m).padStart(2, "0")}-${String(d).padStart(2, "0")}`,
  );

/** Arbitrary BlogPost. */
const blogPostArb: fc.Arbitrary<BlogPost> = fc.record({
  slug: nonEmptyStringArb.map((s) => s.replace(/\s/g, "-").toLowerCase()),
  title: nonEmptyStringArb,
  description: nonEmptyStringArb,
  heroImage: urlArb,
  author: nonEmptyStringArb,
  publishDate: isoDateArb,
  tags: nonEmptyStringArrayArb,
  category: nonEmptyStringArb,
  published: fc.boolean(),
  body: nonEmptyStringArb,
});

/** Arbitrary array of blog posts (0–20 items). */
const blogPostsArb: fc.Arbitrary<BlogPost[]> = fc.array(blogPostArb, {
  minLength: 0,
  maxLength: 20,
});

/** Arbitrary count (0–15). */
const countArb: fc.Arbitrary<number> = fc.integer({ min: 0, max: 15 });

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Parses an ISO date string to epoch milliseconds for comparison. */
function toMillis(date: string): number {
  return new Date(date).getTime();
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe("Property 9: Blog preview shows the most recent posts", () => {
  it("result length is min(count, posts.length)", () => {
    fc.assert(
      fc.property(blogPostsArb, countArb, (posts, count) => {
        const result = getRecentBlogPosts(posts, count);
        const expectedLength = Math.min(count, posts.length);

        expect(
          result.length,
          `Expected result length ${expectedLength} (min(${count}, ${posts.length})), got ${result.length}`,
        ).toBe(expectedLength);
      }),
      { numRuns: 100 },
    );
  });

  it("result is sorted descending by publishDate", () => {
    fc.assert(
      fc.property(blogPostsArb, countArb, (posts, count) => {
        const result = getRecentBlogPosts(posts, count);

        for (let i = 0; i < result.length - 1; i++) {
          const current = result[i]!;
          const next = result[i + 1]!;
          const currentMs = toMillis(current.publishDate);
          const nextMs = toMillis(next.publishDate);

          expect(
            currentMs,
            `result[${i}].publishDate (${
              current.publishDate
            }) must be ≥ result[${i + 1}].publishDate (${next.publishDate})`,
          ).toBeGreaterThanOrEqual(nextMs);
        }
      }),
      { numRuns: 100 },
    );
  });

  it("every post in the result has publishDate ≥ every post NOT in the result", () => {
    fc.assert(
      fc.property(blogPostsArb, countArb, (posts, count) => {
        const result = getRecentBlogPosts(posts, count);

        // Only meaningful when there are both included and excluded posts
        if (result.length === 0 || result.length === posts.length) {
          return;
        }

        const resultSlugs = new Set(result.map((p) => p.slug));
        const excluded = posts.filter((p) => !resultSlugs.has(p.slug));

        // Find the minimum publishDate in the result
        const minResultMs = Math.min(
          ...result.map((p) => toMillis(p.publishDate)),
        );

        for (const excludedPost of excluded) {
          const excludedMs = toMillis(excludedPost.publishDate);

          expect(
            minResultMs,
            `Minimum result publishDate must be ≥ excluded post "${excludedPost.slug}" publishDate (${excludedPost.publishDate})`,
          ).toBeGreaterThanOrEqual(excludedMs);
        }
      }),
      { numRuns: 100 },
    );
  });

  it("result contains no duplicate slugs", () => {
    fc.assert(
      fc.property(blogPostsArb, countArb, (posts, count) => {
        const result = getRecentBlogPosts(posts, count);
        const slugs = result.map((p) => p.slug);
        const uniqueSlugs = new Set(slugs);

        // Duplicates in the result would only arise if the input had duplicates
        // and the function introduced them — verify the result has no more
        // duplicates than the input.
        const inputSlugCounts = new Map<string, number>();
        for (const p of posts) {
          inputSlugCounts.set(p.slug, (inputSlugCounts.get(p.slug) ?? 0) + 1);
        }

        // If all input slugs are unique, result slugs must also be unique
        const inputHasDuplicates = inputSlugCounts.size < posts.length;
        if (!inputHasDuplicates) {
          expect(
            uniqueSlugs.size,
            "Result must not contain duplicate slugs when input has no duplicates",
          ).toBe(result.length);
        }
      }),
      { numRuns: 100 },
    );
  });

  it("returns empty array when count is 0", () => {
    fc.assert(
      fc.property(blogPostsArb, (posts) => {
        const result = getRecentBlogPosts(posts, 0);

        expect(
          result.length,
          "getRecentBlogPosts with count=0 must return an empty array",
        ).toBe(0);
      }),
      { numRuns: 100 },
    );
  });

  it("returns all posts when count ≥ posts.length", () => {
    fc.assert(
      fc.property(
        blogPostsArb.filter((posts) => posts.length > 0),
        (posts) => {
          const count =
            posts.length + fc.sample(fc.integer({ min: 0, max: 10 }), 1)[0]!;
          const result = getRecentBlogPosts(posts, count);

          expect(
            result.length,
            `When count (${count}) ≥ posts.length (${posts.length}), all posts must be returned`,
          ).toBe(posts.length);
        },
      ),
      { numRuns: 100 },
    );
  });

  it("does not mutate the input array", () => {
    fc.assert(
      fc.property(blogPostsArb, countArb, (posts, count) => {
        const originalOrder = posts.map((p) => p.slug);
        getRecentBlogPosts(posts, count);
        const afterOrder = posts.map((p) => p.slug);

        expect(
          afterOrder,
          "getRecentBlogPosts must not mutate the input array",
        ).toEqual(originalOrder);
      }),
      { numRuns: 100 },
    );
  });
});
