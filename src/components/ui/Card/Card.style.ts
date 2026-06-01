/**
 * Styles for the Card component.
 *
 * All colors reference CSS custom properties from the theme layer — no
 * hardcoded color literals (Requirements 26.2, 26.3).
 *
 * @see Requirements 26.1, 26.2, 26.3
 */

import type { CSSProperties } from "react";

/** Base card container styles. */
export const cardStyles: CSSProperties = {
  display: "flex",
  flexDirection: "column",
  backgroundColor: "var(--color-surface)",
  border: "1px solid var(--color-border)",
  borderRadius: "0.75rem",
  overflow: "hidden",
  position: "relative",
};

/** Additional styles applied when the card is a link (`href` provided). */
export const cardLinkStyles: CSSProperties = {
  ...cardStyles,
  textDecoration: "none",
  color: "inherit",
  cursor: "pointer",
  transition: "border-color 0.2s ease, transform 0.15s ease",
};

/** Wrapper that fills the card link's anchor element. */
export const cardLinkInnerStyles: CSSProperties = {
  display: "flex",
  flexDirection: "column",
  flex: "1 1 auto",
};
