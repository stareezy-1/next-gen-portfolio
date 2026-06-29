/**
 * Frontmatter schema for the `saas-project` content collection.
 *
 * Validates the YAML frontmatter of a Personal SaaS project MDX file against the
 * {@link SaasProject} domain type. Like a Personal_Project it MAY expose a live
 * URL and (optionally) source, but it adds product-lifecycle fields (`status`,
 * `pricingModel`) that mark it as a shipped product rather than an experiment.
 *
 * @see Requirements 15.1, 15.2
 */

import { z } from "zod";

import type { SaasProject } from "@/types";
import { isoDateString } from "@/content/schemas/shared";
import type { Assert, Equals } from "@/content/schemas/shared";

/** Validates the frontmatter of a Personal SaaS project. */
export const saasProjectSchema = z.object({
  kind: z.literal("saas"),
  slug: z.string(),
  title: z.string(),
  description: z.string(),
  image: z.string(),
  technologies: z.array(z.string()),
  featured: z.boolean(),
  startDate: isoDateString("Start date"),
  liveUrl: z.string().optional(),
  githubUrl: z.string().optional(),
  endDate: isoDateString("End date").optional(),
  status: z.enum(["live", "beta", "development"]).optional(),
  pricingModel: z.string().optional(),
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

/** Compile-time guarantee the schema matches the SaasProject shape. */
type _SaasProjectMatchesType = Assert<
  Equals<z.infer<typeof saasProjectSchema>, SaasProject>
>;
