/**
 * Types for the BlogPostRenderer component.
 *
 * @see Requirements 14.1
 */

import type { BlogPost } from "@/types/content";

/** Props for the BlogPostRenderer component. */
export interface BlogPostRendererProps {
  /** The blog post to render. */
  post: BlogPost;
  /**
   * Pre-computed reading time in minutes.
   * When provided it is displayed alongside the publish date (Requirement 14.1).
   */
  readingTimeMinutes?: number;
}
