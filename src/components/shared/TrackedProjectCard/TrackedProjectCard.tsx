"use client";

/**
 * TrackedProjectCard — a client component that wraps a project link and fires
 * a `project_click` analytics event on activation.
 *
 * Server Components cannot use `useAnalytics` directly, so this thin client
 * wrapper is used wherever a project card link needs analytics tracking
 * (Requirements 22.2).
 *
 * @see Requirements 22.2
 */

import Link from "next/link";
import { useAnalytics } from "@/providers/AnalyticsProvider";
import { ANALYTICS_EVENTS } from "@/constants/analytics";

export interface TrackedProjectCardProps {
  href: string;
  slug: string;
  "aria-label"?: string;
  children: React.ReactNode;
}

/**
 * Renders a Next.js Link for a project card that records a `project_click`
 * event on activation.
 *
 * @param props - See {@link TrackedProjectCardProps}.
 */
export function TrackedProjectCard({
  href,
  slug,
  children,
  "aria-label": ariaLabel,
}: TrackedProjectCardProps) {
  const { track } = useAnalytics();

  return (
    <Link
      href={href}
      aria-label={ariaLabel}
      onClick={() => track(ANALYTICS_EVENTS.PROJECT_CLICK, { slug })}
    >
      {children}
    </Link>
  );
}
