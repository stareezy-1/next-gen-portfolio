/**
 * Frontmatter schema for the `education` content collection.
 *
 * Validates the YAML frontmatter of an Education MDX file against the
 * {@link EducationEntry} domain type. `gpa` and `achievements` are optional
 * (Requirements 10.3, 10.4).
 *
 * @see Requirements 15.1, 15.2
 */

import { z } from "zod";

import type { EducationEntry } from "@/types";
import { isoDateString } from "@/content/schemas/shared";
import type { Assert, Equals } from "@/content/schemas/shared";

/** Validates the frontmatter of an Education timeline entry. */
export const educationSchema = z.object({
  school: z.string(),
  degree: z.string(),
  major: z.string(),
  startDate: isoDateString("Start date"),
  endDate: isoDateString("End date").optional(),
  gpa: z.string().optional(),
  achievements: z.array(z.string()).optional(),
});

/** Compile-time guarantee the schema matches the EducationEntry shape. */
type _EducationMatchesType = Assert<
  Equals<z.infer<typeof educationSchema>, EducationEntry>
>;
