/**
 * Hooks barrel.
 *
 * Single import surface for the platform's client hooks. The theme hooks live
 * with the {@link ThemeProvider} (so they share the context module) and are
 * re-exported here; `useReducedMotion` is standalone.
 *
 * @see Requirements 4.4, 4.5, 23.5
 */

export {
  useTheme,
  useThemeControl,
  type ThemeContextValue,
  type ThemeControlValue,
} from "@/providers/ThemeProvider";

export { useReducedMotion } from "./useReducedMotion";
export { useScrollReveal } from "./useScrollReveal";
export type {
  UseScrollRevealOptions,
  UseScrollRevealReturn,
} from "./useScrollReveal";
