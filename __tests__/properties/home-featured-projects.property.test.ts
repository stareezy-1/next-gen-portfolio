// Feature: next-gen-portfolio-platform, Property 7: Home renders exactly six featured projects
//
// **Validates: Requirements 7.2**
//
// Property 7: Home renders exactly six featured projects.
// For any set of projects containing at least six featured projects, the Home
// page featured-project selection renders exactly six project cards.
//
// Contracts under test (getFeaturedProjects from @/features/home/selectors):
//
//   1. For any set of projects with at least 6 featured, returns exactly
//      FEATURED_PROJECTS_COUNT (6).
//   2. For any set with fewer than 6 featured, returns all featured (≤ 6).
//   3. Result length is always ≤ FEATURED_PROJECTS_COUNT.
//   4. All returned projects have featured === true.
//
// Strategy:
//   Generate arbitrary arrays of mixed Project values with controlled
//   featured flags. Run getFeaturedProjects and assert all four invariants.
//
// Tooling: Vitest + fast-check, numRuns = 100.

import { describe, it, expect } from "vitest";
import * as fc from "fast-check";

import { getFeaturedProjects } from "@/features/home/selectors";
import { FEATURED_PROJECTS_COUNT } from "@/constants";
import type {
  PersonalProject,
  ProfessionalProject,
  Project,
} from "@/types/content";

// ---------------------------------------------------------------------------
// Arbitraries
// ---------------------------------------------------------------------------

/** Non-empty string (printable, trimmed). */
const nonEmptyStringArb: fc.Arbitrary<string> = fc
  .string({ minLength: 1, maxLength: 40 })
  .map((s) => s.trim())
  .filter((s) => s.length > 0);

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

/** Non-empty array of non-empty strings. */
const nonEmptyStringArrayArb: fc.Arbitrary<string[]> = fc.array(
  nonEmptyStringArb,
  { minLength: 1, maxLength: 4 },
);

/** URL string. */
const urlArb: fc.Arbitrary<string> = nonEmptyStringArb.map(
  (s) => `https://example.com/${s.replace(/\s/g, "-")}`,
);

/** Arbitrary PersonalProject with a controlled featured flag. */
function personalProjectArb(featured: boolean): fc.Arbitrary<PersonalProject> {
  return fc.record({
    kind: fc.constant("personal" as const),
    slug: nonEmptyStringArb.map((s) => s.replace(/\s/g, "-").toLowerCase()),
    title: nonEmptyStringArb,
    description: nonEmptyStringArb,
    image: urlArb,
    technologies: nonEmptyStringArrayArb,
    featured: fc.constant(featured),
    startDate: isoDateArb,
    githubUrl: fc.option(urlArb, { nil: undefined }),
    liveUrl: fc.option(urlArb, { nil: undefined }),
    endDate: fc.option(isoDateArb, { nil: undefined }),
    challenges: fc.option(nonEmptyStringArrayArb, { nil: undefined }),
    solutions: fc.option(nonEmptyStringArrayArb, { nil: undefined }),
    results: fc.option(nonEmptyStringArrayArb, { nil: undefined }),
    overview: fc.option(nonEmptyStringArb, { nil: undefined }),
    problem: fc.option(nonEmptyStringArb, { nil: undefined }),
    solution: fc.option(nonEmptyStringArb, { nil: undefined }),
    architecture: fc.option(nonEmptyStringArb, { nil: undefined }),
    lessonsLearned: fc.option(nonEmptyStringArb, { nil: undefined }),
    gallery: fc.option(fc.array(urlArb, { minLength: 0, maxLength: 3 }), {
      nil: undefined,
    }),
  });
}

/** Arbitrary ProfessionalProject with a controlled featured flag. */
function professionalProjectArb(
  featured: boolean,
): fc.Arbitrary<ProfessionalProject> {
  return fc.record({
    kind: fc.constant("professional" as const),
    slug: nonEmptyStringArb.map((s) => s.replace(/\s/g, "-").toLowerCase()),
    title: nonEmptyStringArb,
    company: nonEmptyStringArb,
    role: nonEmptyStringArb,
    description: nonEmptyStringArb,
    image: urlArb,
    technologies: nonEmptyStringArrayArb,
    achievements: nonEmptyStringArrayArb,
    featured: fc.constant(featured),
    overview: fc.option(nonEmptyStringArb, { nil: undefined }),
    problem: fc.option(nonEmptyStringArb, { nil: undefined }),
    solution: fc.option(nonEmptyStringArb, { nil: undefined }),
    architecture: fc.option(nonEmptyStringArb, { nil: undefined }),
    lessonsLearned: fc.option(nonEmptyStringArb, { nil: undefined }),
    gallery: fc.option(fc.array(urlArb, { minLength: 0, maxLength: 3 }), {
      nil: undefined,
    }),
  });
}

/** Arbitrary Project with a controlled featured flag. */
function projectArb(featured: boolean): fc.Arbitrary<Project> {
  return fc.oneof(
    personalProjectArb(featured),
    professionalProjectArb(featured),
  );
}

/**
 * Generates an array of projects with at least `minFeatured` featured projects
 * and some non-featured projects mixed in.
 */
function projectsWithAtLeastNFeaturedArb(
  minFeatured: number,
): fc.Arbitrary<Project[]> {
  return fc
    .tuple(
      // Exactly minFeatured featured projects
      fc.array(projectArb(true), {
        minLength: minFeatured,
        maxLength: minFeatured + 10,
      }),
      // Some non-featured projects
      fc.array(projectArb(false), { minLength: 0, maxLength: 10 }),
    )
    .map(([featured, nonFeatured]) => {
      // Shuffle the two arrays together so order is arbitrary
      const combined = [...featured, ...nonFeatured];
      return combined;
    });
}

/**
 * Generates an array of projects with fewer than FEATURED_PROJECTS_COUNT
 * featured projects.
 */
const projectsWithFewerThanMaxFeaturedArb: fc.Arbitrary<Project[]> = fc
  .tuple(
    fc.integer({ min: 0, max: FEATURED_PROJECTS_COUNT - 1 }),
    fc.array(projectArb(false), { minLength: 0, maxLength: 10 }),
  )
  .chain(([featuredCount, nonFeatured]) =>
    fc
      .array(projectArb(true), {
        minLength: featuredCount,
        maxLength: featuredCount,
      })
      .map((featured) => [...featured, ...nonFeatured]),
  );

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe("Property 7: Home renders exactly six featured projects", () => {
  it("returns exactly FEATURED_PROJECTS_COUNT when at least 6 featured projects exist", () => {
    fc.assert(
      fc.property(
        projectsWithAtLeastNFeaturedArb(FEATURED_PROJECTS_COUNT),
        (projects) => {
          const result = getFeaturedProjects(projects);

          expect(
            result.length,
            `Expected exactly ${FEATURED_PROJECTS_COUNT} featured projects, got ${result.length}`,
          ).toBe(FEATURED_PROJECTS_COUNT);
        },
      ),
      { numRuns: 100 },
    );
  });

  it("returns all featured projects when fewer than FEATURED_PROJECTS_COUNT exist", () => {
    fc.assert(
      fc.property(projectsWithFewerThanMaxFeaturedArb, (projects) => {
        const featuredCount = projects.filter((p) => p.featured).length;
        const result = getFeaturedProjects(projects);

        expect(
          result.length,
          `Expected ${featuredCount} featured projects (all of them), got ${result.length}`,
        ).toBe(featuredCount);
      }),
      { numRuns: 100 },
    );
  });

  it("result length is always ≤ FEATURED_PROJECTS_COUNT", () => {
    fc.assert(
      fc.property(
        fc.array(fc.oneof(projectArb(true), projectArb(false)), {
          minLength: 0,
          maxLength: 30,
        }),
        (projects) => {
          const result = getFeaturedProjects(projects);

          expect(
            result.length,
            `Result length ${result.length} must be ≤ ${FEATURED_PROJECTS_COUNT}`,
          ).toBeLessThanOrEqual(FEATURED_PROJECTS_COUNT);
        },
      ),
      { numRuns: 100 },
    );
  });

  it("all returned projects have featured === true", () => {
    fc.assert(
      fc.property(
        fc.array(fc.oneof(projectArb(true), projectArb(false)), {
          minLength: 0,
          maxLength: 30,
        }),
        (projects) => {
          const result = getFeaturedProjects(projects);

          for (const project of result) {
            expect(
              project.featured,
              `Project "${project.slug}" in result must have featured === true`,
            ).toBe(true);
          }
        },
      ),
      { numRuns: 100 },
    );
  });
});
