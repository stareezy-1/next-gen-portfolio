"use client";

/**
 * ResumeDownloadLink — a client component that renders a resume download link
 * and fires a `resume_download` analytics event on activation.
 *
 * @see Requirements 22.4
 */

import { useAnalytics } from "@/providers/AnalyticsProvider";
import { ANALYTICS_EVENTS } from "@/constants/analytics";

export interface ResumeDownloadLinkProps {
  href: string;
  children: React.ReactNode;
  className?: string;
  "aria-label"?: string;
}

/**
 * Renders a download link that records a `resume_download` event on click.
 *
 * @param props - See {@link ResumeDownloadLinkProps}.
 */
export function ResumeDownloadLink({
  href,
  children,
  ...rest
}: ResumeDownloadLinkProps) {
  const { track } = useAnalytics();

  return (
    <a
      href={href}
      download
      onClick={() => track(ANALYTICS_EVENTS.RESUME_DOWNLOAD)}
      {...rest}
    >
      {children}
    </a>
  );
}
