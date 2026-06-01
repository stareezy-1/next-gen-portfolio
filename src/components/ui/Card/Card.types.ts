/**
 * Types for the Card component.
 *
 * @see Requirements 26.1
 */

import type { ReactNode, CSSProperties } from "react";

/** Props for the Card component. */
export interface CardProps {
  /** Card content. */
  children: ReactNode;
  /**
   * When provided, the card renders as an anchor element wrapping the content,
   * making the entire card a clickable link.
   */
  href?: string;
  /** Additional CSS class names. */
  className?: string;
  /** Inline style overrides (use sparingly — prefer token-driven styles). */
  style?: CSSProperties;
  /** Accessible label for the card link (required when `href` is provided). */
  "aria-label"?: string;
}
