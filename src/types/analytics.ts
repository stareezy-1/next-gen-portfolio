/**
 * Analytics data models for the Analytics_Service.
 *
 * Event names are defined as constants in the `constants` directory; this
 * union is the authoritative set of trackable events.
 *
 * @see Requirements 22.2, 22.3, 22.4, 22.5
 */

/** The set of analytics events the platform records. */
export type AnalyticsEvent =
  | "project_click"
  | "github_click"
  | "resume_download"
  | "contact_submission";
