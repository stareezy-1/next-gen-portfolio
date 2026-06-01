/**
 * Content_Loader — reads, parses, and validates MDX content into typed objects.
 *
 * The loader is the bridge between raw MDX files on disk and the typed
 * {@link ContentObject} models the rest of the platform consumes. For a given
 * {@link Collection} it:
 *
 *   1. reads the file (the {@link load} path variant) or accepts source text
 *      directly (the {@link loadSource} variant, used by tests and callers that
 *      already hold the content);
 *   2. splits frontmatter from body via the {@link parse | MDX_Parser};
 *   3. validates the frontmatter against the collection's Zod schema from
 *      {@link COLLECTION_SCHEMAS}; and
 *   4. for body-carrying collections (blog and projects), merges the parsed
 *      body back into the validated object.
 *
 * Validation never throws into the render path. A single bad file produces a
 * {@link ValidationError} that names the file and the failing field; the
 * {@link loadAll} aggregate keeps loading the rest of the collection so a build
 * can report *every* bad file at once rather than failing on the first.
 *
 * The split into {@link load} (file path → reads disk) and {@link loadSource}
 * (file label + source text → no disk access) keeps the validation logic pure
 * and unit-testable without touching a real filesystem.
 *
 * @see Requirements 15.2 — validate frontmatter against the collection schema
 * @see Requirements 15.3 — descriptive error identifying the file and field
 * @see Requirements 11.6 — professional-project repository links are rejected
 * @see Property 24 — invalid content yields a descriptive validation error
 * @see Property 15 — professional content with a repository link is rejected
 */

import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";

import type { ZodIssue } from "zod";

import { parse } from "@/content/parser";
import { COLLECTION_SCHEMAS } from "@/content/schemas";
import type {
  BlogPost,
  Collection,
  EducationEntry,
  ExperienceEntry,
  PersonalProject,
  ProfessionalProject,
} from "@/types";

/**
 * Maps a {@link Collection} literal to the typed content object the loader
 * produces for that collection. Lets {@link load}/{@link loadSource}/
 * {@link loadAll} return precisely-typed values from a generic collection
 * parameter.
 */
export type ContentOf<C extends Collection> = C extends "blog"
  ? BlogPost
  : C extends "experience"
  ? ExperienceEntry
  : C extends "education"
  ? EducationEntry
  : C extends "personal-project"
  ? PersonalProject
  : C extends "professional-project"
  ? ProfessionalProject
  : never;

/**
 * A success-or-failure outcome. `ok: true` carries the produced `value`;
 * `ok: false` carries the `error`. Used instead of throwing so callers
 * (notably {@link loadAll}) can aggregate failures.
 */
export type Result<T, E> = { ok: true; value: T } | { ok: false; error: E };

/**
 * A schema-validation (or file-read) failure for a single content file.
 *
 * Carries the offending `file`, the failing `field` (a dotted frontmatter path
 * such as `"publishDate"` or `"author"`, or a sentinel like `"(file)"` for a
 * read failure), and a human-readable `detail`. The composed `message`
 * identifies both the file and the field as required by Requirement 15.3.
 *
 * @see Requirements 15.3
 */
export class ValidationError extends Error {
  constructor(
    public file: string,
    public field: string,
    public detail: string,
  ) {
    super(`${file}: ${field} — ${detail}`);
    this.name = "ValidationError";
  }
}

/**
 * Aggregate failure thrown by {@link loadCollectionOrThrow} when a required
 * collection has one or more {@link ValidationError}s. The build step uses this
 * to fail loudly, listing every bad file at once (Requirement 15.3).
 */
export class ContentValidationError extends Error {
  constructor(public readonly errors: ValidationError[]) {
    super(
      `Content validation failed with ${errors.length} error(s):\n` +
        errors.map((error) => `  - ${error.message}`).join("\n"),
    );
    this.name = "ContentValidationError";
  }
}

/** The file extension every content file in a collection directory uses. */
const MDX_EXTENSION = ".mdx";

/**
 * Path segments, relative to the project root, of the directory that holds the
 * per-collection content subdirectories (`<root>/blog`, `<root>/experience`, …).
 */
const COLLECTIONS_ROOT_SEGMENTS = ["src", "content", "collections"] as const;

/**
 * Collections whose content files carry a free MDX body in addition to their
 * frontmatter. For these, {@link loadSource} merges the parsed body into the
 * validated object; for the others (experience, education) the body is ignored.
 *
 * Per the design, the schema validates frontmatter only — the body is supplied
 * by the {@link parse | MDX_Parser} and merged here after validation.
 */
const COLLECTIONS_WITH_BODY: ReadonlySet<Collection> = new Set<Collection>([
  "blog",
  "personal-project",
  "professional-project",
]);

/**
 * Resolves the on-disk directory for a collection.
 *
 * @param collection - The collection whose directory to resolve.
 * @param rootDir - Optional override for the collections root (the directory
 *   containing the per-collection subdirectories). Defaults to
 *   `<cwd>/src/content/collections`. Primarily a testing seam so a fixtures
 *   directory can be supplied without touching the project's real content.
 * @returns The absolute path to `<root>/<collection>`.
 */
function collectionDir(collection: Collection, rootDir?: string): string {
  const root = rootDir ?? join(process.cwd(), ...COLLECTIONS_ROOT_SEGMENTS);
  return join(root, collection);
}

/** Narrows an unknown thrown value to a Node "file/dir not found" error. */
function isNotFoundError(error: unknown): boolean {
  return (
    typeof error === "object" &&
    error !== null &&
    (error as { code?: unknown }).code === "ENOENT"
  );
}

/** Extracts a human-readable message from an unknown thrown value. */
function describeError(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}

/**
 * Picks the most informative issue from a Zod failure.
 *
 * Prefers the first issue whose `path` names a concrete field, so a precise
 * field-level error (e.g. the professional-project repository-field guard,
 * which reports `path: ["githubUrl"]`) wins over a path-less object-level error
 * (e.g. an `.strict()` "unrecognized keys" issue with an empty path). Falls
 * back to the first issue when none carry a path.
 *
 * @param issues - The non-empty issue list from a failed `safeParse`.
 * @returns The selected issue, or `undefined` if the list is empty.
 */
function selectPrimaryIssue(issues: ZodIssue[]): ZodIssue | undefined {
  return issues.find((issue) => issue.path.length > 0) ?? issues[0];
}

/**
 * Derives the failing-field label for a {@link ValidationError} from an issue.
 *
 * - A non-empty `path` becomes a dotted field name (`"a.b.0"`).
 * - An `.strict()` "unrecognized keys" issue (path-less) reports the rejected
 *   key names so a stray/forbidden field is still identified.
 * - Otherwise the field is reported as the document root.
 */
function fieldFromIssue(issue: ZodIssue): string {
  if (issue.path.length > 0) {
    return issue.path.join(".");
  }
  if (issue.code === "unrecognized_keys" && issue.keys.length > 0) {
    return issue.keys.join(", ");
  }
  return "(root)";
}

/** Builds a {@link ValidationError} from a file and (optional) primary issue. */
function toValidationError(file: string, issue?: ZodIssue): ValidationError {
  if (issue === undefined) {
    return new ValidationError(
      file,
      "(unknown)",
      "Content failed schema validation",
    );
  }
  return new ValidationError(file, fieldFromIssue(issue), issue.message);
}

/**
 * Validates raw MDX source for a collection into a typed content object.
 *
 * This is the filesystem-free core of the loader. It parses `source` into
 * frontmatter + body, validates the frontmatter against the collection's
 * schema, and — for body-carrying collections — merges the body into the
 * validated object. On the first schema failure it returns a
 * {@link ValidationError} naming `file` and the failing field; it never throws.
 *
 * @typeParam C - The collection literal, which fixes the produced type.
 * @param file - A label/path used only to identify the source in error
 *   messages (no disk access is performed).
 * @param collection - The collection whose schema validates the frontmatter.
 * @param source - The raw MDX source text.
 * @returns `{ ok: true, value }` with the typed object, or `{ ok: false, error }`.
 *
 * @see Requirements 15.2, 15.3, 11.6
 */
export function loadSource<C extends Collection>(
  file: string,
  collection: C,
  source: string,
): Result<ContentOf<C>, ValidationError> {
  const { frontmatter, body } = parse(source);
  const schema = COLLECTION_SCHEMAS[collection];
  const result = schema.safeParse(frontmatter);

  if (!result.success) {
    const issue = selectPrimaryIssue(result.error.issues);
    return { ok: false, error: toValidationError(file, issue) };
  }

  const validated = result.data as Record<string, unknown>;
  const value = (COLLECTIONS_WITH_BODY.has(collection)
    ? { ...validated, body }
    : validated) as unknown as ContentOf<C>;

  return { ok: true, value };
}

/**
 * Loads and validates a single content file by path.
 *
 * Reads `file` from disk and delegates validation to {@link loadSource}. A read
 * failure (missing file, permissions, …) is returned as a {@link ValidationError}
 * rather than thrown, so a single unreadable file does not abort a
 * {@link loadAll} pass.
 *
 * @typeParam C - The collection literal, which fixes the produced type.
 * @param file - The path to the `.mdx` file to read.
 * @param collection - The collection whose schema validates the frontmatter.
 * @returns `{ ok: true, value }` with the typed object, or `{ ok: false, error }`.
 *
 * @see Requirements 15.2, 15.3
 */
export function load<C extends Collection>(
  file: string,
  collection: C,
): Result<ContentOf<C>, ValidationError> {
  let source: string;
  try {
    source = readFileSync(file, "utf8");
  } catch (error) {
    return {
      ok: false,
      error: new ValidationError(file, "(file)", describeError(error)),
    };
  }
  return loadSource(file, collection, source);
}

/**
 * Loads and validates every `.mdx` file in a collection's directory,
 * aggregating errors.
 *
 * Files are loaded in stable (sorted) filename order. Valid files contribute to
 * `items`; invalid ones contribute a {@link ValidationError} to `errors` — the
 * pass continues past failures so the build can report every bad file at once
 * (Requirement 15.3). A missing collection directory is treated as an empty
 * collection (no items, no errors), which is the expected pre-migration state.
 *
 * @typeParam C - The collection literal, which fixes the item type.
 * @param collection - The collection to load.
 * @param rootDir - Optional collections-root override (see {@link collectionDir}).
 * @returns The successfully loaded `items` and the aggregated `errors`.
 *
 * @see Requirements 15.2, 15.3, 11.6
 */
export function loadAll<C extends Collection>(
  collection: C,
  rootDir?: string,
): { items: ContentOf<C>[]; errors: ValidationError[] } {
  const dir = collectionDir(collection, rootDir);
  const items: ContentOf<C>[] = [];
  const errors: ValidationError[] = [];

  let entries: string[];
  try {
    entries = readdirSync(dir);
  } catch (error) {
    if (isNotFoundError(error)) {
      return { items, errors };
    }
    errors.push(new ValidationError(dir, "(directory)", describeError(error)));
    return { items, errors };
  }

  const files = entries
    .filter((name) => name.endsWith(MDX_EXTENSION))
    .sort((a, b) => a.localeCompare(b));

  for (const name of files) {
    const result = load(join(dir, name), collection);
    if (result.ok) {
      items.push(result.value);
    } else {
      errors.push(result.error);
    }
  }

  return { items, errors };
}

/**
 * Loads a collection and throws if any file failed validation.
 *
 * This is the build-time enforcement of "build fails on validation errors": a
 * required collection with one or more {@link ValidationError}s raises a single
 * {@link ContentValidationError} listing them all. Callers that can tolerate
 * partial content should use {@link loadAll} directly and inspect `errors`.
 *
 * @typeParam C - The collection literal, which fixes the item type.
 * @param collection - The required collection to load.
 * @param rootDir - Optional collections-root override (see {@link collectionDir}).
 * @returns The validated items when the collection has no errors.
 * @throws ContentValidationError when one or more files fail validation.
 *
 * @see Requirements 15.3
 */
export function loadCollectionOrThrow<C extends Collection>(
  collection: C,
  rootDir?: string,
): ContentOf<C>[] {
  const { items, errors } = loadAll(collection, rootDir);
  if (errors.length > 0) {
    throw new ContentValidationError(errors);
  }
  return items;
}
