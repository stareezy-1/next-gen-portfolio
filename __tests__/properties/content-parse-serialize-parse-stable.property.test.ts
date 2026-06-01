// Feature: next-gen-portfolio-platform, Property 23: Parse→serialize→parse is stable
//
// Validates: Requirements 15.7
//
// Property 23: Parse→serialize→parse is stable.
// For any valid MDX content file, serializing the parsed object and parsing the
// result produces a content object equal to the first parse result.
//
// Strategy
// --------
// A "valid MDX content file" is generated indirectly so it is guaranteed to be
// canonical and parseable: we build a content-like object `obj`
// (`{ ...frontmatter, body }`) and run it through the real Content_Serializer to
// MAKE the source string `src`. The first parse normalizes `src`; the property
// then asserts that one more serialize→parse round trip starting from that first
// parse result is a fixpoint:
//
//   const first  = parse(src);
//   const second = parse(serialize({ ...first.frontmatter, body: first.body }));
//   expect(second).toEqual(first);
//
// Body edge cases are deliberately exercised: markdown headings, code fences
// whose contents include `---` lines, bare `---` lines, blank lines, and
// non-ASCII text. The parser splits on the FIRST `---` fence (lazy match) and
// preserves the body verbatim, so a `---` line living inside the body must not
// shift the frontmatter boundary on the round trip.
//
// Tooling: Vitest + fast-check, numRuns = 200 (>= 100 required).
import { describe, expect, it } from "vitest";
import * as fc from "fast-check";

import { parse, serialize } from "@/content";

/**
 * serialize() is typed to accept a ContentObject, but Property 23 operates on
 * the structural `{ ...frontmatter, body }` record produced by a parse result.
 * The serializer treats its argument as a generic record internally, so we cast
 * to its declared parameter type at the boundary.
 */
const ser = (record: Record<string, unknown>): string =>
  serialize(record as unknown as Parameters<typeof serialize>[0]);

// --- Frontmatter generators -------------------------------------------------

/**
 * Lowercase-alpha keys are always valid unquoted YAML keys. `body` is excluded
 * because it is handled separately as the verbatim MDX body, not frontmatter.
 */
const keyArb = fc
  .array(fc.constantFrom(..."abcdefghijklmnopqrstuvwxyz".split("")), {
    minLength: 1,
    maxLength: 8,
  })
  .map((chars) => chars.join(""))
  .filter((key) => key !== "body");

/**
 * Scalar string values, including YAML-significant tokens (so quoting behavior
 * is exercised) and non-ASCII samples (accents, CJK, Cyrillic, emoji).
 */
const scalarStringArb = fc.oneof(
  fc.string(),
  fc.constantFrom(
    "true",
    "false",
    "null",
    "yes",
    "no",
    "123",
    "3.14",
    "---",
    ": value",
    "# hash",
    "*star",
    "&amp",
    "",
    "  leading",
    "trailing  ",
  ),
  fc.constantFrom(
    "café",
    "naïve",
    "Ω≈ç√∫",
    "日本語のテキスト",
    "Привет, мир",
    "emoji 😀🚀",
    "〜heading〜",
  ),
);

/** Frontmatter values are string | boolean | string[]. */
const frontmatterValueArb = fc.oneof(
  scalarStringArb,
  fc.boolean(),
  fc.array(scalarStringArb, { maxLength: 4 }),
);

/** A small frontmatter record (possibly empty, exercising the `{}` path). */
const frontmatterArb = fc.dictionary(keyArb, frontmatterValueArb, {
  maxKeys: 6,
});

// --- Body generator ---------------------------------------------------------

const wordArb = fc.constantFrom(
  "the",
  "quick",
  "brown",
  "fox",
  "build",
  "token",
  "mdx",
  "café",
  "日本語",
  "Привет",
  "😀",
  "value",
);

const textLineArb = fc
  .array(wordArb, { minLength: 1, maxLength: 6 })
  .map((words) => words.join(" "));

const headingArb = fc
  .tuple(fc.constantFrom("# ", "## ", "### "), textLineArb)
  .map(([prefix, text]) => prefix + text);

/** A fenced code block whose contents intentionally include `---` lines. */
const codeFenceBlockArb = fc
  .array(
    fc.oneof(textLineArb, fc.constant("---"), fc.constant("const x = 1;")),
    {
      minLength: 1,
      maxLength: 4,
    },
  )
  .map((lines) => ["```", ...lines, "```"].join("\n"));

const blockArb = fc.oneof(
  fc.constant(""), // blank line
  fc.constant("---"), // bare fence-like line inside the body
  headingArb, // markdown heading
  textLineArb, // prose (ASCII + non-ASCII)
  codeFenceBlockArb, // code fence containing `---`
);

const bodyArb = fc
  .array(blockArb, { maxLength: 10 })
  .map((blocks) => blocks.join("\n"));

// --- Content object generator ----------------------------------------------

/** A content-like object: frontmatter fields plus a verbatim MDX `body`. */
const contentObjectArb = fc
  .record({ frontmatter: frontmatterArb, body: bodyArb })
  .map(({ frontmatter, body }) => ({ ...frontmatter, body }));

describe("Property 23: parse→serialize→parse is stable", () => {
  it("reaches a fixpoint: parse(serialize(parse(src))) equals parse(src)", () => {
    fc.assert(
      fc.property(contentObjectArb, (obj) => {
        // Canonicalize: a real serializer output is a guaranteed-parseable
        // "valid MDX content file".
        const src = ser(obj);

        // First parse normalizes the source.
        const first = parse(src);

        // Serialize the parsed object back to MDX, then parse once more.
        const second = parse(ser({ ...first.frontmatter, body: first.body }));

        // The second parse must equal the first parse result.
        expect(second).toEqual(first);
      }),
      { numRuns: 200 },
    );
  });
});
