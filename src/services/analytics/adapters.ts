/**
 * Analytics provider adapters and the dispatch registry.
 *
 * Each adapter is a best-effort `(event, props) => void` function that forwards
 * a tracked event to one analytics provider — Google Analytics, Microsoft
 * Clarity, or OpenPanel (Requirement 22.1). Every adapter reads its provider's
 * browser global defensively: it no-ops on the server (no `window`) and when
 * the provider script is absent, so a missing or unloaded provider never
 * throws (Requirements 22.x). The adapters are collected in the module-level
 * {@link analyticsAdapters} registry that `track` fans out across; the registry
 * is exported (and mutable) so tests can observe dispatch by replacing or
 * appending a recording sink.
 *
 * @see Requirements 22.1, 22.2, 22.3, 22.4, 22.5
 */

import type { AnalyticsEvent } from "@/types";

/**
 * A single provider sink. Receives the canonical {@link AnalyticsEvent} name
 * and optional event properties, and forwards them to one provider. Adapters
 * must be non-throwing for absent providers; `track` additionally guards every
 * call so an adapter that does throw never blocks the others.
 */
export type AnalyticsAdapter = (
  event: AnalyticsEvent,
  props?: Record<string, unknown>,
) => void;

/** Google Analytics `gtag` command function (`gtag('event', name, params)`). */
type GtagFn = (command: string, ...args: unknown[]) => void;

/** Microsoft Clarity command function (`clarity('event', name)`). */
type ClarityFn = (command: string, ...args: unknown[]) => void;

/** OpenPanel queue-style global (`op('track', name, props)`). */
type OpenPanelFn = (command: string, ...args: unknown[]) => void;

/** OpenPanel instance-style global (`op.track(name, props)`). */
interface OpenPanelInstance {
  track: (name: string, props?: Record<string, unknown>) => void;
}

type OpenPanelGlobal = OpenPanelFn | OpenPanelInstance;

/** The provider globals the adapters guard access to. */
interface AnalyticsGlobals {
  gtag?: GtagFn;
  clarity?: ClarityFn;
  op?: OpenPanelGlobal;
  OpenPanel?: OpenPanelGlobal;
}

/**
 * Returns the analytics-augmented `window` when running in the browser, or
 * `undefined` on the server. Keeping the SSR guard in one place keeps every
 * adapter SSR-safe (Requirements 22.x).
 */
function analyticsWindow(): AnalyticsGlobals | undefined {
  if (typeof window === "undefined") return undefined;
  return window as unknown as AnalyticsGlobals;
}

/**
 * Forwards the event to Google Analytics via `gtag('event', name, params)`.
 * No-ops when `window.gtag` is unavailable (Requirement 22.1).
 */
export const googleAnalyticsAdapter: AnalyticsAdapter = (event, props) => {
  const w = analyticsWindow();
  if (!w || typeof w.gtag !== "function") return;
  w.gtag("event", event, props ?? {});
};

/**
 * Forwards the event to Microsoft Clarity via `clarity('event', name)`.
 * No-ops when `window.clarity` is unavailable (Requirement 22.1).
 */
export const clarityAdapter: AnalyticsAdapter = (event) => {
  const w = analyticsWindow();
  if (!w || typeof w.clarity !== "function") return;
  w.clarity("event", event);
};

/**
 * Forwards the event to OpenPanel, supporting both the queue-style global
 * (`op('track', name, props)`) and an instance with a `track` method
 * (`op.track(name, props)` / `OpenPanel.track(...)`). No-ops when no OpenPanel
 * global is present (Requirement 22.1).
 */
export const openPanelAdapter: AnalyticsAdapter = (event, props) => {
  const w = analyticsWindow();
  if (!w) return;
  const op = w.op ?? w.OpenPanel;
  if (typeof op === "function") {
    op("track", event, props);
  } else if (op && typeof op.track === "function") {
    op.track(event, props);
  }
};

/**
 * The module-level dispatch registry. `track` iterates this array, so the
 * default fan-out targets all three providers (Requirement 22.1). The array is
 * intentionally mutable and exported: tests can observe dispatch by clearing it
 * and pushing a recording sink, or by appending one alongside the defaults.
 */
export const analyticsAdapters: AnalyticsAdapter[] = [
  googleAnalyticsAdapter,
  clarityAdapter,
  openPanelAdapter,
];
