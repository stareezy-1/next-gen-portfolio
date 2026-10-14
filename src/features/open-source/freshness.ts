export const CONTRIBUTION_CACHE_SECONDS = 21_600;

/** A build-time verified record follows the same freshness window as the server cache. */
export function isContributionSnapshotFresh(
  generatedAt: string | null,
  now = Date.now(),
): boolean {
  if (!generatedAt) return false;
  const age = now - Date.parse(generatedAt);
  return (
    Number.isFinite(age) && age >= 0 && age < CONTRIBUTION_CACHE_SECONDS * 1000
  );
}
