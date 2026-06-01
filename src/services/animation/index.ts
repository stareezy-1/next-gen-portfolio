/**
 * Animation_System barrel.
 *
 * Single import surface for the platform's motion layer: the token-derived
 * {@link MotionConfig} factories (`pageTransition`, `heroWordReveal`,
 * `sectionReveal`, `cardHover`, `buttonMicro`), the combined
 * {@link animationSystem} object, and the pure CSS-transition helpers used by
 * the animated wrappers. Reduced-motion gating lives in the `MotionWrapper`
 * client component under `components/shared`.
 *
 * @see Requirements 20.1, 20.2, 20.3, 20.4, 20.5, 20.6, 20.7
 */

export {
  pageTransition,
  heroWordReveal,
  sectionReveal,
  cardHover,
  buttonMicro,
  animationSystem,
  type AnimationSystem,
} from "./config";

export { toCssTransition, DEFAULT_TRANSITION_PROPERTIES } from "./css";
