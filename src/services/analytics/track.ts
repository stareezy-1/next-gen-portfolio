/**
 * Analytics_Service `track` — the best-effort, non-blocking fan-out.
 *
 * `track` dispatches a tracked action to every adapter in the
 * {@link analyticsAdapters} registry (Google Analytics, Microsoft Clarity,
 * OpenPanel — Requirement 22.1). Each adapter call is wrapped in its own
 * try/catch so a failing or absent provider can neither throw into the caller
 * nor prevent the remaining providers from receiving the event
 * (Requirements 22.2–22.5). Event names are the canonical
 * {@link AnalyticsEvent} constants from `@/constants` — never inline literals
 * (Requirement 26.4).
 *
 * @see Requirements 22.1, 22.2, 22.3, 22.4, 22.5, 26.4
 */

import type { AnalyticsEvent } from "@/types";
import { analyticsAdapters } from "./adapters";

/**
 * Records an analytics event by fanning it out to every configured provider
 * adapter. Best-effort and non-blocking: each adapter is invoked inside its own
 * try/catch, so one provider failing or being absent never affects the caller
 * or the other providers.
 *
 * @param event - The canonical event name (from `ANALYTICS_EVENTS`).
 * @param props - Optional event properties forwarded to each provider.
 */
export function track(
  event: AnalyticsEvent,
  props?: Record<string, unknown>,
): void {
  for (const adapter of analyticsAdapters) {
    try {
      adapter(event, props);
    } catch {
      /* best-effort: a failing provider must never throw into the caller
         or block dispatch to the remaining providers (Requirements 22.x). */
    }
  }
}
