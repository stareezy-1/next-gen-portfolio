// Feature: next-gen-portfolio-platform, Property 5: Palette colors originate from the token system
//
// For any Theme_Palette and resolved mode, every color value applied by the
// Theme_Controller is drawn from a Token_System source (themes, auroraVariants,
// steinsGateVariants) accessed via .value, and is not a hardcoded literal.
//
// Validates: Requirements 4.11
import { describe, it, expect } from "vitest";
import * as fc from "fast-check";
import {
  themes,
  auroraVariants,
  steinsGateVariants,
  type Token,
} from "@stareezy-ui/tokens";
import { resolveVariant } from "@/services/theme";
import { THEME_PALETTES } from "@/constants";
import type { ResolvedMode } from "@/types";

/**
 * A value is a Token_System token when it carries the `__token: true`
 * discriminant produced by the token() factory, a stable non-empty string id,
 * and a resolved `value`.
 */
function isToken(v: unknown): v is Token<unknown> {
  return (
    typeof v === "object" &&
    v !== null &&
    (v as { __token?: unknown }).__token === true &&
    typeof (v as { id?: unknown }).id === "string" &&
    "value" in (v as object)
  );
}

/**
 * Recursively walks an arbitrary Token_System source, collecting the `id` of
 * every token object reachable through nested groups. This builds the set of
 * ids that legitimately originate from the token() factory.
 */
function collectTokenIds(source: unknown, into: Set<string>): void {
  if (isToken(source)) {
    into.add(source.id);
    return;
  }
  if (typeof source === "object" && source !== null) {
    for (const value of Object.values(source)) {
      collectTokenIds(value, into);
    }
  }
}

// Build the universe of known token ids from every Token_System palette source.
const KNOWN_TOKEN_IDS: Set<string> = (() => {
  const ids = new Set<string>();
  // `themes` nests semantic groups (border/backgrounds/text) across all
  // built-in themes (light/dark/aurora/steins-gate) — walk it recursively.
  collectTokenIds(themes, ids);
  // Aurora + Steins;Gate dark/light variants.
  collectTokenIds(auroraVariants.dark, ids);
  collectTokenIds(auroraVariants.light, ids);
  collectTokenIds(steinsGateVariants.dark, ids);
  collectTokenIds(steinsGateVariants.light, ids);
  return ids;
})();

describe("Property 5: Palette colors originate from the token system", () => {
  it("every applied color is a token object whose id is sourced from the Token_System", () => {
    // Sanity: the known-id universe is non-empty, otherwise the membership
    // assertion below would be vacuous.
    expect(KNOWN_TOKEN_IDS.size).toBeGreaterThan(0);

    fc.assert(
      fc.property(
        fc.constantFrom(...THEME_PALETTES),
        fc.constantFrom<ResolvedMode>("dark", "light"),
        (palette, resolved) => {
          const variant = resolveVariant(palette, resolved);

          const entries = Object.entries(variant);
          // A resolved variant always applies at least one color.
          expect(entries.length).toBeGreaterThan(0);

          for (const [key, value] of entries) {
            // 1. Each value is a token object — not a hardcoded literal. This
            //    proves it came from the token() factory: it has the
            //    `__token` discriminant, a non-empty string id, and a value.
            expect(isToken(value), `${key} must be a token object`).toBe(true);
            expect(value.__token).toBe(true);
            expect(typeof value.id).toBe("string");
            expect(value.id.length).toBeGreaterThan(0);
            expect("value" in value).toBe(true);

            // 2. The token's id is a member of the Token_System universe — the
            //    applied color originates from `themes` / `auroraVariants` /
            //    `steinsGateVariants`, not an ad-hoc literal minted elsewhere.
            expect(
              KNOWN_TOKEN_IDS.has(value.id),
              `${key} → "${value.id}" must originate from a Token_System source`,
            ).toBe(true);

            // 3. token() returns a frozen object — a further signal the value
            //    came from the factory rather than a mutable inline literal.
            expect(Object.isFrozen(value)).toBe(true);
          }

          return true;
        },
      ),
      { numRuns: 100 },
    );
  });
});
