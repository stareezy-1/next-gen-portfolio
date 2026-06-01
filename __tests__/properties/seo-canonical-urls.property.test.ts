// Feature: next-gen-portfolio-platform, Property 27: Every indexable page emits a canonical URL
//
// **Validates: Requirements 17.4**
//
// Property 27: Every indexable page emits a canonical URL.
// For any path, `canonicalUrl` produces an absolute URL that:
//   1. Starts with SITE_URL
//   2. For "/" equals SITE_URL exactly (no trailing slash added)
//   3. For non-root paths equals SITE_URL + path
//   4. Always starts with "https://"
//   5. Never contains double slashes after the protocol
//
// Tooling: Vitest + fast-check, numRuns = 100.

import { describe, it, expect } from "vitest";
import * as fc from "fast-check";

import { canonicalUrl } from "@/services/seo";
import { SITE_URL } from "@/constants/seo";

// ---------------------------------------------------------------------------
// Arbitraries
// ---------------------------------------------------------------------------

/**
 * Generates a valid URL path segment (alphanumeric, hyphens, underscores).
 * Always non-empty.
 */
const slugSegmentArb: fc.Arbitrary<string> = fc
  .stringMatching(/^[a-z0-9][a-z0-9-_]*$/)
  .filter((s) => s.length > 0 && s.length <= 30);

/**
 * Generates a non-root path like "/blog/my-post" or "/projects/foo".
 * Always starts with "/" and never ends with "/".
 */
const nonRootPathArb: fc.Arbitrary<string> = fc
  .array(slugSegmentArb, { minLength: 1, maxLength: 3 })
  .map((segments) => `/${segments.join("/")}`);

/**
 * Generates any path: either "/" or a non-root path.
 */
const anyPathArb: fc.Arbitrary<string> = fc.oneof(
  fc.constant("/"),
  nonRootPathArb,
);

/**
 * Generates a non-root path that may or may not have a trailing slash.
 */
const pathWithOptionalTrailingSlashArb: fc.Arbitrary<string> = fc
  .tuple(nonRootPathArb, fc.boolean())
  .map(([path, addTrailing]) => (addTrailing ? `${path}/` : path));

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe("Property 27: Every indexable page emits a canonical URL", () => {
  // -------------------------------------------------------------------------
  // Property 1: Result always starts with SITE_URL
  // -------------------------------------------------------------------------
  it("result always starts with SITE_URL for any path", () => {
    fc.assert(
      fc.property(anyPathArb, (path) => {
        const result = canonicalUrl(path);
        expect(
          result.startsWith(SITE_URL),
          `canonicalUrl("${path}") = "${result}" must start with SITE_URL "${SITE_URL}"`,
        ).toBe(true);
      }),
      { numRuns: 100 },
    );
  });

  // -------------------------------------------------------------------------
  // Property 2: For "/", result equals SITE_URL exactly
  // -------------------------------------------------------------------------
  it('for "/" result equals SITE_URL with no trailing slash', () => {
    const result = canonicalUrl("/");
    expect(result).toBe(SITE_URL);
    // Must not have a trailing slash
    expect(result.endsWith("/")).toBe(false);
  });

  // -------------------------------------------------------------------------
  // Property 3: For non-root paths, result equals SITE_URL + path
  // -------------------------------------------------------------------------
  it("for non-root paths, result equals SITE_URL + path (no trailing slash)", () => {
    fc.assert(
      fc.property(nonRootPathArb, (path) => {
        const result = canonicalUrl(path);
        const expected = `${SITE_URL}${path}`;
        expect(result).toBe(expected);
      }),
      { numRuns: 100 },
    );
  });

  // -------------------------------------------------------------------------
  // Property 4: Result always starts with "https://"
  // -------------------------------------------------------------------------
  it('result always starts with "https://" for any path', () => {
    fc.assert(
      fc.property(anyPathArb, (path) => {
        const result = canonicalUrl(path);
        expect(
          result.startsWith("https://"),
          `canonicalUrl("${path}") = "${result}" must start with "https://"`,
        ).toBe(true);
      }),
      { numRuns: 100 },
    );
  });

  // -------------------------------------------------------------------------
  // Property 5: No double slashes after the protocol
  // -------------------------------------------------------------------------
  it("result never contains double slashes after the protocol", () => {
    fc.assert(
      fc.property(anyPathArb, (path) => {
        const result = canonicalUrl(path);
        // Strip the protocol prefix before checking for double slashes
        const withoutProtocol = result.replace(/^https?:\/\//, "");
        expect(
          withoutProtocol.includes("//"),
          `canonicalUrl("${path}") = "${result}" contains double slashes after protocol`,
        ).toBe(false);
      }),
      { numRuns: 100 },
    );
  });

  // -------------------------------------------------------------------------
  // Property 6: Trailing slashes on non-root paths are normalized away
  // -------------------------------------------------------------------------
  it("trailing slashes on non-root paths are removed", () => {
    fc.assert(
      fc.property(pathWithOptionalTrailingSlashArb, (path) => {
        const result = canonicalUrl(path);
        expect(
          result.endsWith("/"),
          `canonicalUrl("${path}") = "${result}" must not end with "/"`,
        ).toBe(false);
      }),
      { numRuns: 100 },
    );
  });

  // -------------------------------------------------------------------------
  // Spot-check examples
  // -------------------------------------------------------------------------
  describe("spot-check examples", () => {
    it('canonicalUrl("/") → SITE_URL', () => {
      expect(canonicalUrl("/")).toBe(SITE_URL);
    });

    it('canonicalUrl("/blog/my-post") → SITE_URL + "/blog/my-post"', () => {
      expect(canonicalUrl("/blog/my-post")).toBe(`${SITE_URL}/blog/my-post`);
    });

    it('canonicalUrl("/projects/foo") → SITE_URL + "/projects/foo"', () => {
      expect(canonicalUrl("/projects/foo")).toBe(`${SITE_URL}/projects/foo`);
    });

    it("canonicalUrl with trailing slash normalizes it", () => {
      expect(canonicalUrl("/about/")).toBe(`${SITE_URL}/about`);
    });

    it("canonicalUrl with path not starting with / still works", () => {
      const result = canonicalUrl("about");
      expect(result.startsWith(SITE_URL)).toBe(true);
      expect(result).toBe(`${SITE_URL}/about`);
    });
  });
});
