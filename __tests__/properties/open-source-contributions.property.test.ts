import { describe, expect, it } from "vitest";
import * as fc from "fast-check";

import {
  groupOpenSourceContributions,
  normalizeOpenSourceContributions,
} from "@/features/open-source";

const USERNAME = "stareezy-1";

function pullRequestNode(options: {
  id?: string;
  number?: number;
  owner?: string;
  isPrivate?: boolean;
  mergedAt?: string | null;
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
      stargazerCount: 100,
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

  it("groups contributions by upstream repository in first-seen order", () => {
    const contributions = normalizeOpenSourceContributions(
      [
        pullRequestNode({ id: "expo-new", number: 1, owner: "expo" }),
        pullRequestNode({
          id: "raycast",
          number: 2,
          owner: "raycast",
          mergedAt: "2026-07-02T12:00:00Z",
        }),
        pullRequestNode({
          id: "expo-old",
          number: 3,
          owner: "expo",
          mergedAt: "2026-07-01T12:00:00Z",
        }),
      ],
      USERNAME,
    );

    const groups = groupOpenSourceContributions(contributions);

    expect(groups.map((group) => group.repository.nameWithOwner)).toEqual([
      "expo/project",
      "raycast/project",
    ]);
    expect(groups[0]!.contributions).toHaveLength(2);
    expect(groups[1]!.contributions).toHaveLength(1);
  });
});

