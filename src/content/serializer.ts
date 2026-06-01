/**
 * Content_Serializer — writes a content object back to canonical MDX source.
 *
 * The serializer is the inverse of {@link parse}. It emits a stable,
 * deterministic representation so that the round-trip properties hold:
 *
 * - **A:** `parse(serialize(obj))` reconstructs `obj` (via
 *   `{ ...frontmatter, body }`).
 * - **B:** `parse(serialize(parse(src)))` equals `parse(src)`.
 *
 * Canonical-form decisions (what makes the output stable):
 *
 * 1. **Field partition** — every own field of the object EXCEPT `body` becomes
 *    frontmatter; `body` (when present) is written verbatim after the closing
 *    fence. An absent `body` serializes to an empty body section.
 * 2. **Stable key order** — frontmatter keys are sorted alphabetically via the
 *    `yaml` package's `sortMapEntries` option, so equal objects always produce
 *    byte-identical output regardless of in-memory key insertion order.
 * 3. **Normalized scalars** — scalar formatting (quoting, booleans, numbers,
 *    nulls) is delegated to `yaml.stringify`, which is type-aware. Because the
 *    same library parses the output, YAML types round-trip identically (a
 *    string that looks like a boolean stays a string, etc.).
 * 4. **Verbatim body** — the body is appended byte-for-byte after the closing
 *    `---` fence, so it is preserved exactly.
 *
 * @see Requirements 15.5 — serialize a content object into canonical MDX
 * @see Property 22, Property 23 — round-trip guarantees with the MDX_Parser
 */

import { stringify } from "yaml";

import type { ContentObject } from "@/types";

/** The frontmatter fence delimiter. */
const FENCE = "---";

/** The frontmatter key written verbatim as the body rather than as YAML. */
const BODY_KEY = "body";

/**
 * Serialize a content object into canonical MDX source.
 *
 * The output always has the shape:
 *
 * ```text
 * ---
 * <frontmatter YAML, keys sorted alphabetically>
 * ---
 * <body verbatim>
 * ```
 *
 * The `body` field is separated from the other fields and written after the
 * closing fence exactly as supplied. When the object has no `body` field (for
 * collections that carry no MDX body), the body section is empty. All remaining
 * fields are stringified as YAML with a stable alphabetical key order so the
 * result is deterministic for a given object value.
 *
 * @param obj - The validated content object to serialize.
 * @returns Canonical MDX source (frontmatter block + body).
 */
export function serialize(obj: ContentObject): string {
  // `body` exists only on some members of the ContentObject union, so widen to
  // a generic record before partitioning the body field out of the frontmatter.
  const record = obj as unknown as Record<string, unknown>;
  const { [BODY_KEY]: bodyValue, ...frontmatter } = record;
  const body = typeof bodyValue === "string" ? bodyValue : "";

  // `yaml.stringify` returns a string terminated by a newline, so the closing
  // fence sits on its own line directly after the frontmatter block.
  const frontmatterYaml = stringify(frontmatter, { sortMapEntries: true });

  return `${FENCE}\n${frontmatterYaml}${FENCE}\n${body}`;
}
