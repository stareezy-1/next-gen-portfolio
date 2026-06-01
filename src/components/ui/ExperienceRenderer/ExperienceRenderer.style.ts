/**
 * Styles for the ExperienceRenderer component.
 *
 * All colors reference CSS custom properties from the theme layer — no
 * hardcoded color literals (Requirements 26.2, 26.3).
 *
 * @see Requirements 9.2, 9.3, 26.1, 26.2, 26.3
 */

import type { CSSProperties } from "react";

/** Outer wrapper for the experience entry. */
export const experienceWrapperStyles: CSSProperties = {
  display: "flex",
  flexDirection: "column",
  gap: "1rem",
  padding: "1.5rem",
  backgroundColor: "var(--color-surface)",
  border: "1px solid var(--color-border)",
  borderRadius: "0.75rem",
};

/** Header row: role + company + date range. */
export const experienceHeaderStyles: CSSProperties = {
  display: "flex",
  flexDirection: "column",
  gap: "0.25rem",
};

/** Role / job title. */
export const experienceRoleStyles: CSSProperties = {
  fontSize: "1.125rem",
  fontWeight: 700,
  color: "var(--color-text-primary)",
  margin: 0,
};

/** Company name. */
export const experienceCompanyStyles: CSSProperties = {
  fontSize: "1rem",
  fontWeight: 600,
  color: "var(--color-brand)",
  margin: 0,
};

/** Meta row: location + date range. */
export const experienceMetaStyles: CSSProperties = {
  display: "flex",
  flexWrap: "wrap",
  gap: "0.75rem",
  fontSize: "0.875rem",
  color: "var(--color-text-secondary)",
};

/** Section label (Achievements, Technologies, Impact). */
export const experienceSectionLabelStyles: CSSProperties = {
  fontSize: "0.8125rem",
  fontWeight: 600,
  textTransform: "uppercase",
  letterSpacing: "0.05em",
  color: "var(--color-text-muted)",
  margin: "0 0 0.5rem 0",
};

/** Unordered list used for achievements and impact metrics. */
export const experienceListStyles: CSSProperties = {
  margin: 0,
  paddingLeft: "1.25rem",
  display: "flex",
  flexDirection: "column",
  gap: "0.375rem",
};

/** Individual list item. */
export const experienceListItemStyles: CSSProperties = {
  fontSize: "0.9375rem",
  color: "var(--color-text-primary)",
  lineHeight: 1.6,
};

/** Tag pill used for technologies. */
export const experienceTagStyles: CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  padding: "0.25rem 0.625rem",
  backgroundColor: "var(--color-surface-elevated)",
  border: "1px solid var(--color-border)",
  borderRadius: "9999px",
  fontSize: "0.8125rem",
  color: "var(--color-text-secondary)",
  whiteSpace: "nowrap",
};

/** Flex wrap container for technology tags. */
export const experienceTagsContainerStyles: CSSProperties = {
  display: "flex",
  flexWrap: "wrap",
  gap: "0.5rem",
};

/** Section block wrapper. */
export const experienceSectionStyles: CSSProperties = {
  display: "flex",
  flexDirection: "column",
};
