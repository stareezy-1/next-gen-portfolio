// Feature: next-gen-portfolio-platform, Property 45: Card hover plays then resets the card asset
//
// **Validates: Requirements 25.9**
//
// Property 45: Card hover plays then resets the card asset.
// For any project card, while Reduced_Motion is disabled, hovering plays the
// card's Animated_Asset and ending the hover stops and resets that asset to
// its initial frame.
//
// Contracts under test (`@/components/shared/AssetPlayer`):
//   When `trigger="hover"` and `useReducedMotion()` returns `false`:
//     - Firing a `mouseenter` event on the container calls `dotLottie.play()`.
//     - Firing a `mouseleave` event on the container calls `dotLottie.stop()`.
//     - `dotLottie.pause()` is NOT called by the hover handlers.
//   These assertions hold for any `src` string and `name` string.
//
// Strategy:
//   - Mock `@lottiefiles/dotlottie-react` to expose a FakeDotLottie instance
//     with `play`, `pause`, and `stop` as vi.fn() spies. The mock captures the
//     instance via `dotLottieRefCallback` so the test can inspect calls.
//   - Mock `@/hooks` to return `useReducedMotion = false` and a stable theme.
//   - Mock `@/services/theme` so `resolveVariant` returns a minimal token record.
//   - Mock `IntersectionObserver` to immediately fire `isIntersecting: true` so
//     the lazy-load gate opens and the DotLottieReact player mounts.
//   - Use fast-check to generate varied `src` and `name` strings (≥100 runs).
//   - For each generated pair:
//       1. Render `<AssetPlayer src={src} name={name} trigger="hover" />`.
//       2. Fire `mouseenter` on the container → assert `play` was called once.
//       3. Fire `mouseleave` on the container → assert `stop` was called once.
//       4. Assert `pause` was NOT called by the hover interaction.
//
// Tooling: Vitest + fast-check, numRuns = 100.

import {
  describe,
  expect,
  it,
  vi,
  beforeAll,
  beforeEach,
  afterEach,
} from "vitest";
import * as fc from "fast-check";
import { render, fireEvent, act } from "@testing-library/react";
import React from "react";

// ---------------------------------------------------------------------------
// Shared spy storage — populated by the DotLottieReact mock each render.
// ---------------------------------------------------------------------------

/** Holds the most-recently created FakeDotLottie instance. */
let lastInstance: FakeDotLottie | null = null;

class FakeDotLottie {
  play = vi.fn();
  pause = vi.fn();
  stop = vi.fn();

  private listeners: Map<string, Array<() => void>> = new Map();

  addEventListener(event: string, handler: () => void) {
    if (!this.listeners.has(event)) this.listeners.set(event, []);
    this.listeners.get(event)!.push(handler);
  }

  removeEventListener(event: string, handler: () => void) {
    const handlers = this.listeners.get(event);
    if (handlers) {
      const idx = handlers.indexOf(handler);
      if (idx !== -1) handlers.splice(idx, 1);
    }
  }

  emit(event: string) {
    for (const h of this.listeners.get(event) ?? []) h();
  }
}

// ---------------------------------------------------------------------------
// Mocks — declared before any import of the component under test.
// ---------------------------------------------------------------------------

// Mock @lottiefiles/dotlottie-react: capture the dotLottieRefCallback and
// expose a FakeDotLottie instance so tests can assert on play/stop/pause.
vi.mock("@lottiefiles/dotlottie-react", () => ({
  DotLottieReact: ({
    dotLottieRefCallback,
  }: {
    dotLottieRefCallback?: (instance: FakeDotLottie | null) => void;
  }) => {
    // Call dotLottieRefCallback only once on mount (not on every re-render),
    // matching real dotLottie behavior so lastInstance stays stable.
    const callbackRef = React.useRef(dotLottieRefCallback);
    callbackRef.current = dotLottieRefCallback;

    React.useEffect(() => {
      if (callbackRef.current) {
        const instance = new FakeDotLottie();
        lastInstance = instance;
        callbackRef.current(instance);
      }
      return () => {
        if (callbackRef.current) callbackRef.current(null);
      };
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []); // Only on mount/unmount

    return React.createElement("div", { "data-testid": "dotlottie-player" });
  },
}));

// Mock @/hooks: reduced motion OFF, stable theme.
vi.mock("@/hooks", () => ({
  useReducedMotion: () => false,
  useTheme: () => ({
    mode: "dark" as const,
    palette: "aurora" as const,
    resolved: "dark" as const,
  }),
}));

// Mock @/services/theme: minimal token record for LSS theme building.
vi.mock("@/services/theme", () => ({
  resolveVariant: () => ({
    primary: { value: "#6366f1" },
    secondary: { value: "#8b5cf6" },
  }),
}));

// ---------------------------------------------------------------------------
// IntersectionObserver mock — fires isIntersecting: true immediately so the
// lazy-load gate opens and DotLottieReact mounts on first render.
// ---------------------------------------------------------------------------

type IOCallback = (entries: IntersectionObserverEntry[]) => void;

class MockIntersectionObserver {
  private callback: IOCallback;

  constructor(callback: IOCallback) {
    this.callback = callback;
  }

  observe(target: Element) {
    // Immediately report the element as intersecting so hasEntered becomes
    // true and the DotLottieReact player is mounted. Fire directly without
    // wrapping in act() since we're already inside an act() call from the test.
    this.callback([
      {
        target,
        isIntersecting: true,
        intersectionRatio: 1,
        boundingClientRect: target.getBoundingClientRect(),
        intersectionRect: target.getBoundingClientRect(),
        rootBounds: null,
        time: performance.now(),
      } as IntersectionObserverEntry,
    ]);
  }

  unobserve() {}
  disconnect() {}
}

// Install the mock globally before tests run.
beforeAll(() => {
  vi.stubGlobal("IntersectionObserver", MockIntersectionObserver);
});

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
// Arbitraries
// ---------------------------------------------------------------------------

/**
 * Generates a non-empty src string representing a dotLottie asset URL.
 * Covers typical paths and arbitrary path-like strings to prove the hover
 * behavior holds for any asset source.
 */
const srcArb: fc.Arbitrary<string> = fc.oneof(
  fc.constant("/animations/hero.lottie"),
  fc.constant("/animations/project-card.lottie"),
  fc.constant("/animations/skills.lottie"),
  fc.constant("https://cdn.example.com/asset.lottie"),
  // Arbitrary path-like strings: /segment1/segment2.lottie
  fc
    .array(fc.stringMatching(/^[a-z0-9-]+$/), { minLength: 1, maxLength: 3 })
    .map((parts) => `/${parts.join("/")}.lottie`),
);

/**
 * Generates a name string for the accessible label.
 * Covers typical card asset names and arbitrary non-empty strings.
 */
const nameArb: fc.Arbitrary<string> = fc.oneof(
  fc.constant("Project card animation"),
  fc.constant("Hero accent"),
  fc.constant("Skill group icon"),
  fc.string({ minLength: 1, maxLength: 60 }),
);

// ---------------------------------------------------------------------------
// Property test
// ---------------------------------------------------------------------------

describe("Property 45: Card hover plays then resets the card asset", () => {
  beforeEach(() => {
    lastInstance = null;
    vi.clearAllMocks();
  });

  afterEach(() => {
    // Clean up any rendered components between iterations.
    document.body.innerHTML = "";
  });

  it("mouseenter calls play() and mouseleave calls stop() for any src and name, with reduced motion disabled", async () => {
    await fc.assert(
      fc.asyncProperty(srcArb, nameArb, async (src, name) => {
        lastInstance = null;

        let unmount!: () => void;
        await act(async () => {
          const result = render(
            React.createElement(AssetPlayer, {
              src,
              name,
              trigger: "hover",
            }),
          );
          unmount = result.unmount;
        });

        // The DotLottieReact player must have mounted (lazy-load gate opened
        // by the MockIntersectionObserver firing isIntersecting: true).
        const player = document.querySelector(
          '[data-testid="dotlottie-player"]',
        );
        expect(
          player,
          `DotLottieReact player must mount for src="${src}"`,
        ).not.toBeNull();

        // The FakeDotLottie instance must have been captured.
        expect(
          lastInstance,
          "FakeDotLottie instance must be captured via dotLottieRefCallback",
        ).not.toBeNull();

        const instance = lastInstance!;

        // Reset call counts before firing hover events (the constructor call
        // to dotLottieRefCallback may have triggered play for 'visible' trigger,
        // but we're using 'hover' so no play should have been called yet).
        instance.play.mockClear();
        instance.pause.mockClear();
        instance.stop.mockClear();

        // Find the container element (data-testid="asset-player").
        const container = document.querySelector(
          '[data-testid="asset-player"]',
        );
        expect(
          container,
          "asset-player container must be present",
        ).not.toBeNull();

        // --- mouseenter: play() must be called exactly once ---
        fireEvent.mouseEnter(container!);

        expect(
          instance.play,
          `play() must be called on mouseenter for src="${src}"`,
        ).toHaveBeenCalledTimes(1);
        expect(
          instance.stop,
          "stop() must NOT be called on mouseenter",
        ).not.toHaveBeenCalled();
        expect(
          instance.pause,
          "pause() must NOT be called by hover handlers",
        ).not.toHaveBeenCalled();

        // --- mouseleave: stop() must be called exactly once ---
        fireEvent.mouseLeave(container!);

        expect(
          instance.stop,
          `stop() must be called on mouseleave for src="${src}"`,
        ).toHaveBeenCalledTimes(1);
        // play() count must still be 1 (no extra calls on leave).
        expect(
          instance.play,
          "play() must not be called again on mouseleave",
        ).toHaveBeenCalledTimes(1);
        // pause() must never be called by the hover interaction.
        expect(
          instance.pause,
          "pause() must NOT be called by hover handlers",
        ).not.toHaveBeenCalled();

        unmount();
      }),
      { numRuns: 100 },
    );
  });

  it("hover interaction does not call play() or stop() when trigger is not 'hover'", async () => {
    // Regression guard: with trigger="auto", mouseenter/mouseleave must be
    // no-ops for the play/stop spies (the component guards on trigger === 'hover').
    await fc.assert(
      fc.asyncProperty(srcArb, async (src) => {
        lastInstance = null;

        let unmount!: () => void;
        await act(async () => {
          const result = render(
            React.createElement(AssetPlayer, {
              src,
              name: "test",
              trigger: "auto",
            }),
          );
          unmount = result.unmount;
        });

        const instance = lastInstance as FakeDotLottie | null;
        if (!instance) {
          // Player may not have mounted if IntersectionObserver didn't fire;
          // skip this iteration gracefully.
          unmount();
          return;
        }

        instance.play.mockClear();
        instance.pause.mockClear();
        instance.stop.mockClear();

        const container = document.querySelector(
          '[data-testid="asset-player"]',
        );
        if (!container) {
          unmount();
          return;
        }

        fireEvent.mouseEnter(container);
        fireEvent.mouseLeave(container);

        // With trigger="auto", the hover handlers are no-ops for play/stop.
        expect(
          instance.play,
          "play() must not be called by hover when trigger=auto",
        ).not.toHaveBeenCalled();
        expect(
          instance.stop,
          "stop() must not be called by hover when trigger=auto",
        ).not.toHaveBeenCalled();

        unmount();
      }),
      { numRuns: 100 },
    );
  });
});
