"use client";

/**
 * TrackedGithubLink — a client component that renders a GitHub link and fires
 * a `github_click` analytics event on activation.
 *
 * Alias for {@link GithubLink} with the canonical name used in the task spec.
 * Used in PersonalProjectRenderer and anywhere a GitHub URL is displayed.
 *
 * @see Requirements 22.3
 */

import { useAnalytics } from "@/providers/AnalyticsProvider";
import { ANALYTICS_EVENTS } from "@/constants/analytics";

export interface TrackedGithubLinkProps {
  href: string;
  children: React.ReactNode;
  "aria-label"?: string;
}

/**
 * Renders an external GitHub link that records a `github_click` event on
 * activation.
 *
 * @param props - See {@link TrackedGithubLinkProps}.
 */
export function TrackedGithubLink({
  href,
  children,
  "aria-label": ariaLabel,
}: TrackedGithubLinkProps) {
  const { track } = useAnalytics();

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={ariaLabel}
      onClick={() => track(ANALYTICS_EVENTS.GITHUB_CLICK, { url: href })}
    >
      {children}
    </a>
  );
}
