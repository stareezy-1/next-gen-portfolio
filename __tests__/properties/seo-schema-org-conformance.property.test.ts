// Feature: next-gen-portfolio-platform, Property 33: Emitted structured data validates against its schema.org type
//
// **Validates: Requirements 19.7**
//
// Property 33: Emitted structured data validates against its schema.org type.
// Tests the structured-data builders from @/services/seo/structured-data:
//   - personJsonLd: @type "Person", has name, url fields
//   - blogPostingJsonLd: @type "BlogPosting", has headline, datePublished, author fields
//   - creativeWorkJsonLd: @type "CreativeWork", has name, description fields
//   - breadcrumbListJsonLd: @type "BreadcrumbList", has itemListElement array
//   - faqPageJsonLd: @type "FAQPage", has mainEntity array
//
// Tooling: Vitest + fast-check, numRuns = 100.

import { describe, it, expect } from "vitest";
import * as fc from "fast-check";

import {
  personJsonLd,
  blogPostingJsonLd,
  creativeWorkJsonLd,
  breadcrumbListJsonLd,
  faqPageJsonLd,
} from "@/services/seo/structured-data";
import { SITE_URL } from "@/constants/seo";
import type {
  BlogPost,
  PersonalProject,
  ProfessionalProject,
} from "@/types/content";

// ---------------------------------------------------------------------------
// Arbitraries
// ---------------------------------------------------------------------------

/** Non-empty string (printable, trimmed). */
const nonEmptyStringArb: fc.Arbitrary<string> = fc
  .string({ minLength: 1, maxLength: 80 })
  .map((s) => s.trim())
  .filter((s) => s.length > 0);

/** Valid slug. */
const slugArb: fc.Arbitrary<string> = fc
  .stringMatching(/^[a-z][a-z0-9-]*$/)
  .filter((s) => s.length >= 1 && s.length <= 40);

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

/** URL string. */
const urlArb: fc.Arbitrary<string> = slugArb.map(
  (s) => `https://example.com/${s}`,
);

/** Non-empty array of non-empty strings. */
const nonEmptyStringArrayArb: fc.Arbitrary<string[]> = fc.array(
  nonEmptyStringArb,
  { minLength: 1, maxLength: 4 },
);

/** Arbitrary data for personJsonLd. */
const personDataArb: fc.Arbitrary<{
  name: string;
  url: string;
  description: string;
  sameAs?: string[];
}> = fc.record({
  name: nonEmptyStringArb,
  url: urlArb,
  description: nonEmptyStringArb,
  sameAs: fc.option(fc.array(urlArb, { minLength: 1, maxLength: 3 }), {
    nil: undefined,
  }),
});

/** Arbitrary BlogPost. */
const blogPostArb: fc.Arbitrary<BlogPost> = fc.record({
  slug: slugArb,
  title: nonEmptyStringArb,
  description: nonEmptyStringArb,
  heroImage: urlArb,
  author: nonEmptyStringArb,
  publishDate: isoDateArb,
  tags: fc.array(nonEmptyStringArb, { minLength: 0, maxLength: 4 }),
  category: nonEmptyStringArb,
  published: fc.boolean(),
  body: fc.string({ minLength: 0, maxLength: 200 }),
});

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

/** Arbitrary project (personal or professional). */
const projectArb: fc.Arbitrary<PersonalProject | ProfessionalProject> =
  fc.oneof(personalProjectArb, professionalProjectArb);

/** Arbitrary breadcrumb items array (at least 1 item). */
const breadcrumbItemsArb: fc.Arbitrary<Array<{ name: string; url: string }>> =
  fc.array(fc.record({ name: nonEmptyStringArb, url: urlArb }), {
    minLength: 1,
    maxLength: 5,
  });

/** Arbitrary FAQ items array (at least 1 item). */
const faqItemsArb: fc.Arbitrary<Array<{ question: string; answer: string }>> =
  fc.array(
    fc.record({ question: nonEmptyStringArb, answer: nonEmptyStringArb }),
    { minLength: 1, maxLength: 5 },
  );

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe("Property 33: Emitted structured data validates against its schema.org type", () => {
  // -------------------------------------------------------------------------
  // personJsonLd
  // -------------------------------------------------------------------------
  describe("personJsonLd", () => {
    it('has @type "Person"', () => {
      fc.assert(
        fc.property(personDataArb, (data) => {
          const result = personJsonLd(data);
          expect(result["@type"]).toBe("Person");
        }),
        { numRuns: 100 },
      );
    });

    it('has @context "https://schema.org"', () => {
      fc.assert(
        fc.property(personDataArb, (data) => {
          const result = personJsonLd(data);
          expect(result["@context"]).toBe("https://schema.org");
        }),
        { numRuns: 100 },
      );
    });

    it("has name field matching input", () => {
      fc.assert(
        fc.property(personDataArb, (data) => {
          const result = personJsonLd(data);
          expect(result["name"]).toBe(data.name);
        }),
        { numRuns: 100 },
      );
    });

    it("has url field matching input", () => {
      fc.assert(
        fc.property(personDataArb, (data) => {
          const result = personJsonLd(data);
          expect(result["url"]).toBe(data.url);
        }),
        { numRuns: 100 },
      );
    });

    it("has description field matching input", () => {
      fc.assert(
        fc.property(personDataArb, (data) => {
          const result = personJsonLd(data);
          expect(result["description"]).toBe(data.description);
        }),
        { numRuns: 100 },
      );
    });
  });

  // -------------------------------------------------------------------------
  // blogPostingJsonLd
  // -------------------------------------------------------------------------
  describe("blogPostingJsonLd", () => {
    it('has @type "BlogPosting"', () => {
      fc.assert(
        fc.property(blogPostArb, urlArb, (post, url) => {
          const result = blogPostingJsonLd(post, url);
          expect(result["@type"]).toBe("BlogPosting");
        }),
        { numRuns: 100 },
      );
    });

    it("has headline field (from post.title)", () => {
      fc.assert(
        fc.property(blogPostArb, urlArb, (post, url) => {
          const result = blogPostingJsonLd(post, url);
          expect(result["headline"]).toBe(post.title);
        }),
        { numRuns: 100 },
      );
    });

    it("has datePublished field (from post.publishDate)", () => {
      fc.assert(
        fc.property(blogPostArb, urlArb, (post, url) => {
          const result = blogPostingJsonLd(post, url);
          expect(result["datePublished"]).toBe(post.publishDate);
        }),
        { numRuns: 100 },
      );
    });

    it("has author field", () => {
      fc.assert(
        fc.property(blogPostArb, urlArb, (post, url) => {
          const result = blogPostingJsonLd(post, url);
          expect(result["author"]).toBeDefined();
          const author = result["author"] as { "@type": string; name: string };
          expect(author["@type"]).toBe("Person");
          expect(author["name"]).toBe(post.author);
        }),
        { numRuns: 100 },
      );
    });
  });

  // -------------------------------------------------------------------------
  // creativeWorkJsonLd
  // -------------------------------------------------------------------------
  describe("creativeWorkJsonLd", () => {
    it('has @type "CreativeWork"', () => {
      fc.assert(
        fc.property(projectArb, urlArb, (project, url) => {
          const result = creativeWorkJsonLd(project, url);
          expect(result["@type"]).toBe("CreativeWork");
        }),
        { numRuns: 100 },
      );
    });

    it("has name field (from project.title)", () => {
      fc.assert(
        fc.property(projectArb, urlArb, (project, url) => {
          const result = creativeWorkJsonLd(project, url);
          expect(result["name"]).toBe(project.title);
        }),
        { numRuns: 100 },
      );
    });

    it("has description field (from project.description)", () => {
      fc.assert(
        fc.property(projectArb, urlArb, (project, url) => {
          const result = creativeWorkJsonLd(project, url);
          expect(result["description"]).toBe(project.description);
        }),
        { numRuns: 100 },
      );
    });
  });

  // -------------------------------------------------------------------------
  // breadcrumbListJsonLd
  // -------------------------------------------------------------------------
  describe("breadcrumbListJsonLd", () => {
    it('has @type "BreadcrumbList"', () => {
      fc.assert(
        fc.property(breadcrumbItemsArb, (items) => {
          const result = breadcrumbListJsonLd(items);
          expect(result["@type"]).toBe("BreadcrumbList");
        }),
        { numRuns: 100 },
      );
    });

    it("has itemListElement array with correct length", () => {
      fc.assert(
        fc.property(breadcrumbItemsArb, (items) => {
          const result = breadcrumbListJsonLd(items);
          const list = result["itemListElement"] as unknown[];
          expect(Array.isArray(list)).toBe(true);
          expect(list.length).toBe(items.length);
        }),
        { numRuns: 100 },
      );
    });

    it("itemListElement entries have @type ListItem, position, name, item", () => {
      fc.assert(
        fc.property(breadcrumbItemsArb, (items) => {
          const result = breadcrumbListJsonLd(items);
          const list = result["itemListElement"] as Array<{
            "@type": string;
            position: number;
            name: string;
            item: string;
          }>;
          for (let i = 0; i < items.length; i++) {
            expect(list[i]!["@type"]).toBe("ListItem");
            expect(list[i]!.position).toBe(i + 1);
            expect(list[i]!.name).toBe(items[i]!.name);
            expect(list[i]!.item).toBe(items[i]!.url);
          }
        }),
        { numRuns: 100 },
      );
    });
  });

  // -------------------------------------------------------------------------
  // faqPageJsonLd
  // -------------------------------------------------------------------------
  describe("faqPageJsonLd", () => {
    it('has @type "FAQPage"', () => {
      fc.assert(
        fc.property(faqItemsArb, (faqs) => {
          const result = faqPageJsonLd(faqs);
          expect(result["@type"]).toBe("FAQPage");
        }),
        { numRuns: 100 },
      );
    });

    it("has mainEntity array with correct length", () => {
      fc.assert(
        fc.property(faqItemsArb, (faqs) => {
          const result = faqPageJsonLd(faqs);
          const entities = result["mainEntity"] as unknown[];
          expect(Array.isArray(entities)).toBe(true);
          expect(entities.length).toBe(faqs.length);
        }),
        { numRuns: 100 },
      );
    });

    it("mainEntity entries have @type Question, name, acceptedAnswer", () => {
      fc.assert(
        fc.property(faqItemsArb, (faqs) => {
          const result = faqPageJsonLd(faqs);
          const entities = result["mainEntity"] as Array<{
            "@type": string;
            name: string;
            acceptedAnswer: { "@type": string; text: string };
          }>;
          for (let i = 0; i < faqs.length; i++) {
            expect(entities[i]!["@type"]).toBe("Question");
            expect(entities[i]!.name).toBe(faqs[i]!.question);
            expect(entities[i]!.acceptedAnswer["@type"]).toBe("Answer");
            expect(entities[i]!.acceptedAnswer.text).toBe(faqs[i]!.answer);
          }
        }),
        { numRuns: 100 },
      );
    });
  });

  // -------------------------------------------------------------------------
  // Spot-check examples
  // -------------------------------------------------------------------------
  describe("spot-check examples", () => {
    it("personJsonLd produces correct shape", () => {
      const result = personJsonLd({
        name: "Stareezy",
        url: `${SITE_URL}`,
        description: "Full-Stack Engineer",
      });
      expect(result["@context"]).toBe("https://schema.org");
      expect(result["@type"]).toBe("Person");
      expect(result["name"]).toBe("Stareezy");
      expect(result["url"]).toBe(SITE_URL);
    });

    it("breadcrumbListJsonLd with two items has positions 1 and 2", () => {
      const result = breadcrumbListJsonLd([
        { name: "Home", url: SITE_URL },
        { name: "Blog", url: `${SITE_URL}/blog` },
      ]);
      const list = result["itemListElement"] as Array<{ position: number }>;
      expect(list[0]!.position).toBe(1);
      expect(list[1]!.position).toBe(2);
    });

    it("faqPageJsonLd with one FAQ has correct structure", () => {
      const result = faqPageJsonLd([
        { question: "What do you do?", answer: "I build software." },
      ]);
      expect(result["@type"]).toBe("FAQPage");
      const entities = result["mainEntity"] as Array<{
        "@type": string;
        name: string;
      }>;
      expect(entities[0]!["@type"]).toBe("Question");
      expect(entities[0]!.name).toBe("What do you do?");
    });
  });
});
