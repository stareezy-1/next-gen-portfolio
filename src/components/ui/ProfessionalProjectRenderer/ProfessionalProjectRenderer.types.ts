/**
 * Types for the ProfessionalProjectRenderer component.
 *
 * @see Requirements 11.4, 11.5
 */

import type { ProfessionalProject } from "@/types/content";

/** Props for the ProfessionalProjectRenderer component. */
export interface ProfessionalProjectRendererProps {
  /** The professional project to render. */
  project: ProfessionalProject;
}
