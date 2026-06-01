/**
 * Theme_Controller barrel.
 *
 * RSC-compatible theming layer that resolves and applies the active mode and
 * palette by reading Token_System values only (never the token package's
 * React-18 ThemeProvider). The client ThemeProvider (task 3.3) builds on these
 * pure functions and side-effecting wrappers.
 *
 * @see Requirements 4.1, 4.2, 4.3, 4.7, 4.8, 4.9, 4.10, 4.11
 */

// Pure resolution logic
export { resolveMode, resolveVariant, type ThemeVariant } from "./resolve";

// Build-time CSS custom-property generator (task 3.1)
export {
  generatePaletteCss,
  colorVarName,
  paletteSelector,
  COLOR_CSS_VAR_PREFIX,
} from "./css-generator";

// Persistence + normalization helpers
export {
  normalizeMode,
  normalizePalette,
  readMode,
  readPalette,
  readThemeState,
  writeMode,
  writePalette,
} from "./persistence";

// DOM-applying controller wrappers
export {
  osPrefersDark,
  applyToDom,
  setMode,
  setPalette,
  applyPersistedTheme,
} from "./controller";
