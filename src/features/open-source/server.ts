import "server-only";

import { unstable_cache } from "next/cache";

import {
  normalizeOpenSourceContributions,
  type OpenSourceContributionSnapshot,
} from "./model";

const GITHUB_GRAPHQL_URL = "https://api.github.com/graphql";
const GITHUB_USERNAME = "stareezy-1";
const CACHE_SECONDS = 60 * 60 * 6;

const CONTRIBUTIONS_QUERY = `
  query PortfolioOpenSourceContributions($searchQuery: String!) {
    search(query: $searchQuery, type: ISSUE, first: 100) {
      nodes {
        ... on PullRequest {
          id
          number
          title
          url
          mergedAt
          additions
          deletions
          changedFiles
          repository {
            name
            nameWithOwner
            url
            description
            isPrivate
            stargazerCount
            owner {
              login
            }
            primaryLanguage {
              name
            }
          }
        }
      }
    }
  }
`;

interface GraphQLResponse {
  readonly data?: {
    readonly search?: {
      readonly nodes?: readonly unknown[];
    };
  };
  readonly errors?: readonly { readonly message?: string }[];
}

function unavailableSnapshot(): OpenSourceContributionSnapshot {
  return {
    status: "unavailable",
    contributions: [],
    repositoryCount: 0,
    generatedAt: null,
  };
}

async function requestOpenSourceContributions(): Promise<OpenSourceContributionSnapshot> {
  const token = process.env.GITHUB_PORTFOLIO_TOKEN;
  if (!token) return unavailableSnapshot();

  try {
    const response = await fetch(GITHUB_GRAPHQL_URL, {
      method: "POST",
      headers: {
        Accept: "application/vnd.github+json",
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
        "User-Agent": "stareezy.tech",
      },
      body: JSON.stringify({
        query: CONTRIBUTIONS_QUERY,
        variables: {
          searchQuery: `is:pr author:${GITHUB_USERNAME} is:merged is:public sort:updated-desc`,
        },
      }),
      cache: "no-store",
      signal: AbortSignal.timeout(8_000),
    });

    if (!response.ok) return unavailableSnapshot();

    const payload = (await response.json()) as GraphQLResponse;
    if (payload.errors?.length) return unavailableSnapshot();

    const contributions = normalizeOpenSourceContributions(
      payload.data?.search?.nodes ?? [],
      GITHUB_USERNAME,
    );

    return {
      status: "ready",
      contributions,
      repositoryCount: new Set(
        contributions.map((item) => item.repository.nameWithOwner),
      ).size,
      generatedAt: new Date().toISOString(),
    };
  } catch {
    return unavailableSnapshot();
  }
}

// ponytail: GitHub Search returns at most 100 nodes here; add cursor pagination
// if the public, externally-owned merged contribution history exceeds that.
export const getOpenSourceContributions = unstable_cache(
  requestOpenSourceContributions,
  ["portfolio-open-source-contributions-v1"],
  { revalidate: CACHE_SECONDS },
);

