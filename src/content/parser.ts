/**
 * MDX_Parser — splits an MDX source file into frontmatter and body.
 *
 * The parser recognizes the canonical frontmatter form written by the
 * Content_Serializer:
 *
 * ```text
 * ---
 * <yaml frontmatter>
 * ---
 * <body verbatim>
 * ```
 *
 * The opening fence must be the very first line of the source. The first
 * subsequent line that is exactly `---` closes the frontmatter block; every
 * byte after that closing fence's trailing newline is the body, preserved
 * verbatim. A source with no complete frontmatter block yields an empty
 * frontmatter map and the entire source as the body.
 *
 * Parsing is the inverse of {@link serialize}: the two together guarantee the
 * round-trip properties — `parse(serialize(obj))` reconstructs `obj` (via
 * `{ ...frontmatter, body }`) and `parse(serialize(parse(src)))` equals
 * `parse(src)`.
 *
 * @see Requirements 15.4 — MDX_Parser parses a content file into a typed object
 * @see Requirements 15.5 — round-trips with the Content_Serializer
 * @see Property 22, Property 23 — parse/serialize round-trip guarantees
 */

import { parse as parseYaml } from "yaml";

import type { ParsedFile } from "@/types";

/**
 * Matches a leading frontmatter block delimited by `---` fences.
 *
 * - Group 1 captures the YAML between the fences (lazily, so the FIRST closing
 *   `---` line ends the block).
 * - Group 2 captures the body — everything after the closing fence's newline.
 *
 * Optional trailing spaces/tabs on a fence line are tolerated for real-world
 * authored files; the canonical output written by {@link serialize} uses bare
 * `---\n` fences.
 */
const FRONTMATTER_PATTERN =
  /^---[ \t]*\r?\n([\s\S]*?)\r?\n---[ \t]*\r?\n([\s\S]*)$/;

/**
 * Type guard for a plain (non-array, non-null) object.
 *
 * Used to confirm that parsed YAML frontmatter is a mapping, so the returned
 * `frontmatter` always satisfies `Record<string, unknown>`.
 */
function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

/**
 * Parse an MDX source string into its frontmatter map and body.
 *
 * Behavior:
 *
 * - **Frontmatter present** (source begins with a `---` fence line and has a
 *   matching closing `---` fence): the YAML between the fences is parsed and,
 *   when it is a mapping, returned as `frontmatter`; the remainder is the
 *   `body`, preserved byte-for-byte.
 * - **Empty frontmatter block** (`---\n\n---\n…`): YAML parses to `null`, so
 *   `frontmatter` is `{}` and the remainder is the `body`.
 * - **No frontmatter block** (no leading fence / no closing fence): `frontmatter`
 *   is `{}` and the whole source is the `body`.
 * - **Non-mapping frontmatter** (the fenced YAML parses to a scalar or
 *   sequence rather than a mapping): treated as not-a-frontmatter-block — the
 *   entire source is preserved as the `body` so no information is lost and the
 *   `frontmatter` type contract (`Record<string, unknown>`) holds.
 *
 * @param source - Raw MDX file contents.
 * @returns The split `{ frontmatter, body }`.
 */
export function parse(source: string): ParsedFile {
  const match = FRONTMATTER_PATTERN.exec(source);
  if (match === null) {
    return { frontmatter: {}, body: source };
  }

  const yamlText = match[1] ?? "";
  const body = match[2] ?? "";
  const parsed: unknown = parseYaml(yamlText);

  if (isPlainObject(parsed)) {
    return { frontmatter: parsed, body };
  }

  if (parsed === null || parsed === undefined) {
    return { frontmatter: {}, body };
  }

  // The fenced content parsed to a scalar or sequence, not a mapping. It is
  // therefore not a valid frontmatter block; keep the whole source as the body.
  return { frontmatter: {}, body: source };
}
