/**
 * Animated_Asset placement keys.
 *
 * Stable identifiers for the nine Animated_Asset placements enumerated in
 * Requirement 25.8. Defined as named constants so placement identifiers are
 * referenced by import rather than inlined at use sites (Requirements 26.4,
 * 26.5). The Asset_Player and feature sections key into these placements.
 */

/** Canonical placement-key strings for each Animated_Asset location. */
export const ASSET_PLACEMENTS = {
  /** 25.8.1 — the Home hero accent. */
  HERO_ACCENT: "hero_accent",
  /** 25.8.2 — section empty states (no search results, no filtered projects). */
  EMPTY_STATE: "empty_state",
  /** 25.8.3 — loading indicators for asynchronous content. */
  LOADING_INDICATOR: "loading_indicator",
  /** 25.8.4 — the route transition overlay shown while a page transition runs. */
  ROUTE_TRANSITION: "route_transition",
  /** 25.8.5 — the 404 / not-found page illustration. */
  NOT_FOUND: "not_found",
  /** 25.8.6 — the Contact form success confirmation. */
  CONTACT_SUCCESS: "contact_success",
  /** 25.8.7 — the Contact form / submission error state. */
  CONTACT_ERROR: "contact_error",
  /** 25.8.8 — each skill-group icon in the Home skills section. */
  SKILL_GROUP_ICON: "skill_group_icon",
  /** 25.8.9 — the project card accent revealed on hover. */
  PROJECT_CARD_HOVER: "project_card_hover",
} as const;

/** Union of the Animated_Asset placement keys. */
export type AssetPlacement =
  (typeof ASSET_PLACEMENTS)[keyof typeof ASSET_PLACEMENTS];
