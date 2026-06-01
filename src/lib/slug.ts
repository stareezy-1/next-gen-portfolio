/**
 * URL-safe slug generation.
 *
 * Produces a deterministic, URL-safe slug from arbitrary input text. Slugs are
 * used to address blog posts and projects by path, so the transform must be
 * stable and contain only characters that are safe in a URL path segment.
 *
 * The transform, in order:
 *  1. lowercase and trim surrounding whitespace;
 *  2. turn runs of whitespace and underscores into a single hyphen;
 *  3. strip every character that is not a lowercase letter, digit, or hyphen;
 *  4. collapse repeated hyphens into one;
 *  5. trim leading and trailing hyphens.
 *
 * @see Requirements 9.4, 17.1, 17.2
 */

/**
 * Converts arbitrary input into a URL-safe slug.
 *
 * @param input - The source text (e.g. a title) to slugify.
 * @returns A lowercase, hyphen-separated slug containing only `[a-z0-9-]`.
 *
 * @example
 * slug("Hello, World!");        // "hello-world"
 * slug("  Spaces_and__under "); // "spaces-and-under"
 * slug("--Already-Slug--");     // "already-slug"
 */
export function slug(input: string): string {
  return input
    .toLowerCase()
    .trim()
    .replace(/[\s_]+/g, "-")
    .replace(/[^a-z0-9-]/g, "")
    .replace(/-+/g, "-")
    .replace(/^-+|-+$/g, "");
}
