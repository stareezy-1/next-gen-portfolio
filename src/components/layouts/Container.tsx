/**
 * Layout container primitives.
 *
 * Three width-constrained containers that implement the platform's responsive
 * layout system (Requirements 5.1–5.5). All widths are sourced from named
 * constants — never inlined (Requirements 26.4, 26.5). Styles live in
 * `Container.style.ts` (Requirement 26.1).
 *
 * - `MaxContentWidth` — outermost container, max 1440 px (Requirement 5.1)
 * - `ContentWidth`    — standard content container, max 1280 px (Requirement 5.2)
 * - `ReadingWidth`    — long-form reading container, max 720 px (Requirement 5.3)
 *
 * All containers:
 *  - span full viewport width below their max (Requirement 5.4)
 *  - suppress horizontal overflow so layout never breaks on narrow viewports
 *  - use `display: flex` per the stareezy-ui web convention
 *
 * These are React Server Components (no `'use client'`).
 *
 * @see Requirements 5.1, 5.2, 5.3, 5.4, 5.5
 */

import type { ContainerProps } from "./Container.types";
import {
  maxContentWidthStyles,
  contentWidthStyles,
  readingWidthStyles,
} from "./Container.style";

/**
 * Outermost layout container constrained to {@link MAX_CONTENT_WIDTH} (1440 px).
 *
 * Use this as the outermost wrapper on every page to cap the layout width
 * while allowing the background to bleed full-width (Requirement 5.1).
 */
export function MaxContentWidth({
  children,
  className,
  style,
  as: Tag = "div",
}: ContainerProps) {
  return (
    <Tag style={{ ...maxContentWidthStyles, ...style }} className={className}>
      {children}
    </Tag>
  );
}

/**
 * Standard content container constrained to {@link CONTENT_WIDTH} (1280 px).
 *
 * Use this for primary page content sections — navigation, cards, grids
 * (Requirement 5.2).
 */
export function ContentWidth({
  children,
  className,
  style,
  as: Tag = "div",
}: ContainerProps) {
  return (
    <Tag style={{ ...contentWidthStyles, ...style }} className={className}>
      {children}
    </Tag>
  );
}

/**
 * Long-form reading container constrained to {@link READING_WIDTH} (720 px).
 *
 * Use this for blog post bodies, the About page narrative, and any other
 * long-form prose (Requirement 5.3).
 */
export function ReadingWidth({
  children,
  className,
  style,
  as: Tag = "div",
}: ContainerProps) {
  return (
    <Tag style={{ ...readingWidthStyles, ...style }} className={className}>
      {children}
    </Tag>
  );
}
