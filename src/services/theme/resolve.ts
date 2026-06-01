/**
 * Pure theme-resolution logic for the Theme_Controller.
 *
 * These functions are free of DOM and `localStorage` side effects so they can
 * be exhaustively property-tested (tasks 3.5–3.7). The thin DOM/persistence
 * wrappers live in `persistence.ts` and `controller.ts`.
 *
 * @see Requirements 4.4, 4.10, 4.11
 */

import {
  themes,
  auroraVariants,
  steinsGateVariants,
  getVariant,
  type Token,
} from "@stareezy-ui/tokens";
import type { ThemeMode, ThemePalette, ResolvedMode } from "@/types";

/**
 * The uniform shape `resolveVariant` returns for every palette: a flat record
 * of token objects keyed by stable, descriptive names. Every value is a
 * `Token<string>` carrying its color via `.value` (Requirement 4.11) — never a
 * hardcoded literal.
 */
export type ThemeVariant = Record<string, Token<string>>;

/**
 * Resolves a {@link ThemeMode} to a concrete {@link ResolvedMode}.
 *
 * When the mode is `system`, the resolved mode follows the operating-system
 * color-scheme preference (Requirements 4.4, 4.5). For `dark` or `light`, the
 * mode is returned unchanged regardless of the OS preference.
 *
 * @param mode - The selected Theme_Mode.
 * @param osPrefersDark - Whether the OS prefers a dark color scheme.
 */
export function resolveMode(
  mode: ThemeMode,
  osPrefersDark: boolean,
): ResolvedMode {
  if (mode === "system") {
    return osPrefersDark ? "dark" : "light";
  }
  return mode;
}

/**
 * Converts a camelCase token key to a stable kebab-case segment.
 * e.g. `primaryBrand` → `primary-brand`, `dangerPrimary` → `danger-primary`.
 */
function toKebab(key: string): string {
  return key.replace(/([A-Z])/g, "-$1").toLowerCase();
}

/**
 * Maps a `themes` semantic group name to its data-attribute prefix.
 * The `backgrounds` group is singularized to `background` for readable keys
 * (e.g. `background-primary`).
 */
const GROUP_PREFIX: Record<string, string> = {
  border: "border",
  backgrounds: "background",
  text: "text",
};

/**
 * Flattens a nested `themes` entry (semantic groups `border` / `backgrounds`
 * / `text`, each a record of leaf `Token<string>`) into a flat
 * {@link ThemeVariant} with stable, descriptive keys such as `text-primary`,
 * `background-primary`, and `border-default`.
 *
 * The returned values are the original token objects (by reference), so every
 * color is sourced from the Token_System and read via `.value` downstream
 * (Requirement 4.11).
 */
function flattenSemanticTheme(
  theme: Record<string, Record<string, Token<string>>>,
): ThemeVariant {
  const flat: ThemeVariant = {};
  for (const [group, tokens] of Object.entries(theme)) {
    const prefix = GROUP_PREFIX[group] ?? group;
    for (const [key, value] of Object.entries(tokens)) {
      flat[`${prefix}-${toKebab(key)}`] = value;
    }
  }
  return flat;
}

/**
 * Selects the concrete token variant for the active palette and resolved mode
 * (Requirement 4.10). Every value is drawn from the Token_System sources
 * (`themes`, `auroraVariants`, `steinsGateVariants`) and never hardcoded
 * (Requirement 4.11).
 *
 * Mapping:
 *  - `aurora` → `getVariant(auroraVariants, resolved)`
 *  - `steins-gate` → `getVariant(steinsGateVariants, resolved)`
 *  - `dark` / `light` (the neutral palettes) → the flattened `themes.dark`
 *    when resolved is `dark`, or `themes.light` when resolved is `light`.
 *
 * Note on neutral palettes: `themes` provides flat semantic theme definitions
 * (`themes.dark`, `themes.light`) rather than dark/light `TokenVariant` pairs.
 * To honor Requirement 4.10 uniformly — dark mode applies the dark variant,
 * light mode applies the light variant — the neutral palette's applied variant
 * follows the resolved mode: both neutral palette names select `themes.dark`
 * under a dark resolved mode and `themes.light` under a light resolved mode.
 *
 * @param palette - The active Theme_Palette.
 * @param resolved - The resolved mode (`dark` | `light`).
 */
export function resolveVariant(
  palette: ThemePalette,
  resolved: ResolvedMode,
): ThemeVariant {
  switch (palette) {
    case "aurora":
      return getVariant(auroraVariants, resolved);
    case "steins-gate":
      return getVariant(steinsGateVariants, resolved);
    case "dark":
    case "light":
      // Neutral palettes: the resolved mode selects the themes entry so the
      // applied variant follows the resolved mode (Requirement 4.10).
      return flattenSemanticTheme(
        resolved === "dark" ? themes.dark : themes.light,
      );
  }
}
