"use client";

/**
 * ThemeProvider — the client theming island.
 *
 * A `'use client'` React context provider that owns the live Theme_Mode /
 * Theme_Palette selection and the resolved mode, keeping React state in sync
 * with the DOM data-attributes written by the pre-paint script (task 3.3) and
 * the Theme_Controller (`services/theme`).
 *
 * Responsibilities:
 *  - On mount, reconcile React state with the persisted selection and re-apply
 *    it to the document so the provider agrees with the pre-paint script
 *    (Requirements 4.2, 4.8).
 *  - While the mode is `system`, listen to `matchMedia('(prefers-color-scheme:
 *    dark)')` and re-resolve + re-apply the theme whenever the OS preference
 *    changes (Requirements 4.4, 4.5).
 *  - Expose `useTheme()` (current `{ mode, palette, resolved }`) and
 *    `useThemeControl()` (`{ setMode, setPalette }` that persist + apply +
 *    update context).
 *
 * The visual theming itself flows through CSS variables selected by the
 * `data-theme` / `data-palette` attributes, so this provider performs no
 * theme-dependent rendering of its own — it only mirrors and drives the
 * controller, which avoids hydration mismatches.
 *
 * @see Requirements 4.4, 4.5, 4.6, 23.5
 */

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import {
  DEFAULT_THEME_MODE,
  DEFAULT_THEME_PALETTE,
  THEME_DATA_ATTRIBUTES,
} from "@/constants";
import type { ThemeMode, ThemePalette, ResolvedMode } from "@/types";
import {
  resolveMode,
  osPrefersDark,
  applyToDom,
  setMode as persistMode,
  setPalette as persistPalette,
  readThemeState,
} from "@/services/theme";

/** Media query used to resolve `system` mode against the OS preference. */
const COLOR_SCHEME_QUERY = "(prefers-color-scheme: dark)";

/** The current resolved theme selection exposed by {@link useTheme}. */
export interface ThemeContextValue {
  /** Raw selected Theme_Mode (`dark` | `light` | `system`). */
  mode: ThemeMode;
  /** Active Theme_Palette. */
  palette: ThemePalette;
  /** Concrete mode after resolving `system` against the OS preference. */
  resolved: ResolvedMode;
}

/** The theme mutators exposed by {@link useThemeControl}. */
export interface ThemeControlValue {
  /** Persists + applies the mode and updates context (Requirements 4.3, 4.4). */
  setMode: (mode: ThemeMode) => void;
  /** Persists + applies the palette and updates context (Requirement 4.9). */
  setPalette: (palette: ThemePalette) => void;
}

const ThemeStateContext = createContext<ThemeContextValue | null>(null);
const ThemeControlContext = createContext<ThemeControlValue | null>(null);

/**
 * The deterministic initial state used for the server render and the first
 * client render. It mirrors the Theme_Controller defaults so SSR output is
 * stable; the real persisted selection is reconciled on mount. The resolved
 * mode is derived from the default mode (Requirement 4.2 → `dark`).
 */
function getInitialState(): ThemeContextValue {
  return {
    mode: DEFAULT_THEME_MODE,
    palette: DEFAULT_THEME_PALETTE,
    resolved: resolveMode(DEFAULT_THEME_MODE, false),
  };
}

/**
 * Wraps the application tree, providing the theme state and control contexts.
 *
 * @param children - The subtree that consumes the theme hooks.
 */
export function ThemeProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<ThemeContextValue>(getInitialState);

  // Refs mirror the latest state so the long-lived matchMedia listener reads
  // current values without being re-attached on every selection change.
  const modeRef = useRef(state.mode);
  const paletteRef = useRef(state.palette);
  modeRef.current = state.mode;
  paletteRef.current = state.palette;

  // Reconcile with the persisted selection on mount (Requirements 4.2, 4.8).
  // The pre-paint script already set the DOM attributes; this aligns React
  // state with that selection and re-applies defensively.
  useEffect(() => {
    const { mode, palette } = readThemeState();
    const resolved = resolveMode(mode, osPrefersDark());
    setState({ mode, palette, resolved });
    applyToDom(mode, palette, resolved);
  }, []);

  // While in System mode, follow OS color-scheme changes (Requirements 4.4, 4.5).
  useEffect(() => {
    if (
      typeof window === "undefined" ||
      typeof window.matchMedia !== "function"
    ) {
      return;
    }
    const mql = window.matchMedia(COLOR_SCHEME_QUERY);

    const handleChange = (event: MediaQueryListEvent) => {
      // Only react while the selected mode is System.
      if (modeRef.current !== "system") return;
      const resolved: ResolvedMode = event.matches ? "dark" : "light";
      setState((prev) => ({ ...prev, resolved }));
      applyToDom("system", paletteRef.current, resolved);
    };

    mql.addEventListener("change", handleChange);
    return () => mql.removeEventListener("change", handleChange);
  }, []);

  const setMode = useCallback((mode: ThemeMode) => {
    // Persist + apply to the DOM via the controller, then mirror into context.
    persistMode(mode);
    setState((prev) => ({
      ...prev,
      mode,
      resolved: resolveMode(mode, osPrefersDark()),
    }));
  }, []);

  const setPalette = useCallback((palette: ThemePalette) => {
    persistPalette(palette);
    setState((prev) => ({ ...prev, palette }));
  }, []);

  const control = useMemo<ThemeControlValue>(
    () => ({ setMode, setPalette }),
    [setMode, setPalette],
  );

  return (
    <ThemeStateContext.Provider value={state}>
      <ThemeControlContext.Provider value={control}>
        {children}
      </ThemeControlContext.Provider>
    </ThemeStateContext.Provider>
  );
}

/**
 * Returns the current theme selection: `{ mode, palette, resolved }`.
 *
 * @throws If called outside a {@link ThemeProvider}.
 */
export function useTheme(): ThemeContextValue {
  const value = useContext(ThemeStateContext);
  if (value === null) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return value;
}

/**
 * Returns the theme mutators `{ setMode, setPalette }`, each of which persists
 * the selection, applies it to the document, and updates the theme context.
 *
 * @throws If called outside a {@link ThemeProvider}.
 */
export function useThemeControl(): ThemeControlValue {
  const value = useContext(ThemeControlContext);
  if (value === null) {
    throw new Error("useThemeControl must be used within a ThemeProvider");
  }
  return value;
}

/** The data-attribute names this provider keeps in sync, re-exported for tests/wiring. */
export const THEME_ATTRIBUTES = THEME_DATA_ATTRIBUTES;
