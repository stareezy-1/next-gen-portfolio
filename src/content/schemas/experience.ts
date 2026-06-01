/**
 * Frontmatter schema for the `experience` content collection.
 *
 * Validates the YAML frontmatter of an Experience MDX file against the
 * {@link ExperienceEntry} domain type. An absent `endDate` denotes the current
 * position (Requirement 9.3).
 *
 * @see Requirements 15.1, 15.2
 */

import { z } from "zod";

import type { ExperienceEntry } from "@/types";
import { isoDateString } from "@/content/schemas/shared";
import type { Assert, Equals } from "@/content/schemas/shared";

/** Validates the frontmatter of an Experience timeline entry. */
export const experienceSchema = z.object({
  company: z.string(),
  role: z.string(),
  location: z.string(),
  startDate: isoDateString("Start date"),
  endDate: isoDateString("End date").optional(),
  achievements: z.array(z.string()),
  technologies: z.array(z.string()),
  impactMetrics: z.array(z.string()),
});

/** Compile-time guarantee the schema matches the ExperienceEntry shape. */
type _ExperienceMatchesType = Assert<
  Equals<z.infer<typeof experienceSchema>, ExperienceEntry>
>;
