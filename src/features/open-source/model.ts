export interface OpenSourceRepository {
  readonly name: string;
  readonly nameWithOwner: string;
  readonly owner: string;
  readonly url: string;
  readonly description: string | null;
  readonly primaryLanguage: string | null;
  readonly stargazerCount: number;
}

export interface OpenSourceContribution {
  readonly id: string;
  readonly number: number;
  readonly title: string;
  readonly url: string;
  readonly mergedAt: string;
  readonly additions: number;
  readonly deletions: number;
  readonly changedFiles: number;
  readonly repository: OpenSourceRepository;
}

export interface OpenSourceContributionGroup {
  readonly repository: OpenSourceRepository;
  readonly contributions: readonly OpenSourceContribution[];
}

export interface OpenSourceContributionSnapshot {
  readonly status: "ready" | "unavailable";
  readonly contributions: readonly OpenSourceContribution[];
  readonly repositoryCount: number;
  readonly generatedAt: string | null;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function isNonEmptyString(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

function isGitHubUrl(value: unknown): value is string {
  if (!isNonEmptyString(value)) return false;

  try {
    const url = new URL(value);
    return url.protocol === "https:" && url.hostname === "github.com";
  } catch {
    return false;
  }
}

function nonNegativeInteger(value: unknown): number {
  return typeof value === "number" && Number.isInteger(value) && value >= 0
    ? value
    : 0;
}

/**
 * Convert untrusted GraphQL nodes into the public portfolio model.
 * Privacy and ownership are enforced here even though the search query also
 * asks GitHub for public, merged pull requests.
 */
export function normalizeOpenSourceContributions(
  nodes: readonly unknown[],
  username: string,
): OpenSourceContribution[] {
  const normalizedUsername = username.toLowerCase();
  const contributions: OpenSourceContribution[] = [];

  for (const node of nodes) {
    if (!isRecord(node) || !isRecord(node.repository)) continue;

    const repository = node.repository;
    const owner = isRecord(repository.owner)
      ? repository.owner.login
      : undefined;
    const mergedAt = node.mergedAt;

    if (
      repository.isPrivate !== false ||
      !isNonEmptyString(owner) ||
      owner.toLowerCase() === normalizedUsername ||
      !isNonEmptyString(mergedAt) ||
      Number.isNaN(Date.parse(mergedAt)) ||
      !isNonEmptyString(node.id) ||
      !isNonEmptyString(node.title) ||
      typeof node.number !== "number" ||
      !Number.isInteger(node.number) ||
      !isGitHubUrl(node.url) ||
      !isNonEmptyString(repository.name) ||
      !isNonEmptyString(repository.nameWithOwner) ||
      !isGitHubUrl(repository.url)
    ) {
      continue;
    }

    const primaryLanguage = isRecord(repository.primaryLanguage)
      ? repository.primaryLanguage.name
      : null;

    contributions.push({
      id: node.id,
      number: node.number,
      title: node.title,
      url: node.url,
      mergedAt,
      additions: nonNegativeInteger(node.additions),
      deletions: nonNegativeInteger(node.deletions),
      changedFiles: nonNegativeInteger(node.changedFiles),
      repository: {
        name: repository.name,
        nameWithOwner: repository.nameWithOwner,
        owner,
        url: repository.url,
        description:
          typeof repository.description === "string"
            ? repository.description
            : null,
        primaryLanguage: isNonEmptyString(primaryLanguage)
          ? primaryLanguage
          : null,
        stargazerCount: nonNegativeInteger(repository.stargazerCount),
      },
    });
  }

  return contributions.sort(
    (left, right) => Date.parse(right.mergedAt) - Date.parse(left.mergedAt),
  );
}

/**
 * Group contributions per upstream repository.
 * Repositories are ordered by stargazer count (most starred first) so the page
 * leads with the highest-signal upstreams; contributions inside each repository
 * stay ordered by merge date, newest first.
 */
export function groupOpenSourceContributions(
  contributions: readonly OpenSourceContribution[],
): OpenSourceContributionGroup[] {
  const groups = new Map<string, OpenSourceContribution[]>();

  for (const contribution of contributions) {
    const key = contribution.repository.nameWithOwner;
    const group = groups.get(key);
    if (group) {
      group.push(contribution);
    } else {
      groups.set(key, [contribution]);
    }
  }

  return [...groups.values()]
    .map((items) => ({
      repository: items[0]!.repository,
      contributions: [...items].sort(
        (left, right) => Date.parse(right.mergedAt) - Date.parse(left.mergedAt),
      ),
    }))
    .sort((left, right) => {
      const byStars =
        right.repository.stargazerCount - left.repository.stargazerCount;
      if (byStars !== 0) return byStars;

      const byRecency =
        Date.parse(right.contributions[0]!.mergedAt) -
        Date.parse(left.contributions[0]!.mergedAt);
      if (byRecency !== 0) return byRecency;

      return left.repository.nameWithOwner.localeCompare(
        right.repository.nameWithOwner,
        "en",
      );
    });
}

/**
 * Pick the preview contributions shown on the home page.
 * Ordering follows the open-source page: most starred upstream first, then
 * newest merge inside each repository.
 */
export function selectOpenSourceHighlights(
  contributions: readonly OpenSourceContribution[],
  limit: number,
): OpenSourceContribution[] {
  return groupOpenSourceContributions(contributions)
    .flatMap((group) => group.contributions)
    .slice(0, Math.max(limit, 0));
}
