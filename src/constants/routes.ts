/**
 * Route paths and primary navigation labels.
 *
 * These are the single source of truth for the six primary routes
 * (Requirement 2.5) and the primary navigation links and labels
 * (Requirement 6.1). Use sites import these constants rather than inlining
 * path or label literals (Requirements 26.4, 26.5).
 */

/** Canonical path for each primary route. */
export const ROUTES = {
  HOME: "/",
  ABOUT: "/about",
  EXPERIENCE: "/experience",
  PROJECTS: "/projects",
  BLOG: "/blog",
  CONTACT: "/contact",
} as const;

/** Union of the defined primary route paths. */
export type RoutePath = (typeof ROUTES)[keyof typeof ROUTES];

/** Stable identifier for each primary navigation entry. */
export const NAV_KEYS = {
  HOME: "home",
  ABOUT: "about",
  EXPERIENCE: "experience",
  PROJECTS: "projects",
  BLOG: "blog",
  CONTACT: "contact",
} as const;

/** Union of the navigation entry identifiers. */
export type NavKey = (typeof NAV_KEYS)[keyof typeof NAV_KEYS];

/** Human-readable label for each primary navigation link. */
export const NAV_LABELS = {
  HOME: "Home",
  ABOUT: "About",
  EXPERIENCE: "Experience",
  PROJECTS: "Projects",
  BLOG: "Blog",
  CONTACT: "Contact",
} as const;

/** A single primary-navigation entry: identifier, label, and target path. */
export interface NavItem {
  readonly key: NavKey;
  readonly label: string;
  readonly path: RoutePath;
}

/**
 * The ordered list of primary navigation items.
 *
 * Drives the primary navigation component (Requirement 6.1) and guarantees a
 * link exists for every defined route (Requirement 6.2). Ordered Home → About
 * → Experience → Projects → Blog → Contact.
 */
export const PRIMARY_NAV_ITEMS: readonly NavItem[] = [
  { key: NAV_KEYS.HOME, label: NAV_LABELS.HOME, path: ROUTES.HOME },
  { key: NAV_KEYS.ABOUT, label: NAV_LABELS.ABOUT, path: ROUTES.ABOUT },
  {
    key: NAV_KEYS.EXPERIENCE,
    label: NAV_LABELS.EXPERIENCE,
    path: ROUTES.EXPERIENCE,
  },
  { key: NAV_KEYS.PROJECTS, label: NAV_LABELS.PROJECTS, path: ROUTES.PROJECTS },
  { key: NAV_KEYS.BLOG, label: NAV_LABELS.BLOG, path: ROUTES.BLOG },
  { key: NAV_KEYS.CONTACT, label: NAV_LABELS.CONTACT, path: ROUTES.CONTACT },
] as const;
