// Feature: next-gen-portfolio-platform, Property 29: Every route has title and description metadata
//
// **Validates: Requirements 18.3**
//
// Property 29: Every route has title and description metadata.
// For any RouteDescriptor with title and description:
//   1. The result has a non-empty title
//   2. The result has a non-empty description
//   3. The result has a canonical URL in alternates
//   4. The canonical URL is absolute (starts with "https://")
//   5. The title and description match the input values exactly
//
// Tooling: Vitest + fast-check, numRuns = 100.

import { describe, it, expect } from "vitest";
import * as fc from "fast-check";

import { buildMetadata } from "@/services/seo";
import { SITE_URL } from "@/constants/seo";
import type { RouteDescriptor } from "@/types/seo";

// ---------------------------------------------------------------------------
// Arbitraries
// ---------------------------------------------------------------------------

/** Non-empty string (printable, trimmed). */
const nonEmptyStringArb: fc.Arbitrary<string> = fc
  .string({ minLength: 1, maxLength: 80 })
  .map((s) => s.trim())
  .filter((s) => s.length > 0);

/** Valid URL path segment. */
const slugSegmentArb: fc.Arbitrary<string> = fc
  .stringMatching(/^[a-z0-9][a-z0-9-_]*$/)
  .filter((s) => s.length >= 1 && s.length <= 30);

/** A route path: either "/" or a multi-segment path like "/blog/post". */
const routePathArb: fc.Arbitrary<string> = fc.oneof(
  fc.constant("/"),
  fc
    .array(slugSegmentArb, { minLength: 1, maxLength: 3 })
    .map((segs) => `/${segs.join("/")}`),
);

/** Optional OG image path. */
const ogImageArb: fc.Arbitrary<string | undefined> = fc.option(
  fc
    .array(slugSegmentArb, { minLength: 1, maxLength: 2 })
    .map((segs) => `/${segs.join("/")}`),
  { nil: undefined },
);

/** Arbitrary RouteDescriptor. */
const routeDescriptorArb: fc.Arbitrary<RouteDescriptor> = fc.record({
  path: routePathArb,
  title: nonEmptyStringArb,
  description: nonEmptyStringArb,
  ogImage: ogImageArb,
  indexable: fc.option(fc.boolean(), { nil: undefined }),
});

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe("Property 29: Every route has title and description metadata", () => {
  // -------------------------------------------------------------------------
  // Property 1: Result has a non-empty title
  // -------------------------------------------------------------------------
  it("result has a non-empty title for any RouteDescriptor", () => {
    fc.assert(
      fc.property(routeDescriptorArb, (route) => {
        const metadata = buildMetadata(route);
        expect(
          typeof metadata.title === "string" && metadata.title.length > 0,
          `buildMetadata title must be a non-empty string, got: ${JSON.stringify(
            metadata.title,
          )}`,
        ).toBe(true);
      }),
      { numRuns: 100 },
    );
  });

  // -------------------------------------------------------------------------
  // Property 2: Result has a non-empty description
  // -------------------------------------------------------------------------
  it("result has a non-empty description for any RouteDescriptor", () => {
    fc.assert(
      fc.property(routeDescriptorArb, (route) => {
        const metadata = buildMetadata(route);
        expect(
          typeof metadata.description === "string" &&
            metadata.description.length > 0,
          `buildMetadata description must be a non-empty string, got: ${JSON.stringify(
            metadata.description,
          )}`,
        ).toBe(true);
      }),
      { numRuns: 100 },
    );
  });

  // -------------------------------------------------------------------------
  // Property 3: Result has a canonical URL in alternates
  // -------------------------------------------------------------------------
  it("result has a canonical URL in alternates for any RouteDescriptor", () => {
    fc.assert(
      fc.property(routeDescriptorArb, (route) => {
        const metadata = buildMetadata(route);
        expect(
          metadata.alternates,
          "metadata.alternates must be defined",
        ).toBeDefined();
        expect(
          metadata.alternates?.canonical,
          "metadata.alternates.canonical must be defined",
        ).toBeDefined();
        expect(
          typeof metadata.alternates?.canonical,
          "metadata.alternates.canonical must be a string",
        ).toBe("string");
      }),
      { numRuns: 100 },
    );
  });

  // -------------------------------------------------------------------------
  // Property 4: Canonical URL is absolute
  // -------------------------------------------------------------------------
  it("canonical URL is absolute (starts with https://)", () => {
    fc.assert(
      fc.property(routeDescriptorArb, (route) => {
        const metadata = buildMetadata(route);
        const canonical = metadata.alternates?.canonical as string;
        expect(
          canonical.startsWith("https://"),
          `canonical "${canonical}" must start with "https://"`,
        ).toBe(true);
        expect(
          canonical.startsWith(SITE_URL),
          `canonical "${canonical}" must start with SITE_URL "${SITE_URL}"`,
        ).toBe(true);
      }),
      { numRuns: 100 },
    );
  });

  // -------------------------------------------------------------------------
  // Property 5: Title and description match the input values exactly
  // -------------------------------------------------------------------------
  it("title and description match the input RouteDescriptor values exactly", () => {
    fc.assert(
      fc.property(routeDescriptorArb, (route) => {
        const metadata = buildMetadata(route);
        expect(metadata.title).toBe(route.title);
        expect(metadata.description).toBe(route.description);
      }),
      { numRuns: 100 },
    );
  });

  // -------------------------------------------------------------------------
  // Spot-check examples
  // -------------------------------------------------------------------------
  describe("spot-check examples", () => {
    it("home route produces correct metadata", () => {
      const metadata = buildMetadata({
        path: "/",
        title: "Home — Stareezy",
        description: "Full-Stack Engineer",
      });
      expect(metadata.title).toBe("Home — Stareezy");
      expect(metadata.description).toBe("Full-Stack Engineer");
      expect(metadata.alternates?.canonical).toBe(SITE_URL);
    });

    it("blog route produces correct canonical URL", () => {
      const metadata = buildMetadata({
        path: "/blog/my-post",
        title: "My Post",
        description: "A great post",
      });
      expect(metadata.alternates?.canonical).toBe(`${SITE_URL}/blog/my-post`);
    });

    it("custom ogImage is used when provided", () => {
      const metadata = buildMetadata({
        path: "/about",
        title: "About",
        description: "About me",
        ogImage: "/about/og-image",
      });
      const images = metadata.openGraph?.images as string[];
      expect(images).toBeDefined();
      expect(images[0]).toBe(`${SITE_URL}/about/og-image`);
    });
  });
});
