import { describe, expect, it } from "vitest";
import * as fc from "fast-check";

import {
  groupOpenSourceContributions,
  normalizeOpenSourceContributions,
  selectOpenSourceHighlights,
} from "@/features/open-source";

const USERNAME = "stareezy-1";

function pullRequestNode(options: {
  id?: string;
  number?: number;
  owner?: string;
  isPrivate?: boolean;
  mergedAt?: string | null;
  stargazerCount?: number;
}) {
  const owner = options.owner ?? "expo";
  const number = options.number ?? 1;

  return {
    id: options.id ?? `pr-${number}`,
    number,
    title: `Fix upstream behavior ${number}`,
    url: `https://github.com/${owner}/project/pull/${number}`,
    mergedAt:
      options.mergedAt === undefined
        ? "2026-08-01T12:00:00Z"
        : options.mergedAt,
    additions: 12,
    deletions: 4,
    changedFiles: 2,
    repository: {
      name: "project",
      nameWithOwner: `${owner}/project`,
      url: `https://github.com/${owner}/project`,
      description: "An upstream open-source project",
      isPrivate: options.isPrivate ?? false,
      stargazerCount: options.stargazerCount ?? 100,
      owner: { login: owner },
      primaryLanguage: { name: "TypeScript" },
    },
  };
}

describe("open-source contribution model", () => {
  it("keeps only public, externally-owned, merged pull requests", () => {
    const contributions = normalizeOpenSourceContributions(
      [
        pullRequestNode({ id: "external", owner: "expo" }),
        pullRequestNode({ id: "owned", owner: USERNAME }),
        pullRequestNode({ id: "private", owner: "company", isPrivate: true }),
        pullRequestNode({ id: "open", owner: "raycast", mergedAt: null }),
      ],
      USERNAME,
    );

    expect(contributions.map((item) => item.id)).toEqual(["external"]);
  });

  it("orders accepted contributions by merge date, newest first", () => {
    const contributions = normalizeOpenSourceContributions(
      [
        pullRequestNode({
          id: "older",
          number: 1,
          mergedAt: "2026-07-01T12:00:00Z",
        }),
        pullRequestNode({
          id: "newer",
          number: 2,
          mergedAt: "2026-08-01T12:00:00Z",
        }),
      ],
      USERNAME,
    );

    expect(contributions.map((item) => item.id)).toEqual(["newer", "older"]);
  });

  it("enforces the privacy, ownership, and merge gates for arbitrary nodes", () => {
    const caseArbitrary = fc.record({
      owner: fc.constantFrom(USERNAME, "expo", "raycast"),
      isPrivate: fc.boolean(),
      isMerged: fc.boolean(),
    });

    fc.assert(
      fc.property(
        fc.array(caseArbitrary, { minLength: 0, maxLength: 30 }),
        (cases) => {
          const nodes = cases.map((item, index) =>
            pullRequestNode({
              id: `case-${index}`,
              number: index + 1,
              owner: item.owner,
              isPrivate: item.isPrivate,
              mergedAt: item.isMerged ? "2026-08-01T12:00:00Z" : null,
            }),
          );
          const contributions = normalizeOpenSourceContributions(
            nodes,
            USERNAME,
          );
          const expectedIds = cases
            .map((item, index) => ({ ...item, id: `case-${index}` }))
            .filter(
              (item) =>
                item.owner !== USERNAME && !item.isPrivate && item.isMerged,
            )
            .map((item) => item.id);

          expect(contributions.map((item) => item.id).sort()).toEqual(
            expectedIds.sort(),
          );
        },
      ),
      { numRuns: 100 },
    );
  });

  it("groups contributions by upstream repository, most starred first", () => {
    const contributions = normalizeOpenSourceContributions(
      [
        pullRequestNode({
          id: "expo-new",
          number: 1,
          owner: "expo",
          stargazerCount: 900,
        }),
        pullRequestNode({
          id: "raycast",
          number: 2,
          owner: "raycast",
          mergedAt: "2026-07-02T12:00:00Z",
          stargazerCount: 4_200,
        }),
        pullRequestNode({
          id: "expo-old",
          number: 3,
          owner: "expo",
          mergedAt: "2026-07-01T12:00:00Z",
          stargazerCount: 900,
        }),
      ],
      USERNAME,
    );

    const groups = groupOpenSourceContributions(contributions);

    expect(groups.map((group) => group.repository.nameWithOwner)).toEqual([
      "raycast/project",
      "expo/project",
    ]);
    expect(groups[0]!.contributions).toHaveLength(1);
    expect(groups[1]!.contributions.map((item) => item.id)).toEqual([
      "expo-new",
      "expo-old",
    ]);
  });

  it("keeps repositories with equal stars ordered by most recent merge", () => {
    const contributions = normalizeOpenSourceContributions(
      [
        pullRequestNode({
          id: "raycast",
          number: 1,
          owner: "raycast",
          mergedAt: "2026-07-01T12:00:00Z",
        }),
        pullRequestNode({
          id: "expo",
          number: 2,
          owner: "expo",
          mergedAt: "2026-08-01T12:00:00Z",
        }),
      ],
      USERNAME,
    );

    const groups = groupOpenSourceContributions(contributions);

    expect(groups.map((group) => group.repository.nameWithOwner)).toEqual([
      "expo/project",
      "raycast/project",
    ]);
  });

  it("always orders grouped repositories by stars and items by merge date", () => {
    const nodeArbitrary = fc.record({
      owner: fc.constantFrom("expo", "raycast", "vercel", "withastro"),
      stargazerCount: fc.integer({ min: 0, max: 50_000 }),
      mergedAt: fc
        .integer({ min: 1_700_000_000_000, max: 1_800_000_000_000 })
        .map((millis) => new Date(millis).toISOString()),
    });

    fc.assert(
      fc.property(
        fc.array(nodeArbitrary, { minLength: 1, maxLength: 25 }),
        (cases) => {
          // A repository has one star count, so keep the fixture consistent.
          const starsByOwner = new Map<string, number>();
          for (const item of cases) {
            if (!starsByOwner.has(item.owner)) {
              starsByOwner.set(item.owner, item.stargazerCount);
            }
          }

          const groups = groupOpenSourceContributions(
            normalizeOpenSourceContributions(
              cases.map((item, index) =>
                pullRequestNode({
                  id: `case-${index}`,
                  number: index + 1,
                  owner: item.owner,
                  mergedAt: item.mergedAt,
                  stargazerCount: starsByOwner.get(item.owner)!,
                }),
              ),
              USERNAME,
            ),
          );

          for (let index = 1; index < groups.length; index += 1) {
            expect(
              groups[index - 1]!.repository.stargazerCount,
            ).toBeGreaterThanOrEqual(groups[index]!.repository.stargazerCount);
          }

          for (const group of groups) {
            for (
              let index = 1;
              index < group.contributions.length;
              index += 1
            ) {
              expect(
                Date.parse(group.contributions[index - 1]!.mergedAt),
              ).toBeGreaterThanOrEqual(
                Date.parse(group.contributions[index]!.mergedAt),
              );
            }
          }
        },
      ),
      { numRuns: 100 },
    );
  });

  it("previews highlights by repository popularity, not newest merge", () => {
    const contributions = normalizeOpenSourceContributions(
      [
        pullRequestNode({
          id: "small-newest",
          number: 1,
          owner: "withastro",
          mergedAt: "2026-08-20T12:00:00Z",
          stargazerCount: 120,
        }),
        pullRequestNode({
          id: "popular-older",
          number: 2,
          owner: "raycast",
          mergedAt: "2026-01-05T12:00:00Z",
          stargazerCount: 9_000,
        }),
        pullRequestNode({
          id: "popular-newer",
          number: 3,
          owner: "raycast",
          mergedAt: "2026-02-05T12:00:00Z",
          stargazerCount: 9_000,
        }),
      ],
      USERNAME,
    );

    expect(
      selectOpenSourceHighlights(contributions, 2).map((item) => item.id),
    ).toEqual(["popular-newer", "popular-older"]);
  });

  it("never returns more highlights than the requested limit", () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 0, max: 12 }),
        fc.integer({ min: 0, max: 6 }),
        (total, limit) => {
          const contributions = normalizeOpenSourceContributions(
            Array.from({ length: total }, (_unused, index) =>
              pullRequestNode({
                id: `case-${index}`,
                number: index + 1,
                owner: index % 2 === 0 ? "expo" : "raycast",
                stargazerCount: index % 2 === 0 ? 500 : 5_000,
              }),
            ),
            USERNAME,
          );

          const highlights = selectOpenSourceHighlights(contributions, limit);

          expect(highlights).toHaveLength(Math.min(total, limit));
          for (let index = 1; index < highlights.length; index += 1) {
            expect(
              highlights[index - 1]!.repository.stargazerCount,
            ).toBeGreaterThanOrEqual(
              highlights[index]!.repository.stargazerCount,
            );
          }
        },
      ),
      { numRuns: 100 },
    );
  });
});
