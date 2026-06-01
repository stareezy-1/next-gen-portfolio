// Feature: next-gen-portfolio-platform, Property 43: Asset load failure renders a same-size fallback
//
// Validates: Requirements 25.6
//
// Property 43: Asset load failure renders a same-size fallback.
// For any Animated_Asset that fails to load, the Asset_Player renders a static
// fallback occupying the same box dimensions as the asset, producing no layout
// shift.
//
// Strategy:
//   - Mock `@lottiefiles/dotlottie-react` so that `DotLottieReact` calls
//     `dotLottieRefCallback` with a fake player instance and then fires a
//     `loadError` event via a React useEffect (after mount), simulating a
//     failed asset load without triggering a setState-during-render warning.
//   - Mock `@/hooks` to return `prefersReducedMotion = false` (so the component
//     takes the normal animation path, not the reduced-motion static-image path)
//     and a stable theme value.
//   - Mock `@/services/theme` so `resolveVariant` returns a minimal token record.
//   - Use fast-check to generate varied `width` and `height` values (positive
//     integers as pixel numbers, and CSS strings like "200px", "50%", "auto").
//   - For each generated pair, render `<AssetPlayer>` inside `act` to flush the
//     useEffect that fires loadError, then assert:
//       1. The fallback element (`data-testid="asset-player-fallback"`) is present.
//       2. The container's inline `style.width` and `style.height` match the
//          expected CSS values derived from the props.
//
// Tooling: Vitest + fast-check, numRuns = 100.

import { describe, expect, it, vi, beforeAll } from "vitest";
import * as fc from "fast-check";
import { render, screen, act } from "@testing-library/react";
import React from "react";

// ---------------------------------------------------------------------------
// Mocks — must be declared before importing the component under test.
// ---------------------------------------------------------------------------

/**
 * Fake DotLottie instance that can fire registered event listeners on demand.
 */
class FakeDotLottie {
  private listeners: Map<string, Array<() => void>> = new Map();

  addEventListener(event: string, handler: () => void) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event)!.push(handler);
  }

  removeEventListener(event: string, handler: () => void) {
    const handlers = this.listeners.get(event);
    if (handlers) {
      const idx = handlers.indexOf(handler);
      if (idx !== -1) handlers.splice(idx, 1);
    }
  }

  /** Trigger all registered handlers for the given event. */
  emit(event: string) {
    const handlers = this.listeners.get(event) ?? [];
    for (const h of handlers) h();
  }

  // Stub out player methods used by the component.
  play() {}
  pause() {}
  stop() {}
}

// Mock @lottiefiles/dotlottie-react before any import of the component.
// The fake DotLottieReact fires loadError inside a useEffect so the state
// update happens after mount (not during render), avoiding React warnings.
vi.mock("@lottiefiles/dotlottie-react", () => {
  return {
    DotLottieReact: ({
      dotLottieRefCallback,
    }: {
      dotLottieRefCallback?: (instance: FakeDotLottie | null) => void;
    }) => {
      React.useEffect(() => {
        if (dotLottieRefCallback) {
          const instance = new FakeDotLottie();
          // Register the component's listeners first via the ref callback.
          dotLottieRefCallback(instance);
          // Then fire loadError so the component sets loadFailed = true.
          instance.emit("loadError");
        }
        // dotLottieRefCallback identity is stable per render; omit from deps.
        // eslint-disable-next-line react-hooks/exhaustive-deps
      }, []);
      return null;
    },
  };
});

// Mock @/hooks so the component never enters the reduced-motion branch.
vi.mock("@/hooks", () => ({
  useReducedMotion: () => false,
  useTheme: () => ({
    mode: "dark" as const,
    palette: "aurora" as const,
    resolved: "dark" as const,
  }),
}));

// Mock @/services/theme so resolveVariant returns a minimal token record.
vi.mock("@/services/theme", () => ({
  resolveVariant: () => ({
    primary: { value: "#000000" },
    secondary: { value: "#ffffff" },
  }),
}));

// ---------------------------------------------------------------------------
// Import the component AFTER mocks are registered.
// ---------------------------------------------------------------------------
let AssetPlayer: React.ComponentType<{
  src: string;
  name?: string;
  decorative?: boolean;
  trigger?: "auto" | "hover" | "visible";
  width?: number | string;
  height?: number | string;
}>;

beforeAll(async () => {
  const mod = await import("@/components/shared/AssetPlayer/AssetPlayer");
  AssetPlayer = mod.AssetPlayer;
});

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Converts an AssetPlayer `width` or `height` prop value to the CSS string
 * that the component writes into the container's inline style.
 *
 * The component does:
 *   width: typeof width === "number" ? `${width}px` : width
 */
function toCssValue(value: number | string): string {
  return typeof value === "number" ? `${value}px` : value;
}

// ---------------------------------------------------------------------------
// Arbitraries
// ---------------------------------------------------------------------------

/**
 * Generates a dimension value as either:
 *   - a positive integer (pixel number, e.g. 50, 200, 1024)
 *   - a CSS pixel string (e.g. "100px", "300px")
 *   - a CSS percentage string (e.g. "50%", "100%")
 *   - the string "auto"
 */
const dimensionArb: fc.Arbitrary<number | string> = fc.oneof(
  // Positive integer pixel values
  fc.integer({ min: 1, max: 2000 }),
  // CSS pixel strings
  fc.integer({ min: 1, max: 2000 }).map((n) => `${n}px`),
  // CSS percentage strings
  fc.integer({ min: 1, max: 100 }).map((n) => `${n}%`),
  // "auto"
  fc.constant("auto"),
);

// ---------------------------------------------------------------------------
// Property test
// ---------------------------------------------------------------------------

describe("Property 43: Asset load failure renders a same-size fallback", () => {
  it("renders a fallback with the same container dimensions as the props for any width/height", async () => {
    await fc.assert(
      fc.asyncProperty(dimensionArb, dimensionArb, async (width, height) => {
        let unmount!: () => void;

        // Wrap in act so React flushes the useEffect that fires loadError.
        await act(async () => {
          const result = render(
            React.createElement(AssetPlayer, {
              src: "/test.lottie",
              name: "test",
              width,
              height,
            }),
          );
          unmount = result.unmount;
        });

        // The fallback element must be present after load failure.
        const fallback = screen.queryByTestId("asset-player-fallback");
        expect(fallback).not.toBeNull();

        // The container (the fallback element itself) must carry the
        // correct inline dimensions so no layout shift occurs (Req 25.6).
        const expectedWidth = toCssValue(width);
        const expectedHeight = toCssValue(height);

        expect(fallback!.style.width).toBe(expectedWidth);
        expect(fallback!.style.height).toBe(expectedHeight);

        unmount();
      }),
      { numRuns: 100 },
    );
  });
});
