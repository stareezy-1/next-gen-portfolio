// Feature: next-gen-portfolio-platform, Property 16: Related projects exclude the current project
//
// **Validates: Requirements 12.4**
//
// Property 16: Related projects exclude the current project.
// For any set of projects and any current slug, the result of
// getRelatedProjects never contains the project with that slug.
//
// Contracts under test (getRelatedProjects from @/features/projects/partition):
//
//   1. The result never contains a project whose slug equals currentSlug.
//   2. If the current project is in the input set, it is excluded from the result.
//   3. All other projects (slug !== currentSlug) are included in the result.
//   4. The result length equals projects.length minus the count of projects
//      whose slug equals currentSlug.
//
// Strategy:
//   Generate arbitrary arrays of mixed Project values and an arbitrary
//   currentSlug (sometimes matching a project in the array, sometimes not).
//   Assert all four invariants hold.
//
// Tooling: Vitest + fast-check, numRuns = 100.

import { describe, it } from "vitest";
import * as fc from "fast-check";
import { expect } from "vitest";

import { getRelatedProjects } from "@/features/projects/partition";
import type { PersonalProject, ProfessionalProject } from "@/types/content";

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

/** Slug string: lowercase, hyphen-separated. */
const slugArb: fc.Arbitrary<string> = fc
  .stringMatching(/^[a-z][a-z0-9-]{0,19}$/)
  .filter((s) => s.length > 0);

/** Arbitrary PersonalProject. */
const personalProjectArb: fc.Arbitrary<PersonalProject> = fc.record({
  kind: fc.constant("personal" as const),
  slug: slugArb,
  title: nonEmptyStringArb,
  description: nonEmptyStringArb,
  image: urlArb,
  technologies: nonEmptyStringArrayArb,
  featured: fc.boolean(),
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

/** Arbitrary ProfessionalProject. */
const professionalProjectArb: fc.Arbitrary<ProfessionalProject> = fc.record({
  kind: fc.constant("professional" as const),
  slug: slugArb,
  title: nonEmptyStringArb,
  company: nonEmptyStringArb,
  role: nonEmptyStringArb,
  description: nonEmptyStringArb,
  image: urlArb,
  technologies: nonEmptyStringArrayArb,
  achievements: nonEmptyStringArrayArb,
  featured: fc.boolean(),
  overview: fc.option(nonEmptyStringArb, { nil: undefined }),
  problem: fc.option(nonEmptyStringArb, { nil: undefined }),
  solution: fc.option(nonEmptyStringArb, { nil: undefined }),
  architecture: fc.option(nonEmptyStringArb, { nil: undefined }),
  lessonsLearned: fc.option(nonEmptyStringArb, { nil: undefined }),
  gallery: fc.option(fc.array(urlArb, { minLength: 0, maxLength: 3 }), {
    nil: undefined,
  }),
});

/** Arbitrary mixed Project array. */
const mixedProjectsArb = fc.array(
  fc.oneof(personalProjectArb, professionalProjectArb),
  { minLength: 0, maxLength: 20 },
);

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe("Property 16: Related projects exclude the current project", () => {
  it("result never contains a project with the current slug (arbitrary slug)", () => {
    fc.assert(
      fc.property(mixedProjectsArb, slugArb, (projects, currentSlug) => {
        const related = getRelatedProjects(projects, currentSlug);

        for (const p of related) {
          expect(
            p.slug,
            `Related projects must not contain a project with slug "${currentSlug}"`,
          ).not.toBe(currentSlug);
        }
      }),
      { numRuns: 100 },
    );
  });

  it("if the current project is in the set it is excluded from the result", () => {
    fc.assert(
      fc.property(
        fc.oneof(personalProjectArb, professionalProjectArb),
        mixedProjectsArb,
        (currentProject, otherProjects) => {
          // Build a pool that definitely contains the current project.
          const projects = [...otherProjects, currentProject];
          const related = getRelatedProjects(projects, currentProject.slug);

          const resultSlugs = related.map((p) => p.slug);
          expect(
            resultSlugs,
            `The current project (slug "${currentProject.slug}") must be excluded from related projects`,
          ).not.toContain(currentProject.slug);
        },
      ),
      { numRuns: 100 },
    );
  });

  it("all projects with a different slug are included in the result", () => {
    fc.assert(
      fc.property(mixedProjectsArb, slugArb, (projects, currentSlug) => {
        const related = getRelatedProjects(projects, currentSlug);
        const relatedSlugs = related.map((p) => p.slug);

        for (const p of projects) {
          if (p.slug !== currentSlug) {
            expect(
              relatedSlugs,
              `Project "${p.slug}" (slug !== currentSlug) must appear in the related list`,
            ).toContain(p.slug);
          }
        }
      }),
      { numRuns: 100 },
    );
  });

  it("result length equals total minus the count of projects matching currentSlug", () => {
    fc.assert(
      fc.property(mixedProjectsArb, slugArb, (projects, currentSlug) => {
        const related = getRelatedProjects(projects, currentSlug);
        const matchCount = projects.filter(
          (p) => p.slug === currentSlug,
        ).length;

        expect(
          related.length,
          `related.length must equal projects.length (${projects.length}) minus matches (${matchCount})`,
        ).toBe(projects.length - matchCount);
      }),
      { numRuns: 100 },
    );
  });
});
