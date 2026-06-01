/**
 * Styles for the {@link MotionWrapper}.
 *
 * Every dimensional/timing value originates from the Token_System: the reveal
 * offset is a `spacing` token value and the transition is built from a
 * token-derived {@link MotionConfig} via the Animation_System's
 * {@link toCssTransition} helper (Requirement 26.2). No hardcoded spacing,
 * easing, or duration literals appear here.
 *
 * The wrapper animates two CSS properties — `opacity` and `transform` — between
 * a pre-reveal "hidden" state and a "final" state. The reduced-motion style is
 * exactly the final state with `transition: none`, which is what lets the
 * wrapper present content in its final visual state with no transition when
 * Reduced_Motion is enabled (Requirements 20.7, 23.5).
 *
 * @see Requirements 20.7, 23.5, 26.2
 */

import type { CSSProperties } from "react";
import { spacing } from "@stareezy-ui/tokens";
import type { MotionConfig } from "@/types";
import { toCssTransition } from "@/services/animation";

/**
 * Vertical offset (in px) the element travels during a reveal, sourced from a
 * `spacing` token (`spacing.medium` = 12). Sourced from the token, never a
 * hardcoded literal (Requirement 26.2/3.3).
 */
const REVEAL_OFFSET_PX = spacing.medium.value;

/** Fully transparent — the start of the opacity reveal. */
const HIDDEN_OPACITY = 0;
/** Fully opaque — the final, revealed state. */
const FINAL_OPACITY = 1;

/** The neutral, settled transform applied in the final state. */
const FINAL_TRANSFORM = "translateY(0)";

/**
 * The pre-reveal "hidden" state: transparent and nudged down by the
 * token-derived offset. Applied on first mount before the element reveals.
 */
export const hidden: CSSProperties = {
  opacity: HIDDEN_OPACITY,
  transform: `translateY(${REVEAL_OFFSET_PX}px)`,
};

/**
 * The "final" state: fully opaque and settled. This is also the state shown
 * immediately (with no transition) under Reduced_Motion (Requirement 20.7).
 */
export const finalState: CSSProperties = {
  opacity: FINAL_OPACITY,
  transform: FINAL_TRANSFORM,
};

/**
 * The full style for the revealed element, including the token-derived
 * transition built from the supplied {@link MotionConfig}.
 *
 * @param config - The token-derived motion configuration to apply.
 * @returns The final-state style plus its transition.
 */
export function revealed(config: MotionConfig): CSSProperties {
  return {
    ...finalState,
    transition: toCssTransition(config),
  };
}

/**
 * The Reduced_Motion style: the final visual state with no transition. Using
 * this when reduced motion is enabled satisfies "present content in its final
 * state" with no animation applied (Requirements 20.7, 23.5).
 */
export const reducedMotion: CSSProperties = {
  ...finalState,
  transition: "none",
};
