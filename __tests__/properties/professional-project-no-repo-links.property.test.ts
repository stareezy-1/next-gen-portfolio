// Feature: next-gen-portfolio-platform, Property 14: Professional project renders expose no repository links
//
// **Validates: Requirements 11.5**
//
// Property 14: Professional project renders expose no repository links.
// For any ProfessionalProject, the rendered output contains no repository
// link, source-code link, or internal documentation reference.
//
// Contracts under test (ProfessionalProjectRenderer):
//
//   1. No <a> elements appear in the rendered output.
//   2. No text containing "github" or "GitHub" appears.
//   3. No text containing "repository" appears.
//   4. No text containing "source code" appears.
//   5. No text containing "repo" appears.
//
// Strategy:
//   Generate arbitrary ProfessionalProject values with fast-check.
//   Render ProfessionalProjectRenderer with @testing-library/react and assert
//   all five invariants hold for every generated project.
//
// Tooling: Vitest + fast-check + @testing-library/react, numRuns = 100.

import { describe, it, afterEach } from "vitest";
import * as fc from "fast-check";
import { expect } from "vitest";
import { render } from "@testing-library/react";
import React from "react";

import { ProfessionalProjectRenderer } from "@/components/ui/ProfessionalProjectRenderer";
import type { ProfessionalProject } from "@/types/content";

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

/**
 * Arbitrary ProfessionalProject.
 *
 * The ProfessionalProject type has no githubUrl or repository fields by
 * design (Requirement 11.5, 11.6). The renderer must not expose any such
 * links regardless of what data it receives.
 */
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

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe("Property 14: Professional project renders expose no repository links", () => {
  afterEach(() => {
    document.body.innerHTML = "";
  });

  it("renders no <a> elements for any ProfessionalProject", () => {
    fc.assert(
      fc.property(professionalProjectArb, (project) => {
        const { container, unmount } = render(
          React.createElement(ProfessionalProjectRenderer, { project }),
        );

        const links = container.querySelectorAll("a");
        expect(
          links.length,
          `ProfessionalProjectRenderer must not render any <a> elements (found ${links.length})`,
        ).toBe(0);

        unmount();
      }),
      { numRuns: 100 },
    );
  });

  it('renders no text containing "github" or "GitHub" for any ProfessionalProject', () => {
    fc.assert(
      fc.property(professionalProjectArb, (project) => {
        const { container, unmount } = render(
          React.createElement(ProfessionalProjectRenderer, { project }),
        );

        const text = container.textContent ?? "";
        expect(
          text.toLowerCase(),
          'ProfessionalProjectRenderer must not render text containing "github"',
        ).not.toContain("github");

        unmount();
      }),
      { numRuns: 100 },
    );
  });

  it('renders no text containing "repository" for any ProfessionalProject', () => {
    fc.assert(
      fc.property(professionalProjectArb, (project) => {
        const { container, unmount } = render(
          React.createElement(ProfessionalProjectRenderer, { project }),
        );

        const text = container.textContent ?? "";
        expect(
          text.toLowerCase(),
          'ProfessionalProjectRenderer must not render text containing "repository"',
        ).not.toContain("repository");

        unmount();
      }),
      { numRuns: 100 },
    );
  });

  it('renders no text containing "source code" for any ProfessionalProject', () => {
    fc.assert(
      fc.property(professionalProjectArb, (project) => {
        const { container, unmount } = render(
          React.createElement(ProfessionalProjectRenderer, { project }),
        );

        const text = container.textContent ?? "";
        expect(
          text.toLowerCase(),
          'ProfessionalProjectRenderer must not render text containing "source code"',
        ).not.toContain("source code");

        unmount();
      }),
      { numRuns: 100 },
    );
  });

  it('renders no text containing "repo" for any ProfessionalProject', () => {
    fc.assert(
      fc.property(professionalProjectArb, (project) => {
        const { container, unmount } = render(
          React.createElement(ProfessionalProjectRenderer, { project }),
        );

        const text = container.textContent ?? "";
        expect(
          text.toLowerCase(),
          'ProfessionalProjectRenderer must not render text containing "repo"',
        ).not.toContain("repo");

        unmount();
      }),
      { numRuns: 100 },
    );
  });
});
