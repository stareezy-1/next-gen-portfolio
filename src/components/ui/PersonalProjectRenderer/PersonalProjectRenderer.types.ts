/**
 * Types for the PersonalProjectRenderer component.
 *
 * @see Requirements 11.2, 11.3
 */

import type { PersonalProject } from "@/types/content";

/** Props for the PersonalProjectRenderer component. */
export interface PersonalProjectRendererProps {
  /** The personal project to render. */
  project: PersonalProject;
}
