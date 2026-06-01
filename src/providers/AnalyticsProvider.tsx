"use client";

/**
 * AnalyticsProvider — the client analytics island.
 *
 * A `'use client'` React context provider that holds the Analytics_Service
 * context and exposes a `useAnalytics()` hook returning `{ track }` so any
 * client component can record interactions (project clicks, GitHub clicks,
 * resume downloads, contact submissions — Requirements 22.2–22.5). The root
 * layout wraps the app tree with this provider (root-layout wiring is task
 * 13.2).
 *
 * The provider delegates to the Analytics_Service `track`, whose fan-out is
 * best-effort and non-blocking (Requirement 22.1). Initialization is
 * side-effect-light and SSR-safe: the `track` reference is stable across
 * renders and the underlying adapters guard their own `window` access, so this
 * provider performs no work during render and is safe to render on the server.
 *
 * @see Requirements 22.1, 22.2, 22.3, 22.4, 22.5
 */

import { createContext, useContext, useMemo, type ReactNode } from "react";
import type { AnalyticsEvent } from "@/types";
import { track as trackEvent } from "@/services/analytics";

/** The analytics API exposed by {@link useAnalytics}. */
export interface AnalyticsContextValue {
  /**
   * Records an analytics event, fanning it out to every configured provider
   * (best-effort, non-blocking). The event name must be a canonical
   * {@link AnalyticsEvent} from `ANALYTICS_EVENTS`.
   */
  track: (event: AnalyticsEvent, props?: Record<string, unknown>) => void;
}

const AnalyticsContext = createContext<AnalyticsContextValue | null>(null);

/**
 * Wraps the application tree, providing the analytics context.
 *
 * @param children - The subtree that consumes the analytics hook.
 */
export function AnalyticsProvider({ children }: { children: ReactNode }) {
  // The Analytics_Service `track` is module-level and stable, so the context
  // value is memoized once and never causes consumer re-renders.
  const value = useMemo<AnalyticsContextValue>(
    () => ({ track: trackEvent }),
    [],
  );

  return (
    <AnalyticsContext.Provider value={value}>
      {children}
    </AnalyticsContext.Provider>
  );
}

/** No-op track function used when no provider is present. */
const NOOP_TRACK: AnalyticsContextValue["track"] = () => undefined;

/** Fallback context value used outside a provider (e.g. in tests). */
const NOOP_CONTEXT: AnalyticsContextValue = { track: NOOP_TRACK };

/**
 * Returns the analytics API `{ track }` for recording interactions.
 *
 * When called outside an {@link AnalyticsProvider} (e.g. in unit tests or
 * server-rendered contexts), returns a no-op `track` function rather than
 * throwing. This makes analytics-wired components safe to render in isolation.
 */
export function useAnalytics(): AnalyticsContextValue {
  const value = useContext(AnalyticsContext);
  return value ?? NOOP_CONTEXT;
}
