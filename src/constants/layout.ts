/**
 * Layout width breakpoints.
 *
 * Named constants for the three layout-width constraints
 * (Requirements 5.1, 5.2, 5.3) so width literals are never inlined at use
 * sites (Requirements 26.4, 26.5). Values are in CSS pixels.
 *
 * Note: these are layout breakpoints, not design tokens — the Token_System
 * does not export layout container widths, so they live here as named
 * constants per Requirement 26.6.
 */

/** Outermost layout container maximum width, in pixels (Requirement 5.1). */
export const MAX_CONTENT_WIDTH = 1440 as const;

/** Standard content container maximum width, in pixels (Requirement 5.2). */
export const CONTENT_WIDTH = 1280 as const;

/** Long-form reading content maximum line width, in pixels (Requirement 5.3). */
export const READING_WIDTH = 720 as const;
