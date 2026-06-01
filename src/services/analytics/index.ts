/**
 * Analytics_Service barrel.
 *
 * The Analytics_Service records key interactions to the configured providers —
 * Google Analytics, Microsoft Clarity, and OpenPanel — via a best-effort,
 * non-blocking fan-out (Requirement 22.1). `track` is the single entry point;
 * the provider adapters and their dispatch registry are exported so tests can
 * observe dispatch (e.g. property test 11.2 backing Property 39).
 *
 * Event names always come from the `ANALYTICS_EVENTS` constants (Requirement
 * 26.4); this module never inlines event-name string literals.
 *
 * @see Requirements 22.1, 22.2, 22.3, 22.4, 22.5, 26.4
 */

export { track } from "./track";

export {
  analyticsAdapters,
  googleAnalyticsAdapter,
  clarityAdapter,
  openPanelAdapter,
  type AnalyticsAdapter,
} from "./adapters";
