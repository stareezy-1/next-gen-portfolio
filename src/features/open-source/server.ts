import "server-only";
import { unstable_cache } from "next/cache";
import { requestGitHubContributions } from "./github";
import {
  CONTRIBUTION_CACHE_SECONDS,
  isContributionSnapshotFresh,
} from "./freshness";
import verifiedSnapshot from "./contributions.snapshot.json";
import type { OpenSourceContributionSnapshot } from "./model";

// Only successful requests enter the cache. A missing token uses public REST.
const getLiveSnapshot = unstable_cache(
  () => requestGitHubContributions(process.env.GITHUB_PORTFOLIO_TOKEN),
  ["portfolio-open-source-contributions-v2"],
  { revalidate: CONTRIBUTION_CACHE_SECONDS },
);

export async function getOpenSourceContributions(): Promise<OpenSourceContributionSnapshot> {
  // Reuse the public record fetched by the refresh script while it is within TTL.
  // This avoids spending anonymous GitHub quota on identical startup requests.
  if (isContributionSnapshotFresh(verifiedSnapshot.generatedAt))
    return { ...verifiedSnapshot, status: "ready" };
  try {
    return await getLiveSnapshot();
  } catch {
    // Public records verified by scripts/refresh-contributions.ts, never fixtures.
    return { ...verifiedSnapshot, status: "stale" };
  }
}
