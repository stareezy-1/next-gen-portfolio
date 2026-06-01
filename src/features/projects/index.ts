/**
 * Projects feature barrel.
 *
 * Re-exports all project-feature utilities so consumers can import from
 * `@/features/projects` without knowing the internal file layout.
 *
 * @see Requirements 11.1, 12.4
 */

export { partitionProjects, getRelatedProjects } from "./partition";
