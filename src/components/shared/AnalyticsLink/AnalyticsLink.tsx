"use client";

/**
 * AnalyticsLink — a client component that wraps Next.js Link and fires an
 * analytics event on click.
 *
 * Used for project links and any other navigable element that should record
 * an analytics event when activated.
 *
 * @see Requirements 22.2, 22.3
 */

import Link from "next/link";
import { useAnalytics } from "@/providers/AnalyticsProvider";
import type { AnalyticsEvent } from "@/types";

export interface AnalyticsLinkProps {
  href: string;
  event: AnalyticsEvent;
  eventProps?: Record<string, unknown>;
  children: React.ReactNode;
  className?: string;
  "aria-label"?: string;
  target?: string;
  rel?: string;
}

/**
 * Wraps Next.js `Link` and fires an analytics event on click.
 *
 * @param props - See {@link AnalyticsLinkProps}.
 */
export function AnalyticsLink({
  href,
  event,
  eventProps,
  children,
  ...rest
}: AnalyticsLinkProps) {
  const { track } = useAnalytics();

  return (
    <Link href={href} onClick={() => track(event, eventProps)} {...rest}>
      {children}
    </Link>
  );
}
