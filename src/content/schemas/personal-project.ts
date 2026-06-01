/**
 * Frontmatter schema for the `personal-project` content collection.
 *
 * Validates the YAML frontmatter of a Personal_Project MDX file against the
 * {@link PersonalProject} domain type. Unlike a Professional_Project, a
 * Personal_Project MAY expose source-code and repository links
 * (`githubUrl`, `liveUrl`) — Requirement 11.3.
 *
 * @see Requirements 15.1, 15.2
 */

import { z } from "zod";

import type { PersonalProject } from "@/types";
import { isoDateString } from "@/content/schemas/shared";
import type { Assert, Equals } from "@/content/schemas/shared";

/** Validates the frontmatter of a Personal_Project. */
export const personalProjectSchema = z.object({
  kind: z.literal("personal"),
  slug: z.string(),
  title: z.string(),
  description: z.string(),
  image: z.string(),
  technologies: z.array(z.string()),
  featured: z.boolean(),
  startDate: isoDateString("Start date"),
  githubUrl: z.string().optional(),
  liveUrl: z.string().optional(),
  endDate: isoDateString("End date").optional(),
  challenges: z.array(z.string()).optional(),
  solutions: z.array(z.string()).optional(),
  results: z.array(z.string()).optional(),
  // Detail-page sections (Requirement 12.2).
  overview: z.string().optional(),
  problem: z.string().optional(),
  solution: z.string().optional(),
  architecture: z.string().optional(),
  lessonsLearned: z.string().optional(),
  gallery: z.array(z.string()).optional(),
});

/** Compile-time guarantee the schema matches the PersonalProject shape. */
type _PersonalProjectMatchesType = Assert<
  Equals<z.infer<typeof personalProjectSchema>, PersonalProject>
>;
