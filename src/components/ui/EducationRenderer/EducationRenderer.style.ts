/**
 * Styles for the EducationRenderer component.
 *
 * All colors reference CSS custom properties from the theme layer — no
 * hardcoded color literals (Requirements 26.2, 26.3).
 *
 * @see Requirements 10.2, 10.3, 10.4, 26.1, 26.2, 26.3
 */

import type { CSSProperties } from "react";

/** Outer wrapper for the education entry. */
export const educationWrapperStyles: CSSProperties = {
  display: "flex",
  flexDirection: "column",
  gap: "0.875rem",
  padding: "1.5rem",
  backgroundColor: "var(--color-surface)",
  border: "1px solid var(--color-border)",
  borderRadius: "0.75rem",
};

/** Header block: degree + school. */
export const educationHeaderStyles: CSSProperties = {
  display: "flex",
  flexDirection: "column",
  gap: "0.25rem",
};

/** Degree title. */
export const educationDegreeStyles: CSSProperties = {
  fontSize: "1.125rem",
  fontWeight: 700,
  color: "var(--color-text-primary)",
  margin: 0,
};

/** Major / field of study. */
export const educationMajorStyles: CSSProperties = {
  fontSize: "0.9375rem",
  color: "var(--color-text-secondary)",
  margin: 0,
};

/** School name. */
export const educationSchoolStyles: CSSProperties = {
  fontSize: "1rem",
  fontWeight: 600,
  color: "var(--color-brand)",
  margin: 0,
};

/** Meta row: date range + optional GPA. */
export const educationMetaStyles: CSSProperties = {
  display: "flex",
  flexWrap: "wrap",
  gap: "0.75rem",
  fontSize: "0.875rem",
  color: "var(--color-text-secondary)",
};

/** GPA badge. */
export const educationGpaStyles: CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  gap: "0.25rem",
  padding: "0.125rem 0.5rem",
  backgroundColor: "var(--color-surface-elevated)",
  border: "1px solid var(--color-border)",
  borderRadius: "9999px",
  fontSize: "0.8125rem",
  color: "var(--color-text-secondary)",
};

/** Section label for achievements. */
export const educationSectionLabelStyles: CSSProperties = {
  fontSize: "0.8125rem",
  fontWeight: 600,
  textTransform: "uppercase",
  letterSpacing: "0.05em",
  color: "var(--color-text-muted)",
  margin: "0 0 0.5rem 0",
};

/** Achievements list. */
export const educationListStyles: CSSProperties = {
  margin: 0,
  paddingLeft: "1.25rem",
  display: "flex",
  flexDirection: "column",
  gap: "0.375rem",
};

/** Individual achievement item. */
export const educationListItemStyles: CSSProperties = {
  fontSize: "0.9375rem",
  color: "var(--color-text-primary)",
  lineHeight: 1.6,
};

/** Section block wrapper. */
export const educationSectionStyles: CSSProperties = {
  display: "flex",
  flexDirection: "column",
};
