import React from "react";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { act, cleanup, render } from "@testing-library/react";
import { ScrollReveal } from "@/components/shared/ScrollReveal";
let callback: IntersectionObserverCallback;
const disconnect = vi.fn();
beforeEach(() => {
  vi.stubGlobal("matchMedia", () => ({
    matches: false,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
  }));
  vi.spyOn(HTMLElement.prototype, "getBoundingClientRect").mockReturnValue({
    top: 1200,
    bottom: 1300,
    left: 0,
    right: 100,
    width: 100,
    height: 100,
    x: 0,
    y: 1200,
    toJSON: () => ({}),
  });
  vi.stubGlobal(
    "IntersectionObserver",
    class {
      constructor(cb: IntersectionObserverCallback) {
        callback = cb;
      }
      observe = vi.fn();
      disconnect = disconnect;
    },
  );
});
afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
  disconnect.mockClear();
});
it("reveals offscreen content on intersection without CSS view timelines", () => {
  const { container } = render(
    <ScrollReveal>
      <h2>Work</h2>
    </ScrollReveal>,
  );
  expect(container.firstChild).toHaveAttribute("data-inview", "false");
  act(() =>
    callback(
      [{ isIntersecting: true } as IntersectionObserverEntry],
      {} as IntersectionObserver,
    ),
  );
  expect(container.firstChild).toHaveAttribute("data-inview", "true");
  expect(disconnect).toHaveBeenCalled();
});
it("never hides content when reduced motion is requested", () => {
  vi.stubGlobal("matchMedia", () => ({
    matches: true,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
  }));
  const { container } = render(
    <ScrollReveal>
      <h2>Work</h2>
    </ScrollReveal>,
  );
  expect(container.firstChild).toHaveAttribute("data-inview", "true");
  expect(container.firstChild).not.toHaveAttribute("data-reveal-ready");
});
it("keeps content visible when IntersectionObserver is unavailable", () => {
  vi.stubGlobal("IntersectionObserver", undefined);
  const { container } = render(
    <ScrollReveal>
      <h2>Work</h2>
    </ScrollReveal>,
  );
  expect(container.firstChild).not.toHaveAttribute("data-reveal-ready");
});
