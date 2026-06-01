/**
 * Build step that writes the generated palette stylesheet to disk
 * (Theme_Controller, task 3.1).
 *
 * Run with a TypeScript-aware runner (e.g. `tsx src/services/theme/write-palette-css.ts`)
 * to (re)generate `src/app/theme.generated.css`. The root layout imports that
 * stylesheet so the `:root[data-palette][data-theme]` custom-property blocks
 * ship with the app. Keeping generation in a discrete, idempotent step means
 * the committed CSS is reviewable and free of hardcoded color literals — every
 * value flows from {@link generatePaletteCss} and ultimately `token.value`.
 */

import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";
import { writeFileSync } from "node:fs";
import { generatePaletteCss } from "./css-generator";

/** Output path: `src/app/theme.generated.css`, imported by the root layout. */
export const PALETTE_CSS_OUTPUT_PATH = resolve(
  dirname(fileURLToPath(import.meta.url)),
  "../../app/theme.generated.css",
);

/**
 * Writes the deterministic palette stylesheet to {@link PALETTE_CSS_OUTPUT_PATH}.
 *
 * @returns The absolute path written to.
 */
export function writePaletteCss(): string {
  writeFileSync(PALETTE_CSS_OUTPUT_PATH, generatePaletteCss(), "utf8");
  return PALETTE_CSS_OUTPUT_PATH;
}

// Execute when run directly (not when imported).
if (
  typeof process !== "undefined" &&
  process.argv[1] &&
  fileURLToPath(import.meta.url) === resolve(process.argv[1])
) {
  const written = writePaletteCss();
  // eslint-disable-next-line no-console
  console.log(`Wrote palette CSS → ${written}`);
}
