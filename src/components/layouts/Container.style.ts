/**
 * Styles for the layout container primitives.
 *
 * All values come from named constants (Requirements 5.1, 5.2, 5.3, 26.4).
 * No hardcoded design literals — widths are imported from `@/constants`.
 * Web styles use `display: 'flex'` per the stareezy-ui convention.
 *
 * @see Requirements 5.1, 5.2, 5.3, 5.4, 5.5, 26.1, 26.2
 */

import { MAX_CONTENT_WIDTH, CONTENT_WIDTH, READING_WIDTH } from "@/constants";
import type { CSSProperties } from "react";

/**
 * Base styles shared by all containers: full width, flex column, no horizontal
 * overflow (Requirement 5.4), and horizontal auto-margin for centering.
 */
const base: CSSProperties = {
  display: "flex",
  flexDirection: "column",
  width: "100%",
  marginLeft: "auto",
  marginRight: "auto",
  overflowX: "hidden",
  boxSizing: "border-box",
  paddingLeft: "1.5rem",
  paddingRight: "1.5rem",
};

/**
 * Outermost layout container — max 1440 px (Requirement 5.1).
 */
export const maxContentWidthStyles: CSSProperties = {
  ...base,
  maxWidth: MAX_CONTENT_WIDTH,
};

/**
 * Standard content container — max 1280 px (Requirement 5.2).
 */
export const contentWidthStyles: CSSProperties = {
  ...base,
  maxWidth: CONTENT_WIDTH,
};

/**
 * Long-form reading container — max 720 px (Requirement 5.3).
 */
export const readingWidthStyles: CSSProperties = {
  ...base,
  maxWidth: READING_WIDTH,
};
