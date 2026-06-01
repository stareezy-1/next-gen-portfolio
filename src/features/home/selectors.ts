/**
 * Home page data selectors.
 *
 * Pure functions for selecting and ordering the data subsets rendered on the
 * Home page: featured projects and recent blog posts.
 *
 * These are the core logic units tested by Properties 7 and 9.
 *
 * @see Requirements 7.2, 7.5
 */

import type { Project } from "@/types/content";
import type { BlogPost } from "@/types/content";
import { FEATURED_PROJECTS_COUNT } from "@/constants";

/**
 * Returns the featured projects for the Home page.
 *
 * Filters the input array to projects with `featured === true`, then takes at
 * most {@link FEATURED_PROJECTS_COUNT} (6). If fewer than 6 projects are
 * featured, all featured projects are returned.
 *
 * The input array is never mutated; a new array is always returned.
 *
 * @param projects - The full pool of projects to select from.
 * @returns At most {@link FEATURED_PROJECTS_COUNT} featured projects.
 *
 * @see Requirements 7.2
 * @see Property 7
 */
export function getFeaturedProjects(projects: Project[]): Project[] {
  return projects.filter((p) => p.featured).slice(0, FEATURED_PROJECTS_COUNT);
}

/**
 * Returns the N most recent blog posts by `publishDate` (descending).
 *
 * Sorts a defensive copy of `posts` by `publishDate` from most recent to
 * least recent, then takes the first `count` entries. The sort is stable for
 * equal dates (original relative order is preserved).
 *
 * The input array is never mutated.
 *
 * @param posts - The pool of blog posts to select from.
 * @param count - The maximum number of posts to return.
 * @returns The `count` most recent posts, sorted descending by publishDate.
 *
 * @see Requirements 7.5
 * @see Property 9
 */
export function getRecentBlogPosts(
  posts: BlogPost[],
  count: number,
): BlogPost[] {
  return [...posts]
    .sort(
      (a, b) =>
        new Date(b.publishDate).getTime() - new Date(a.publishDate).getTime(),
    )
    .slice(0, count);
}
