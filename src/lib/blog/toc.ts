/**
 * Table-of-contents generation for Blog Posts.
 *
 * Parses Markdown / MDX ATX headings (`#` … `######`) from a Blog Post body, in
 * document order, into typed `TocEntry` objects. Each entry carries the heading
 * text, its level (number of leading `#`), and a slug `id` suitable for use as
 * the anchor target of the rendered heading element.
 *
 * Headings that appear inside fenced code blocks (``` ``` ``` or `~~~`) are not
 * treated as headings.
 *
 * @see Requirement 14.3 — table of contents generated from body headings
 * @see Requirement 14.4 — TOC entry anchor moves the view to the heading
 * @see Property 21 — TOC mirrors body headings with matching anchor ids
 */

import type { TocEntry } from "@/types";

/** Fallback slug used when a heading's text contains no slug-able characters. */
const EMPTY_SLUG_FALLBACK = "section";

/**
 * Derive a URL-anchor slug from heading text.
 *
 * Slugification rules:
 * 1. Lowercase the text.
 * 2. Strip punctuation — remove every character that is not a Unicode letter,
 *    a Unicode number, whitespace, or a hyphen. (Unicode letters/numbers are
 *    preserved so non-ASCII headings still produce meaningful anchors.)
 * 3. Collapse any run of whitespace and/or hyphens into a single hyphen
 *    (spaces become hyphens).
 * 4. Trim leading and trailing hyphens.
 *
 * The same text always produces the same slug, so the id assigned here matches
 * the id that the heading renderer derives from the same text.
 *
 * @param text - The trimmed heading text.
 * @returns The slug, or an empty string when no slug-able characters remain.
 */
function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s-]+/gu, "")
    .trim()
    .replace(/[\s-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/**
 * Assign a unique anchor id for a base slug.
 *
 * Uniqueness scheme: the first heading that maps to a given base slug keeps the
 * slug verbatim. Each subsequent duplicate gets a numeric suffix appended —
 * `-2`, `-3`, and so on — and the candidate is checked against all previously
 * assigned ids so a generated suffix can never collide with an explicit slug
 * (e.g. headings "Foo", "Foo 2", "Foo" yield `foo`, `foo-2`, `foo-3`).
 *
 * @param base - The base slug from {@link slugify} (may be empty).
 * @param used - Set of ids already assigned in this document.
 * @param counts - Map of base slug to the highest suffix tried so far.
 * @returns A unique anchor id.
 */
function assignUniqueId(
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

/** Matches an opening or closing code fence: 3+ backticks or 3+ tildes. */
const FENCE_PATTERN = /^(`{3,}|~{3,})/;

/** Matches an ATX heading line: 1–6 leading `#` followed by whitespace + text. */
const HEADING_PATTERN = /^(#{1,6})\s+(.+)$/;

/** Matches a trailing ATX closing sequence (whitespace + run of `#` at end). */
const CLOSING_SEQUENCE_PATTERN = /\s+#+$/;

/**
 * Generate a table of contents from a Blog Post body.
 *
 * Walks the body line by line, tracking whether the cursor is inside a fenced
 * code block so that `#` lines within code are ignored. For every ATX heading
 * encountered outside a fence it emits one {@link TocEntry} — in document
 * order — with the trimmed text, the heading level, and a unique anchor id.
 * Headings whose text is empty after trimming are skipped.
 *
 * @param body - The Blog Post body (plain text or MDX).
 * @returns The table of contents entries in document order.
 */
export function tableOfContents(body: string): TocEntry[] {
  const lines = body.split(/\r?\n/);
  const entries: TocEntry[] = [];
  const used = new Set<string>();
  const counts = new Map<string, number>();

  // The fence delimiter character ('`' or '~') while inside a code fence,
  // or null when outside any fence.
  let fenceMarker: string | null = null;

  for (const line of lines) {
    const fenceMatch = FENCE_PATTERN.exec(line.trim());
    if (fenceMatch && fenceMatch[1]) {
      const marker = fenceMatch[1].charAt(0);
      if (fenceMarker === null) {
        // Opening fence.
        fenceMarker = marker;
      } else if (fenceMarker === marker) {
        // Closing fence (must use the same delimiter character).
        fenceMarker = null;
      }
      continue;
    }

    // Skip every line inside a fenced code block.
    if (fenceMarker !== null) {
      continue;
    }

    const headingMatch = HEADING_PATTERN.exec(line);
    if (!headingMatch) {
      continue;
    }

    const hashes = headingMatch[1];
    const rawText = headingMatch[2];
    if (!hashes || rawText === undefined) {
      continue;
    }

    const level = hashes.length;
    // Trim, then drop any optional ATX closing sequence (e.g. "Title ##").
    const text = rawText.trim().replace(CLOSING_SEQUENCE_PATTERN, "").trim();
    if (text.length === 0) {
      continue;
    }

    const id = assignUniqueId(slugify(text), used, counts);
    entries.push({ id, text, level });
  }

  return entries;
}
