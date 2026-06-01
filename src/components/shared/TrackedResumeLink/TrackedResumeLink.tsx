"use client";

/**
 * TrackedResumeLink — a client component that renders a resume download link
 * and fires a `resume_download` analytics event on activation.
 *
 * Alias for {@link ResumeDownloadLink} with the canonical name used in the
 * task spec. Created for future use when a resume download link is added
 * during content migration.
 *
 * @see Requirements 22.4
 */

import { useAnalytics } from "@/providers/AnalyticsProvider";
import { ANALYTICS_EVENTS } from "@/constants/analytics";

export interface TrackedResumeLinkProps {
  href: string;
  children: React.ReactNode;
}

/**
 * Renders a download link that records a `resume_download` event on
 * activation.
 *
 * @param props - See {@link TrackedResumeLinkProps}.
 */
export function TrackedResumeLink({ href, children }: TrackedResumeLinkProps) {
  const { track } = useAnalytics();

  return (
    <a
      href={href}
      download
      onClick={() => track(ANALYTICS_EVENTS.RESUME_DOWNLOAD)}
    >
      {children}
    </a>
  );
}
