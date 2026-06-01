// Feature: next-gen-portfolio-platform, Property 21: Table of contents mirrors body headings
//
// Validates: Requirements 14.3, 14.4
//
// Property 21: Table of contents mirrors body headings.
// For any blog post body, the generated table of contents contains one entry
// per heading in the body, in document order, and each entry's anchor target
// (its `id`) equals the slug derived from its corresponding heading text. Since
// the heading renderer derives a heading element's id from the same text using
// the same slug rule, an entry whose id equals the heading's slug is exactly an
// entry whose anchor target equals the id of its heading (Req 14.4).
//
// Strategy
// --------
// A body is generated as a sequence of "items", each emitting one or more lines
// in document order:
//
//   - heading: an ATX heading (`#`..`######`) at column 0 with text drawn from a
//     pool that slugifies cleanly (lowercase ASCII words, single spaces). These
//     are the EXPECTED headings, tracked by construction (level + text) in order.
//   - prose:   a non-heading text line (never starts with `#`).
//   - fence:   a fenced code block (```` ``` ````) whose inner lines INCLUDE
//     `#`-prefixed lines. Those `#` lines look like headings but live inside a
//     code fence, so they must NOT appear in the table of contents.
//
// The expected headings exclude everything inside code fences by construction.
//
// Oracles (re-implemented independently of the source under test):
//   - `slugifyOracle` replicates the slug rule (lowercase, strip punctuation,
//     spaces/hyphens -> single hyphen, trim hyphens).
//   - `assignUniqueIdOracle` replicates the dedupe scheme (`-2`, `-3`, ...).
//
// Assertions:
//   (1) one entry per expected heading, in document order, with matching level
//       and text;
//   (2) headings inside code fences are excluded (covered by the exact
//       structural equality in (1), and asserted explicitly via count);
//   (3) ids are unique within the result;
//   (4) each id equals the slug derived from its text under the dedupe scheme,
//       proving anchor target == heading id (Req 14.4).
//
// Tooling: Vitest + fast-check, numRuns = 200 (>= 100 required).
import { describe, expect, it } from "vitest";
import * as fc from "fast-check";

import { tableOfContents } from "@/lib/blog";
import type { TocEntry } from "@/types";

// --- Oracles (independent re-implementation of the slug + dedupe contract) ---

/** Fallback slug when a heading's text contains no slug-able characters. */
const EMPTY_SLUG_FALLBACK = "section";

/**
 * Replicates the source slug rule: lowercase, strip punctuation (keep Unicode
 * letters/numbers/whitespace/hyphen), collapse whitespace+hyphen runs into a
 * single hyphen, trim leading/trailing hyphens.
 */
function slugifyOracle(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s-]+/gu, "")
    .trim()
    .replace(/[\s-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/**
 * Replicates the source dedupe scheme: the first occurrence of a base slug
 * keeps it verbatim; each later duplicate gets the lowest unused `-n` suffix
 * (`-2`, `-3`, ...), checked against all previously assigned ids.
 */
function assignUniqueIdOracle(
  base: string,
  used: Set<string>,
  counts: Map<string, number>,
): string {
  const slug = base.length > 0 ? base : EMPTY_SLUG_FALLBACK;

  if (!used.has(slug)) {
    used.add(slug);
    counts.set(slug, 1);
    return slug;
  }

  let n = (counts.get(slug) ?? 1) + 1;
  let candidate = `${slug}-${n}`;
  while (used.has(candidate)) {
    n += 1;
    candidate = `${slug}-${n}`;
  }
  counts.set(slug, n);
  used.add(candidate);
  return candidate;
}

/** Expected anchor ids for a list of heading texts, in document order. */
function expectedIds(headings: { text: string }[]): string[] {
  const used = new Set<string>();
  const counts = new Map<string, number>();
  return headings.map((h) =>
    assignUniqueIdOracle(slugifyOracle(h.text), used, counts),
  );
}

// --- Generators -------------------------------------------------------------

/**
 * Heading texts chosen so they slugify deterministically and cleanly: lowercase
 * ASCII words separated by single spaces, no punctuation, no leading/trailing
 * whitespace. The small pool guarantees frequent duplicates so the dedupe
 * scheme (`-2`, `-3`, ...) is exercised across runs.
 */
const HEADING_TEXTS = [
  "introduction",
  "getting started",
  "build token mdx",
  "the quick brown fox",
  "design system",
  "table of contents",
  "reading time",
  "conclusion",
];

/** Prose lines that are never headings (never begin with `#`) and never fences. */
const PROSE_TEXTS = [
  "this is a prose paragraph",
  "some more text here",
  "lorem ipsum dolor sit",
  "",
];

/**
 * `#`-prefixed lines used INSIDE code fences. Some of these (e.g.
 * "### def foo(): # comment") would match the heading pattern if they appeared
 * outside a fence, so they make the fence-exclusion assertion meaningful.
 */
const FENCE_HASH_LINES = [
  "# not a heading",
  "## also not a heading",
  "### def foo(): # comment",
  "###### deep fake heading",
];

/** Non-`#` code lines that contain no fence delimiter so the fence stays open. */
const FENCE_CODE_LINES = ["const x = 1;", "return 42;", "plain code line"];

type Item =
  | { kind: "heading"; level: number; text: string }
  | { kind: "prose"; text: string }
  | { kind: "fence"; inner: string[] };

const headingItemArb: fc.Arbitrary<Item> = fc.record({
  kind: fc.constant("heading" as const),
  level: fc.integer({ min: 1, max: 6 }),
  text: fc.constantFrom(...HEADING_TEXTS),
});

const proseItemArb: fc.Arbitrary<Item> = fc.record({
  kind: fc.constant("prose" as const),
  text: fc.constantFrom(...PROSE_TEXTS),
});

/** A fence guaranteed to contain at least one `#`-prefixed inner line. */
const fenceItemArb: fc.Arbitrary<Item> = fc
  .tuple(
    fc.constantFrom(...FENCE_HASH_LINES),
    fc.array(fc.constantFrom(...FENCE_HASH_LINES, ...FENCE_CODE_LINES), {
      maxLength: 3,
    }),
  )
  .map(([first, rest]) => ({ kind: "fence", inner: [first, ...rest] }));

const itemArb: fc.Arbitrary<Item> = fc.oneof(
  headingItemArb,
  proseItemArb,
  fenceItemArb,
);

const itemsArb = fc.array(itemArb, { minLength: 0, maxLength: 14 });

/**
 * Turn a sequence of items into a body string plus the EXPECTED headings
 * (level + text), in document order, excluding everything inside code fences.
 */
function buildBody(items: Item[]): {
  body: string;
  expected: { level: number; text: string }[];
} {
  const lines: string[] = [];
  const expected: { level: number; text: string }[] = [];

  for (const item of items) {
    switch (item.kind) {
      case "heading": {
        lines.push("#".repeat(item.level) + " " + item.text);
        expected.push({ level: item.level, text: item.text });
        break;
      }
      case "prose": {
        lines.push(item.text);
        break;
      }
      case "fence": {
        lines.push("```");
        for (const inner of item.inner) lines.push(inner);
        lines.push("```");
        break;
      }
    }
  }

  return { body: lines.join("\n"), expected };
}

// --- Property ---------------------------------------------------------------

describe("Property 21: Table of contents mirrors body headings", () => {
  it("emits one entry per body heading, in order, with slug ids that match each heading", () => {
    fc.assert(
      fc.property(itemsArb, (items) => {
        const { body, expected } = buildBody(items);

        const result: TocEntry[] = tableOfContents(body);

        // (1) + (2): exactly one entry per expected heading, in document order,
        // with matching level and text. Because `expected` excludes everything
        // inside code fences, this structural equality also proves that fenced
        // `#`-lines are NOT treated as headings.
        expect(result.map(({ level, text }) => ({ level, text }))).toEqual(
          expected,
        );

        // (2) made explicit: the count never exceeds the headings authored
        // outside any code fence.
        expect(result.length).toBe(expected.length);

        // (3): ids are unique within the result.
        const ids = result.map((entry) => entry.id);
        expect(new Set(ids).size).toBe(ids.length);

        // (4): each id equals the slug derived from its text under the dedupe
        // scheme. The heading renderer derives a heading's id from the same
        // text with the same rule, so id == slug(text) == heading id, proving
        // the anchor target equals the id of its corresponding heading.
        expect(ids).toEqual(expectedIds(expected));
      }),
      { numRuns: 200 },
    );
  });
});
