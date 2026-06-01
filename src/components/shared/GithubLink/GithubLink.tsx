"use client";

/**
 * GithubLink — a client component that renders a GitHub link and fires a
 * `github_click` analytics event on activation.
 *
 * Used in PersonalProjectRenderer and anywhere a GitHub URL is displayed.
 *
 * @see Requirements 22.3
 */

import { useAnalytics } from "@/providers/AnalyticsProvider";
import { ANALYTICS_EVENTS } from "@/constants/analytics";

export interface GithubLinkProps {
  href: string;
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
  "aria-label"?: string;
}

/**
 * Renders an external GitHub link that records a `github_click` event.
 *
 * @param props - See {@link GithubLinkProps}.
 */
export function GithubLink({ href, children, ...rest }: GithubLinkProps) {
  const { track } = useAnalytics();

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      onClick={() => track(ANALYTICS_EVENTS.GITHUB_CLICK, { href })}
      {...rest}
    >
      {children}
    </a>
  );
}
