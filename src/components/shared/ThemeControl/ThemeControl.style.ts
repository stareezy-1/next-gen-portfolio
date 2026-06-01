/**
 * Styles for the ThemeControl component.
 *
 * All colors reference CSS custom properties set by the theme layer — no
 * hardcoded color literals (Requirements 26.2, 26.3). Spacing values use
 * CSS relative units rather than hardcoded pixel literals.
 *
 * @see Requirements 6.4, 26.1, 26.2
 */

import type { CSSProperties } from "react";

/** Wrapper for the theme control button. */
export const themeControlWrapperStyles: CSSProperties = {
  display: "flex",
  alignItems: "center",
};

/** The cycle button that toggles through theme modes. */
export const themeControlButtonStyles: CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: "0.375rem",
  padding: "0.375rem 0.625rem",
  border: "1px solid var(--color-border)",
  borderRadius: "0.375rem",
  backgroundColor: "transparent",
  color: "var(--color-text-secondary)",
  fontSize: "0.8125rem",
  fontWeight: 500,
  cursor: "pointer",
  transition: "color 0.2s ease, border-color 0.2s ease",
  whiteSpace: "nowrap",
};

/** Icon span inside the button. */
export const themeControlIconStyles: CSSProperties = {
  fontSize: "1rem",
  lineHeight: 1,
};
