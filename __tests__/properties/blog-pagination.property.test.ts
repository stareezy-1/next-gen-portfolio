// Feature: next-gen-portfolio-platform, Property 19: Blog pagination partitions posts into bounded pages
//
// **Validates: Requirements 13.4, 13.5**
//
// Property 19: Blog pagination partitions posts into bounded pages.
// For any set of blog posts and configured page size, each page contains at
// most the page-size number of posts, the pages in order concatenate to the
// full ordered post list with no duplicates or omissions, and requesting a
// given page number returns that page's slice.
//
// Contract under test (`@/lib/blog`):
//   paginate(posts, page, size?): BlogPage { posts, page, totalPages, pageSize }
//   - `size` defaults to BLOG_PAGE_SIZE; this test always supplies a positive
//     integer size so `pageSize === size` (the source floors size, a no-op for
//     integers).
//   - `totalPages === ceil(posts.length / size)`.
//   - the requested `page` is clamped into [1, max(totalPages, 1)].
//   - an empty post list yields `totalPages === 0` and an empty slice.
//   - the returned slice is `posts.slice((clampedPage-1)*size, clampedPage*size)`,
//     and `slice` preserves element identity, so order/dup checks compare by
//     reference.
//
// Generated scenario:
//   - a BlogPost[] of varied length (including empty and single) whose posts are
//     distinguishable by a unique, index-derived `slug` so order/dup/omission
//     checks by identity are meaningful;
//   - a positive integer `size`;
//   - a `page` number spanning below 1, the valid range, and beyond totalPages
//     so the clamping behavior is exercised.
//
// Tooling: Vitest + fast-check, numRuns = 100.
import { describe, expect, it } from "vitest";
import * as fc from "fast-check";

import { paginate } from "@/lib/blog";
import type { BlogPost } from "@/types";

// --- BlogPost arbitrary -----------------------------------------------------

/** A short single-line text value for scalar string fields. */
const text = fc
  .array(fc.constantFrom("alpha", "beta", "gamma", "delta", "42", "résumé"), {
    minLength: 0,
    maxLength: 3,
  })
  .map((ws) => ws.join(" "));

/** A BlogPost with arbitrary content; `slug` is overwritten per-index below. */
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
  tags: fc.array(text, { minLength: 0, maxLength: 3 }),
  category: text,
  published: fc.boolean(),
  body: text,
});

/**
 * A pagination scenario: a distinguishable post list, a positive page size, and
 * a (possibly out-of-range) requested page number.
 *
 * Each post is assigned a unique `slug` (`post-<index>`) so that identity AND
 * structural comparisons can detect any duplicate or omitted post.
 */
const scenarioArb = fc.record({
  posts: fc
    .array(basePostArb, { minLength: 0, maxLength: 40 })
    .map((posts) => posts.map((p, i) => ({ ...p, slug: `post-${i}` }))),
  size: fc.integer({ min: 1, max: 12 }),
  page: fc.integer({ min: -5, max: 60 }),
});

describe("Property 19: blog pagination partitions posts into bounded pages", () => {
  it("paginate yields bounded pages that concatenate to the full ordered list", () => {
    fc.assert(
      fc.property(scenarioArb, ({ posts, size, page }) => {
        const expectedTotalPages = Math.ceil(posts.length / size);

        const result = paginate(posts, page, size);

        // (3) totalPages === ceil(length / size); pageSize echoes the size used.
        expect(result.totalPages).toBe(expectedTotalPages);
        expect(result.pageSize).toBe(size);

        // (5) empty posts → totalPages 0 and an empty slice.
        if (posts.length === 0) {
          expect(result.totalPages).toBe(0);
          expect(result.posts).toEqual([]);
        }

        // (4) requesting a page returns that page's slice (clamped to range),
        //     compared by reference/identity.
        const clampedPage = Math.min(
          Math.max(Math.floor(page), 1),
          Math.max(expectedTotalPages, 1),
        );
        expect(result.page).toBe(clampedPage);

        const expectedSlice = posts.slice(
          (clampedPage - 1) * size,
          clampedPage * size,
        );
        expect(result.posts.length).toBe(expectedSlice.length);
        result.posts.forEach((post, i) => {
          expect(post).toBe(expectedSlice[i]);
        });

        // (1) every valid page holds at most `size` posts, and
        // (2) concatenating pages 1..totalPages reproduces `posts` exactly in
        //     order with no duplicates or omissions (compared by identity).
        const concatenated: BlogPost[] = [];
        for (let p = 1; p <= expectedTotalPages; p += 1) {
          const pageResult = paginate(posts, p, size);
          expect(pageResult.posts.length).toBeLessThanOrEqual(size);
          concatenated.push(...pageResult.posts);
        }

        expect(concatenated.length).toBe(posts.length);
        concatenated.forEach((post, i) => {
          expect(post).toBe(posts[i]);
        });
      }),
      { numRuns: 100 },
    );
  });
});
