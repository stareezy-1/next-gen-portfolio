import { z } from "zod";
import {
  normalizeOpenSourceContributions,
  type OpenSourceContributionSnapshot,
} from "./model";

const API = "https://api.github.com";
export const CONTRIBUTION_USERNAME = "stareezy-1";
const PAGE_SIZE = 100;
const MAX_PAGES = 10;
const CONCURRENCY = 4;
const REQUEST_TIMEOUT = 15_000;
const HEADERS = {
  Accept: "application/vnd.github+json",
  "User-Agent": "stareezy-portfolio",
};
const CONTRIBUTIONS_QUERY = `
  query PortfolioOpenSourceContributions($searchQuery: String!) {
    search(query: $searchQuery, type: ISSUE, first: 100) {
      pageInfo { hasNextPage }
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

type Fetcher = typeof fetch;
const identity = z.object({ login: z.string().min(1) });
const searchItem = z.object({
  number: z.number().int().positive(),
  repository_url: z.string(),
  user: identity,
  pull_request: z.object({ merged_at: z.string().nullable() }),
});
const searchResponse = z.object({
  items: z.array(searchItem),
  total_count: z.number().int().nonnegative(),
  incomplete_results: z.literal(false),
});
const repositoryResponse = z.object({
  name: z.string().min(1),
  full_name: z.string().min(1),
  private: z.boolean(),
  owner: identity,
  html_url: z.string().url(),
  description: z.string().nullable(),
  language: z.string().nullable(),
  stargazers_count: z.number().int().nonnegative(),
});
const pullResponse = z.object({
  node_id: z.string().min(1),
  number: z.number().int().positive(),
  title: z.string().min(1),
  html_url: z.string().url(),
  merged_at: z.string().nullable(),
  user: identity,
  base: z.object({ repo: z.object({ full_name: z.string() }) }),
  additions: z.number().int().nonnegative(),
  deletions: z.number().int().nonnegative(),
  changed_files: z.number().int().nonnegative(),
});
const graphResponse = z.object({
  errors: z.array(z.unknown()).optional(),
  data: z
    .object({
      search: z.object({
        nodes: z.array(z.unknown()),
        pageInfo: z.object({ hasNextPage: z.boolean() }),
      }),
    })
    .optional(),
});

function snapshot(nodes: unknown[]): OpenSourceContributionSnapshot {
  const contributions = normalizeOpenSourceContributions(
    nodes,
    CONTRIBUTION_USERNAME,
  );
  if (nodes.length > 0 && contributions.length === 0)
    throw new Error("No verified contribution records");
  return {
    status: "ready",
    contributions,
    repositoryCount: new Set(
      contributions.map((item) => item.repository.nameWithOwner),
    ).size,
    generatedAt: new Date().toISOString(),
  };
}

async function mapBounded<T, R>(
  items: T[],
  transform: (item: T) => Promise<R>,
): Promise<R[]> {
  const results: R[] = new Array(items.length);
  let cursor = 0;
  await Promise.all(
    Array.from({ length: Math.min(CONCURRENCY, items.length) }, async () => {
      while (cursor < items.length) {
        const index = cursor++;
        results[index] = await transform(items[index]!);
      }
    }),
  );
  return results;
}

/** Public REST fallback validates each repository and PR before publishing it. */
export async function requestPublicContributions(
  fetcher: Fetcher = fetch,
): Promise<OpenSourceContributionSnapshot> {
  const signal = AbortSignal.timeout(REQUEST_TIMEOUT);
  async function get(url: string): Promise<unknown> {
    const response = await fetcher(url, {
      headers: HEADERS,
      cache: "no-store",
      signal,
    });
    if (!response.ok)
      throw new Error(`GitHub public API returned ${response.status}`);
    const data: unknown = await response.json();
    return data;
  }
  const items: z.infer<typeof searchItem>[] = [];
  for (let page = 1; page <= MAX_PAGES; page++) {
    const query = new URLSearchParams({
      q: `is:pr author:${CONTRIBUTION_USERNAME} is:merged is:public -user:${CONTRIBUTION_USERNAME}`,
      sort: "updated",
      order: "desc",
      per_page: String(PAGE_SIZE),
      page: String(page),
    });
    const data = searchResponse.parse(
      await get(`${API}/search/issues?${query}`),
    );
    items.push(...data.items);
    if (items.length >= data.total_count) break;
    if (page === MAX_PAGES || data.items.length === 0)
      throw new Error("GitHub result set exceeds supported search window");
  }
  const repositoryRequests = new Map<
    string,
    Promise<z.infer<typeof repositoryResponse>>
  >();
  const nodes = await mapBounded(items, async (item) => {
    const match =
      typeof item.repository_url === "string" &&
      item.repository_url.match(
        /^https:\/\/api\.github\.com\/repos\/([\w.-]+)\/([\w.-]+)$/,
      );
    if (
      !match ||
      !Number.isInteger(item.number) ||
      item.number <= 0 ||
      item.user?.login?.toLowerCase() !== CONTRIBUTION_USERNAME ||
      !item.pull_request?.merged_at
    )
      throw new Error("Unverified GitHub search item");
    const [, owner, name] = match;
    const repoPath = `${API}/repos/${owner}/${name}`;
    let repositoryRequest = repositoryRequests.get(repoPath);
    if (!repositoryRequest) {
      repositoryRequest = get(repoPath).then((value) =>
        repositoryResponse.parse(value),
      );
      repositoryRequests.set(repoPath, repositoryRequest);
    }
    const [repository, pr] = await Promise.all([
      repositoryRequest,
      get(`${repoPath}/pulls/${item.number}`).then((value) =>
        pullResponse.parse(value),
      ),
    ]);
    if (
      repository.private !== false ||
      repository.full_name !== `${owner}/${name}` ||
      repository.owner?.login?.toLowerCase() === CONTRIBUTION_USERNAME ||
      pr.user?.login?.toLowerCase() !== CONTRIBUTION_USERNAME ||
      !pr.merged_at ||
      pr.base?.repo?.full_name !== repository.full_name ||
      pr.number !== item.number
    )
      throw new Error("Unverified public merged pull request");
    return {
      id: pr.node_id,
      number: pr.number,
      title: pr.title,
      url: pr.html_url,
      mergedAt: pr.merged_at,
      additions: pr.additions,
      deletions: pr.deletions,
      changedFiles: pr.changed_files,
      repository: {
        name: repository.name,
        nameWithOwner: repository.full_name,
        owner: { login: repository.owner.login },
        url: repository.html_url,
        isPrivate: repository.private,
        description: repository.description,
        stargazerCount: repository.stargazers_count,
        primaryLanguage: repository.language
          ? { name: repository.language }
          : null,
      },
    };
  });
  const result = snapshot(nodes);
  if (result.contributions.length !== items.length)
    throw new Error("GitHub returned invalid contribution records");
  return result;
}

/** GraphQL remains the preferred authenticated path; public reads need no secret. */
export async function requestGitHubContributions(
  token?: string,
  fetcher: Fetcher = fetch,
): Promise<OpenSourceContributionSnapshot> {
  if (token) {
    try {
      const response = await fetcher(`${API}/graphql`, {
        method: "POST",
        headers: {
          ...HEADERS,
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          query: CONTRIBUTIONS_QUERY,
          variables: {
            searchQuery: `is:pr author:${CONTRIBUTION_USERNAME} is:merged is:public -user:${CONTRIBUTION_USERNAME} sort:updated-desc`,
          },
        }),
        cache: "no-store",
        signal: AbortSignal.timeout(REQUEST_TIMEOUT),
      });
      if (response.ok) {
        const parsed = graphResponse.safeParse(await response.json());
        if (
          parsed.success &&
          !parsed.data.errors?.length &&
          parsed.data.data &&
          !parsed.data.data.search.pageInfo.hasNextPage
        )
          return snapshot(parsed.data.data.search.nodes);
      }
    } catch {
      /* Try the public endpoint when authentication or GraphQL fails. */
    }
  }
  return requestPublicContributions(fetcher);
}
