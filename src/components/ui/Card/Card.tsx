/**
 * Card — generic token-driven card container.
 *
 * Renders as an `<article>` by default. When `href` is provided the card
 * renders as a Next.js `<Link>` wrapping the content, making the entire card
 * a clickable link. Styles live in `Card.style.ts` — no inline styles here
 * (Requirement 26.1). All colors reference CSS custom properties
 * (Requirements 26.2, 26.3).
 *
 * This is a React Server Component (no `'use client'`) — the card itself
 * carries no client-side state. Hover animations are handled by the
 * `MotionWrapper` or CSS transitions defined in the style module.
 *
 * @see Requirements 26.1, 26.2, 26.3
 */

import Link from "next/link";
import { cardStyles, cardLinkStyles } from "./Card.style";
import type { CardProps } from "./Card.types";

/**
 * Generic card container.
 *
 * - Without `href`: renders as a plain `<article>` element.
 * - With `href`: renders as a Next.js `<Link>` (anchor) so the entire card
 *   surface is interactive and keyboard-navigable (Requirement 23.1).
 *
 * @param props - See {@link CardProps}.
 */
export function Card({
  children,
  href,
  className,
  style,
  "aria-label": ariaLabel,
}: CardProps) {
  if (href) {
    return (
      <Link
        href={href}
        style={{ ...cardLinkStyles, ...style }}
        className={className}
        aria-label={ariaLabel}
      >
        {children}
      </Link>
    );
  }

  return (
    <article
      style={{ ...cardStyles, ...style }}
      className={className}
      aria-label={ariaLabel}
    >
      {children}
    </article>
  );
}
