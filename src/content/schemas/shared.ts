/**
 * Shared building blocks for the per-collection content schemas.
 *
 * Houses the ISO-8601 date validator, the forbidden repository-field list used
 * to enforce Professional_Project confidentiality, and small compile-time type
 * assertion helpers that keep each schema in sync with its domain type.
 *
 * @see Requirements 15.1, 11.5, 11.6
 */

import { z } from "zod";

/**
 * Matches an ISO-8601 calendar date (`YYYY-MM-DD`) optionally followed by a
 * time component (`THH:MM`, `THH:MM:SS`, fractional seconds, and a `Z` or
 * numeric UTC offset). A space separator between date and time is also
 * tolerated for authoring convenience.
 */
const ISO_8601_PATTERN =
  /^\d{4}-\d{2}-\d{2}(?:[T ]\d{2}:\d{2}(?::\d{2}(?:\.\d+)?)?(?:Z|[+-]\d{2}:\d{2})?)?$/;

/**
 * Verifies that the leading `YYYY-MM-DD` portion of a value is a real calendar
 * date (rejecting values such as `2024-13-01` or `2024-02-30`).
 */
function isRealCalendarDate(value: string): boolean {
  const match = /^(\d{4})-(\d{2})-(\d{2})/.exec(value);
  if (match === null) {
    return false;
  }

  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);

  if (month < 1 || month > 12 || day < 1 || day > 31) {
    return false;
  }

  const date = new Date(Date.UTC(year, month - 1, day));
  return (
    date.getUTCFullYear() === year &&
    date.getUTCMonth() === month - 1 &&
    date.getUTCDate() === day
  );
}

/**
 * A Zod schema for an ISO-8601 date string. Rejects malformed strings via a
 * format regex and rejects impossible calendar dates via a refinement, so that
 * invalid dates never enter the Content_Store.
 *
 * @param label Human-readable field label used in validation messages.
 */
export function isoDateString(
  label: string,
): z.ZodString | z.ZodEffects<z.ZodString, string, string> {
  return z
    .string()
    .regex(ISO_8601_PATTERN, {
      message: `${label} must be an ISO-8601 date string (e.g. "2024-01-31")`,
    })
    .refine((value) => isRealCalendarDate(value), {
      message: `${label} must be a valid calendar date`,
    });
}

/**
 * Repository / source-code frontmatter field names that a Professional_Project
 * must never expose. Presence of any of these triggers a validation failure at
 * load time (Requirements 11.5, 11.6).
 */
export const FORBIDDEN_REPOSITORY_FIELDS = [
  "githubUrl",
  "repository",
  "repoUrl",
  "sourceUrl",
  "gitUrl",
  "gitlabUrl",
  "bitbucketUrl",
  "sourceCode",
  "sourceCodeUrl",
] as const;

/**
 * Compile-time assertion that two types are mutually assignable. Resolves to
 * `true` only when `A` and `B` are structurally equal; otherwise `false`.
 */
export type Equals<A, B> = [A] extends [B]
  ? [B] extends [A]
    ? true
    : false
  : false;

/**
 * Compile-time guard: instantiating `Assert<false>` is a type error, so a
 * mismatched schema/type pair fails `tsc` rather than slipping through.
 */
export type Assert<T extends true> = T;
