/**
 * Theme persistence helpers for the Theme_Controller.
 *
 * Normalization (`normalizeMode` / `normalizePalette`) is pure and exhaustively
 * testable; the storage read/write helpers wrap `localStorage` defensively so
 * server-side rendering (no `window`) and unrecognized persisted values never
 * throw and always fall back to the defaults (Requirements 4.2, 4.8).
 *
 * @see Requirements 4.2, 4.3, 4.8, 4.9
 */

import {
  THEME_STORAGE_KEYS,
  DEFAULT_THEME_MODE,
  DEFAULT_THEME_PALETTE,
  THEME_MODES,
  THEME_PALETTES,
} from "@/constants";
import type { ThemeMode, ThemePalette, ThemeState } from "@/types";

/**
 * Normalizes an arbitrary persisted value into a valid {@link ThemeMode},
 * falling back to the default when the value is missing or unrecognized
 * (Requirement 4.2).
 */
export function normalizeMode(value: unknown): ThemeMode {
  return THEME_MODES.includes(value as ThemeMode)
    ? (value as ThemeMode)
    : DEFAULT_THEME_MODE;
}

/**
 * Normalizes an arbitrary persisted value into a valid {@link ThemePalette},
 * falling back to the default when the value is missing or unrecognized
 * (Requirement 4.8).
 */
export function normalizePalette(value: unknown): ThemePalette {
  return THEME_PALETTES.includes(value as ThemePalette)
    ? (value as ThemePalette)
    : DEFAULT_THEME_PALETTE;
}

/**
 * Returns the `localStorage` instance when available, otherwise `null`.
 * Guards against server-side rendering and environments where storage access
 * throws (e.g. privacy modes).
 */
function getStorage(): Storage | null {
  try {
    if (typeof window === "undefined" || !window.localStorage) {
      return null;
    }
    return window.localStorage;
  } catch {
    return null;
  }
}

/**
 * Reads the persisted Theme_Mode, normalizing unknown/missing values to the
 * default (Requirements 4.2, 4.3).
 */
export function readMode(): ThemeMode {
  const storage = getStorage();
  if (!storage) return DEFAULT_THEME_MODE;
  try {
    return normalizeMode(storage.getItem(THEME_STORAGE_KEYS.mode));
  } catch {
    return DEFAULT_THEME_MODE;
  }
}

/**
 * Reads the persisted Theme_Palette, normalizing unknown/missing values to the
 * default (Requirements 4.8, 4.9).
 */
export function readPalette(): ThemePalette {
  const storage = getStorage();
  if (!storage) return DEFAULT_THEME_PALETTE;
  try {
    return normalizePalette(storage.getItem(THEME_STORAGE_KEYS.palette));
  } catch {
    return DEFAULT_THEME_PALETTE;
  }
}

/**
 * Reads the full persisted {@link ThemeState} (mode + palette), each
 * normalized to a valid value or its default.
 */
export function readThemeState(): ThemeState {
  return { mode: readMode(), palette: readPalette() };
}

/**
 * Persists the selected Theme_Mode across sessions (Requirement 4.3).
 * No-ops when storage is unavailable.
 */
export function writeMode(mode: ThemeMode): void {
  const storage = getStorage();
  if (!storage) return;
  try {
    storage.setItem(THEME_STORAGE_KEYS.mode, mode);
  } catch {
    /* best-effort: persistence failure must never break theme application */
  }
}

/**
 * Persists the selected Theme_Palette across sessions (Requirement 4.9).
 * No-ops when storage is unavailable.
 */
export function writePalette(palette: ThemePalette): void {
  const storage = getStorage();
  if (!storage) return;
  try {
    storage.setItem(THEME_STORAGE_KEYS.palette, palette);
  } catch {
    /* best-effort: persistence failure must never break theme application */
  }
}
