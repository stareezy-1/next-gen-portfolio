/**
 * ThemeScript — the pre-paint, blocking `<head>` theme script.
 *
 * This is a React **Server Component** (no `'use client'`). It renders a single
 * `<script>` tag whose body is a self-contained string of JavaScript that runs
 * synchronously before first paint. The script reads the persisted Theme_Mode
 * and Theme_Palette from `localStorage`, falls back to the defaults on
 * missing/unknown values, resolves `system` mode against
 * `prefers-color-scheme`, and writes `data-theme` / `data-palette` /
 * `data-mode` onto `document.documentElement`. Setting the attributes before
 * paint lets the CSS-variable layer (task 3.1) select the active palette
 * variant with no theme flash (Requirements 4.6).
 *
 * CRITICAL (Requirement 4.6 — server/client agreement): the script does not
 * hardcode separate literals. It derives its storage keys, attribute names,
 * defaults, and the valid value sets from the SAME constant table the
 * Theme_Controller and client ThemeProvider use (`THEME_STORAGE_KEYS`,
 * `THEME_DATA_ATTRIBUTES`, `DEFAULT_THEME_MODE`, `DEFAULT_THEME_PALETTE`,
 * `THEME_MODES`, `THEME_PALETTES`). Because the inline body must be a
 * self-contained string, the constant *values* are interpolated into the
 * script at render time via `JSON.stringify`, guaranteeing the server-rendered
 * script and the client controller agree on every key, attribute, and default.
 *
 * @see Requirements 4.4, 4.5, 4.6, 23.5
 */

import {
  THEME_STORAGE_KEYS,
  DEFAULT_THEME_MODE,
  DEFAULT_THEME_PALETTE,
  THEME_MODES,
  THEME_PALETTES,
  THEME_DATA_ATTRIBUTES,
} from "@/constants";

/**
 * The `prefers-color-scheme` media query used to resolve `system` mode. This
 * mirrors the query the Theme_Controller's `osPrefersDark()` reads, so the
 * pre-paint resolution matches the runtime resolution exactly (Requirement 4.4).
 */
const COLOR_SCHEME_QUERY = "(prefers-color-scheme: dark)";

/**
 * Builds the inline pre-paint theme script body as a self-contained IIFE.
 *
 * All configuration (keys, attributes, defaults, valid value sets) is embedded
 * by interpolating the imported constants via `JSON.stringify`, so this script
 * stays in lock-step with the constant table (Requirement 4.6). The resolution
 * branch (`system` → OS preference, otherwise the selected mode) mirrors
 * `resolveMode` in `services/theme/resolve.ts` (Requirements 4.4, 4.5).
 *
 * The whole body is wrapped in `try/catch` and every storage/`matchMedia`
 * access is individually guarded so a privacy-mode `localStorage` throw or a
 * missing `matchMedia` can never prevent the page from painting.
 *
 * @returns The JavaScript source to inline in a blocking `<script>`.
 */
export function buildThemeScript(): string {
  const config = {
    modeKey: THEME_STORAGE_KEYS.mode,
    paletteKey: THEME_STORAGE_KEYS.palette,
    modes: [...THEME_MODES],
    palettes: [...THEME_PALETTES],
    defaultMode: DEFAULT_THEME_MODE,
    defaultPalette: DEFAULT_THEME_PALETTE,
    attrTheme: THEME_DATA_ATTRIBUTES.theme,
    attrPalette: THEME_DATA_ATTRIBUTES.palette,
    attrMode: THEME_DATA_ATTRIBUTES.mode,
    query: COLOR_SCHEME_QUERY,
  };

  const script = `
(function () {
  try {
    var c = ${JSON.stringify(config)};
    var root = document.documentElement;
    var ls = null;
    try { ls = window.localStorage; } catch (e) { ls = null; }
    var rawMode = null;
    var rawPalette = null;
    if (ls) {
      try { rawMode = ls.getItem(c.modeKey); } catch (e) {}
      try { rawPalette = ls.getItem(c.paletteKey); } catch (e) {}
    }
    var mode = c.modes.indexOf(rawMode) !== -1 ? rawMode : c.defaultMode;
    var palette = c.palettes.indexOf(rawPalette) !== -1 ? rawPalette : c.defaultPalette;
    var prefersDark = false;
    try {
      prefersDark = window.matchMedia(c.query).matches;
    } catch (e) {}
    var resolved = mode === "system" ? (prefersDark ? "dark" : "light") : mode;
    root.setAttribute(c.attrPalette, palette);
    root.setAttribute(c.attrTheme, resolved);
    root.setAttribute(c.attrMode, mode);
  } catch (e) {}
})();
`.trim();

  // Defensively neutralize any `<` so the inlined body can never terminate the
  // surrounding <script> element early. None of the embedded constant values
  // contain `<` today, but this keeps the injection safe if they ever change.
  return script.replace(/</g, "\\u003c");
}

/**
 * Renders the pre-paint theme script. Place this in the document `<head>`
 * (root layout wiring is task 13.2) so it executes before the first paint of
 * any styled content.
 *
 * Server Component: the script tag is emitted in the server response and is
 * never hydrated as an interactive client component.
 */
export function ThemeScript() {
  return (
    // suppressHydrationWarning is required in React 19 to silence the
    // "script tag while rendering" dev warning for intentional inline scripts.
    // This is a Server Component — the script runs before first paint and is
    // never re-executed on the client (Requirement 4.6).
    // eslint-disable-next-line react/no-danger
    <script
      suppressHydrationWarning
      // biome-ignore lint: intentional inline pre-paint script
      dangerouslySetInnerHTML={{ __html: buildThemeScript() }}
    />
  );
}
