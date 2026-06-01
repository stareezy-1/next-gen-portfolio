/**
 * Styles for the ProfessionalProjectRenderer component.
 *
 * All colors reference CSS custom properties from the theme layer — no
 * hardcoded color literals (Requirements 26.2, 26.3).
 *
 * NOTE: This renderer intentionally contains NO link styles — professional
 * projects must never expose repository or source-code links (Requirement 11.5).
 *
 * @see Requirements 11.4, 11.5, 26.1, 26.2, 26.3
 */

import type { CSSProperties } from "react";

/** Outer wrapper for the professional project card. */
export const professionalProjectWrapperStyles: CSSProperties = {
  display: "flex",
  flexDirection: "column",
  gap: "1rem",
  backgroundColor: "var(--color-surface)",
  border: "1px solid var(--color-border)",
  borderRadius: "0.75rem",
  overflow: "hidden",
};

/** Hero image container. */
export const professionalProjectImageContainerStyles: CSSProperties = {
  display: "flex",
  width: "100%",
  aspectRatio: "16 / 9",
  overflow: "hidden",
  backgroundColor: "var(--color-surface-elevated)",
};

/** Hero image. */
export const professionalProjectImageStyles: CSSProperties = {
  width: "100%",
  height: "100%",
  objectFit: "cover",
};

/** Content area below the image. */
export const professionalProjectContentStyles: CSSProperties = {
  display: "flex",
  flexDirection: "column",
  gap: "0.875rem",
  padding: "1.25rem",
};

/** Header row: title + featured badge. */
export const professionalProjectHeaderStyles: CSSProperties = {
  display: "flex",
  alignItems: "flex-start",
  justifyContent: "space-between",
  gap: "0.75rem",
};

/** Project title. */
export const professionalProjectTitleStyles: CSSProperties = {
  fontSize: "1.125rem",
  fontWeight: 700,
  color: "var(--color-text-primary)",
  margin: 0,
};

/** Featured badge. */
export const professionalProjectFeaturedBadgeStyles: CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  padding: "0.125rem 0.5rem",
  backgroundColor: "var(--color-brand)",
  color: "var(--color-background)",
  borderRadius: "9999px",
  fontSize: "0.75rem",
  fontWeight: 600,
  whiteSpace: "nowrap",
  flexShrink: 0,
};

/** Company + role meta row. */
export const professionalProjectCompanyRowStyles: CSSProperties = {
  display: "flex",
  flexWrap: "wrap",
  gap: "0.5rem",
  alignItems: "center",
  fontSize: "0.9375rem",
};

/** Company name. */
export const professionalProjectCompanyStyles: CSSProperties = {
  fontWeight: 600,
  color: "var(--color-brand)",
};

/** Role separator. */
export const professionalProjectRoleSeparatorStyles: CSSProperties = {
  color: "var(--color-text-muted)",
};

/** Role text. */
export const professionalProjectRoleStyles: CSSProperties = {
  color: "var(--color-text-secondary)",
};

/** Project description. */
export const professionalProjectDescriptionStyles: CSSProperties = {
  fontSize: "0.9375rem",
  color: "var(--color-text-secondary)",
  lineHeight: 1.6,
  margin: 0,
};

/** Section label. */
export const professionalProjectSectionLabelStyles: CSSProperties = {
  fontSize: "0.8125rem",
  fontWeight: 600,
  textTransform: "uppercase",
  letterSpacing: "0.05em",
  color: "var(--color-text-muted)",
  margin: "0 0 0.5rem 0",
};

/** Technology tag pill. */
export const professionalProjectTagStyles: CSSProperties = {
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

/** Flex wrap container for tags. */
export const professionalProjectTagsContainerStyles: CSSProperties = {
  display: "flex",
  flexWrap: "wrap",
  gap: "0.5rem",
};

/** Achievements list. */
export const professionalProjectListStyles: CSSProperties = {
  margin: 0,
  paddingLeft: "1.25rem",
  display: "flex",
  flexDirection: "column",
  gap: "0.375rem",
};

/** Individual achievement item. */
export const professionalProjectListItemStyles: CSSProperties = {
  fontSize: "0.9375rem",
  color: "var(--color-text-primary)",
  lineHeight: 1.6,
};

/** Section block wrapper. */
export const professionalProjectSectionStyles: CSSProperties = {
  display: "flex",
  flexDirection: "column",
};
