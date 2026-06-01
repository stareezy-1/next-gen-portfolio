// Feature: next-gen-portfolio-platform, Property 13: Personal and professional projects are partitioned
//
// **Validates: Requirements 11.1**
//
// Property 13: Personal and professional projects are partitioned.
// For any set of projects, the Projects listing places every PersonalProject
// in the personal grouping and every ProfessionalProject in the professional
// grouping, with no project appearing in both.
//
// Contracts under test (partitionProjects from @/features/projects/partition):
//
//   1. Every project with kind === "personal" ends up in `personal`.
//   2. Every project with kind === "professional" ends up in `professional`.
//   3. No project appears in both groupings.
//   4. All projects are accounted for:
//      personal.length + professional.length === projects.length.
//
// Strategy:
//   Generate arbitrary arrays of mixed Project values using
//   fc.array(fc.oneof(personalProjectArb, professionalProjectArb)).
//   Run partitionProjects and assert all four invariants hold.
//
// Tooling: Vitest + fast-check, numRuns = 100.

import { describe, it } from "vitest";
import * as fc from "fast-check";
import { expect } from "vitest";

import { partitionProjects } from "@/features/projects/partition";
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

/** Arbitrary PersonalProject. */
const personalProjectArb: fc.Arbitrary<PersonalProject> = fc.record({
  kind: fc.constant("personal" as const),
  slug: nonEmptyStringArb.map((s) => s.replace(/\s/g, "-").toLowerCase()),
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
  slug: nonEmptyStringArb.map((s) => s.replace(/\s/g, "-").toLowerCase()),
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

describe("Property 13: Personal and professional projects are partitioned", () => {
  it("every PersonalProject ends up in the personal grouping", () => {
    fc.assert(
      fc.property(mixedProjectsArb, (projects) => {
        const { personal } = partitionProjects(projects);
        const personalSlugs = new Set(personal.map((p) => p.slug));

        for (const p of projects) {
          if (p.kind === "personal") {
            expect(
              personalSlugs.has(p.slug),
              `PersonalProject "${p.slug}" must appear in the personal grouping`,
            ).toBe(true);
          }
        }
      }),
      { numRuns: 100 },
    );
  });

  it("every ProfessionalProject ends up in the professional grouping", () => {
    fc.assert(
      fc.property(mixedProjectsArb, (projects) => {
        const { professional } = partitionProjects(projects);
        const professionalSlugs = new Set(professional.map((p) => p.slug));

        for (const p of projects) {
          if (p.kind === "professional") {
            expect(
              professionalSlugs.has(p.slug),
              `ProfessionalProject "${p.slug}" must appear in the professional grouping`,
            ).toBe(true);
          }
        }
      }),
      { numRuns: 100 },
    );
  });

  it("no project object appears in both groupings", () => {
    // Property 13 is about kind-based partitioning: a PersonalProject and a
    // ProfessionalProject that happen to share a slug are two distinct content
    // items and correctly land in different groups. The invariant is that no
    // single project *object* (same reference) appears in both groups — i.e.
    // the partition is disjoint by object identity, not by slug string.
    fc.assert(
      fc.property(mixedProjectsArb, (projects) => {
        const { personal, professional } = partitionProjects(projects);

        // Build identity sets using object references.
        const personalSet = new Set<object>(personal);
        const professionalSet = new Set<object>(professional);

        for (const p of personalSet) {
          expect(
            professionalSet.has(p),
            `Project object must not appear in both groupings`,
          ).toBe(false);
        }
      }),
      { numRuns: 100 },
    );
  });

  it("all projects are accounted for (personal + professional === total)", () => {
    fc.assert(
      fc.property(mixedProjectsArb, (projects) => {
        const { personal, professional } = partitionProjects(projects);

        expect(
          personal.length + professional.length,
          "personal.length + professional.length must equal the total project count",
        ).toBe(projects.length);
      }),
      { numRuns: 100 },
    );
  });

  it("personal grouping contains only PersonalProjects", () => {
    fc.assert(
      fc.property(mixedProjectsArb, (projects) => {
        const { personal } = partitionProjects(projects);

        for (const p of personal) {
          expect(
            p.kind,
            `Every item in the personal grouping must have kind === "personal"`,
          ).toBe("personal");
        }
      }),
      { numRuns: 100 },
    );
  });

  it("professional grouping contains only ProfessionalProjects", () => {
    fc.assert(
      fc.property(mixedProjectsArb, (projects) => {
        const { professional } = partitionProjects(projects);

        for (const p of professional) {
          expect(
            p.kind,
            `Every item in the professional grouping must have kind === "professional"`,
          ).toBe("professional");
        }
      }),
      { numRuns: 100 },
    );
  });
});
