/**
 * Frontmatter schema for the `professional-project` content collection.
 *
 * Validates the YAML frontmatter of a Professional_Project MDX file against the
 * {@link ProfessionalProject} domain type, and — critically — guarantees the
 * content item exposes no source-code or repository links (Requirements 11.5,
 * 11.6).
 *
 * Two complementary mechanisms enforce confidentiality:
 *
 *   1. `.strict()` on the field schema rejects ANY key not declared in the
 *      Professional_Project shape, so every repository/source field (and any
 *      other stray field) is an "unrecognized key" error.
 *   2. A `.superRefine` guard intersected onto the schema inspects the raw
 *      input for the known {@link FORBIDDEN_REPOSITORY_FIELDS} and emits a
 *      descriptive error that NAMES the offending field. (Under `.strict()`
 *      alone the field is stripped before a refinement can see it, so the
 *      guard runs on the raw value via a `z.unknown()` intersection — which
 *      leaves the inferred type unchanged: `T & unknown = T`.)
 *
 * @see Requirements 11.5, 11.6, 15.1
 */

import { z } from "zod";

import type { ProfessionalProject } from "@/types";
import { isoDateString } from "@/content/schemas/shared";
import {
  FORBIDDEN_REPOSITORY_FIELDS,
  type Assert,
  type Equals,
} from "@/content/schemas/shared";

/**
 * The declared Professional_Project frontmatter fields. `.strict()` ensures any
 * field outside this set — including repository links — is rejected.
 */
const professionalProjectFields = z
  .object({
    kind: z.literal("professional"),
    slug: z.string(),
    title: z.string(),
    company: z.string(),
    role: z.string(),
    description: z.string(),
    image: z.string(),
    technologies: z.array(z.string()),
    achievements: z.array(z.string()),
    featured: z.boolean(),
    // Detail-page sections (Requirement 12.2).
    overview: z.string().optional(),
    problem: z.string().optional(),
    solution: z.string().optional(),
    architecture: z.string().optional(),
    lessonsLearned: z.string().optional(),
    gallery: z.array(z.string()).optional(),
  })
  .strict();

/**
 * A guard that inspects the raw frontmatter for any forbidden repository/source
 * field and rejects it with a message that names the field (Requirement 11.6).
 * Built on `z.unknown()` so the refinement observes forbidden keys before
 * `.strict()` strips them, while leaving the intersected type unchanged
 * (`T & unknown = T`).
 */
const noRepositoryFieldsGuard = z.unknown().superRefine((value, ctx) => {
  if (value === null || typeof value !== "object") {
    return;
  }
  for (const field of FORBIDDEN_REPOSITORY_FIELDS) {
    if (Object.prototype.hasOwnProperty.call(value, field)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: [field],
        message: `Professional projects must not expose the repository/source field "${field}"`,
      });
    }
  }
});

/**
 * Validates the frontmatter of a Professional_Project, forbidding repository and
 * source-code fields both structurally (`.strict()`) and by name (guard).
 */
export const professionalProjectSchema = professionalProjectFields.and(
  noRepositoryFieldsGuard,
);

/** Compile-time guarantee the schema matches the ProfessionalProject shape. */
type _ProfessionalProjectMatchesType = Assert<
  Equals<z.infer<typeof professionalProjectSchema>, ProfessionalProject>
>;
