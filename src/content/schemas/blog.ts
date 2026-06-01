/**
 * Frontmatter schema for the `blog` content collection.
 *
 * Validates the YAML frontmatter of a Blog_Post MDX file. The MDX `body` is
 * parsed separately by the MDX_Parser and is therefore intentionally absent
 * from this schema — the schema describes only what an author writes in
 * frontmatter (Requirement 15.1, 15.2).
 *
 * @see Requirements 15.1, 15.2
 */

import { z } from "zod";

import type { BlogPost } from "@/types";
import { isoDateString } from "@/content/schemas/shared";
import type { Assert, Equals } from "@/content/schemas/shared";

/**
 * Validates the frontmatter of a Blog_Post. Mirrors {@link BlogPost} with the
 * exception of `body`, which is supplied by the MDX_Parser rather than the
 * frontmatter block.
 */
export const blogSchema = z.object({
  slug: z.string(),
  title: z.string(),
  description: z.string(),
  heroImage: z.string(),
  author: z.string(),
  publishDate: isoDateString("Publish date"),
  tags: z.array(z.string()),
  category: z.string(),
  published: z.boolean(),
});

/** Compile-time guarantee the schema matches the Blog_Post frontmatter shape. */
type _BlogMatchesType = Assert<
  Equals<z.infer<typeof blogSchema>, Omit<BlogPost, "body">>
>;
