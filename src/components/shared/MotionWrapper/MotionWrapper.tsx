"use client";

/**
 * MotionWrapper — the reduced-motion-aware reveal wrapper.
 *
 * A `'use client'` component that applies a token-derived reveal animation to
 * its children, gated on the user's reduced-motion preference:
 *
 *  - **Reduced motion ON** — the children are rendered immediately in their
 *    FINAL visual state (opacity 1, settled transform) with `transition: none`.
 *    No animation runs and no transition is applied (Requirements 20.7, 23.5).
 *    This final-state behavior backs Property 36.
 *  - **Reduced motion OFF** — the wrapper mounts in the pre-reveal "hidden"
 *    state and, on the next frame, transitions to the final state using the
 *    timing/easing from the selected Animation_System {@link MotionConfig}
 *    (all sourced from `motion` tokens — Requirement 20.1).
 *
 * The motion configuration is chosen by `variant` (defaulting to
 * `sectionReveal`) or supplied explicitly via `config`; either way the timing
 * originates from the Token_System through the Animation_System, never from
 * hardcoded literals.
 *
 * @see Requirements 20.1, 20.2, 20.3, 20.4, 20.7, 23.5
 */

import { useEffect, useState } from "react";
import { useReducedMotion } from "@/hooks";
import {
  pageTransition,
  heroWordReveal,
  sectionReveal,
} from "@/services/animation";
import type { MotionConfig } from "@/types";
import type { MotionVariant, MotionWrapperProps } from "./MotionWrapper.types";
import { hidden, revealed, reducedMotion } from "./MotionWrapper.style";

/**
 * Resolves a {@link MotionVariant} to its token-derived {@link MotionConfig}.
 * Keeping the lookup explicit (no dynamic indexing) keeps the mapping readable
 * and type-safe.
 */
function configForVariant(variant: MotionVariant): MotionConfig {
  switch (variant) {
    case "pageTransition":
      return pageTransition();
    case "heroWordReveal":
      return heroWordReveal();
    case "sectionReveal":
      return sectionReveal();
  }
}

/**
 * Wraps `children` in a reveal animation that respects the reduced-motion
 * preference.
 *
 * @param props - See {@link MotionWrapperProps}.
 */
export function MotionWrapper({
  children,
  variant = "sectionReveal",
  config,
  as: Tag = "div",
  className,
}: MotionWrapperProps) {
  const prefersReducedMotion = useReducedMotion();

  // Tracks whether the reveal has been triggered. Starts `false` so the
  // element mounts in the hidden state, then flips to `true` after mount so
  // the browser animates the transition to the final state.
  const [revealedState, setRevealedState] = useState(false);

  useEffect(() => {
    // Reduced motion: nothing to animate — the final state is rendered
    // directly (handled in the style branch below).
    if (prefersReducedMotion) return;
    // Flip to the revealed state on the next tick so the transition runs.
    const id = requestAnimationFrame(() => setRevealedState(true));
    return () => cancelAnimationFrame(id);
  }, [prefersReducedMotion]);

  const motionConfig = config ?? configForVariant(variant);

  // Reduced motion → final state, no transition (Requirements 20.7, 23.5).
  // Otherwise → hidden until the post-mount frame flips to the revealed state.
  const style = prefersReducedMotion
    ? reducedMotion
    : revealedState
    ? revealed(motionConfig)
    : hidden;

  return (
    <Tag className={className} style={style}>
      {children}
    </Tag>
  );
}
