/**
 * Analytics event names.
 *
 * The exact event-name strings the Analytics_Service records for tracked user
 * actions (Requirements 22.2, 22.3, 22.4, 22.5). Defined as named constants so
 * the same literal is never duplicated across modules (Requirements 26.4,
 * 26.5). The `AnalyticsEvent` union matches the design's analytics type.
 */

/** Canonical analytics event-name strings. */
export const ANALYTICS_EVENTS = {
  /** Recorded when a visitor activates a project link (Requirement 22.2). */
  PROJECT_CLICK: "project_click",
  /** Recorded when a visitor activates a GitHub link (Requirement 22.3). */
  GITHUB_CLICK: "github_click",
  /** Recorded when a visitor downloads the resume (Requirement 22.4). */
  RESUME_DOWNLOAD: "resume_download",
  /** Recorded on a successful contact-form submission (Requirement 22.5). */
  CONTACT_SUBMISSION: "contact_submission",
} as const;

/**
 * Union of the analytics event names. Matches the design's `AnalyticsEvent`
 * type: "project_click" | "github_click" | "resume_download" |
 * "contact_submission".
 */
export type AnalyticsEvent =
  (typeof ANALYTICS_EVENTS)[keyof typeof ANALYTICS_EVENTS];
