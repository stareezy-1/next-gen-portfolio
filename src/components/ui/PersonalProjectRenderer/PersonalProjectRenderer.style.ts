/**
 * Styles for the PersonalProjectRenderer component.
 *
 * All colors reference CSS custom properties from the theme layer — no
 * hardcoded color literals (Requirements 26.2, 26.3).
 *
 * @see Requirements 11.2, 11.3, 26.1, 26.2, 26.3
 */

import type { CSSProperties } from "react";

/** Outer wrapper for the personal project card. */
export const projectWrapperStyles: CSSProperties = {
  display: "flex",
  flexDirection: "column",
  gap: "1rem",
  backgroundColor: "var(--color-surface)",
  border: "1px solid var(--color-border)",
  borderRadius: "0.75rem",
  overflow: "hidden",
};

/** Hero image container. */
export const projectImageContainerStyles: CSSProperties = {
  display: "flex",
  width: "100%",
  aspectRatio: "16 / 9",
  overflow: "hidden",
  backgroundColor: "var(--color-surface-elevated)",
  alignItems: "center",
  justifyContent: "center",
};

/** Hero image. */
export const projectImageStyles: CSSProperties = {
  width: "100%",
  height: "100%",
  objectFit: "contain",
};

/** Content area below the image. */
export const projectContentStyles: CSSProperties = {
  display: "flex",
  flexDirection: "column",
  gap: "0.875rem",
  padding: "1.25rem",
};

/** Header row: title + featured badge. */
export const projectHeaderStyles: CSSProperties = {
  display: "flex",
  alignItems: "flex-start",
  justifyContent: "space-between",
  gap: "0.75rem",
};

/** Project title. */
export const projectTitleStyles: CSSProperties = {
  fontSize: "1.125rem",
  fontWeight: 700,
  color: "var(--color-text-primary)",
  margin: 0,
};

/** Featured badge. */
export const projectFeaturedBadgeStyles: CSSProperties = {
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

/** Project description. */
export const projectDescriptionStyles: CSSProperties = {
  fontSize: "0.9375rem",
  color: "var(--color-text-secondary)",
  lineHeight: 1.6,
  margin: 0,
};

/** Meta row: start date + optional end date. */
export const projectMetaStyles: CSSProperties = {
  display: "flex",
  flexWrap: "wrap",
  gap: "0.75rem",
  fontSize: "0.875rem",
  color: "var(--color-text-muted)",
};

/** Section label. */
export const projectSectionLabelStyles: CSSProperties = {
  fontSize: "0.8125rem",
  fontWeight: 600,
  textTransform: "uppercase",
  letterSpacing: "0.05em",
  color: "var(--color-text-muted)",
  margin: "0 0 0.5rem 0",
};

/** Technology tag pill. */
export const projectTagStyles: CSSProperties = {
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
export const projectTagsContainerStyles: CSSProperties = {
  display: "flex",
  flexWrap: "wrap",
  gap: "0.5rem",
};

/** Links row (GitHub, Live). */
export const projectLinksStyles: CSSProperties = {
  display: "flex",
  flexWrap: "wrap",
  gap: "0.75rem",
};

/** Individual link. */
export const projectLinkStyles: CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  gap: "0.375rem",
  fontSize: "0.875rem",
  fontWeight: 500,
  color: "var(--color-brand)",
  textDecoration: "none",
};

/** Unordered list for challenges / solutions / results. */
export const projectListStyles: CSSProperties = {
  margin: 0,
  paddingLeft: "1.25rem",
  display: "flex",
  flexDirection: "column",
  gap: "0.375rem",
};

/** Individual list item. */
export const projectListItemStyles: CSSProperties = {
  fontSize: "0.9375rem",
  color: "var(--color-text-primary)",
  lineHeight: 1.6,
};

/** Section block wrapper. */
export const projectSectionStyles: CSSProperties = {
  display: "flex",
  flexDirection: "column",
};
