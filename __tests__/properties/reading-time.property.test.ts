// Feature: next-gen-portfolio-platform, Property 20: Reading time is a function of word count
//
// Validates: Requirements 14.2
//
// Property 20: Reading time is a function of word count.
// For any blog post body, the computed reading time equals the body word count
// divided by the configured words-per-minute rate (rounded per the configured
// rule — `Math.ceil`), and is monotonically non-decreasing in word count.
//
// Strategy
// --------
// A body is generated as an array of N "words", each a non-empty token that
// contains NO internal whitespace, joined together by VARIED whitespace
// separators (single spaces, tabs, newlines, runs of multiple spaces) with
// optional leading/trailing whitespace. Because every word is a non-empty,
// whitespace-free token and the separators are pure whitespace, the oracle
// word count is exactly N by construction — independent of how the words are
// glued together. This lets the test assert the closed-form oracle
// `Math.ceil(N / READING_TIME_WPM)` without re-deriving the word count from the
// generated string.
//
// Assertions:
//   (1) exact value:   readingTime(body) === Math.ceil(N / READING_TIME_WPM),
//       importing READING_TIME_WPM rather than hardcoding 200;
//   (2) monotonicity:   for word counts n1 <= n2, build two bodies and assert
//       readingTime(body1) <= readingTime(body2);
//   (3) empty / whitespace-only bodies yield 0.
//
// Tooling: Vitest + fast-check, numRuns = 200 (>= 100 required).
import { describe, expect, it } from "vitest";
import * as fc from "fast-check";

import { readingTime } from "@/lib/blog";
import { READING_TIME_WPM } from "@/constants";

// --- Generators -------------------------------------------------------------

/**
 * A single "word": a non-empty token with NO internal whitespace. Built from a
 * pool of whitespace-free characters (letters, digits, and common punctuation)
 * so that splitting the assembled body on whitespace recovers exactly one token
 * per word.
 */
const WORD_CHARS =
  "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789-_.,!?;:'\"#";

const wordArb: fc.Arbitrary<string> = fc
  .stringOf(fc.constantFrom(...WORD_CHARS.split("")), {
    minLength: 1,
    maxLength: 12,
  })
  // `stringOf` with minLength 1 already yields a non-empty, whitespace-free
  // token; this guard is belt-and-suspenders against the pool ever changing.
  .filter((w) => w.length > 0 && !/\s/.test(w));

/**
 * Varied whitespace separators used BETWEEN words: a single space, a tab, a
 * newline, a CRLF, and runs of multiple spaces/mixed whitespace. Every option
 * is pure whitespace, so it never contributes a word token.
 */
const SEPARATORS = [" ", "\t", "\n", "\r\n", "   ", " \t ", "\n\n", "  \n  "];

const separatorArb: fc.Arbitrary<string> = fc.constantFrom(...SEPARATORS);

/** Optional leading/trailing whitespace (possibly empty). */
const edgeWhitespaceArb: fc.Arbitrary<string> = fc.constantFrom(
  "",
  " ",
  "  ",
  "\t",
  "\n",
  " \n\t ",
);

/**
 * Assemble `words` into a body string by joining adjacent words with an
 * independently chosen whitespace separator, then wrap with optional
 * leading/trailing whitespace. The returned body has EXACTLY `words.length`
 * whitespace-delimited tokens by construction.
 */
function buildBody(
  words: string[],
  separators: string[],
  lead: string,
  trail: string,
): string {
  if (words.length === 0) {
    // No words: the body is pure (possibly empty) whitespace.
    return lead + trail;
  }
  // `words[0]` exists: the length-0 case returned above.
  let body = words[0]!;
  for (let i = 1; i < words.length; i += 1) {
    // `separators[i - 1]` always exists: the generator below produces a
    // separators array of length `words.length` (one spare is unused).
    body += separators[i - 1]! + words[i]!;
  }
  return lead + body + trail;
}

/**
 * Generate `{ body, n }` where `n` is the exact whitespace-delimited word count
 * of `body`, for `n` in `[minWords, maxWords]`.
 */
function bodyWithCountArb(
  minWords: number,
  maxWords: number,
): fc.Arbitrary<{ body: string; n: number }> {
  return fc.integer({ min: minWords, max: maxWords }).chain((n) =>
    fc
      .record({
        words: fc.array(wordArb, { minLength: n, maxLength: n }),
        // One separator per gap (n - 1) is enough; generate `n` to keep it
        // simple and avoid empty-array edge cases when n === 0.
        separators: fc.array(separatorArb, {
          minLength: Math.max(n, 1),
          maxLength: Math.max(n, 1),
        }),
        lead: edgeWhitespaceArb,
        trail: edgeWhitespaceArb,
      })
      .map(({ words, separators, lead, trail }) => ({
        body: buildBody(words, separators, lead, trail),
        n,
      })),
  );
}

// --- Property ---------------------------------------------------------------

describe("Property 20: Reading time is a function of word count", () => {
  it("equals ceil(wordCount / READING_TIME_WPM) for the exact word count", () => {
    fc.assert(
      fc.property(
        // Span a range that crosses several minute boundaries for the WPM rate.
        bodyWithCountArb(0, READING_TIME_WPM * 3 + 5),
        ({ body, n }) => {
          // (1) exact closed-form value; READING_TIME_WPM imported, not hardcoded.
          expect(readingTime(body)).toBe(Math.ceil(n / READING_TIME_WPM));
        },
      ),
      { numRuns: 200 },
    );
  });

  it("is monotonically non-decreasing in word count", () => {
    fc.assert(
      fc.property(
        fc
          .tuple(
            fc.integer({ min: 0, max: READING_TIME_WPM * 2 + 3 }),
            fc.integer({ min: 0, max: READING_TIME_WPM * 2 + 3 }),
          )
          // Order the pair so n1 <= n2.
          .map(([a, b]) => (a <= b ? [a, b] : [b, a]) as [number, number])
          .chain(([n1, n2]) =>
            fc.record({
              n1: fc.constant(n1),
              n2: fc.constant(n2),
              body1: bodyWithCountArb(n1, n1).map(({ body }) => body),
              body2: bodyWithCountArb(n2, n2).map(({ body }) => body),
            }),
          ),
        ({ n1, n2, body1, body2 }) => {
          // Precondition guaranteed by construction; assert it holds.
          expect(n1).toBeLessThanOrEqual(n2);
          // (2) more words never yield a smaller reading time.
          expect(readingTime(body1)).toBeLessThanOrEqual(readingTime(body2));
        },
      ),
      { numRuns: 200 },
    );
  });

  it("returns 0 for empty and whitespace-only bodies", () => {
    fc.assert(
      fc.property(
        // Whitespace-only bodies: any (possibly empty) concatenation of
        // whitespace separators and edge whitespace, including "".
        fc.array(fc.constantFrom(...SEPARATORS, "", " ", "\t", "\n"), {
          minLength: 0,
          maxLength: 8,
        }),
        (parts) => {
          const body = parts.join("");
          // No non-empty whitespace-delimited tokens ⇒ 0 minutes.
          expect(readingTime(body)).toBe(0);
        },
      ),
      { numRuns: 200 },
    );
  });
});
