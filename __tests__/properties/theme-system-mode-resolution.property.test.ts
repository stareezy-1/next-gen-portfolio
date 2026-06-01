// Feature: next-gen-portfolio-platform, Property 3: System mode resolves to the OS color-scheme preference
//
// Validates: Requirements 4.4, 4.5
//
// For any OS color-scheme preference (dark or light):
//  - WHILE the Theme_Mode is System, the resolved mode equals that preference
//    (Req 4.4), and when the preference changes the resolved mode updates to
//    match (Req 4.5).
//  - For Dark or Light mode, the resolved mode equals the selected mode
//    regardless of the OS preference.
import { describe, expect, it } from "vitest";
import * as fc from "fast-check";
import { resolveMode } from "@/services/theme";
import { THEME_MODES } from "@/constants";

describe("Property 3: System mode resolves to the OS color-scheme preference", () => {
  it("resolves System to the OS preference, leaves Dark/Light unchanged, and updates when the preference flips", () => {
    fc.assert(
      fc.property(
        fc.constantFrom(...THEME_MODES),
        fc.boolean(),
        (mode, osPrefersDark) => {
          const resolved = resolveMode(mode, osPrefersDark);

          if (mode === "system") {
            // Req 4.4: System resolves to the OS color-scheme preference.
            expect(resolved).toBe(osPrefersDark ? "dark" : "light");

            // Req 4.5: when the OS preference changes, the resolved mode
            // updates to match. Resolving with the flipped preference must
            // differ from resolving with the original preference.
            const flipped = resolveMode(mode, !osPrefersDark);
            expect(flipped).toBe(!osPrefersDark ? "dark" : "light");
            expect(flipped).not.toBe(resolved);
          } else {
            // Dark or Light: the resolved mode equals the selected mode
            // regardless of the OS preference.
            expect(resolved).toBe(mode);
            expect(resolveMode(mode, !osPrefersDark)).toBe(mode);
          }
        },
      ),
      { numRuns: 100 },
    );
  });
});
