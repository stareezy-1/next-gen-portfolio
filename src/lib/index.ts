/**
 * Pure-utility barrel for the Next-Gen Portfolio Platform.
 *
 * Re-exports slug, timeline-ordering, and redirect-map utilities so consumers
 * can import from `@/lib`.
 */

export { slug } from "./slug";

export { orderByStartDateDesc } from "./timeline";

export { buildRedirectMap, hasCycle, validateRedirectMap } from "./redirects";
export type { RedirectPairs, RedirectValidation } from "./redirects";
