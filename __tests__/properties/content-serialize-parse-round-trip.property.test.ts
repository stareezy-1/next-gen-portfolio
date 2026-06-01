// Feature: next-gen-portfolio-platform, Property 22: Serialize→parse round-trips to an equal object
//
// Validates: Requirements 15.4, 15.5, 15.6
//
// Property 22: Serialize→parse round-trips to an equal object.
// For any valid content object, parsing the result of serializing it produces a
// content object equal to the original.
//
// Contract under test (`@/content`):
//   - serialize(obj): partitions every own field EXCEPT `body` into YAML
//     frontmatter (keys sorted alphabetically by the `yaml` lib) and writes the
//     `body` string verbatim after the closing `---` fence.
//   - parse(source): splits the frontmatter map and the verbatim body.
//   - Reconstruction is therefore `{ ...frontmatter, body }`.
//
// KEY assertion (per the round-trip contract):
//   const out = parse(serialize(obj));
//   expect({ ...out.frontmatter, body: out.body }).toEqual(obj);
//
// Because `parse` always returns a `body` string and the reconstruction always
// re-attaches it, every generated object is built as `{ ...fields, body }` —
// i.e. each generated content object carries a `body` string. For body-carrying
// collections (blog) that is the MDX body; for the others the serializer still
// treats `body` as the generic verbatim-partitioned field, so attaching one
// keeps the round-trip well-defined and matches the reconstruction formula.
//
// Generator constraints (to keep the test about the serializer's CANONICAL
// contract rather than probing YAML pathologies):
//   - Scalar string fields are single-line, non-empty text built from
//     single-space-joined words (no leading/trailing/consecutive whitespace, no
//     newlines) drawn from an alphabet that includes ASCII letters/digits,
//     punctuation, and non-ASCII (accented Latin, CJK, Cyrillic). Word/length
//     caps keep values well under the serializer's 80-column YAML fold width, so
//     plain scalars never line-fold.
//   - A weighted slice of scalars are deliberately ambiguous tokens that LOOK
//     like non-strings ("123", "3.14", "true", "false", "null", ...). These MUST
//     round-trip AS STRINGS; the type-aware `yaml` serializer quotes them. If
//     one ever fails to round-trip, that is a real serializer bug to report.
//   - Date fields are `YYYY-MM-DD` ISO strings (the YAML 1.2 core schema used by
//     the `yaml` lib does not auto-resolve timestamps, so they stay strings).
//   - The `body` is verbatim (NOT YAML), so it freely includes blank lines,
//     markdown headings, fenced code blocks, `---` lines, and non-ASCII.
//
// Tooling: Vitest + fast-check, numRuns = 100.
import { describe, expect, it } from "vitest";
import * as fc from "fast-check";

import { parse, serialize } from "@/content";
import type { ContentObject } from "@/types";

// --- Scalar building blocks -------------------------------------------------

/**
 * Word alphabet: ASCII letters/digits, a moderate punctuation set, and a
 * spread of non-ASCII code points (spread by code point so no surrogate pairs
 * are split). No whitespace lives inside a word — spacing is controlled by the
 * join below — which keeps generated text free of fold-triggering runs.
 */
const WORD_CHARS = [
  ...("abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789" +
    ".,!?;:'\"()-_/" +
    "éñüößçğ" +
    "日本語한글" +
    "Привет"),
];

/** A single non-empty word (1–7 code points), no whitespace. */
const word = fc
  .array(fc.constantFrom(...WORD_CHARS), { minLength: 1, maxLength: 7 })
  .map((cs) => cs.join(""));

/**
 * Reasonable single-line text: 1–4 words joined by single spaces. Guarantees
 * non-empty, no leading/trailing/consecutive whitespace, no newlines, and a
 * length comfortably below the 80-column YAML fold width.
 */
const plainText = fc
  .array(word, { minLength: 1, maxLength: 4 })
  .map((ws) => ws.join(" "));

/**
 * Ambiguous scalars that LOOK like numbers/booleans/null. The serializer's
 * `yaml.stringify` must quote them so they parse back as strings — this probes
 * the "a string stays a string" canonical contract (Req 15.5).
 */
const ambiguousScalar = fc.constantFrom(
  "0",
  "123",
  "-5",
  "3.14",
  "true",
  "false",
  "null",
  "True",
  "FALSE",
);

/** A string scalar field value (mostly plain text, sometimes ambiguous). */
const scalarText = fc.oneof(
  { weight: 4, arbitrary: plainText },
  { weight: 1, arbitrary: ambiguousScalar },
);

/** A string[] field value; allows the empty-array edge case. */
const textArray = fc.array(scalarText, { minLength: 0, maxLength: 4 });

/** An ISO `YYYY-MM-DD` date string within a bounded, valid range. */
const isoDate = fc
  .date({
    min: new Date("1970-01-01T00:00:00.000Z"),
    max: new Date("2100-12-31T00:00:00.000Z"),
  })
  .map((d) => d.toISOString().slice(0, 10));

/** A boolean field value. */
const flag = fc.boolean();

/**
 * Verbatim MDX body. Written after the closing fence, so it is NOT YAML and may
 * contain blank lines, markdown headings, fenced code, `---` lines, and
 * non-ASCII. Joining with `\n` keeps line endings to LF only.
 */
const bodyLine = fc.oneof(
  plainText,
  fc.constant(""),
  fc.constant("## Heading"),
  fc.constant("```ts"),
  fc.constant("const answer = 42;"),
  fc.constant("```"),
  fc.constant("- list item"),
  fc.constant("---"),
  fc.constant("> quote with é and 日本語"),
);
const body = fc
  .array(bodyLine, { minLength: 0, maxLength: 8 })
  .map((lines) => lines.join("\n"));

// --- Per-collection content-object arbitraries ------------------------------
//
// Each arbitrary builds `{ ...fields, body }`. Optional fields are listed
// outside `requiredKeys`, so fast-check sometimes OMITS the key entirely (not
// set to `undefined`) — exercising the "field absent" branch of the round-trip.

const blogArb: fc.Arbitrary<ContentObject> = fc
  .record({
    slug: scalarText,
    title: scalarText,
    description: scalarText,
    heroImage: scalarText,
    author: scalarText,
    publishDate: isoDate,
    tags: textArray,
    category: scalarText,
    published: flag,
    body,
  })
  .map((o) => o as unknown as ContentObject);

const experienceArb: fc.Arbitrary<ContentObject> = fc
  .record(
    {
      company: scalarText,
      role: scalarText,
      location: scalarText,
      startDate: isoDate,
      endDate: isoDate,
      achievements: textArray,
      technologies: textArray,
      impactMetrics: textArray,
      body,
    },
    {
      requiredKeys: [
        "company",
        "role",
        "location",
        "startDate",
        "achievements",
        "technologies",
        "impactMetrics",
        "body",
      ],
    },
  )
  .map((o) => o as unknown as ContentObject);

const educationArb: fc.Arbitrary<ContentObject> = fc
  .record(
    {
      school: scalarText,
      degree: scalarText,
      major: scalarText,
      startDate: isoDate,
      endDate: isoDate,
      gpa: scalarText,
      achievements: textArray,
      body,
    },
    { requiredKeys: ["school", "degree", "major", "startDate", "body"] },
  )
  .map((o) => o as unknown as ContentObject);

const personalProjectArb: fc.Arbitrary<ContentObject> = fc
  .record(
    {
      kind: fc.constant("personal"),
      slug: scalarText,
      title: scalarText,
      description: scalarText,
      image: scalarText,
      technologies: textArray,
      featured: flag,
      startDate: isoDate,
      githubUrl: scalarText,
      liveUrl: scalarText,
      endDate: isoDate,
      challenges: textArray,
      solutions: textArray,
      results: textArray,
      overview: scalarText,
      problem: scalarText,
      solution: scalarText,
      architecture: scalarText,
      lessonsLearned: scalarText,
      gallery: textArray,
      body,
    },
    {
      requiredKeys: [
        "kind",
        "slug",
        "title",
        "description",
        "image",
        "technologies",
        "featured",
        "startDate",
        "body",
      ],
    },
  )
  .map((o) => o as unknown as ContentObject);

const professionalProjectArb: fc.Arbitrary<ContentObject> = fc
  .record(
    {
      kind: fc.constant("professional"),
      slug: scalarText,
      title: scalarText,
      company: scalarText,
      role: scalarText,
      description: scalarText,
      image: scalarText,
      technologies: textArray,
      achievements: textArray,
      featured: flag,
      overview: scalarText,
      problem: scalarText,
      solution: scalarText,
      architecture: scalarText,
      lessonsLearned: scalarText,
      gallery: textArray,
      body,
    },
    {
      requiredKeys: [
        "kind",
        "slug",
        "title",
        "company",
        "role",
        "description",
        "image",
        "technologies",
        "achievements",
        "featured",
        "body",
      ],
    },
  )
  .map((o) => o as unknown as ContentObject);

/** A valid content object drawn from any of the five collections. */
const contentObjectArb: fc.Arbitrary<ContentObject> = fc.oneof(
  blogArb,
  experienceArb,
  educationArb,
  personalProjectArb,
  professionalProjectArb,
);

describe("Property 22: serialize→parse round-trips to an equal object", () => {
  it("parse(serialize(obj)) reconstructs the original content object across collections", () => {
    fc.assert(
      fc.property(contentObjectArb, (obj) => {
        const out = parse(serialize(obj));
        expect({ ...out.frontmatter, body: out.body }).toEqual(obj);
      }),
      { numRuns: 100 },
    );
  });
});
