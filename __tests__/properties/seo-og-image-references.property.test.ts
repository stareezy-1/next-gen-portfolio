// Feature: next-gen-portfolio-platform, Property 31: Every indexable page references an Open Graph image
//
// **Validates: Requirements 18.5**
//
// Property 31: Every indexable page references an Open Graph image.
// For any RouteDescriptor:
//   1. The result has openGraph.images with at least one entry
//   2. The OG image URL is absolute (starts with "https://")
//   3. The OG image URL starts with SITE_URL
//   4. When no ogImage is provided, the default OG_IMAGE_PATH is used
//   5. When a custom ogImage is provided, that path is used
//
// Tooling: Vitest + fast-check, numRuns = 100.

import { describe, it, expect } from "vitest";
import * as fc from "fast-check";

import { buildMetadata } from "@/services/seo";
import { SITE_URL, OG_IMAGE_PATH } from "@/constants/seo";
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

/** A route path: either "/" or a multi-segment path. */
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

/** RouteDescriptor without ogImage (uses default). */
const routeWithoutOgImageArb: fc.Arbitrary<RouteDescriptor> = fc.record({
  path: routePathArb,
  title: nonEmptyStringArb,
  description: nonEmptyStringArb,
  ogImage: fc.constant(undefined),
  indexable: fc.option(fc.boolean(), { nil: undefined }),
});

/** RouteDescriptor with a custom ogImage. */
const routeWithOgImageArb: fc.Arbitrary<RouteDescriptor & { ogImage: string }> =
  fc.record({
    path: routePathArb,
    title: nonEmptyStringArb,
    description: nonEmptyStringArb,
    ogImage: fc
      .array(slugSegmentArb, { minLength: 1, maxLength: 2 })
      .map((segs) => `/${segs.join("/")}`),
    indexable: fc.option(fc.boolean(), { nil: undefined }),
  }) as fc.Arbitrary<RouteDescriptor & { ogImage: string }>;

/** Any RouteDescriptor (with or without ogImage). */
const routeDescriptorArb: fc.Arbitrary<RouteDescriptor> = fc.record({
  path: routePathArb,
  title: nonEmptyStringArb,
  description: nonEmptyStringArb,
  ogImage: ogImageArb,
  indexable: fc.option(fc.boolean(), { nil: undefined }),
});

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Extract the OG image URLs from a metadata result. */
function getOgImages(metadata: ReturnType<typeof buildMetadata>): string[] {
  const images = metadata.openGraph?.images;
  if (!images) return [];
  if (typeof images === "string") return [images];
  if (Array.isArray(images)) {
    return images.map((img) => {
      if (typeof img === "string") return img;
      if (typeof img === "object" && img !== null && "url" in img) {
        return String((img as { url: string }).url);
      }
      return String(img);
    });
  }
  return [];
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe("Property 31: Every indexable page references an Open Graph image", () => {
  // -------------------------------------------------------------------------
  // Property 1: openGraph.images has at least one entry
  // -------------------------------------------------------------------------
  it("openGraph.images has at least one entry for any RouteDescriptor", () => {
    fc.assert(
      fc.property(routeDescriptorArb, (route) => {
        const metadata = buildMetadata(route);
        const images = getOgImages(metadata);
        expect(
          images.length >= 1,
          `openGraph.images must have at least one entry, got ${images.length}`,
        ).toBe(true);
      }),
      { numRuns: 100 },
    );
  });

  // -------------------------------------------------------------------------
  // Property 2: OG image URL is absolute (starts with "https://")
  // -------------------------------------------------------------------------
  it("OG image URL is absolute (starts with https://)", () => {
    fc.assert(
      fc.property(routeDescriptorArb, (route) => {
        const metadata = buildMetadata(route);
        const images = getOgImages(metadata);
        for (const imageUrl of images) {
          expect(
            imageUrl.startsWith("https://"),
            `OG image URL "${imageUrl}" must start with "https://"`,
          ).toBe(true);
        }
      }),
      { numRuns: 100 },
    );
  });

  // -------------------------------------------------------------------------
  // Property 3: OG image URL starts with SITE_URL
  // -------------------------------------------------------------------------
  it("OG image URL starts with SITE_URL", () => {
    fc.assert(
      fc.property(routeDescriptorArb, (route) => {
        const metadata = buildMetadata(route);
        const images = getOgImages(metadata);
        for (const imageUrl of images) {
          expect(
            imageUrl.startsWith(SITE_URL),
            `OG image URL "${imageUrl}" must start with SITE_URL "${SITE_URL}"`,
          ).toBe(true);
        }
      }),
      { numRuns: 100 },
    );
  });

  // -------------------------------------------------------------------------
  // Property 4: Default OG_IMAGE_PATH is used when no ogImage is provided
  // -------------------------------------------------------------------------
  it("default OG_IMAGE_PATH is used when no ogImage is provided", () => {
    fc.assert(
      fc.property(routeWithoutOgImageArb, (route) => {
        const metadata = buildMetadata(route);
        const images = getOgImages(metadata);
        const expectedUrl = `${SITE_URL}${OG_IMAGE_PATH}`;
        expect(
          images,
          `Default OG image URL "${expectedUrl}" must be present when no ogImage is provided`,
        ).toContain(expectedUrl);
      }),
      { numRuns: 100 },
    );
  });

  // -------------------------------------------------------------------------
  // Property 5: Custom ogImage path is used when provided
  // -------------------------------------------------------------------------
  it("custom ogImage path is used when provided", () => {
    fc.assert(
      fc.property(routeWithOgImageArb, (route) => {
        const metadata = buildMetadata(route);
        const images = getOgImages(metadata);
        const expectedUrl = `${SITE_URL}${route.ogImage}`;
        expect(
          images,
          `Custom OG image URL "${expectedUrl}" must be present when ogImage is "${route.ogImage}"`,
        ).toContain(expectedUrl);
      }),
      { numRuns: 100 },
    );
  });

  // -------------------------------------------------------------------------
  // Spot-check examples
  // -------------------------------------------------------------------------
  describe("spot-check examples", () => {
    it("home route uses default OG image", () => {
      const metadata = buildMetadata({
        path: "/",
        title: "Home",
        description: "Home page",
      });
      const images = getOgImages(metadata);
      expect(images[0]).toBe(`${SITE_URL}${OG_IMAGE_PATH}`);
    });

    it("route with custom ogImage uses that image", () => {
      const metadata = buildMetadata({
        path: "/blog/my-post",
        title: "My Post",
        description: "A post",
        ogImage: "/blog/my-post/og",
      });
      const images = getOgImages(metadata);
      expect(images[0]).toBe(`${SITE_URL}/blog/my-post/og`);
    });
  });
});
