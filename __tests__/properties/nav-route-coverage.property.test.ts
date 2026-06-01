// Feature: next-gen-portfolio-platform, Property 6: Primary navigation links to and marks every route
//
// **Validates: Requirements 6.2, 6.3**
//
// Property 6: Primary navigation links to and marks every route.
// For any defined route, the primary navigation contains a link whose target
// is that route, and when that route is active exactly that one link is marked
// as the current location.
//
// Contracts under test:
//
//   PRIMARY_NAV_ITEMS (`@/constants/routes`):
//     - Contains exactly one item for every route defined in ROUTES.
//     - No route in ROUTES is missing a corresponding nav item.
//     - No nav item targets a path not defined in ROUTES.
//
//   Active-state logic (extracted from Nav.tsx for direct testing):
//     - For any primary route path, exactly one nav item is active.
//     - The active item's path equals the route (exact match).
//     - For any sub-path of a non-root route, the parent route item is active.
//     - For the home route "/", only the home item is active (no prefix match
//       from other items).
//
// Strategy:
//   Since Nav uses `usePathname()` (a Next.js hook), we test the active-state
//   logic directly as a pure function extracted from Nav.tsx rather than
//   rendering the full component. This avoids complex Next.js mocking while
//   still validating the core correctness contract.
//
//   Property 1 — Route coverage: every ROUTES value has exactly one nav item.
//   Property 2 — Exact-match activation: for any primary route, exactly one
//                nav item is active and its path equals the route.
//   Property 3 — Sub-path activation: for any sub-path of a non-root route,
//                the parent route item is active.
//   Property 4 — Home isolation: "/" activates only the HOME item.
//
// Tooling: Vitest + fast-check, numRuns = 100.

import { describe, expect, it } from "vitest";
import * as fc from "fast-check";
import { PRIMARY_NAV_ITEMS, ROUTES } from "@/constants/routes";

// ---------------------------------------------------------------------------
// Active-state logic extracted from Nav.tsx
//
// This mirrors the isActive computation in Nav.tsx exactly:
//   item.path === "/" ? pathname === "/" : pathname === item.path || pathname.startsWith(item.path + "/")
// ---------------------------------------------------------------------------

/**
 * Returns true when a nav item with the given `itemPath` should be marked
 * active for the given `pathname`.
 *
 * Mirrors the logic in `Nav.tsx`:
 *   - For "/": exact match only.
 *   - For other routes: exact match OR prefix match (e.g. /projects/slug).
 */
function isNavItemActive(itemPath: string, pathname: string): boolean {
  if (itemPath === "/") return pathname === "/";
  return pathname === itemPath || pathname.startsWith(itemPath + "/");
}

/**
 * Returns all nav items that are active for the given pathname.
 */
function getActiveItems(pathname: string) {
  return PRIMARY_NAV_ITEMS.filter((item) =>
    isNavItemActive(item.path, pathname),
  );
}

// ---------------------------------------------------------------------------
// Derived constants for use in tests
// ---------------------------------------------------------------------------

/** All route path values defined in ROUTES. */
const ALL_ROUTES = Object.values(ROUTES) as string[];

/** Non-root routes (everything except "/"). */
const NON_ROOT_ROUTES = ALL_ROUTES.filter((r) => r !== "/");

// ---------------------------------------------------------------------------
// Arbitraries
// ---------------------------------------------------------------------------

/**
 * Generates one of the six primary route paths.
 */
const primaryRouteArb: fc.Arbitrary<string> = fc.constantFrom(...ALL_ROUTES);

/**
 * Generates a non-root primary route path.
 */
const nonRootRouteArb: fc.Arbitrary<string> = fc.constantFrom(
  ...NON_ROOT_ROUTES,
);

/**
 * Generates a valid URL slug segment (alphanumeric + hyphens, non-empty).
 */
const slugArb: fc.Arbitrary<string> = fc
  .array(fc.stringMatching(/^[a-z0-9-]+$/), { minLength: 1, maxLength: 3 })
  .map((parts) => parts.join("-"))
  .filter((s) => s.length > 0);

/**
 * Generates a sub-path for a given non-root route, e.g. "/projects/my-slug".
 */
const subPathArb: fc.Arbitrary<{ route: string; subPath: string }> =
  nonRootRouteArb.chain((route) =>
    slugArb.map((slug) => ({
      route,
      subPath: `${route}/${slug}`,
    })),
  );

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe("Property 6: Primary navigation links to and marks every route", () => {
  // -------------------------------------------------------------------------
  // Property 1: Route coverage — every ROUTES value has exactly one nav item
  // -------------------------------------------------------------------------
  describe("Property 1 — Route coverage: every ROUTES value has exactly one nav item", () => {
    it("every route in ROUTES has exactly one corresponding nav item", () => {
      fc.assert(
        fc.property(primaryRouteArb, (route) => {
          const matchingItems = PRIMARY_NAV_ITEMS.filter(
            (item) => item.path === route,
          );
          expect(
            matchingItems.length,
            `Route "${route}" must have exactly one nav item, found ${matchingItems.length}`,
          ).toBe(1);
        }),
        { numRuns: 100 },
      );
    });

    it("PRIMARY_NAV_ITEMS has the same count as ROUTES", () => {
      expect(PRIMARY_NAV_ITEMS.length).toBe(ALL_ROUTES.length);
    });

    it("every nav item path is a defined route in ROUTES", () => {
      for (const item of PRIMARY_NAV_ITEMS) {
        expect(
          ALL_ROUTES,
          `Nav item "${item.key}" has path "${item.path}" which is not in ROUTES`,
        ).toContain(item.path);
      }
    });

    it("no two nav items share the same path", () => {
      const paths = PRIMARY_NAV_ITEMS.map((item) => item.path);
      const uniquePaths = new Set(paths);
      expect(uniquePaths.size).toBe(paths.length);
    });
  });

  // -------------------------------------------------------------------------
  // Property 2: Exact-match activation — for any primary route, exactly one
  //             nav item is active and its path equals the route
  // -------------------------------------------------------------------------
  describe("Property 2 — Exact-match activation: for any primary route, exactly one nav item is active", () => {
    it("exactly one nav item is active for any primary route path", () => {
      fc.assert(
        fc.property(primaryRouteArb, (route) => {
          const activeItems = getActiveItems(route);
          expect(
            activeItems.length,
            `Exactly one nav item must be active for route "${route}", found ${
              activeItems.length
            }: [${activeItems.map((i) => i.path).join(", ")}]`,
          ).toBe(1);
        }),
        { numRuns: 100 },
      );
    });

    it("the active item's path equals the route for any primary route", () => {
      fc.assert(
        fc.property(primaryRouteArb, (route) => {
          const activeItems = getActiveItems(route);
          expect(activeItems.length).toBe(1);
          expect(
            activeItems[0]!.path,
            `Active item path must equal the route "${route}"`,
          ).toBe(route);
        }),
        { numRuns: 100 },
      );
    });
  });

  // -------------------------------------------------------------------------
  // Property 3: Sub-path activation — for any sub-path of a non-root route,
  //             the parent route item is active
  // -------------------------------------------------------------------------
  describe("Property 3 — Sub-path activation: parent route item is active for sub-paths", () => {
    it("the parent route item is active for any sub-path of a non-root route", () => {
      fc.assert(
        fc.property(subPathArb, ({ route, subPath }) => {
          const activeItems = getActiveItems(subPath);
          // At least the parent route must be active.
          const parentActive = activeItems.some((item) => item.path === route);
          expect(
            parentActive,
            `Nav item for route "${route}" must be active for sub-path "${subPath}"`,
          ).toBe(true);
        }),
        { numRuns: 100 },
      );
    });

    it("exactly one nav item is active for any sub-path of a non-root route", () => {
      fc.assert(
        fc.property(subPathArb, ({ route, subPath }) => {
          const activeItems = getActiveItems(subPath);
          expect(
            activeItems.length,
            `Exactly one nav item must be active for sub-path "${subPath}" (parent: "${route}"), found ${
              activeItems.length
            }: [${activeItems.map((i) => i.path).join(", ")}]`,
          ).toBe(1);
        }),
        { numRuns: 100 },
      );
    });

    it("the home item is NOT active for sub-paths of non-root routes", () => {
      fc.assert(
        fc.property(subPathArb, ({ subPath }) => {
          const activeItems = getActiveItems(subPath);
          const homeActive = activeItems.some((item) => item.path === "/");
          expect(
            homeActive,
            `Home nav item must NOT be active for sub-path "${subPath}"`,
          ).toBe(false);
        }),
        { numRuns: 100 },
      );
    });
  });

  // -------------------------------------------------------------------------
  // Property 4: Home isolation — "/" activates only the HOME item
  // -------------------------------------------------------------------------
  describe("Property 4 — Home isolation: '/' activates only the HOME item", () => {
    it("only the HOME item is active for the root path '/'", () => {
      const activeItems = getActiveItems("/");
      expect(
        activeItems.length,
        `Exactly one nav item must be active for "/", found ${activeItems.length}`,
      ).toBe(1);
      expect(
        activeItems[0]!.path,
        "The active item for '/' must be the HOME item",
      ).toBe(ROUTES.HOME);
    });

    it("no non-home nav item is active for '/'", () => {
      const activeItems = getActiveItems("/");
      const nonHomeActive = activeItems.filter((item) => item.path !== "/");
      expect(
        nonHomeActive.length,
        `No non-home nav item must be active for "/", but found: [${nonHomeActive
          .map((i) => i.path)
          .join(", ")}]`,
      ).toBe(0);
    });

    it("home item is NOT active for any non-root primary route", () => {
      fc.assert(
        fc.property(nonRootRouteArb, (route) => {
          const homeItem = PRIMARY_NAV_ITEMS.find((item) => item.path === "/");
          expect(homeItem, "HOME nav item must exist").toBeDefined();
          const homeActive = isNavItemActive("/", route);
          expect(
            homeActive,
            `Home nav item must NOT be active for route "${route}"`,
          ).toBe(false);
        }),
        { numRuns: 100 },
      );
    });

    it("home item is NOT active for any sub-path of a non-root route", () => {
      fc.assert(
        fc.property(subPathArb, ({ subPath }) => {
          const homeActive = isNavItemActive("/", subPath);
          expect(
            homeActive,
            `Home nav item must NOT be active for sub-path "${subPath}"`,
          ).toBe(false);
        }),
        { numRuns: 100 },
      );
    });
  });

  // -------------------------------------------------------------------------
  // Spot-check examples — deterministic sanity checks
  // -------------------------------------------------------------------------
  describe("Spot-check examples", () => {
    it("HOME item is active for '/'", () => {
      expect(isNavItemActive("/", "/")).toBe(true);
    });

    it("HOME item is NOT active for '/about'", () => {
      expect(isNavItemActive("/", "/about")).toBe(false);
    });

    it("PROJECTS item is active for '/projects'", () => {
      expect(isNavItemActive("/projects", "/projects")).toBe(true);
    });

    it("PROJECTS item is active for '/projects/my-project'", () => {
      expect(isNavItemActive("/projects", "/projects/my-project")).toBe(true);
    });

    it("BLOG item is active for '/blog/some-post'", () => {
      expect(isNavItemActive("/blog", "/blog/some-post")).toBe(true);
    });

    it("ABOUT item is NOT active for '/about-us' (no false prefix match)", () => {
      // '/about-us' does NOT start with '/about/' so it must not match.
      expect(isNavItemActive("/about", "/about-us")).toBe(false);
    });

    it("EXPERIENCE item is NOT active for '/experience-old'", () => {
      expect(isNavItemActive("/experience", "/experience-old")).toBe(false);
    });

    it("getActiveItems returns empty array for an unknown path", () => {
      const active = getActiveItems("/unknown-page");
      expect(active.length).toBe(0);
    });

    it("getActiveItems returns empty array for '/admin'", () => {
      const active = getActiveItems("/admin");
      expect(active.length).toBe(0);
    });
  });
});
