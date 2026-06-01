/**
 * Reading-time computation for Blog Posts.
 *
 * Computes an estimated reading time, in whole minutes, from a Blog Post body's
 * word count and the configured words-per-minute rate (`READING_TIME_WPM`).
 *
 * @see Requirement 14.2 — reading time computed from body word count
 * @see Property 20 — reading time is a function of word count and is
 *   monotonically non-decreasing in word count
 */

import { READING_TIME_WPM } from "@/constants";

/**
 * Count the words in a body of text.
 *
 * Words are whitespace-delimited tokens: the body is split on runs of
 * whitespace and empty tokens are ignored. This makes the count independent of
 * leading/trailing/duplicated whitespace, so the same visible words always
 * yield the same count.
 *
 * @param body - The raw text (or MDX) body to measure.
 * @returns The number of non-empty whitespace-delimited tokens.
 */
function countWords(body: string): number {
  const tokens = body.split(/\s+/);
  let count = 0;
  for (const token of tokens) {
    if (token.length > 0) {
      count += 1;
    }
  }
  return count;
}

/**
 * Compute the reading time, in whole minutes, for a Blog Post body.
 *
 * Rounding rule: the raw value `wordCount / READING_TIME_WPM` is rounded UP to
 * the next whole minute with `Math.ceil`. Consequences of this rule:
 *
 * - An empty body (`0` words) yields `0` minutes (`ceil(0 / wpm) === 0`).
 * - Any non-empty body yields at least `1` minute, because for any
 *   `wordCount >= 1` we have `ceil(wordCount / wpm) >= 1` (a single word still
 *   rounds up to one minute). No explicit `Math.max(1, …)` clamp is therefore
 *   required — the minimum-of-one guarantee falls out of `Math.ceil`.
 *
 * The result is a pure function of the word count: equal word counts always
 * produce equal reading times. Because `Math.ceil(n / wpm)` is monotonically
 * non-decreasing in `n` (and `wpm` is a fixed positive rate), more words never
 * produce a smaller reading time, satisfying Property 20.
 *
 * @param body - The Blog Post body (plain text or MDX).
 * @returns The estimated reading time in whole minutes (a non-negative integer).
 */
export function readingTime(body: string): number {
  const wordCount = countWords(body);
  return Math.ceil(wordCount / READING_TIME_WPM);
}
