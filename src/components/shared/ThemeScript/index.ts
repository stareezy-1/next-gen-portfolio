/**
 * ThemeScript barrel.
 *
 * Re-exports the pre-paint theme script component and its body builder so
 * consumers (root layout — task 13.2) and tests can import from a stable path.
 *
 * @see Requirements 4.6
 */

export { ThemeScript, buildThemeScript } from "./ThemeScript";
