import { ExternalLink, GitMerge, Star } from "lucide-react";

import {
  groupOpenSourceContributions,
  type OpenSourceContribution,
} from "./model";

interface ContributionLedgerProps {
  readonly contributions: readonly OpenSourceContribution[];
  readonly variant?: "preview" | "grouped";
}

const DATE_FORMATTER = new Intl.DateTimeFormat("en-US", {
  year: "numeric",
  month: "short",
  day: "numeric",
  timeZone: "UTC",
});

function ContributionRow({
  contribution,
  showRepository,
}: {
  readonly contribution: OpenSourceContribution;
  readonly showRepository: boolean;
}) {
  return (
    <li>
      <a
        href={contribution.url}
        target="_blank"
        rel="noreferrer"
        className="oss-contribution-row"
        aria-label={`${contribution.title}, pull request ${contribution.number} in ${contribution.repository.nameWithOwner}`}
      >
        <span className="oss-pr-ref" aria-hidden="true">
          <GitMerge size={14} strokeWidth={1.7} />
          <span>#{contribution.number}</span>
        </span>
        <span className="oss-contribution-copy">
          {showRepository && (
            <span className="oss-contribution-repo">
              {contribution.repository.nameWithOwner}
            </span>
          )}
          <span className="oss-contribution-title">{contribution.title}</span>
          <span className="oss-contribution-meta">
            <time dateTime={contribution.mergedAt}>
              {DATE_FORMATTER.format(new Date(contribution.mergedAt))}
            </time>
            <span>{contribution.changedFiles} files</span>
            <span className="oss-additions">+{contribution.additions}</span>
            <span className="oss-deletions">−{contribution.deletions}</span>
          </span>
        </span>
        <ExternalLink
          className="oss-contribution-arrow"
          size={17}
          strokeWidth={1.7}
          aria-hidden="true"
        />
      </a>
    </li>
  );
}

export function ContributionLedger({
  contributions,
  variant = "grouped",
}: ContributionLedgerProps) {
  if (variant === "preview") {
    return (
      <ol className="oss-contribution-list oss-contribution-list--preview">
        {contributions.map((contribution) => (
          <ContributionRow
            key={contribution.id}
            contribution={contribution}
            showRepository
          />
        ))}
      </ol>
    );
  }

  const groups = groupOpenSourceContributions(contributions);

  return (
    <div className="oss-repository-list">
      {groups.map((group, index) => (
        <section
          key={group.repository.nameWithOwner}
          className="oss-repository"
          aria-labelledby={`repository-${index}`}
        >
          <header className="oss-repository-head">
            <p className="oss-repository-index">
              <span aria-hidden="true">
                {String(index + 1).padStart(2, "0")}
              </span>
              Upstream repository
            </p>
            <div className="oss-repository-copy">
              <h2 id={`repository-${index}`} className="oss-repository-title">
                <a
                  href={group.repository.url}
                  target="_blank"
                  rel="noreferrer"
                >
                  {group.repository.nameWithOwner}
                  <ExternalLink size={15} strokeWidth={1.7} aria-hidden="true" />
                </a>
              </h2>
              {group.repository.description && (
                <p className="oss-repository-description">
                  {group.repository.description}
                </p>
              )}
            </div>
            <div className="oss-repository-facts" aria-label="Repository facts">
              {group.repository.primaryLanguage && (
                <span>{group.repository.primaryLanguage}</span>
              )}
              <span>
                <Star size={13} strokeWidth={1.8} aria-hidden="true" />
                {group.repository.stargazerCount.toLocaleString("en-US")}
              </span>
              <span>
                {group.contributions.length} merged
              </span>
            </div>
          </header>
          <ol className="oss-contribution-list">
            {group.contributions.map((contribution) => (
              <ContributionRow
                key={contribution.id}
                contribution={contribution}
                showRepository={false}
              />
            ))}
          </ol>
        </section>
      ))}
    </div>
  );
}
