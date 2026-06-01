/**
 * Pure helpers that turn a token-derived {@link MotionConfig} into the CSS
 * primitives the animated wrappers apply at render time.
 *
 * Keeping these pure (no DOM, no React) lets the `MotionWrapper` stay a thin
 * client shell and lets the timing math be unit-tested in isolation. The
 * timing values still originate from `motion` tokens via the `MotionConfig`
 * the Animation_System produces (Requirement 20.1).
 *
 * @see Requirements 20.1, 20.7
 */

import type { MotionConfig } from "@/types";

/**
 * The CSS properties a reveal transition animates by default. Kept as a
 * named constant so the wrapper and the transition string stay in lock-step.
 */
export const DEFAULT_TRANSITION_PROPERTIES = ["opacity", "transform"] as const;

/**
 * Builds a CSS `transition` shorthand string from a {@link MotionConfig}.
 *
 * Each listed property animates for `config.durationMs` using `config.easing`
 * — both sourced from `motion` tokens. With no properties, returns `"none"`
 * so reduced-motion call sites can express "no transition" through the same
 * helper.
 *
 * @param config - The token-derived motion configuration.
 * @param properties - CSS properties to animate (defaults to opacity + transform).
 * @returns A `transition` value, e.g. `"opacity 300ms cubic-bezier(...) , transform 300ms cubic-bezier(...)"`.
 */
export function toCssTransition(
  config: MotionConfig,
  properties: readonly string[] = DEFAULT_TRANSITION_PROPERTIES,
): string {
  if (properties.length === 0) {
    return "none";
  }
  return properties
    .map((prop) => `${prop} ${config.durationMs}ms ${config.easing}`)
    .join(", ");
}
