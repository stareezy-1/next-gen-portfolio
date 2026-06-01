/**
 * Animation_System — token-derived motion configurations.
 *
 * Every animation the platform runs (page transitions, hero/section reveals,
 * card-hover and button micro-interactions) draws its duration and easing from
 * the Token_System `motion` tokens — never from hardcoded numbers or
 * cubic-bezier literals. Each function returns a {@link MotionConfig} whose
 * `durationMs` is one of the `motion.duration.*.value` numbers and whose
 * `easing` is one of the `motion.easing.*.value` strings (Requirement 20.1,
 * Property 35).
 *
 * Token mapping (purposeful, premium-but-not-distracting motion):
 *  - `pageTransition`  → `duration.enter` (300ms) / `easing.easeInOut`
 *    — heavier cross-route motion that moves symmetrically in and out (Req 20.2)
 *  - `heroWordReveal`  → `duration.normal` (200ms) / `easing.easeOut`
 *    — word-by-word entrance that decelerates naturally (Req 20.3)
 *  - `sectionReveal`   → `duration.enter` (300ms) / `easing.easeOut`
 *    — on-scroll section entrance, slightly heavier than the hero (Req 20.4)
 *  - `cardHover`       → `duration.fast` (150ms) / `easing.easeOut`
 *    — quick, responsive hover feedback on project cards (Req 20.5)
 *  - `buttonMicro`     → `duration.instant` (100ms) / `easing.easeOut`
 *    — instant-feeling button micro-interaction (Req 20.6)
 *
 * These are pure functions with no DOM or React dependency so they can be
 * exhaustively property-tested (task 8.2). Reduced-motion gating lives in the
 * `MotionWrapper` client component, not here.
 *
 * @see Requirements 20.1, 20.2, 20.3, 20.4, 20.5, 20.6
 */

import { motion } from "@stareezy-ui/tokens";
import type { MotionConfig } from "@/types";

/**
 * The Animation_System surface: one factory per animation, each returning a
 * token-derived {@link MotionConfig}. Consumers gate the actual playback on the
 * reduced-motion preference (see {@link MotionWrapper}); when reduced, they
 * render the final state and skip the transition (Requirement 20.7).
 */
export interface AnimationSystem {
  /** Cross-route page transition motion (Requirement 20.2). */
  pageTransition(): MotionConfig;
  /** Word-by-word hero text reveal motion (Requirement 20.3). */
  heroWordReveal(): MotionConfig;
  /** On-scroll section reveal motion (Requirement 20.4). */
  sectionReveal(): MotionConfig;
  /** Project-card hover motion (Requirement 20.5). */
  cardHover(): MotionConfig;
  /** Interactive-button micro-interaction motion (Requirement 20.6). */
  buttonMicro(): MotionConfig;
}

/**
 * Page transition motion — `duration.enter` + `easeInOut`.
 *
 * @returns A token-derived {@link MotionConfig} for route transitions.
 */
export function pageTransition(): MotionConfig {
  return {
    durationMs: motion.duration.enter.value,
    easing: motion.easing.easeInOut.value,
  };
}

/**
 * Hero word-by-word reveal motion — `duration.normal` + `easeOut`.
 *
 * @returns A token-derived {@link MotionConfig} for the hero text reveal.
 */
export function heroWordReveal(): MotionConfig {
  return {
    durationMs: motion.duration.normal.value,
    easing: motion.easing.easeOut.value,
  };
}

/**
 * Section reveal motion — `duration.enter` + `easeOut`.
 *
 * @returns A token-derived {@link MotionConfig} for on-scroll section reveals.
 */
export function sectionReveal(): MotionConfig {
  return {
    durationMs: motion.duration.enter.value,
    easing: motion.easing.easeOut.value,
  };
}

/**
 * Project-card hover motion — `duration.fast` + `easeOut`.
 *
 * @returns A token-derived {@link MotionConfig} for card-hover feedback.
 */
export function cardHover(): MotionConfig {
  return {
    durationMs: motion.duration.fast.value,
    easing: motion.easing.easeOut.value,
  };
}

/**
 * Button micro-interaction motion — `duration.instant` + `easeOut`.
 *
 * @returns A token-derived {@link MotionConfig} for button micro-interactions.
 */
export function buttonMicro(): MotionConfig {
  return {
    durationMs: motion.duration.instant.value,
    easing: motion.easing.easeOut.value,
  };
}

/**
 * The concrete {@link AnimationSystem}, wiring the standalone factories into a
 * single object for ergonomic consumption (`animationSystem.cardHover()`).
 */
export const animationSystem: AnimationSystem = {
  pageTransition,
  heroWordReveal,
  sectionReveal,
  cardHover,
  buttonMicro,
};
