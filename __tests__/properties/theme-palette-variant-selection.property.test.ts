// Feature: next-gen-portfolio-platform, Property 4: Palette variant matches the resolved mode
//
// For any Theme_Palette and any resolved mode, the applied token variant equals
// getVariant(paletteVariants, resolvedMode): the palette's dark variant when the
// resolved mode is dark, its light variant when the resolved mode is light.
//
// Validates: Requirements 4.10
import { describe, it, expect } from "vitest";
import * as fc from "fast-check";
import {
  auroraVariants,
  steinsGateVariants,
  getVariant,
  themes,
} from "@stareezy-ui/tokens";
import { resolveVariant } from "@/services/theme";
import { THEME_PALETTES } from "@/constants";
import type { ResolvedMode } from "@/types";

describe("Property 4: Palette variant matches the resolved mode", () => {
  it("applies getVariant(paletteVariants, resolvedMode) for every palette and resolved mode", () => {
    fc.assert(
      fc.property(
        fc.constantFrom(...THEME_PALETTES),
        fc.constantFrom<ResolvedMode>("dark", "light"),
        (palette, resolved) => {
          const applied = resolveVariant(palette, resolved);

          switch (palette) {
            case "aurora": {
              // The applied variant is exactly getVariant(auroraVariants, resolved).
              expect(applied).toBe(getVariant(auroraVariants, resolved));

              // The key invariant: dark resolves to the dark variant, light to
              // the light variant — and those are distinct variant objects.
              expect(resolveVariant("aurora", "dark")).toBe(
                getVariant(auroraVariants, "dark"),
              );
              expect(resolveVariant("aurora", "light")).toBe(
                getVariant(auroraVariants, "light"),
              );
              expect(resolveVariant("aurora", "dark")).not.toBe(
                resolveVariant("aurora", "light"),
              );
              break;
            }

            case "steins-gate": {
              // The applied variant is exactly getVariant(steinsGateVariants, resolved).
              expect(applied).toBe(getVariant(steinsGateVariants, resolved));

              expect(resolveVariant("steins-gate", "dark")).toBe(
                getVariant(steinsGateVariants, "dark"),
              );
              expect(resolveVariant("steins-gate", "light")).toBe(
                getVariant(steinsGateVariants, "light"),
              );
              expect(resolveVariant("steins-gate", "dark")).not.toBe(
                resolveVariant("steins-gate", "light"),
              );
              break;
            }

            case "dark":
            case "light": {
              // Neutral palettes follow the resolved mode: dark mode selects the
              // dark themes entry, light mode selects the light themes entry.
              // Compare a representative flattened key's underlying token to the
              // corresponding `themes` source token (by reference).
              const expectedThemesEntry =
                resolved === "dark" ? themes.dark : themes.light;
              expect(applied["text-primary"]).toBe(
                expectedThemesEntry.text.primary,
              );

              // Resolving with dark picks the dark themes token; resolving with
              // light picks the light themes token — and those tokens differ.
              expect(resolveVariant(palette, "dark")["text-primary"]).toBe(
                themes.dark.text.primary,
              );
              expect(resolveVariant(palette, "light")["text-primary"]).toBe(
                themes.light.text.primary,
              );
              expect(themes.dark.text.primary).not.toBe(
                themes.light.text.primary,
              );
              break;
            }
          }

          return true;
        },
      ),
      { numRuns: 100 },
    );
  });
});
