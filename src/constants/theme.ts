/**
 * Theme_Controller constants.
 *
 * Stable named constants for theme persistence, defaults, the enumerated
 * value sets, and the DOM data-attribute names the theming layer writes
 * (Requirements 4.1, 4.2, 4.7, 4.8). Defined here so the same literals are
 * never inlined at use sites (Requirements 26.4, 26.5).
 *
 * The data-attribute table is the single source the Theme_Controller and the
 * pre-paint script (task 3.3) both read, so server and client agree on the
 * attributes written to `<html>` before first paint.
 */

import type { ThemeMode, ThemePalette } from "@/types";

/**
 * `localStorage` keys under which the active mode and palette are persisted
 * across sessions (Requirements 4.3, 4.9).
 */
export const THEME_STORAGE_KEYS = {
  /** Persisted Theme_Mode key. */
  mode: "ngp-theme-mode",
  /** Persisted Theme_Palette key. */
  palette: "ngp-theme-palette",
} as const;

/** Default Theme_Mode applied when no valid value is persisted (Requirement 4.2). */
export const DEFAULT_THEME_MODE: ThemeMode = "dark";

/** Default Theme_Palette applied when no valid value is persisted (Requirement 4.8). */
export const DEFAULT_THEME_PALETTE: ThemePalette = "aurora";

/** The three supported Theme_Mode values (Requirement 4.1). */
export const THEME_MODES: readonly ThemeMode[] = [
  "dark",
  "light",
  "system",
] as const;

/** The four supported Theme_Palette values (Requirement 4.7). */
export const THEME_PALETTES: readonly ThemePalette[] = [
  "aurora",
  "dark",
  "light",
  "steins-gate",
] as const;

/**
 * DOM data-attribute names written to the document element. The CSS-variable
 * generator (task 3.1) selects palette variants via
 * `:root[data-palette][data-theme]`, so flipping these attributes switches the
 * applied palette with zero re-render (Requirements 4.6, 4.10).
 *
 * - `palette` carries the active Theme_Palette.
 * - `theme` carries the resolved mode (`dark` | `light`) used by the CSS selector.
 * - `mode` carries the raw Theme_Mode (`dark` | `light` | `system`) so the
 *   System-mode `matchMedia` listener (task 3.3) knows when to react.
 */
export const THEME_DATA_ATTRIBUTES = {
  /** Active palette attribute. */
  palette: "data-palette",
  /** Resolved-mode attribute consumed by the CSS variable selector. */
  theme: "data-theme",
  /** Raw selected mode attribute. */
  mode: "data-mode",
} as const;
