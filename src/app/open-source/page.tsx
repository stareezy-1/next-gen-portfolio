import type { Metadata } from "next";
import { ArrowUpRight, GitPullRequest } from "lucide-react";

import { ContentWidth } from "@/components/layouts";
import { ScrollReveal } from "@/components/shared/ScrollReveal";
import { Button } from "@/components/ui/shadcn/button";
import { ContributionLedger } from "@/features/open-source";
import { getOpenSourceContributions } from "@/features/open-source/server";
import { NAV_LABELS, ROUTES } from "@/constants/routes";
import { canonicalUrl } from "@/services/seo";
import { breadcrumbListJsonLd } from "@/services/seo/structured-data";

export const revalidate = 21_600;

export const metadata: Metadata = {
  title: "Open Source Contributions",
  description:
    "Merged pull requests by Muhammad Bintang Al Akbar across public open-source projects including Expo and Raycast extensions.",
  alternates: { canonical: "https://stareezy.tech/open-source" },
  openGraph: {
    url: "https://stareezy.tech/open-source",
    type: "website",
  },
};

const DATE_FORMATTER = new Intl.DateTimeFormat("en-US", {
  year: "numeric",
  month: "long",
  day: "numeric",
  timeZone: "UTC",
});

export default async function OpenSourcePage() {
  const snapshot = await getOpenSourceContributions();
  const latestMerge = snapshot.contributions[0]?.mergedAt;
  const breadcrumbLd = breadcrumbListJsonLd([
    { name: NAV_LABELS.HOME, url: canonicalUrl(ROUTES.HOME) },
    {
      name: NAV_LABELS.OPEN_SOURCE,
      url: canonicalUrl(ROUTES.OPEN_SOURCE),
    },
  ]);

  return (
    <ContentWidth as="div">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }}
        suppressHydrationWarning
      />

      <section
        aria-labelledby="open-source-page-heading"
        className="oss-masthead"
      >
        <ScrollReveal variant="fade-up">
          <div className="oss-masthead-grid">
            <p className="oss-masthead-index" aria-hidden="true">
              OSS <span>/ 01</span>
            </p>

            <div className="oss-masthead-copy">
              <p className="section-kicker">Public engineering record</p>
              <h1 id="open-source-page-heading" className="oss-masthead-title">
                Code that made it upstream.
              </h1>
            </div>

            <div className="oss-masthead-note">
              <p>
                Merged work in public repositories I do not own. Every entry
                links to the code, discussion, and review that accepted it.
              </p>
              <a
                href="https://github.com/stareezy-1"
                target="_blank"
                rel="noreferrer"
              >
                github.com/stareezy-1
                <ArrowUpRight size={15} strokeWidth={1.7} aria-hidden="true" />
              </a>
            </div>
          </div>
        </ScrollReveal>

        <ScrollReveal variant="fade-up" delay={1}>
          <dl className="oss-vitals" aria-label="Contribution summary">
            <div className="oss-vitals-primary">
              <dt>Accepted patches</dt>
              <dd>{snapshot.contributions.length}</dd>
              <span>Merged / public / externally owned</span>
            </div>
            <div className="oss-vitals-secondary">
              <dt>Upstream repositories</dt>
              <dd>{snapshot.repositoryCount}</dd>
            </div>
            <div className="oss-vitals-secondary">
              <dt>Latest acceptance</dt>
              <dd>
                {latestMerge
                  ? DATE_FORMATTER.format(new Date(latestMerge))
                  : "Unavailable"}
              </dd>
            </div>
          </dl>
        </ScrollReveal>
      </section>

      <section
        aria-labelledby="contribution-index-heading"
        className="page-section page-section--last oss-index"
      >
        <ScrollReveal variant="fade-up">
          <div className="oss-index-intro">
            <div className="oss-index-heading">
              <span className="oss-section-number" aria-hidden="true">
                02
              </span>
              <div>
                <p className="section-kicker">Contribution index</p>
                <h2 id="contribution-index-heading" className="section-h2">
                  The accepted changes
                </h2>
              </div>
            </div>
            {snapshot.generatedAt && (
              <p className="oss-refreshed">
                GitHub snapshot · {DATE_FORMATTER.format(new Date(snapshot.generatedAt))}
              </p>
            )}
          </div>
        </ScrollReveal>

        {snapshot.status === "ready" && snapshot.contributions.length > 0 ? (
          <ContributionLedger contributions={snapshot.contributions} />
        ) : (
          <div className="oss-unavailable">
            <GitPullRequest size={28} strokeWidth={1.5} aria-hidden="true" />
            <div>
              <h2>Live contribution data is unavailable</h2>
              <p>
                GitHub could not provide the cached public contribution feed.
                You can still review the profile directly.
              </p>
            </div>
            <Button asChild variant="outline" className="btn-ghost">
              <a
                href="https://github.com/stareezy-1"
                target="_blank"
                rel="noreferrer"
              >
                View GitHub profile
              </a>
            </Button>
          </div>
        )}
      </section>
    </ContentWidth>
  );
}
