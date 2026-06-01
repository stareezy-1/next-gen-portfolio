/**
 * Styles for the BlogPostRenderer component.
 *
 * All colors reference CSS custom properties from the theme layer — no
 * hardcoded color literals (Requirements 26.2, 26.3).
 *
 * @see Requirements 14.1, 26.1, 26.2, 26.3
 */

import type { CSSProperties } from "react";

/** Outer article wrapper. */
export const blogPostWrapperStyles: CSSProperties = {
  display: "flex",
  flexDirection: "column",
  gap: "1.25rem",
  backgroundColor: "var(--color-surface)",
  border: "1px solid var(--color-border)",
  borderRadius: "0.75rem",
  overflow: "hidden",
};

/** Hero image container. */
export const blogPostHeroContainerStyles: CSSProperties = {
  display: "flex",
  width: "100%",
  aspectRatio: "16 / 9",
  overflow: "hidden",
  backgroundColor: "var(--color-surface-elevated)",
};

/** Hero image. */
export const blogPostHeroImageStyles: CSSProperties = {
  width: "100%",
  height: "100%",
  objectFit: "cover",
};

/** Content area below the hero image. */
export const blogPostContentStyles: CSSProperties = {
  display: "flex",
  flexDirection: "column",
  gap: "1rem",
  padding: "1.5rem",
};

/** Category + tag row. */
export const blogPostCategoryRowStyles: CSSProperties = {
  display: "flex",
  flexWrap: "wrap",
  gap: "0.5rem",
  alignItems: "center",
};

/** Category badge. */
export const blogPostCategoryStyles: CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  padding: "0.25rem 0.625rem",
  backgroundColor: "var(--color-brand)",
  color: "var(--color-background)",
  borderRadius: "9999px",
  fontSize: "0.75rem",
  fontWeight: 600,
  textTransform: "uppercase",
  letterSpacing: "0.05em",
};

/** Tag pill. */
export const blogPostTagStyles: CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  padding: "0.25rem 0.625rem",
  backgroundColor: "var(--color-surface-elevated)",
  border: "1px solid var(--color-border)",
  borderRadius: "9999px",
  fontSize: "0.75rem",
  color: "var(--color-text-secondary)",
  whiteSpace: "nowrap",
};

/** Post title. */
export const blogPostTitleStyles: CSSProperties = {
  fontSize: "1.375rem",
  fontWeight: 700,
  color: "var(--color-text-primary)",
  lineHeight: 1.3,
  margin: 0,
};

/** Post description / excerpt. */
export const blogPostDescriptionStyles: CSSProperties = {
  fontSize: "0.9375rem",
  color: "var(--color-text-secondary)",
  lineHeight: 1.6,
  margin: 0,
};

/** Meta row: author, date, reading time. */
export const blogPostMetaStyles: CSSProperties = {
  display: "flex",
  flexWrap: "wrap",
  gap: "1rem",
  alignItems: "center",
  fontSize: "0.875rem",
  color: "var(--color-text-muted)",
  borderTop: "1px solid var(--color-border)",
  paddingTop: "1rem",
};

/** Author name. */
export const blogPostAuthorStyles: CSSProperties = {
  fontWeight: 500,
  color: "var(--color-text-secondary)",
};

/** Separator dot between meta items. */
export const blogPostMetaSeparatorStyles: CSSProperties = {
  color: "var(--color-border)",
  userSelect: "none",
};

/** Reading time label. */
export const blogPostReadingTimeStyles: CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  gap: "0.25rem",
};
