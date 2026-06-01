// Feature: next-gen-portfolio-platform, Property 2: Theme and palette selections round-trip through persistence
//
// Validates: Requirements 4.3, 4.9
//
// Property 2: Theme and palette selections round-trip through persistence.
// For any Theme_Mode value and any Theme_Palette value, persisting the
// selection and then re-reading it (as on a new session load) yields the same
// mode and palette.
//
// The persistence layer under test:
//   - writeMode / writePalette persist to localStorage
//   - readMode / readPalette / readThemeState read + normalize, falling back to
//     the defaults ("dark" / "aurora") only on unknown/missing values.
// Because every (mode, palette) pair generated here is a valid enumerated
// value, normalization is the identity and the round-trip must be exact.
//
// Tooling: Vitest + fast-check, jsdom-provided localStorage, numRuns = 100.
import { beforeEach, describe, expect, it } from "vitest";
import * as fc from "fast-check";
import {
  writeMode,
  writePalette,
  readMode,
  readPalette,
  readThemeState,
} from "@/services/theme";
import { THEME_MODES, THEME_PALETTES } from "@/constants";

describe("Property 2: theme/palette persistence round-trip", () => {
  beforeEach(() => {
    // Start each test from a clean storage to avoid cross-test contamination.
    window.localStorage.clear();
  });

  it("re-reads the exact mode and palette that were persisted", () => {
    fc.assert(
      fc.property(
        fc.constantFrom(...THEME_MODES),
        fc.constantFrom(...THEME_PALETTES),
        (mode, palette) => {
          // Clear between iterations so each run simulates a fresh session and
          // no prior value can leak in.
          window.localStorage.clear();

          // Persist the selection...
          writeMode(mode);
          writePalette(palette);

          // ...then re-read it as a new session load would.
          expect(readMode()).toBe(mode);
          expect(readPalette()).toBe(palette);

          // readThemeState aggregates both and must agree.
          expect(readThemeState()).toEqual({ mode, palette });
        },
      ),
      { numRuns: 100 },
    );
  });
});
