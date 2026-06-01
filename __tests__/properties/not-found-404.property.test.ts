// Feature: next-gen-portfolio-platform, Property 1: Unknown routes and slugs return 404
//
// **Validates: Requirements 2.6, 12.3, 14.5**
//
// Property 1: Unknown routes and slugs return 404.
// For any project or blog slug not present in the content store, the
// slug-lookup logic returns `undefined`, which causes `notFound()` to be
// called in the page components — resulting in an HTTP 404 response.
//
// Since full Next.js page rendering cannot be exercised in unit tests, this
// property tests the slug-lookup logic directly:
//
//   1. `loadAll("personal-project")` + `loadAll("professional-project")`
//      combined with `.find(p => p.slug === slug)` returns `undefined` for
//      any slug not present in the content store.
//   2. `loadAll("blog")` + `publishedOnly` + `.find(p => p.slug === slug)`
//      returns `undefined` for any slug not present in the content store.
//
// The property: for any slug that is not in the content store, the lookup
// returns `undefined` (which causes `notFound()` to be called in the page).
//
// Strategy:
//   Generate slug strings that are guaranteed not to match any real content
//   by prefixing them with `__test__` followed by 8 lowercase alphanumeric
//   characters. The content store is empty during tests (no MDX files in the
//   test environment), so any generated slug will be absent.
//
// Tooling: Vitest + fast-check, numRuns = 100.

import { describe, it, expect } from "vitest";
import * as fc from "fast-check";
import { loadAll } from "@/content/loader";
import { publishedOnly } from "@/lib/blog/query";

// ---------------------------------------------------------------------------
// Arbitraries
// ---------------------------------------------------------------------------

/**
 * Generates slug strings that are guaranteed not to exist in the content
 * store. The `__test__` prefix followed by 8 lowercase alphanumeric
 * characters makes accidental collisions with real content slugs impossible.
 */
const unknownSlugArb: fc.Arbitrary<string> = fc
  .stringOf(
    fc.constantFrom(..."abcdefghijklmnopqrstuvwxyz0123456789".split("")),
    {
      minLength: 8,
      maxLength: 8,
    },
  )
  .map((suffix) => `__test__${suffix}`);

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe("Property 1: Unknown routes and slugs return 404", () => {
  it("unknown project slug returns undefined (triggers notFound)", () => {
    fc.assert(
      fc.property(unknownSlugArb, (slug) => {
        const { items: personal } = loadAll("personal-project");
        const { items: professional } = loadAll("professional-project");
        const all = [...personal, ...professional];
        const found = all.find((p) => p.slug === slug);

        expect(
          found,
          `Project lookup for unknown slug "${slug}" must return undefined`,
        ).toBeUndefined();
      }),
      { numRuns: 100 },
    );
  });

  it("unknown blog slug returns undefined (triggers notFound)", () => {
    fc.assert(
      fc.property(unknownSlugArb, (slug) => {
        const { items } = loadAll("blog");
        const published = publishedOnly(items);
        const found = published.find((p) => p.slug === slug);

        expect(
          found,
          `Blog lookup for unknown slug "${slug}" must return undefined`,
        ).toBeUndefined();
      }),
      { numRuns: 100 },
    );
  });
});
