/**
 * Theme_Controller — applies the resolved mode + palette to the document and
 * persists selections across sessions.
 *
 * This module holds the thin DOM/`localStorage` side-effecting wrappers. The
 * pure resolution logic (`resolveMode` / `resolveVariant`) lives in
 * `resolve.ts` and the persistence/normalization helpers in `persistence.ts`,
 * so the testable core stays free of side effects.
 *
 * @see Requirements 4.1, 4.2, 4.3, 4.6, 4.7, 4.8, 4.9, 4.10
 */

import { THEME_DATA_ATTRIBUTES } from "@/constants";
import type { ThemeMode, ThemePalette, ResolvedMode } from "@/types";
import { resolveMode } from "./resolve";
import { readMode, readPalette, writeMode, writePalette } from "./persistence";

/**
 * Reads the operating-system dark-scheme preference via `matchMedia`.
 * Returns `false` when `matchMedia` is unavailable (e.g. SSR).
 *
 * @see Requirement 4.4
 */
export function osPrefersDark(): boolean {
  try {
    if (
      typeof window === "undefined" ||
      typeof window.matchMedia !== "function"
    ) {
      return false;
    }
    return window.matchMedia("(prefers-color-scheme: dark)").matches;
  } catch {
    return false;
  }
}

/**
 * Writes the resolved data-attributes to the document element so the CSS
 * variable layer (task 3.1) can select the active palette variant with zero
 * re-render and no flash (Requirements 4.6, 4.10).
 *
 * - `data-palette` ← active palette
 * - `data-theme`   ← resolved mode (drives the `:root[data-theme]` selector)
 * - `data-mode`    ← raw selected mode (so the System-mode listener can react)
 *
 * No-ops when there is no `document` (SSR); the pre-paint script (task 3.3)
 * applies attributes before hydration on the server response.
 */
export function applyToDom(
  mode: ThemeMode,
  palette: ThemePalette,
  resolved: ResolvedMode,
): void {
  if (typeof document === "undefined" || !document.documentElement) return;
  const root = document.documentElement;
  root.setAttribute(THEME_DATA_ATTRIBUTES.palette, palette);
  root.setAttribute(THEME_DATA_ATTRIBUTES.theme, resolved);
  root.setAttribute(THEME_DATA_ATTRIBUTES.mode, mode);
}

/**
 * Persists and applies the selected Theme_Mode (Requirement 4.3). The applied
 * theme is resolved against the current OS preference so `system` reflects the
 * environment immediately (Requirement 4.4). The active palette is preserved.
 */
export function setMode(mode: ThemeMode): void {
  writeMode(mode);
  const palette = readPalette();
  applyToDom(mode, palette, resolveMode(mode, osPrefersDark()));
}

/**
 * Persists and applies the selected Theme_Palette (Requirement 4.9). The
 * current mode is preserved and re-resolved against the OS preference.
 */
export function setPalette(palette: ThemePalette): void {
  writePalette(palette);
  const mode = readMode();
  applyToDom(mode, palette, resolveMode(mode, osPrefersDark()));
}

/**
 * Reads the persisted selection (or defaults) and applies it to the document.
 * Intended to run on initial client mount to reconcile with the pre-paint
 * script (Requirements 4.2, 4.8).
 */
export function applyPersistedTheme(): void {
  const mode = readMode();
  const palette = readPalette();
  applyToDom(mode, palette, resolveMode(mode, osPrefersDark()));
}
