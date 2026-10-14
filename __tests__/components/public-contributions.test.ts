import { describe, expect, it, vi } from "vitest";
import {
  requestGitHubContributions,
  requestPublicContributions,
} from "@/features/open-source/github";
import verified from "@/features/open-source/contributions.snapshot.json";

const contribution = verified.contributions[0]!;
const repo = contribution.repository;
const repoUrl = `https://api.github.com/repos/${repo.nameWithOwner}`;
function fixture({
  privateRepo = false,
  author = "stareezy-1",
  mergedAt = contribution.mergedAt as string | null,
  repositoryUrl = repoUrl,
  incomplete = false,
  omitStatistics = false,
} = {}) {
  return vi.fn(async (input: RequestInfo | URL) => {
    const url = String(input);
    if (url.endsWith("/graphql"))
      return Response.json({ message: "Bad credentials" }, { status: 401 });
    if (url.includes("/search/issues?"))
      return Response.json({
        total_count: 1,
        incomplete_results: incomplete,
        items: [
          {
            number: contribution.number,
            repository_url: repositoryUrl,
            user: { login: author },
            pull_request: { merged_at: mergedAt },
          },
        ],
      });
    if (url === repoUrl)
      return Response.json({
        name: repo.name,
        full_name: repo.nameWithOwner,
        private: privateRepo,
        owner: { login: repo.owner },
        html_url: repo.url,
        description: repo.description,
        language: repo.primaryLanguage,
        stargazers_count: repo.stargazerCount,
      });
    return Response.json({
      node_id: contribution.id,
      number: contribution.number,
      title: contribution.title,
      html_url: contribution.url,
      merged_at: mergedAt,
      user: { login: author },
      base: { repo: { full_name: repo.nameWithOwner } },
      additions: contribution.additions,
      deletions: contribution.deletions,
      changed_files: omitStatistics ? undefined : contribution.changedFiles,
    });
  });
}

describe("Public GitHub contribution fallback", () => {
  it("works without a token and preserves verified PR statistics", async () => {
    const fetcher = fixture();
    const result = await requestGitHubContributions(undefined, fetcher);
    expect(result.status).toBe("ready");
    expect(result.repositoryCount).toBe(1);
    expect(result.contributions[0]).toEqual(contribution);
    expect(fetcher).toHaveBeenCalledTimes(3);
  });
  it("falls back after an expired GraphQL token without sending it to public requests", async () => {
    const fetcher = fixture();
    const result = await requestGitHubContributions("test-token", fetcher);
    expect(result.contributions).toHaveLength(1);
    const calls = fetcher.mock.calls as unknown as [string, RequestInit][];
    expect(calls[0]![1].headers).toHaveProperty(
      "Authorization",
      "Bearer test-token",
    );
    for (const [, options] of calls.slice(1))
      expect(options.headers).not.toHaveProperty("Authorization");
  });
  it.each([
    { privateRepo: true },
    { author: "someone-else" },
    { mergedAt: null },
    { omitStatistics: true },
  ])("rejects unverified or incomplete records: %j", async (options) => {
    await expect(
      requestPublicContributions(fixture(options)),
    ).rejects.toThrow();
  });
  it("does not follow arbitrary URLs from search data", async () => {
    const fetcher = fixture({
      repositoryUrl: "https://example.com/repos/owner/project",
    });
    await expect(requestPublicContributions(fetcher)).rejects.toThrow(
      "Unverified",
    );
    expect(fetcher).toHaveBeenCalledTimes(1);
  });
  it("rejects incomplete search and rate limits instead of caching an empty success", async () => {
    await expect(
      requestPublicContributions(fixture({ incomplete: true })),
    ).rejects.toThrow();
    await expect(
      requestPublicContributions(
        vi.fn(async () => Response.json({}, { status: 403 })),
      ),
    ).rejects.toThrow("403");
  });
  it("ships a dated public fallback with external repositories and evidence links", () => {
    expect(Number.isNaN(Date.parse(verified.generatedAt))).toBe(false);
    expect(verified.contributions.length).toBeGreaterThan(0);
    expect(verified.repositoryCount).toBe(
      new Set(verified.contributions.map((c) => c.repository.nameWithOwner))
        .size,
    );
    for (const item of verified.contributions) {
      expect(item.repository.owner).not.toBe("stareezy-1");
      expect(item.url).toBe(
        `https://github.com/${item.repository.nameWithOwner}/pull/${item.number}`,
      );
      expect(Number.isNaN(Date.parse(item.mergedAt))).toBe(false);
    }
  });
});

import { isContributionSnapshotFresh } from "@/features/open-source/freshness";
describe("Contribution snapshot freshness", () => {
  const now = Date.parse("2026-10-14T06:00:00Z");
  it("reuses a verified snapshot within the six-hour cache window", () => {
    expect(isContributionSnapshotFresh("2026-10-14T03:00:00Z", now)).toBe(true);
  });
  it("refreshes at the expiry boundary", () => {
    expect(isContributionSnapshotFresh("2026-10-14T00:00:00Z", now)).toBe(
      false,
    );
  });
  it("rejects missing, invalid and future timestamps", () => {
    for (const value of [null, "invalid", "2026-10-14T07:00:00Z"])
      expect(isContributionSnapshotFresh(value, now)).toBe(false);
  });
});
