/**
 * Styles for the Nav component.
 *
 * All colors reference CSS custom properties set by the theme layer — no
 * hardcoded color literals (Requirements 26.2, 26.3).
 *
 * @see Requirements 6.1, 6.2, 6.3, 6.4, 26.1, 26.2
 */

import type { CSSProperties } from "react";

/** Outer <nav> element — sticky header bar with backdrop blur. */
export const navStyles: CSSProperties = {
  display: "flex",
  alignItems: "center",
  padding: "0 1.5rem",
  height: "68px",
  backgroundColor: "color-mix(in srgb, var(--color-surface) 80%, transparent)",
  borderBottom: "1px solid var(--color-border)",
  position: "sticky",
  top: 0,
  zIndex: 100,
  backdropFilter: "blur(12px)",
  WebkitBackdropFilter: "blur(12px)",
};

/** Inner row that holds the link list and controls, constrained by ContentWidth. */
export const navInnerStyles: CSSProperties = {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  width: "100%",
};

/** Ordered list of navigation links. */
export const navListStyles: CSSProperties = {
  display: "flex",
  listStyle: "none",
  margin: 0,
  padding: 0,
  gap: "2rem",
  alignItems: "center",
};

/** Default (inactive) navigation link. */
export const navLinkStyles: CSSProperties = {
  color: "var(--color-text-secondary)",
  textDecoration: "none",
  fontSize: "0.9375rem",
  fontWeight: 500,
  transition: "color 0.2s ease",
};

/** Active navigation link — current route. */
export const navLinkActiveStyles: CSSProperties = {
  ...navLinkStyles,
  color: "var(--color-brand)",
};

/** Logo text styles. */
export const navLogoStyles: CSSProperties = {
  fontSize: "1.125rem",
  fontWeight: 800,
  color: "var(--color-brand)",
  textDecoration: "none",
  letterSpacing: "-0.02em",
  flexShrink: 0,
};

/** Right-hand controls area (ThemeControl, etc.). */
export const navControlsStyles: CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: "0.75rem",
};
