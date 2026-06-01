// Feature: next-gen-portfolio-platform, Property 35: Animation configurations derive from motion tokens
//
// Validates: Requirements 20.1
//
// Property 35: Animation configurations derive from motion tokens.
// For any animation the Animation_System produces, its duration value is one of
// the `motion.duration` token values and its easing value is one of the
// `motion.easing` token values.
//
// Strategy
// --------
// Build two closed sets from the actual token primitives at test-load time:
//   KNOWN_DURATIONS — the five `motion.duration.*.value` numbers
//   KNOWN_EASINGS   — the four `motion.easing.*.value` strings
//
// An arbitrary picks one of the five factory functions via `fc.constantFrom`.
// For each generated factory the test calls it and asserts membership in both
// sets. Because the factories are pure and deterministic, 100 runs exercise
// every factory multiple times and confirm no factory ever escapes the token
// universe.
//
// Tooling: Vitest + fast-check, numRuns = 100.

import { describe, expect, it } from "vitest";
import * as fc from "fast-check";
import { motion } from "@stareezy-ui/tokens";

import {
  pageTransition,
  heroWordReveal,
  sectionReveal,
  cardHover,
  buttonMicro,
} from "@/services/animation";
import type { MotionConfig } from "@/types";

// ---------------------------------------------------------------------------
// Known-value sets — built from the actual token primitives, never hardcoded.
// ---------------------------------------------------------------------------

const KNOWN_DURATIONS = new Set<number>([
  motion.duration.instant.value,
  motion.duration.fast.value,
  motion.duration.normal.value,
  motion.duration.slow.value,
  motion.duration.enter.value,
]);

const KNOWN_EASINGS = new Set<string>([
  motion.easing.spring.value,
  motion.easing.easeOut.value,
  motion.easing.easeIn.value,
  motion.easing.easeInOut.value,
]);

// ---------------------------------------------------------------------------
// Factory arbitrary — picks one of the five Animation_System factories.
// ---------------------------------------------------------------------------

type AnimationFactory = () => MotionConfig;

const factoryArb: fc.Arbitrary<AnimationFactory> = fc.constantFrom(
  pageTransition,
  heroWordReveal,
  sectionReveal,
  cardHover,
  buttonMicro,
);

// ---------------------------------------------------------------------------
// Property
// ---------------------------------------------------------------------------

describe("Property 35: Animation configurations derive from motion tokens", () => {
  it("every factory's durationMs is a known motion.duration token value and easing is a known motion.easing token value", () => {
    // Sanity: the known sets are non-empty so membership assertions are not vacuous.
    expect(KNOWN_DURATIONS.size).toBe(5);
    expect(KNOWN_EASINGS.size).toBe(4);

    fc.assert(
      fc.property(factoryArb, (factory) => {
        const config = factory();

        // durationMs must be one of the five motion.duration token values.
        expect(
          KNOWN_DURATIONS.has(config.durationMs),
          `durationMs ${config.durationMs} is not a known motion.duration token value`,
        ).toBe(true);

        // easing must be one of the four motion.easing token values.
        expect(
          KNOWN_EASINGS.has(config.easing),
          `easing "${config.easing}" is not a known motion.easing token value`,
        ).toBe(true);
      }),
      { numRuns: 100 },
    );
  });
});
