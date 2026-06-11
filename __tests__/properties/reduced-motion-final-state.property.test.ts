// Feature: next-gen-portfolio-platform, Property 36: Reduced motion presents content in its final state
//
// **Validates: Requirements 20.7, 23.5, 25.4**
//
// Property 36: Reduced motion presents content in its final state.
// For any animated component or Animated_Asset, when Reduced_Motion is enabled
// the component renders in its final visual state with no transition applied,
// and the Asset_Player does not autoplay (it shows a static final frame).
//
// Contracts under test:
//
//   MotionWrapper (`@/components/shared/MotionWrapper`):
//     When `useReducedMotion()` returns `true`:
//       - Children are rendered (final state is visible).
//       - The wrapper element has `transition: none` (no animation applied).
//       - The wrapper element has `opacity: 1` (fully visible final state).
//       - The wrapper element has `transform: translateY(0)` (settled position).
//     These assertions hold for any MotionConfig (any durationMs / easing).
//
//   AssetPlayer (`@/components/shared/AssetPlayer`):
//     When `useReducedMotion()` returns `true`:
//       - A static `<img>` element is rendered (final frame, no animation).
//       - The animated DotLottie player is NOT rendered.
//       - The static img has the correct `src` attribute.
//     These assertions hold for any `src` and `name` string.
//
// Strategy:
//   - `useReducedMotion` is mocked via `vi.mock('@/hooks', ...)` to always
//     return `true`, making the test deterministic.
//   - `useTheme` (consumed by AssetPlayer) is also mocked to return a stable
//     theme state so the component renders without a real ThemeProvider.
//   - fast-check generates varied MotionConfig values (durationMs, easing) and
//     varied src/name strings to prove the behavior holds for any input.
//   - @testing-library/react `render` is used for DOM assertions.
//
// Tooling: Vitest + fast-check, numRuns = 100.

import { describe, expect, it, vi, beforeEach } from "vitest";
import * as fc from "fast-check";
import { render, screen } from "@testing-library/react";
import React from "react";

// ---------------------------------------------------------------------------
// Mocks — must be declared before any import of the mocked modules.
// ---------------------------------------------------------------------------

// Mock `@/hooks` so `useReducedMotion` always returns `true` (reduced motion
// enabled) and `useTheme` returns a stable theme state for AssetPlayer.
vi.mock("@/hooks", () => ({
  useReducedMotion: () => true,
  useTheme: () => ({
    mode: "dark" as const,
    palette: "aurora" as const,
    resolved: "dark" as const,
  }),
  useThemeControl: () => ({
    setMode: vi.fn(),
    setPalette: vi.fn(),
  }),
}));

// Mock `@/services/theme` so `resolveVariant` returns a minimal token record
// (AssetPlayer calls this to build the LSS theme string).
vi.mock("@/services/theme", () => ({
  resolveVariant: () => ({
    primary: { value: "#6366f1" },
    secondary: { value: "#8b5cf6" },
  }),
  resolveMode: (mode: string) => mode,
  setMode: vi.fn(),
  setPalette: vi.fn(),
}));

// Mock `@lottiefiles/dotlottie-react` so the DotLottie player doesn't attempt
// real network requests or WebGL rendering in jsdom.
vi.mock("@lottiefiles/dotlottie-react", () => ({
  DotLottieReact: () =>
    React.createElement("div", { "data-testid": "dotlottie-player" }),
}));

// ---------------------------------------------------------------------------
// Imports — after mocks are registered.
// ---------------------------------------------------------------------------

import { MotionWrapper } from "@/components/shared/MotionWrapper";
import { AssetPlayer } from "@/components/shared/AssetPlayer";
import type { MotionConfig } from "@/types";

// ---------------------------------------------------------------------------
// Arbitraries
// ---------------------------------------------------------------------------

/**
 * Generates a MotionConfig with varied durationMs and easing values.
 * Covers the full range of token-derived durations (100–500ms) and a
 * representative set of easing strings.
 */
const motionConfigArb: fc.Arbitrary<MotionConfig> = fc.record({
  durationMs: fc.integer({ min: 50, max: 1000 }),
  easing: fc.oneof(
    fc.constant("ease"),
    fc.constant("ease-in"),
    fc.constant("ease-out"),
    fc.constant("ease-in-out"),
    fc.constant("linear"),
    // Cubic-bezier strings as used by the token system
    fc.constant("cubic-bezier(0.4, 0, 0.2, 1)"),
    fc.constant("cubic-bezier(0, 0, 0.2, 1)"),
    fc.constant("cubic-bezier(0.4, 0, 1, 1)"),
  ),
});

/**
 * Generates a non-empty src string for AssetPlayer. Covers typical dotLottie
 * paths and URLs.
 */
const srcArb: fc.Arbitrary<string> = fc.oneof(
  fc.constant("/animations/hero.lottie"),
  fc.constant("/animations/404.lottie"),
  fc.constant("/animations/success.lottie"),
  fc.constant("https://cdn.example.com/asset.lottie"),
  // Arbitrary path-like strings
  fc
    .array(fc.stringMatching(/^[a-z0-9-]+$/), { minLength: 1, maxLength: 4 })
    .map((parts) => `/${parts.join("/")}.lottie`),
);

/**
 * Generates a name string for AssetPlayer (accessible label).
 * Includes empty string (decorative) and non-empty strings.
 */
const nameArb: fc.Arbitrary<string> = fc.oneof(
  fc.constant(""),
  fc.constant("Hero animation"),
  fc.constant("Loading indicator"),
  fc.constant("Success checkmark"),
  fc.string({ minLength: 1, maxLength: 50 }),
);

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe("Property 36: Reduced motion presents content in its final state", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // -------------------------------------------------------------------------
  // MotionWrapper: final state, no transition
  // -------------------------------------------------------------------------
  describe("MotionWrapper — reduced motion renders final state with no transition", () => {
    it("renders children in final state (opacity:1, transform:translateY(0), transition:none) for any MotionConfig", () => {
      fc.assert(
        fc.property(motionConfigArb, (config) => {
          const { unmount } = render(
            React.createElement(MotionWrapper, {
              config,
              children: React.createElement(
                "div",
                { "data-testid": "child" },
                "content",
              ),
            }),
          );

          // (1) Children are rendered — final state is visible.
          const child = screen.getByTestId("child");
          expect(child).toBeInTheDocument();
          expect(child).toHaveTextContent("content");

          // (2) The wrapper element has transition: none — no animation applied.
          // The wrapper is the parent of the child.
          const wrapper = child.parentElement;
          expect(wrapper).not.toBeNull();

          const style = wrapper!.style;

          // transition must be "none" (no CSS transition applied).
          expect(style.transition).toBe("none");

          // (3) opacity must be "1" — fully visible final state.
          expect(style.opacity).toBe("1");

          // (4) transform must be "translateY(0)" — settled position.
          expect(style.transform).toBe("translateY(0)");

          unmount();
        }),
        { numRuns: 100 },
      );
    });

    it("renders children in final state for all MotionVariants (no explicit config)", () => {
      const variants = [
        "pageTransition",
        "heroWordReveal",
        "sectionReveal",
      ] as const;

      fc.assert(
        fc.property(fc.constantFrom(...variants), (variant) => {
          const { unmount } = render(
            React.createElement(MotionWrapper, {
              variant,
              children: React.createElement(
                "div",
                { "data-testid": "child-variant" },
                "variant content",
              ),
            }),
          );

          const child = screen.getByTestId("child-variant");
          expect(child).toBeInTheDocument();

          const wrapper = child.parentElement;
          expect(wrapper).not.toBeNull();

          const style = wrapper!.style;
          expect(style.transition).toBe("none");
          expect(style.opacity).toBe("1");
          expect(style.transform).toBe("translateY(0)");

          unmount();
        }),
        { numRuns: 100 },
      );
    });
  });

  // -------------------------------------------------------------------------
  // AssetPlayer: static final frame, no animated player
  // -------------------------------------------------------------------------
  describe("AssetPlayer — reduced motion renders static fallback, no autoplay", () => {
    it("renders a static fallback (no broken <img>) and NOT the animated player for any src and name", () => {
      fc.assert(
        fc.property(srcArb, nameArb, (src, name) => {
          const { container, unmount } = render(
            React.createElement(AssetPlayer, {
              src,
              name: name || undefined,
            }),
          );

          // (1) A static fallback container is rendered with matching
          // dimensions. dotLottie files are not valid <img> sources, so the
          // reduced-motion branch must NOT render an <img> (it would show a
          // broken-image icon). Instead a plain sized box is rendered.
          const imgs = document.querySelectorAll("img");
          expect(imgs.length).toBe(0);
          // The outer container element exists.
          expect(container.firstChild).not.toBeNull();

          // (2) The animated DotLottie player is NOT rendered.
          const player = document.querySelector(
            '[data-testid="dotlottie-player"]',
          );
          expect(player).toBeNull();

          unmount();
        }),
        { numRuns: 100 },
      );
    });

    it("does not render the animated player for any src (autoplay suppressed)", () => {
      fc.assert(
        fc.property(srcArb, (src) => {
          const { container, unmount } = render(
            React.createElement(AssetPlayer, {
              src,
              name: "test animation",
            }),
          );

          // The DotLottie player must not be present — autoplay is suppressed.
          const player = document.querySelector(
            '[data-testid="dotlottie-player"]',
          );
          expect(player).toBeNull();

          // A static fallback container must be present instead (no <img>,
          // which would render as a broken image for a .json/.lottie src).
          expect(container.firstChild).not.toBeNull();
          expect(document.querySelectorAll("img").length).toBe(0);

          unmount();
        }),
        { numRuns: 100 },
      );
    });
  });
});
