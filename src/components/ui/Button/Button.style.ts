/**
 * Styles for the Button component.
 *
 * All colors reference CSS custom properties from the theme layer — no
 * hardcoded color literals (Requirements 26.2, 26.3). Spacing uses CSS
 * relative units.
 *
 * @see Requirements 26.1, 26.2, 26.3
 */

import type { CSSProperties } from "react";
import { ButtonVariant } from "./Button.types";

/** Shared base styles for all button variants. */
const buttonBase: CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  gap: "0.5rem",
  padding: "0.625rem 1.25rem",
  borderRadius: "0.375rem",
  fontSize: "0.9375rem",
  fontWeight: 600,
  lineHeight: 1.25,
  cursor: "pointer",
  border: "1px solid transparent",
  textDecoration: "none",
  whiteSpace: "nowrap",
  userSelect: "none",
  transition: "opacity 0.1s ease, transform 0.1s ease",
};

/** Styles for the primary variant. */
export const buttonPrimaryStyles: CSSProperties = {
  ...buttonBase,
  backgroundColor: "var(--color-brand)",
  color: "var(--color-background)",
  borderColor: "var(--color-brand)",
};

/** Styles for the secondary variant. */
export const buttonSecondaryStyles: CSSProperties = {
  ...buttonBase,
  backgroundColor: "var(--color-surface-elevated)",
  color: "var(--color-text-primary)",
  borderColor: "var(--color-border)",
};

/** Styles for the ghost variant. */
export const buttonGhostStyles: CSSProperties = {
  ...buttonBase,
  backgroundColor: "transparent",
  color: "var(--color-text-secondary)",
  borderColor: "transparent",
};

/** Disabled overlay applied on top of any variant. */
export const buttonDisabledStyles: CSSProperties = {
  opacity: 0.5,
  cursor: "not-allowed",
  pointerEvents: "none",
};

/** Micro-interaction pressed state (scale down slightly). */
export const buttonPressedStyles: CSSProperties = {
  transform: "scale(0.97)",
};

/** Returns the base style for a given variant. */
export function getButtonVariantStyles(variant: ButtonVariant): CSSProperties {
  switch (variant) {
    case ButtonVariant.Primary:
      return buttonPrimaryStyles;
    case ButtonVariant.Secondary:
      return buttonSecondaryStyles;
    case ButtonVariant.Ghost:
      return buttonGhostStyles;
  }
}
