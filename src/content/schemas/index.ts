/**
 * Per-collection content schema registry.
 *
 * Maps every {@link Collection} to the Zod schema that validates its MDX
 * frontmatter, and re-exports each schema individually. The Content_Loader
 * resolves a file's collection to its schema through {@link COLLECTION_SCHEMAS}
 * before producing a typed content object (Requirements 15.1, 15.2).
 *
 * @see Requirements 15.1, 11.5, 11.6
 */

import type { ZodTypeAny } from "zod";

import type { Collection } from "@/types";

import { blogSchema } from "@/content/schemas/blog";
import { experienceSchema } from "@/content/schemas/experience";
import { educationSchema } from "@/content/schemas/education";
import { personalProjectSchema } from "@/content/schemas/personal-project";
import { professionalProjectSchema } from "@/content/schemas/professional-project";
import { saasProjectSchema } from "@/content/schemas/saas-project";

export { blogSchema } from "@/content/schemas/blog";
export { experienceSchema } from "@/content/schemas/experience";
export { educationSchema } from "@/content/schemas/education";
export { personalProjectSchema } from "@/content/schemas/personal-project";
export { professionalProjectSchema } from "@/content/schemas/professional-project";
export { saasProjectSchema } from "@/content/schemas/saas-project";

export {
  isoDateString,
  FORBIDDEN_REPOSITORY_FIELDS,
} from "@/content/schemas/shared";
export type { Assert, Equals } from "@/content/schemas/shared";

/**
 * The schema used to validate each content collection's frontmatter. Keyed by
 * {@link Collection} so the Content_Loader can look up the correct schema for a
 * given file.
 */
export const COLLECTION_SCHEMAS: Record<Collection, ZodTypeAny> = {
  blog: blogSchema,
  experience: experienceSchema,
  education: educationSchema,
  "personal-project": personalProjectSchema,
  "professional-project": professionalProjectSchema,
  "saas-project": saasProjectSchema,
};
