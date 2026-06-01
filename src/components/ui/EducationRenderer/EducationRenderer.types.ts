/**
 * Types for the EducationRenderer component.
 *
 * @see Requirements 10.2, 10.3, 10.4
 */

import type { EducationEntry } from "@/types/content";

/** Props for the EducationRenderer component. */
export interface EducationRendererProps {
  /** The education entry to render. */
  entry: EducationEntry;
}
