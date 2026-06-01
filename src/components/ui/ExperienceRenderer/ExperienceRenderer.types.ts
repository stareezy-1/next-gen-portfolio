/**
 * Types for the ExperienceRenderer component.
 *
 * @see Requirements 9.2, 9.3
 */

import type { ExperienceEntry } from "@/types/content";

/** Props for the ExperienceRenderer component. */
export interface ExperienceRendererProps {
  /** The experience entry to render. */
  entry: ExperienceEntry;
}
