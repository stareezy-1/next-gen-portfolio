/**
 * Types for the Button component.
 *
 * @see Requirements 20.6, 26.1
 */

import type { ReactNode, MouseEventHandler } from "react";

/** Visual style variants for the Button. */
export enum ButtonVariant {
  Primary = "primary",
  Secondary = "secondary",
  Ghost = "ghost",
}

/** Props for the Button component. */
export interface ButtonProps {
  /** Button content. */
  children: ReactNode;
  /** Visual variant. Defaults to `ButtonVariant.Primary`. */
  variant?: ButtonVariant;
  /** HTML button type attribute. Defaults to `"button"`. */
  type?: "button" | "submit" | "reset";
  /** Click handler. */
  onClick?: MouseEventHandler<HTMLButtonElement>;
  /** Whether the button is disabled. */
  disabled?: boolean;
  /** Accessible label for icon-only buttons. */
  "aria-label"?: string;
  /** Additional CSS class names. */
  className?: string;
}
