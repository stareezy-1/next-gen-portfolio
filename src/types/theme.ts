/**
 * Theme data models for the Theme_Controller.
 *
 * @see Requirements 4.1, 4.7, 4.10
 */

/** User-selectable theme mode. Default `dark`. */
export type ThemeMode = "dark" | "light" | "system";

/** Token-defined color palette. Default `aurora`. */
export type ThemePalette = "aurora" | "dark" | "light" | "steins-gate";

/** Concrete mode after resolving `system` against the OS preference. */
export type ResolvedMode = "dark" | "light";

/** Persisted theme selection. */
export interface ThemeState {
  /** Persisted; default `dark`. */
  mode: ThemeMode;
  /** Persisted; default `aurora`. */
  palette: ThemePalette;
}
