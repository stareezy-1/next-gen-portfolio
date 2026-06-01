"use client";

/**
 * Button — token-driven interactive button with micro-interaction.
 *
 * A `'use client'` component because it uses `useState` for the pressed
 * micro-interaction state (Requirement 20.6). Styles live in
 * `Button.style.ts` — no inline styles here (Requirement 26.1). All colors
 * reference CSS custom properties (Requirements 26.2, 26.3).
 *
 * Variants: `primary` (brand fill), `secondary` (surface fill), `ghost`
 * (transparent). The micro-interaction applies a subtle scale-down on
 * `mousedown` / `touchstart` and resets on `mouseup` / `touchend`, gated on
 * the reduced-motion preference (Requirement 20.6, 20.7).
 *
 * @see Requirements 20.6, 23.1, 23.2, 23.3, 26.1, 26.2
 */

import { useState } from "react";
import { useReducedMotion } from "@/hooks";
import {
  getButtonVariantStyles,
  buttonDisabledStyles,
  buttonPressedStyles,
} from "./Button.style";
import { ButtonVariant } from "./Button.types";
import type { ButtonProps } from "./Button.types";

/**
 * Interactive button with variant styles and a micro-interaction on press.
 *
 * @param props - See {@link ButtonProps}.
 */
export function Button({
  children,
  variant = ButtonVariant.Primary,
  type = "button",
  onClick,
  disabled = false,
  "aria-label": ariaLabel,
  className,
}: ButtonProps) {
  const prefersReducedMotion = useReducedMotion();
  const [pressed, setPressed] = useState(false);

  const variantStyles = getButtonVariantStyles(variant);

  const style = {
    ...variantStyles,
    ...(disabled ? buttonDisabledStyles : {}),
    ...(!prefersReducedMotion && pressed && !disabled
      ? buttonPressedStyles
      : {}),
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      aria-label={ariaLabel}
      className={className}
      style={style}
      onMouseDown={() => setPressed(true)}
      onMouseUp={() => setPressed(false)}
      onMouseLeave={() => setPressed(false)}
      onTouchStart={() => setPressed(true)}
      onTouchEnd={() => setPressed(false)}
    >
      {children}
    </button>
  );
}
