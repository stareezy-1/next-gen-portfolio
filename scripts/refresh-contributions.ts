/** Refresh the checked-in public fallback from verified GitHub API records. */
import { writeFile } from "node:fs/promises";
import { requestPublicContributions } from "../src/features/open-source/github";
const snapshot = await requestPublicContributions();
await writeFile(
  new URL(
    "../src/features/open-source/contributions.snapshot.json",
    import.meta.url,
  ),
  JSON.stringify(snapshot, null, 2) + "\n",
);
console.log(
  `Verified ${snapshot.contributions.length} merged contributions across ${snapshot.repositoryCount} repositories at ${snapshot.generatedAt}`,
);
