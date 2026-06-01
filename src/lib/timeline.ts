/**
 * Timeline ordering utilities.
 *
 * Experience and Education entries are presented as chronological timelines
 * ordered most-recent-first by their `startDate`. This module provides a single
 * pure, stable ordering function shared by both timelines.
 *
 * @see Requirements 9.1, 9.4, 10.1
 */

/**
 * Parses an ISO-8601 date string into a comparable epoch-millisecond number.
 *
 * Unparseable dates collapse to `NaN`, which compares as "oldest" so that
 * malformed entries sink to the end of a descending ordering rather than
 * throwing or reordering valid entries unpredictably.
 */
function startMillis(value: string): number {
  return Date.parse(value);
}

/**
 * Returns a new array of entries ordered by `startDate` from most recent to
 * least recent (descending).
 *
 * The sort is **stable**: entries sharing the same parsed `startDate` preserve
 * their original relative order. This is achieved with a decorate-sort-
 * undecorate pass that breaks ties on the original index, so the function is
 * stable regardless of the host engine's `Array.prototype.sort` stability.
 *
 * The input array is never mutated; a new array is always returned.
 *
 * @typeParam T - Any entry shape carrying an ISO-8601 `startDate` string.
 * @param entries - The entries to order.
 * @returns A new array sorted most-recent-first.
 *
 * @example
 * orderByStartDateDesc([
 *   { startDate: "2020-01-01" },
 *   { startDate: "2023-06-01" },
 *   { startDate: "2021-09-01" },
 * ]);
 * // → 2023-06-01, 2021-09-01, 2020-01-01
 */
export function orderByStartDateDesc<T extends { startDate: string }>(
  entries: T[],
): T[] {
  return entries
    .map((entry, index) => ({
      entry,
      index,
      millis: startMillis(entry.startDate),
    }))
    .sort((a, b) => {
      const aMillis = Number.isNaN(a.millis) ? -Infinity : a.millis;
      const bMillis = Number.isNaN(b.millis) ? -Infinity : b.millis;
      if (aMillis !== bMillis) {
        // Descending: larger (more recent) epoch first.
        return bMillis - aMillis;
      }
      // Equal dates: preserve original input order (stable tiebreak).
      return a.index - b.index;
    })
    .map((decorated) => decorated.entry);
}
