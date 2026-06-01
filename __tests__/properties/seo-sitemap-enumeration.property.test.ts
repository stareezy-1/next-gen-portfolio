// Feature: next-gen-portfolio-platform, Property 28: Sitemap enumerates every indexable URL
//
// **Validates: Requirements 18.1, 18.6**
//
// Property 28: Sitemap enumerates every indexable URL.
// For any set of blog slugs and project slugs:
//   1. Every blog slug appears in the sitemap as an absolute URL
//   2. Every project slug appears in the sitemap as an absolute URL
//   3. All six primary routes appear in the sitemap
//   4. All URLs are absolute (start with SITE_URL)
//   5. No duplicate URLs exist in the sitemap
//
// Tooling: Vitest + fast-check, numRuns = 100.

import { describe, it, expect } from "vitest";
import * as fc from "fast-check";

import { sitemapEntries } from "@/services/seo";
import { SITE_URL } from "@/constants/seo";
import { ROUTES } from "@/constants/routes";

// ---------------------------------------------------------------------------
// Arbitraries
// ---------------------------------------------------------------------------

/** Valid URL slug: alphanumeric + hyphens, non-empty. */
const slugArb: fc.Arbitrary<string> = fc
  .stringMatching(/^[a-z][a-z0-9-]*$/)
  .filter((s) => s.length >= 1 && s.length <= 40);

/** Array of unique slugs (no duplicates within the array). */
const uniqueSlugArrayArb: fc.Arbitrary<string[]> = fc
  .array(slugArb, { minLength: 0, maxLength: 10 })
  .map((slugs) => [...new Set(slugs)]);

/** Pair of blog slugs and project slugs. */
const slugPairArb: fc.Arbitrary<{
  blogSlugs: string[];
  projectSlugs: string[];
}> = fc.record({
  blogSlugs: uniqueSlugArrayArb,
  projectSlugs: uniqueSlugArrayArb,
});

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** All six primary route paths. */
const PRIMARY_ROUTES = Object.values(ROUTES) as string[];

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe("Property 28: Sitemap enumerates every indexable URL", () => {
  // -------------------------------------------------------------------------
  // Property 1: Every blog slug appears in the sitemap
  // -------------------------------------------------------------------------
  it("every blog slug appears in the sitemap as an absolute URL", () => {
    fc.assert(
      fc.property(slugPairArb, ({ blogSlugs, projectSlugs }) => {
        const entries = sitemapEntries({ blogSlugs, projectSlugs });
        const urls = entries.map((e) => e.url);

        for (const slug of blogSlugs) {
          const expectedUrl = `${SITE_URL}/blog/${slug}`;
          expect(
            urls,
            `Blog slug "${slug}" must appear in sitemap as "${expectedUrl}"`,
          ).toContain(expectedUrl);
        }
      }),
      { numRuns: 100 },
    );
  });

  // -------------------------------------------------------------------------
  // Property 2: Every project slug appears in the sitemap
  // -------------------------------------------------------------------------
  it("every project slug appears in the sitemap as an absolute URL", () => {
    fc.assert(
      fc.property(slugPairArb, ({ blogSlugs, projectSlugs }) => {
        const entries = sitemapEntries({ blogSlugs, projectSlugs });
        const urls = entries.map((e) => e.url);

        for (const slug of projectSlugs) {
          const expectedUrl = `${SITE_URL}/projects/${slug}`;
          expect(
            urls,
            `Project slug "${slug}" must appear in sitemap as "${expectedUrl}"`,
          ).toContain(expectedUrl);
        }
      }),
      { numRuns: 100 },
    );
  });

  // -------------------------------------------------------------------------
  // Property 3: All six primary routes appear in the sitemap
  // -------------------------------------------------------------------------
  it("all six primary routes appear in the sitemap", () => {
    fc.assert(
      fc.property(slugPairArb, ({ blogSlugs, projectSlugs }) => {
        const entries = sitemapEntries({ blogSlugs, projectSlugs });
        const urls = entries.map((e) => e.url);

        for (const route of PRIMARY_ROUTES) {
          // Root "/" maps to SITE_URL; others map to SITE_URL + route
          const expectedUrl = route === "/" ? SITE_URL : `${SITE_URL}${route}`;
          expect(
            urls,
            `Primary route "${route}" must appear in sitemap as "${expectedUrl}"`,
          ).toContain(expectedUrl);
        }
      }),
      { numRuns: 100 },
    );
  });

  // -------------------------------------------------------------------------
  // Property 4: All URLs are absolute (start with SITE_URL)
  // -------------------------------------------------------------------------
  it("all sitemap URLs are absolute and start with SITE_URL", () => {
    fc.assert(
      fc.property(slugPairArb, ({ blogSlugs, projectSlugs }) => {
        const entries = sitemapEntries({ blogSlugs, projectSlugs });

        for (const entry of entries) {
          expect(
            entry.url.startsWith(SITE_URL),
            `Sitemap URL "${entry.url}" must start with SITE_URL "${SITE_URL}"`,
          ).toBe(true);
        }
      }),
      { numRuns: 100 },
    );
  });

  // -------------------------------------------------------------------------
  // Property 5: No duplicate URLs in the sitemap
  // -------------------------------------------------------------------------
  it("no duplicate URLs exist in the sitemap", () => {
    fc.assert(
      fc.property(slugPairArb, ({ blogSlugs, projectSlugs }) => {
        const entries = sitemapEntries({ blogSlugs, projectSlugs });
        const urls = entries.map((e) => e.url);
        const uniqueUrls = new Set(urls);

        expect(
          uniqueUrls.size,
          `Sitemap has ${urls.length} entries but only ${uniqueUrls.size} unique URLs — duplicates found`,
        ).toBe(urls.length);
      }),
      { numRuns: 100 },
    );
  });

  // -------------------------------------------------------------------------
  // Spot-check examples
  // -------------------------------------------------------------------------
  describe("spot-check examples", () => {
    it("empty slugs still includes all primary routes", () => {
      const entries = sitemapEntries({ blogSlugs: [], projectSlugs: [] });
      const urls = entries.map((e) => e.url);
      expect(urls).toContain(SITE_URL); // home "/"
      expect(urls).toContain(`${SITE_URL}/about`);
      expect(urls).toContain(`${SITE_URL}/experience`);
      expect(urls).toContain(`${SITE_URL}/projects`);
      expect(urls).toContain(`${SITE_URL}/blog`);
      expect(urls).toContain(`${SITE_URL}/contact`);
    });

    it("blog slug 'hello-world' appears as expected URL", () => {
      const entries = sitemapEntries({
        blogSlugs: ["hello-world"],
        projectSlugs: [],
      });
      const urls = entries.map((e) => e.url);
      expect(urls).toContain(`${SITE_URL}/blog/hello-world`);
    });

    it("project slug 'my-app' appears as expected URL", () => {
      const entries = sitemapEntries({
        blogSlugs: [],
        projectSlugs: ["my-app"],
      });
      const urls = entries.map((e) => e.url);
      expect(urls).toContain(`${SITE_URL}/projects/my-app`);
    });

    it("total count equals 6 primary + blog count + project count", () => {
      const blogSlugs = ["post-1", "post-2"];
      const projectSlugs = ["proj-a", "proj-b", "proj-c"];
      const entries = sitemapEntries({ blogSlugs, projectSlugs });
      expect(entries.length).toBe(6 + blogSlugs.length + projectSlugs.length);
    });
  });
});
