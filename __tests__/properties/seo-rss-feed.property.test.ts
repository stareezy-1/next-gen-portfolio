// Feature: next-gen-portfolio-platform, Property 30: RSS feed enumerates exactly the published posts
//
// **Validates: Requirements 18.4**
//
// Property 30: RSS feed enumerates exactly the published posts.
// For any set of blog posts:
//   1. rssItems returns exactly one item per post (1:1 mapping)
//   2. Each item has a non-empty title
//   3. Each item has a non-empty link (absolute URL)
//   4. Each item has a non-empty description
//   5. Each item has a non-empty pubDate
//   6. Each item has a non-empty guid
//   7. link and guid are absolute URLs (start with "https://")
//   8. pubDate equals the post's publishDate
//   9. link equals the canonical URL for the post's slug
//
// Tooling: Vitest + fast-check, numRuns = 100.

import { describe, it, expect } from "vitest";
import * as fc from "fast-check";

import { rssItems } from "@/services/seo";
import { SITE_URL } from "@/constants/seo";
import type { BlogPost } from "@/types/content";

// ---------------------------------------------------------------------------
// Arbitraries
// ---------------------------------------------------------------------------

/** Non-empty string (printable, trimmed). */
const nonEmptyStringArb: fc.Arbitrary<string> = fc
  .string({ minLength: 1, maxLength: 80 })
  .map((s) => s.trim())
  .filter((s) => s.length > 0);

/** Valid slug: alphanumeric + hyphens. */
const slugArb: fc.Arbitrary<string> = fc
  .stringMatching(/^[a-z][a-z0-9-]*$/)
  .filter((s) => s.length >= 1 && s.length <= 40);

/** ISO date string (YYYY-MM-DD). */
const isoDateArb: fc.Arbitrary<string> = fc
  .tuple(
    fc.integer({ min: 2000, max: 2024 }),
    fc.integer({ min: 1, max: 12 }),
    fc.integer({ min: 1, max: 28 }),
  )
  .map(
    ([y, m, d]) =>
      `${y}-${String(m).padStart(2, "0")}-${String(d).padStart(2, "0")}`,
  );

/** URL string. */
const urlArb: fc.Arbitrary<string> = slugArb.map(
  (s) => `https://example.com/${s}`,
);

/** Arbitrary BlogPost. */
const blogPostArb: fc.Arbitrary<BlogPost> = fc.record({
  slug: slugArb,
  title: nonEmptyStringArb,
  description: nonEmptyStringArb,
  heroImage: urlArb,
  author: nonEmptyStringArb,
  publishDate: isoDateArb,
  tags: fc.array(nonEmptyStringArb, { minLength: 0, maxLength: 4 }),
  category: nonEmptyStringArb,
  published: fc.boolean(),
  body: fc.string({ minLength: 0, maxLength: 200 }),
});

/** Array of blog posts (0–15 items). */
const blogPostArrayArb: fc.Arbitrary<BlogPost[]> = fc.array(blogPostArb, {
  minLength: 0,
  maxLength: 15,
});

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe("Property 30: RSS feed enumerates exactly the published posts", () => {
  // -------------------------------------------------------------------------
  // Property 1: One item per post (1:1 mapping)
  // -------------------------------------------------------------------------
  it("returns exactly one RSS item per blog post", () => {
    fc.assert(
      fc.property(blogPostArrayArb, (posts) => {
        const items = rssItems(posts);
        expect(
          items.length,
          `rssItems must return ${posts.length} items for ${posts.length} posts, got ${items.length}`,
        ).toBe(posts.length);
      }),
      { numRuns: 100 },
    );
  });

  // -------------------------------------------------------------------------
  // Property 2: Each item has a non-empty title
  // -------------------------------------------------------------------------
  it("each RSS item has a non-empty title", () => {
    fc.assert(
      fc.property(blogPostArrayArb, (posts) => {
        const items = rssItems(posts);
        for (const item of items) {
          expect(
            item.title.length > 0,
            `RSS item title must be non-empty, got: "${item.title}"`,
          ).toBe(true);
        }
      }),
      { numRuns: 100 },
    );
  });

  // -------------------------------------------------------------------------
  // Property 3: Each item has a non-empty link (absolute URL)
  // -------------------------------------------------------------------------
  it("each RSS item has a non-empty link", () => {
    fc.assert(
      fc.property(blogPostArrayArb, (posts) => {
        const items = rssItems(posts);
        for (const item of items) {
          expect(item.link.length > 0, `RSS item link must be non-empty`).toBe(
            true,
          );
        }
      }),
      { numRuns: 100 },
    );
  });

  // -------------------------------------------------------------------------
  // Property 4: Each item has a non-empty description
  // -------------------------------------------------------------------------
  it("each RSS item has a non-empty description", () => {
    fc.assert(
      fc.property(blogPostArrayArb, (posts) => {
        const items = rssItems(posts);
        for (const item of items) {
          expect(
            item.description.length > 0,
            `RSS item description must be non-empty`,
          ).toBe(true);
        }
      }),
      { numRuns: 100 },
    );
  });

  // -------------------------------------------------------------------------
  // Property 5 & 6: Each item has non-empty pubDate and guid
  // -------------------------------------------------------------------------
  it("each RSS item has a non-empty pubDate and guid", () => {
    fc.assert(
      fc.property(blogPostArrayArb, (posts) => {
        const items = rssItems(posts);
        for (const item of items) {
          expect(item.pubDate.length > 0, "pubDate must be non-empty").toBe(
            true,
          );
          expect(item.guid.length > 0, "guid must be non-empty").toBe(true);
        }
      }),
      { numRuns: 100 },
    );
  });

  // -------------------------------------------------------------------------
  // Property 7: link and guid are absolute URLs
  // -------------------------------------------------------------------------
  it("link and guid are absolute URLs starting with https://", () => {
    fc.assert(
      fc.property(blogPostArrayArb, (posts) => {
        const items = rssItems(posts);
        for (const item of items) {
          expect(
            item.link.startsWith("https://"),
            `link "${item.link}" must start with "https://"`,
          ).toBe(true);
          expect(
            item.guid.startsWith("https://"),
            `guid "${item.guid}" must start with "https://"`,
          ).toBe(true);
          expect(
            item.link.startsWith(SITE_URL),
            `link "${item.link}" must start with SITE_URL`,
          ).toBe(true);
          expect(
            item.guid.startsWith(SITE_URL),
            `guid "${item.guid}" must start with SITE_URL`,
          ).toBe(true);
        }
      }),
      { numRuns: 100 },
    );
  });

  // -------------------------------------------------------------------------
  // Property 8: pubDate equals the post's publishDate
  // -------------------------------------------------------------------------
  it("pubDate equals the post's publishDate", () => {
    fc.assert(
      fc.property(blogPostArrayArb, (posts) => {
        const items = rssItems(posts);
        for (let i = 0; i < posts.length; i++) {
          expect(items[i]!.pubDate).toBe(posts[i]!.publishDate);
        }
      }),
      { numRuns: 100 },
    );
  });

  // -------------------------------------------------------------------------
  // Property 9: link equals the canonical URL for the post's slug
  // -------------------------------------------------------------------------
  it("link equals the canonical URL for the post's slug", () => {
    fc.assert(
      fc.property(blogPostArrayArb, (posts) => {
        const items = rssItems(posts);
        for (let i = 0; i < posts.length; i++) {
          const expectedLink = `${SITE_URL}/blog/${posts[i]!.slug}`;
          expect(items[i]!.link).toBe(expectedLink);
          // guid equals link
          expect(items[i]!.guid).toBe(items[i]!.link);
        }
      }),
      { numRuns: 100 },
    );
  });

  // -------------------------------------------------------------------------
  // Spot-check examples
  // -------------------------------------------------------------------------
  describe("spot-check examples", () => {
    it("empty post array returns empty items", () => {
      expect(rssItems([])).toEqual([]);
    });

    it("single post maps correctly", () => {
      const post: BlogPost = {
        slug: "hello-world",
        title: "Hello World",
        description: "My first post",
        heroImage: "https://example.com/img.jpg",
        author: "Reko",
        publishDate: "2024-01-15",
        tags: ["intro"],
        category: "general",
        published: true,
        body: "Content here",
      };
      const [item] = rssItems([post]);
      expect(item!.title).toBe("Hello World");
      expect(item!.link).toBe(`${SITE_URL}/blog/hello-world`);
      expect(item!.guid).toBe(`${SITE_URL}/blog/hello-world`);
      expect(item!.pubDate).toBe("2024-01-15");
      expect(item!.description).toBe("My first post");
    });
  });
});
