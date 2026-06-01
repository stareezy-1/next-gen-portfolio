// Feature: next-gen-portfolio-platform, Property 12: Optional fields render exactly when present
//
// **Validates: Requirements 9.3, 10.3, 10.4, 11.3**
//
// Property 12: Optional fields render exactly when present.
// For any content entity, an optional field is rendered when present in the
// data and is absent from the output when not present.
//
// Contracts under test:
//
//   ExperienceRenderer (Requirement 9.3):
//     - endDate: rendered when present; "Present" rendered when absent.
//
//   EducationRenderer (Requirement 10.3, 10.4):
//     - gpa: rendered when present; absent from output when undefined.
//     - achievements: rendered when present and non-empty; absent when undefined.
//
//   PersonalProjectRenderer (Requirement 11.3):
//     - githubUrl: link rendered when present; absent when undefined.
//     - liveUrl: link rendered when present; absent when undefined.
//     - endDate: rendered when present; absent when undefined.
//     - challenges: list rendered when present and non-empty; absent when undefined.
//     - solutions: list rendered when present and non-empty; absent when undefined.
//     - results: list rendered when present and non-empty; absent when undefined.
//
//   ProfessionalProjectRenderer (Requirement 11.5):
//     - No repository/GitHub/source links are ever rendered, regardless of input.
//
// Strategy:
//   For each optional field, generate two variants of the entity:
//     1. With the field present (assert it appears in the output).
//     2. With the field absent/undefined (assert it does NOT appear in the output).
//   Use fast-check to generate arbitrary base entities and vary the optional field.
//
// Tooling: Vitest + fast-check + @testing-library/react, numRuns = 100.

import { describe, expect, it, afterEach } from "vitest";
import * as fc from "fast-check";
import { render } from "@testing-library/react";
import React from "react";

// ---------------------------------------------------------------------------
// Component imports
// ---------------------------------------------------------------------------

import { ExperienceRenderer } from "@/components/ui/ExperienceRenderer";
import { EducationRenderer } from "@/components/ui/EducationRenderer";
import { PersonalProjectRenderer } from "@/components/ui/PersonalProjectRenderer";
import { ProfessionalProjectRenderer } from "@/components/ui/ProfessionalProjectRenderer";

// ---------------------------------------------------------------------------
// Type imports
// ---------------------------------------------------------------------------

import type {
  ExperienceEntry,
  EducationEntry,
  PersonalProject,
  ProfessionalProject,
} from "@/types/content";

// ---------------------------------------------------------------------------
// Arbitraries — helpers
// ---------------------------------------------------------------------------

const nonEmptyStringArb: fc.Arbitrary<string> = fc
  .string({ minLength: 1, maxLength: 40 })
  .map((s) => s.trim())
  .filter((s) => s.length > 0);

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

const nonEmptyStringArrayArb: fc.Arbitrary<string[]> = fc.array(
  nonEmptyStringArb,
  { minLength: 1, maxLength: 4 },
);

const urlArb: fc.Arbitrary<string> = nonEmptyStringArb.map(
  (s) => `https://example.com/${s.replace(/\s/g, "-")}`,
);

// ---------------------------------------------------------------------------
// Base entity arbitraries (all optional fields set to undefined)
// ---------------------------------------------------------------------------

/** ExperienceEntry with endDate absent. */
const experienceNoEndDateArb: fc.Arbitrary<ExperienceEntry> = fc.record({
  company: nonEmptyStringArb,
  role: nonEmptyStringArb,
  location: nonEmptyStringArb,
  startDate: isoDateArb,
  endDate: fc.constant(undefined),
  achievements: nonEmptyStringArrayArb,
  technologies: nonEmptyStringArrayArb,
  impactMetrics: nonEmptyStringArrayArb,
});

/** ExperienceEntry with endDate present. */
const experienceWithEndDateArb: fc.Arbitrary<ExperienceEntry> = fc.record({
  company: nonEmptyStringArb,
  role: nonEmptyStringArb,
  location: nonEmptyStringArb,
  startDate: isoDateArb,
  endDate: isoDateArb,
  achievements: nonEmptyStringArrayArb,
  technologies: nonEmptyStringArrayArb,
  impactMetrics: nonEmptyStringArrayArb,
});

/** EducationEntry with all optional fields absent. */
const educationBaseArb: fc.Arbitrary<EducationEntry> = fc.record({
  school: nonEmptyStringArb,
  degree: nonEmptyStringArb,
  major: nonEmptyStringArb,
  startDate: isoDateArb,
  endDate: fc.option(isoDateArb, { nil: undefined }),
  gpa: fc.constant(undefined),
  achievements: fc.constant(undefined),
});

/** PersonalProject with all optional fields absent. */
const personalProjectBaseArb: fc.Arbitrary<PersonalProject> = fc.record({
  kind: fc.constant("personal" as const),
  slug: nonEmptyStringArb.map((s) => s.replace(/\s/g, "-").toLowerCase()),
  title: nonEmptyStringArb,
  description: nonEmptyStringArb,
  image: urlArb,
  technologies: nonEmptyStringArrayArb,
  featured: fc.boolean(),
  startDate: isoDateArb,
  githubUrl: fc.constant(undefined),
  liveUrl: fc.constant(undefined),
  endDate: fc.constant(undefined),
  challenges: fc.constant(undefined),
  solutions: fc.constant(undefined),
  results: fc.constant(undefined),
  overview: fc.constant(undefined),
  problem: fc.constant(undefined),
  solution: fc.constant(undefined),
  architecture: fc.constant(undefined),
  lessonsLearned: fc.constant(undefined),
  gallery: fc.constant(undefined),
});

/** ProfessionalProject base. */
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
  overview: fc.constant(undefined),
  problem: fc.constant(undefined),
  solution: fc.constant(undefined),
  architecture: fc.constant(undefined),
  lessonsLearned: fc.constant(undefined),
  gallery: fc.constant(undefined),
});

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function assertTextPresent(container: HTMLElement, text: string): void {
  expect(
    container.textContent,
    `Expected rendered output to contain "${text}"`,
  ).toContain(text);
}

function assertTextAbsent(container: HTMLElement, text: string): void {
  expect(
    container.textContent,
    `Expected rendered output NOT to contain "${text}"`,
  ).not.toContain(text);
}

function assertLinkAbsent(container: HTMLElement): void {
  const links = container.querySelectorAll("a");
  expect(links.length, "Expected no <a> elements in the rendered output").toBe(
    0,
  );
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe("Property 12: Optional fields render exactly when present", () => {
  afterEach(() => {
    document.body.innerHTML = "";
  });

  // -------------------------------------------------------------------------
  // ExperienceRenderer — endDate (Requirement 9.3)
  // -------------------------------------------------------------------------
  describe("ExperienceRenderer — endDate (Requirement 9.3)", () => {
    it("renders 'Present' when endDate is absent", () => {
      fc.assert(
        fc.property(experienceNoEndDateArb, (entry) => {
          const { container, unmount } = render(
            React.createElement(ExperienceRenderer, { entry }),
          );

          assertTextPresent(container, "Present");

          unmount();
        }),
        { numRuns: 100 },
      );
    });

    it("renders the endDate value when endDate is present", () => {
      fc.assert(
        fc.property(experienceWithEndDateArb, (entry) => {
          const { container, unmount } = render(
            React.createElement(ExperienceRenderer, { entry }),
          );

          assertTextPresent(container, entry.endDate!);

          unmount();
        }),
        { numRuns: 100 },
      );
    });

    it("does NOT render 'Present' when endDate is present", () => {
      fc.assert(
        fc.property(experienceWithEndDateArb, (entry) => {
          const { container, unmount } = render(
            React.createElement(ExperienceRenderer, { entry }),
          );

          assertTextAbsent(container, "Present");

          unmount();
        }),
        { numRuns: 100 },
      );
    });
  });

  // -------------------------------------------------------------------------
  // EducationRenderer — gpa (Requirement 10.3)
  // -------------------------------------------------------------------------
  describe("EducationRenderer — gpa (Requirement 10.3)", () => {
    it("renders GPA when gpa is present", () => {
      fc.assert(
        fc.property(educationBaseArb, nonEmptyStringArb, (entry, gpa) => {
          const entryWithGpa: EducationEntry = { ...entry, gpa };
          const { container, unmount } = render(
            React.createElement(EducationRenderer, { entry: entryWithGpa }),
          );

          assertTextPresent(container, gpa);
          assertTextPresent(container, "GPA");

          unmount();
        }),
        { numRuns: 100 },
      );
    });

    it("does NOT render GPA when gpa is absent", () => {
      fc.assert(
        fc.property(educationBaseArb, (entry) => {
          // entry has gpa: undefined from the base arbitrary
          const { container, unmount } = render(
            React.createElement(EducationRenderer, { entry }),
          );

          assertTextAbsent(container, "GPA");

          unmount();
        }),
        { numRuns: 100 },
      );
    });
  });

  // -------------------------------------------------------------------------
  // EducationRenderer — achievements (Requirement 10.4)
  // -------------------------------------------------------------------------
  describe("EducationRenderer — achievements (Requirement 10.4)", () => {
    it("renders achievements when present and non-empty", () => {
      fc.assert(
        fc.property(
          educationBaseArb,
          nonEmptyStringArrayArb,
          (entry, achievements) => {
            const entryWithAchievements: EducationEntry = {
              ...entry,
              achievements,
            };
            const { container, unmount } = render(
              React.createElement(EducationRenderer, {
                entry: entryWithAchievements,
              }),
            );

            for (const achievement of achievements) {
              assertTextPresent(container, achievement);
            }

            unmount();
          },
        ),
        { numRuns: 100 },
      );
    });

    it("does NOT render achievements section when achievements is absent", () => {
      fc.assert(
        fc.property(educationBaseArb, (entry) => {
          // entry has achievements: undefined from the base arbitrary
          const { container, unmount } = render(
            React.createElement(EducationRenderer, { entry }),
          );

          // The "Achievements" section label must not appear.
          assertTextAbsent(container, "Achievements");

          unmount();
        }),
        { numRuns: 100 },
      );
    });
  });

  // -------------------------------------------------------------------------
  // PersonalProjectRenderer — githubUrl (Requirement 11.3)
  // -------------------------------------------------------------------------
  describe("PersonalProjectRenderer — githubUrl (Requirement 11.3)", () => {
    it("renders a GitHub link when githubUrl is present", () => {
      fc.assert(
        fc.property(personalProjectBaseArb, urlArb, (project, githubUrl) => {
          const projectWithGithub: PersonalProject = { ...project, githubUrl };
          const { container, unmount } = render(
            React.createElement(PersonalProjectRenderer, {
              project: projectWithGithub,
            }),
          );

          const links = container.querySelectorAll("a");
          const githubLink = Array.from(links).find(
            (a) => a.getAttribute("href") === githubUrl,
          );
          expect(
            githubLink,
            `Expected a link with href="${githubUrl}" to be rendered`,
          ).toBeDefined();

          unmount();
        }),
        { numRuns: 100 },
      );
    });

    it("does NOT render a GitHub link when githubUrl is absent", () => {
      fc.assert(
        fc.property(personalProjectBaseArb, (project) => {
          // project has githubUrl: undefined from the base arbitrary
          const { container, unmount } = render(
            React.createElement(PersonalProjectRenderer, { project }),
          );

          assertTextAbsent(container, "GitHub");

          unmount();
        }),
        { numRuns: 100 },
      );
    });
  });

  // -------------------------------------------------------------------------
  // PersonalProjectRenderer — liveUrl (Requirement 11.3)
  // -------------------------------------------------------------------------
  describe("PersonalProjectRenderer — liveUrl (Requirement 11.3)", () => {
    it("renders a Live Demo link when liveUrl is present", () => {
      fc.assert(
        fc.property(personalProjectBaseArb, urlArb, (project, liveUrl) => {
          const projectWithLive: PersonalProject = { ...project, liveUrl };
          const { container, unmount } = render(
            React.createElement(PersonalProjectRenderer, {
              project: projectWithLive,
            }),
          );

          const links = container.querySelectorAll("a");
          const liveLink = Array.from(links).find(
            (a) => a.getAttribute("href") === liveUrl,
          );
          expect(
            liveLink,
            `Expected a link with href="${liveUrl}" to be rendered`,
          ).toBeDefined();

          unmount();
        }),
        { numRuns: 100 },
      );
    });

    it("does NOT render a Live Demo link when liveUrl is absent", () => {
      fc.assert(
        fc.property(personalProjectBaseArb, (project) => {
          const { container, unmount } = render(
            React.createElement(PersonalProjectRenderer, { project }),
          );

          assertTextAbsent(container, "Live Demo");

          unmount();
        }),
        { numRuns: 100 },
      );
    });
  });

  // -------------------------------------------------------------------------
  // PersonalProjectRenderer — endDate (Requirement 11.3)
  // -------------------------------------------------------------------------
  describe("PersonalProjectRenderer — endDate (Requirement 11.3)", () => {
    it("renders endDate when present", () => {
      fc.assert(
        fc.property(personalProjectBaseArb, isoDateArb, (project, endDate) => {
          const projectWithEnd: PersonalProject = { ...project, endDate };
          const { container, unmount } = render(
            React.createElement(PersonalProjectRenderer, {
              project: projectWithEnd,
            }),
          );

          assertTextPresent(container, endDate);

          unmount();
        }),
        { numRuns: 100 },
      );
    });

    it("does NOT render endDate when absent", () => {
      fc.assert(
        fc.property(personalProjectBaseArb, (project) => {
          // project has endDate: undefined from the base arbitrary
          // The startDate is present; we verify the date range separator "–"
          // is not followed by a second date.
          const { container, unmount } = render(
            React.createElement(PersonalProjectRenderer, { project }),
          );

          // The meta text should contain startDate but NOT "– <someDate>"
          // (i.e. no end date appended after the dash).
          const metaText = container.textContent ?? "";
          // startDate must be present
          expect(metaText).toContain(project.startDate);
          // The text after startDate must not contain " – " followed by a date
          const afterStart = metaText.slice(
            metaText.indexOf(project.startDate) + project.startDate.length,
          );
          expect(afterStart).not.toMatch(/–\s*\d{4}-\d{2}-\d{2}/);

          unmount();
        }),
        { numRuns: 100 },
      );
    });
  });

  // -------------------------------------------------------------------------
  // PersonalProjectRenderer — challenges (Requirement 11.3)
  // -------------------------------------------------------------------------
  describe("PersonalProjectRenderer — challenges (Requirement 11.3)", () => {
    it("renders challenges when present and non-empty", () => {
      fc.assert(
        fc.property(
          personalProjectBaseArb,
          nonEmptyStringArrayArb,
          (project, challenges) => {
            const projectWithChallenges: PersonalProject = {
              ...project,
              challenges,
            };
            const { container, unmount } = render(
              React.createElement(PersonalProjectRenderer, {
                project: projectWithChallenges,
              }),
            );

            assertTextPresent(container, "Challenges");
            for (const item of challenges) {
              assertTextPresent(container, item);
            }

            unmount();
          },
        ),
        { numRuns: 100 },
      );
    });

    it("does NOT render Challenges section when challenges is absent", () => {
      fc.assert(
        fc.property(personalProjectBaseArb, (project) => {
          const { container, unmount } = render(
            React.createElement(PersonalProjectRenderer, { project }),
          );

          assertTextAbsent(container, "Challenges");

          unmount();
        }),
        { numRuns: 100 },
      );
    });
  });

  // -------------------------------------------------------------------------
  // PersonalProjectRenderer — solutions (Requirement 11.3)
  // -------------------------------------------------------------------------
  describe("PersonalProjectRenderer — solutions (Requirement 11.3)", () => {
    it("renders solutions when present and non-empty", () => {
      fc.assert(
        fc.property(
          personalProjectBaseArb,
          nonEmptyStringArrayArb,
          (project, solutions) => {
            const projectWithSolutions: PersonalProject = {
              ...project,
              solutions,
            };
            const { container, unmount } = render(
              React.createElement(PersonalProjectRenderer, {
                project: projectWithSolutions,
              }),
            );

            assertTextPresent(container, "Solutions");
            for (const item of solutions) {
              assertTextPresent(container, item);
            }

            unmount();
          },
        ),
        { numRuns: 100 },
      );
    });

    it("does NOT render Solutions section when solutions is absent", () => {
      fc.assert(
        fc.property(personalProjectBaseArb, (project) => {
          const { container, unmount } = render(
            React.createElement(PersonalProjectRenderer, { project }),
          );

          assertTextAbsent(container, "Solutions");

          unmount();
        }),
        { numRuns: 100 },
      );
    });
  });

  // -------------------------------------------------------------------------
  // PersonalProjectRenderer — results (Requirement 11.3)
  // -------------------------------------------------------------------------
  describe("PersonalProjectRenderer — results (Requirement 11.3)", () => {
    it("renders results when present and non-empty", () => {
      fc.assert(
        fc.property(
          personalProjectBaseArb,
          nonEmptyStringArrayArb,
          (project, results) => {
            const projectWithResults: PersonalProject = {
              ...project,
              results,
            };
            const { container, unmount } = render(
              React.createElement(PersonalProjectRenderer, {
                project: projectWithResults,
              }),
            );

            assertTextPresent(container, "Results");
            for (const item of results) {
              assertTextPresent(container, item);
            }

            unmount();
          },
        ),
        { numRuns: 100 },
      );
    });

    it("does NOT render Results section when results is absent", () => {
      fc.assert(
        fc.property(personalProjectBaseArb, (project) => {
          const { container, unmount } = render(
            React.createElement(PersonalProjectRenderer, { project }),
          );

          assertTextAbsent(container, "Results");

          unmount();
        }),
        { numRuns: 100 },
      );
    });
  });

  // -------------------------------------------------------------------------
  // ProfessionalProjectRenderer — no repository links ever (Requirement 11.5)
  // -------------------------------------------------------------------------
  describe("ProfessionalProjectRenderer — no repository links (Requirement 11.5)", () => {
    it("never renders any <a> links for any ProfessionalProject", () => {
      fc.assert(
        fc.property(professionalProjectArb, (project) => {
          const { container, unmount } = render(
            React.createElement(ProfessionalProjectRenderer, { project }),
          );

          assertLinkAbsent(container);

          unmount();
        }),
        { numRuns: 100 },
      );
    });

    it("never renders 'GitHub' text for any ProfessionalProject", () => {
      fc.assert(
        fc.property(professionalProjectArb, (project) => {
          const { container, unmount } = render(
            React.createElement(ProfessionalProjectRenderer, { project }),
          );

          assertTextAbsent(container, "GitHub");
          assertTextAbsent(container, "github");
          assertTextAbsent(container, "repository");
          assertTextAbsent(container, "source code");

          unmount();
        }),
        { numRuns: 100 },
      );
    });
  });
});
