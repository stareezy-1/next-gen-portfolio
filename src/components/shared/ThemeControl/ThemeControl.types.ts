/**
 * Types for the ThemeControl component.
 *
 * @see Requirements 6.4, 4.1, 4.3
 */

import type { ThemeMode } from "@/types";

/** Props for the ThemeControl component. */
export interface ThemeControlProps {
  /** Additional CSS class names. */
  className?: string;
}

/** Ordered cycle of theme modes for the toggle button. */
export const THEME_MODE_CYCLE: readonly ThemeMode[] = [
  "dark",
  "light",
  "system",
] as const;

/** Human-readable labels for each theme mode. */
export const THEME_MODE_LABELS: Record<ThemeMode, string> = {
  dark: "Dark",
  light: "Light",
  system: "System",
} as const;

/** Accessible icon labels for each theme mode. */
export const THEME_MODE_ICONS: Record<ThemeMode, string> = {
  dark: "🌙",
  light: "☀️",
  system: "💻",
} as const;
