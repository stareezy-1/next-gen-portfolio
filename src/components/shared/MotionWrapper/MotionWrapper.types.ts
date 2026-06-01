/**
 * Types for the {@link MotionWrapper} animated wrapper.
 *
 * Kept in a dedicated module (per the three-file component convention) so the
 * style module and the component can share them without circular imports.
 *
 * @see Requirements 20.7, 23.5
 */

import type { ElementType, ReactNode } from "react";
import type { MotionConfig } from "@/types";

/**
 * The set of reveal animations a {@link MotionWrapper} can run. Each maps to a
 * token-derived {@link MotionConfig} factory in the Animation_System.
 */
export type MotionVariant =
  | "pageTransition"
  | "heroWordReveal"
  | "sectionReveal";

/** Props for {@link MotionWrapper}. */
export interface MotionWrapperProps {
  /** Content rendered inside the wrapper element. */
  children: ReactNode;
  /**
   * Which Animation_System reveal to apply. Selects the token-derived
   * {@link MotionConfig}. Ignored when an explicit {@link MotionWrapperProps.config}
   * is provided.
   *
   * @defaultValue `"sectionReveal"`
   */
  variant?: MotionVariant;
  /**
   * An explicit motion configuration, overriding {@link MotionWrapperProps.variant}.
   * Must still originate from the Animation_System (token-derived).
   */
  config?: MotionConfig;
  /**
   * The element type to render. Defaults to a `div`; pass e.g. `"section"` for
   * a semantic landmark.
   *
   * @defaultValue `"div"`
   */
  as?: ElementType;
  /** Optional class name forwarded to the rendered element. */
  className?: string;
}
