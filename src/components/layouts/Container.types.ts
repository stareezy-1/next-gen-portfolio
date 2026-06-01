/**
 * Types for the layout container primitives.
 *
 * @see Requirements 5.1, 5.2, 5.3
 */

import type { ReactNode, CSSProperties, ElementType } from "react";

/** Props shared by all width-constrained container components. */
export interface ContainerProps {
  /** Content to render inside the container. */
  children: ReactNode;
  /** Additional CSS class names. */
  className?: string;
  /** Inline style overrides (use sparingly — prefer token-driven styles). */
  style?: CSSProperties;
  /** HTML element to render as. Defaults to `"div"`. */
  as?: ElementType;
}
