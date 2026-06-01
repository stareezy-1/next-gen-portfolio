/**
 * Content configuration constants.
 *
 * Configuration thresholds and magic numbers for content rendering, defined as
 * named constants rather than inlined at use sites (Requirements 26.4, 26.5).
 */

/**
 * Number of featured projects rendered on the Home page (Requirement 7.2).
 * The Home featured-project selection renders exactly this many cards.
 */
export const FEATURED_PROJECTS_COUNT = 6 as const;

/**
 * Maximum number of Blog Posts per Blog listing page (Requirements 13.4, 13.5).
 * Used by the blog pagination utility to partition posts into bounded pages.
 */
export const BLOG_PAGE_SIZE = 9 as const;

/**
 * Number of recent Blog Posts shown in the Home blog preview section
 * (Requirements 7.5). The preview renders the N most recent published posts.
 */
export const BLOG_PREVIEW_COUNT = 3 as const;

/**
 * Reading-speed rate, in words per minute, used to compute a Blog Post's
 * reading time from its body word count (Requirement 14.2).
 */
export const READING_TIME_WPM = 200 as const;
