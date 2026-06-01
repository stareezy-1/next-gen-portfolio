/**
 * Home feature barrel.
 *
 * Re-exports all home-feature utilities so consumers can import from
 * `@/features/home` without knowing the internal file layout.
 *
 * @see Requirements 7.2, 7.5
 */

export { getFeaturedProjects, getRecentBlogPosts } from "./selectors";
