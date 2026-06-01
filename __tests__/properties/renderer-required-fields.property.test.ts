// Feature: next-gen-portfolio-platform, Property 11: Renderers include every required field of an entity
//
// **Validates: Requirements 9.2, 10.2, 11.2, 11.4, 12.2, 14.1**
//
// Property 11: Renderers include every required field of an entity.
// For any content entity (ExperienceEntry, EducationEntry, PersonalProject,
// ProfessionalProject, BlogPost), the rendered output includes every field
// the requirements mandate for that entity type.
//
// Contracts under test:
//
//   ExperienceRenderer (Requirement 9.2):
//     - Renders: company, role, location, startDate, endDate (or "Present"),
//       achievements (all items), technologies (all items), impactMetrics (all items).
//
//   EducationRenderer (Requirement 10.2):
//     - Renders: school, degree, major, startDate, endDate.
//
//   PersonalProjectRenderer (Requirement 11.2):
//     - Renders: title, description, technologies (all items), startDate.
//     - featured flag renders a "Featured" badge when true.
//
//   ProfessionalProjectRenderer (Requirement 11.4):
//     - Renders: title, company, role, description, technologies (all items),
//       achievements (all items).
//     - featured flag renders a "Featured" badge when true.
//
//   BlogPostRenderer (Requirement 14.1):
//     - Renders: title, author, publishDate (formatted), description,
//       tags (all items), category.
//
// Strategy:
//   Generate arbitrary valid entities using fast-check, render each renderer
//   with @testing-library/react, and assert every required field appears in
//   the rendered output. Image fields are not asserted via text content (they
//   are rendered as <img> alt attributes instead).
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
import { BlogPostRenderer } from "@/components/ui/BlogPostRenderer";

// ---------------------------------------------------------------------------
// Type imports
// ---------------------------------------------------------------------------

import type {
  ExperienceEntry,
  EducationEntry,
  PersonalProject,
  ProfessionalProject,
  BlogPost,
} from "@/types/content";

// ---------------------------------------------------------------------------
// Arbitraries — helpers
// ---------------------------------------------------------------------------

/** Non-empty string (printable ASCII, no leading/trailing whitespace). */
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

// ---------------------------------------------------------------------------
// Entity arbitraries
// ---------------------------------------------------------------------------

const experienceEntryArb: fc.Arbitrary<ExperienceEntry> = fc.record({
  company: nonEmptyStringArb,
  role: nonEmptyStringArb,
  location: nonEmptyStringArb,
  startDate: isoDateArb,
  endDate: fc.option(isoDateArb, { nil: undefined }),
  achievements: nonEmptyStringArrayArb,
  technologies: nonEmptyStringArrayArb,
  impactMetrics: nonEmptyStringArrayArb,
});

const educationEntryArb: fc.Arbitrary<EducationEntry> = fc.record({
  school: nonEmptyStringArb,
  degree: nonEmptyStringArb,
  major: nonEmptyStringArb,
  startDate: isoDateArb,
  endDate: fc.option(isoDateArb, { nil: undefined }),
  gpa: fc.option(nonEmptyStringArb, { nil: undefined }),
  achievements: fc.option(nonEmptyStringArrayArb, { nil: undefined }),
});

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

const blogPostArb: fc.Arbitrary<BlogPost> = fc.record({
  slug: nonEmptyStringArb.map((s) => s.replace(/\s/g, "-").toLowerCase()),
  title: nonEmptyStringArb,
  description: nonEmptyStringArb,
  heroImage: urlArb,
  author: nonEmptyStringArb,
  publishDate: isoDateArb,
  tags: nonEmptyStringArrayArb,
  category: nonEmptyStringArb,
  published: fc.boolean(),
  body: nonEmptyStringArb,
});

// ---------------------------------------------------------------------------
// Helper: assert text appears in the rendered container
// ---------------------------------------------------------------------------

function assertTextPresent(container: HTMLElement, text: string): void {
  expect(
    container.textContent,
    `Expected rendered output to contain "${text}"`,
  ).toContain(text);
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe("Property 11: Renderers include every required field of an entity", () => {
  afterEach(() => {
    document.body.innerHTML = "";
  });

  // -------------------------------------------------------------------------
  // ExperienceRenderer — Requirement 9.2
  // -------------------------------------------------------------------------
  describe("ExperienceRenderer renders all required fields (Requirement 9.2)", () => {
    it("renders company, role, location, startDate for any ExperienceEntry", () => {
      fc.assert(
        fc.property(experienceEntryArb, (entry) => {
          const { container, unmount } = render(
            React.createElement(ExperienceRenderer, { entry }),
          );

          assertTextPresent(container, entry.company);
          assertTextPresent(container, entry.role);
          assertTextPresent(container, entry.location);
          assertTextPresent(container, entry.startDate);

          unmount();
        }),
        { numRuns: 100 },
      );
    });

    it("renders all achievements for any ExperienceEntry", () => {
      fc.assert(
        fc.property(experienceEntryArb, (entry) => {
          const { container, unmount } = render(
            React.createElement(ExperienceRenderer, { entry }),
          );

          for (const achievement of entry.achievements) {
            assertTextPresent(container, achievement);
          }

          unmount();
        }),
        { numRuns: 100 },
      );
    });

    it("renders all technologies for any ExperienceEntry", () => {
      fc.assert(
        fc.property(experienceEntryArb, (entry) => {
          const { container, unmount } = render(
            React.createElement(ExperienceRenderer, { entry }),
          );

          for (const tech of entry.technologies) {
            assertTextPresent(container, tech);
          }

          unmount();
        }),
        { numRuns: 100 },
      );
    });

    it("renders all impactMetrics for any ExperienceEntry", () => {
      fc.assert(
        fc.property(experienceEntryArb, (entry) => {
          const { container, unmount } = render(
            React.createElement(ExperienceRenderer, { entry }),
          );

          for (const metric of entry.impactMetrics) {
            assertTextPresent(container, metric);
          }

          unmount();
        }),
        { numRuns: 100 },
      );
    });
  });

  // -------------------------------------------------------------------------
  // EducationRenderer — Requirement 10.2
  // -------------------------------------------------------------------------
  describe("EducationRenderer renders all required fields (Requirement 10.2)", () => {
    it("renders school, degree, major, startDate for any EducationEntry", () => {
      fc.assert(
        fc.property(educationEntryArb, (entry) => {
          const { container, unmount } = render(
            React.createElement(EducationRenderer, { entry }),
          );

          assertTextPresent(container, entry.school);
          assertTextPresent(container, entry.degree);
          assertTextPresent(container, entry.major);
          assertTextPresent(container, entry.startDate);

          unmount();
        }),
        { numRuns: 100 },
      );
    });

    it("renders endDate when present for any EducationEntry", () => {
      fc.assert(
        fc.property(
          educationEntryArb.filter((e) => e.endDate !== undefined),
          (entry) => {
            const { container, unmount } = render(
              React.createElement(EducationRenderer, { entry }),
            );

            assertTextPresent(container, entry.endDate!);

            unmount();
          },
        ),
        { numRuns: 100 },
      );
    });
  });

  // -------------------------------------------------------------------------
  // PersonalProjectRenderer — Requirement 11.2
  // -------------------------------------------------------------------------
  describe("PersonalProjectRenderer renders all required fields (Requirement 11.2)", () => {
    it("renders title, description, startDate for any PersonalProject", () => {
      fc.assert(
        fc.property(personalProjectArb, (project) => {
          const { container, unmount } = render(
            React.createElement(PersonalProjectRenderer, { project }),
          );

          assertTextPresent(container, project.title);
          assertTextPresent(container, project.description);
          assertTextPresent(container, project.startDate);

          unmount();
        }),
        { numRuns: 100 },
      );
    });

    it("renders all technologies for any PersonalProject", () => {
      fc.assert(
        fc.property(personalProjectArb, (project) => {
          const { container, unmount } = render(
            React.createElement(PersonalProjectRenderer, { project }),
          );

          for (const tech of project.technologies) {
            assertTextPresent(container, tech);
          }

          unmount();
        }),
        { numRuns: 100 },
      );
    });

    it("renders 'Featured' badge when featured=true", () => {
      fc.assert(
        fc.property(
          personalProjectArb.map((p) => ({ ...p, featured: true })),
          (project) => {
            const { container, unmount } = render(
              React.createElement(PersonalProjectRenderer, { project }),
            );

            assertTextPresent(container, "Featured");

            unmount();
          },
        ),
        { numRuns: 100 },
      );
    });
  });

  // -------------------------------------------------------------------------
  // ProfessionalProjectRenderer — Requirement 11.4
  // -------------------------------------------------------------------------
  describe("ProfessionalProjectRenderer renders all required fields (Requirement 11.4)", () => {
    it("renders title, company, role, description for any ProfessionalProject", () => {
      fc.assert(
        fc.property(professionalProjectArb, (project) => {
          const { container, unmount } = render(
            React.createElement(ProfessionalProjectRenderer, { project }),
          );

          assertTextPresent(container, project.title);
          assertTextPresent(container, project.company);
          assertTextPresent(container, project.role);
          assertTextPresent(container, project.description);

          unmount();
        }),
        { numRuns: 100 },
      );
    });

    it("renders all technologies for any ProfessionalProject", () => {
      fc.assert(
        fc.property(professionalProjectArb, (project) => {
          const { container, unmount } = render(
            React.createElement(ProfessionalProjectRenderer, { project }),
          );

          for (const tech of project.technologies) {
            assertTextPresent(container, tech);
          }

          unmount();
        }),
        { numRuns: 100 },
      );
    });

    it("renders all achievements for any ProfessionalProject", () => {
      fc.assert(
        fc.property(professionalProjectArb, (project) => {
          const { container, unmount } = render(
            React.createElement(ProfessionalProjectRenderer, { project }),
          );

          for (const achievement of project.achievements) {
            assertTextPresent(container, achievement);
          }

          unmount();
        }),
        { numRuns: 100 },
      );
    });

    it("renders 'Featured' badge when featured=true", () => {
      fc.assert(
        fc.property(
          professionalProjectArb.map((p) => ({ ...p, featured: true })),
          (project) => {
            const { container, unmount } = render(
              React.createElement(ProfessionalProjectRenderer, { project }),
            );

            assertTextPresent(container, "Featured");

            unmount();
          },
        ),
        { numRuns: 100 },
      );
    });
  });

  // -------------------------------------------------------------------------
  // BlogPostRenderer — Requirement 14.1
  // -------------------------------------------------------------------------
  describe("BlogPostRenderer renders all required fields (Requirement 14.1)", () => {
    it("renders title, author, description, category for any BlogPost", () => {
      fc.assert(
        fc.property(blogPostArb, (post) => {
          const { container, unmount } = render(
            React.createElement(BlogPostRenderer, { post }),
          );

          assertTextPresent(container, post.title);
          assertTextPresent(container, post.author);
          assertTextPresent(container, post.description);
          assertTextPresent(container, post.category);

          unmount();
        }),
        { numRuns: 100 },
      );
    });

    it("renders all tags for any BlogPost", () => {
      fc.assert(
        fc.property(blogPostArb, (post) => {
          const { container, unmount } = render(
            React.createElement(BlogPostRenderer, { post }),
          );

          for (const tag of post.tags) {
            assertTextPresent(container, tag);
          }

          unmount();
        }),
        { numRuns: 100 },
      );
    });

    it("renders a <time> element with the publishDate as dateTime attribute", () => {
      fc.assert(
        fc.property(blogPostArb, (post) => {
          const { container, unmount } = render(
            React.createElement(BlogPostRenderer, { post }),
          );

          const timeEl = container.querySelector("time");
          expect(
            timeEl,
            "BlogPostRenderer must render a <time> element",
          ).not.toBeNull();
          expect(
            timeEl!.getAttribute("dateTime"),
            "<time> dateTime must equal the publishDate",
          ).toBe(post.publishDate);

          unmount();
        }),
        { numRuns: 100 },
      );
    });

    it("renders readingTimeMinutes when provided", () => {
      fc.assert(
        fc.property(
          blogPostArb,
          fc.integer({ min: 1, max: 60 }),
          (post, readingTimeMinutes) => {
            const { container, unmount } = render(
              React.createElement(BlogPostRenderer, {
                post,
                readingTimeMinutes,
              }),
            );

            assertTextPresent(container, `${readingTimeMinutes}`);
            assertTextPresent(container, "min read");

            unmount();
          },
        ),
        { numRuns: 100 },
      );
    });
  });
});
