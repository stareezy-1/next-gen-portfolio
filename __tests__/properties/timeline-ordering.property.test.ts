// Feature: next-gen-portfolio-platform, Property 10: Timeline entries are ordered most-recent-first
//
// Validates: Requirements 9.1, 9.4, 10.1
//
// Property 10: Timeline entries are ordered most-recent-first.
// For any set of Experience entries and any set of Education entries, the
// rendered timeline orders entries by start date from most recent to least
// recent.
//
// Contract under test (`@/lib`):
//   orderByStartDateDesc<T extends { startDate: string }>(entries: T[]): T[]
//     - returns a NEW array sorted by parsed `startDate` descending
//       (most-recent-first);
//     - is STABLE: entries sharing the same parsed `startDate` keep their
//       original relative order;
//     - never mutates the input array.
//
// Both Experience entries and Education entries flow through this single shared
// ordering function, and it is generic over `{ startDate: string }`. A generic
// `{ id, startDate }` shape therefore exercises both timelines: `startDate`
// drives the ordering, and the unique sequential `id` (assigned by input
// position) lets us verify both permutation and stability.
//
// Assertions:
//   (1) Permutation — output length equals input length and the output is the
//       same multiset as the input (verified by comparing both sorted by id).
//   (2) Descending — every adjacent pair satisfies
//       Date.parse(a.startDate) >= Date.parse(b.startDate).
//   (3) Purity — the input array is not mutated (compared against a pre-call
//       deep copy).
//   (4) Stability — for entries with EQUAL startDate, their relative order in
//       the output matches their relative order in the input (checked via id).
//
// Tooling: Vitest + fast-check, numRuns = 100.
import { describe, expect, it } from "vitest";
import * as fc from "fast-check";

import { orderByStartDateDesc } from "@/lib";

/** A generic timeline entry: an ISO `YYYY-MM-DD` start date plus a unique id. */
interface TimelineEntry {
  id: number;
  startDate: string;
}

/**
 * A broad, valid ISO `YYYY-MM-DD` date drawn from a date arbitrary. Covers the
 * full ordering space so the descending assertion is exercised across many
 * distinct dates.
 */
const broadDate = fc
  .date({
    min: new Date("1970-01-01T00:00:00.000Z"),
    max: new Date("2100-12-31T00:00:00.000Z"),
  })
  .map((d) => d.toISOString().slice(0, 10));

/**
 * A small pool of fixed ISO dates. Weighting these heavily guarantees that
 * arrays frequently contain DUPLICATE start dates, which is what exercises the
 * stability assertion. Each is produced via a date arbitrary → toISOString
 * slice, same as the broad generator.
 */
const pooledDate = fc
  .constantFrom(
    new Date("2010-01-01T00:00:00.000Z"),
    new Date("2015-06-15T00:00:00.000Z"),
    new Date("2018-03-01T00:00:00.000Z"),
    new Date("2020-01-01T00:00:00.000Z"),
    new Date("2022-12-31T00:00:00.000Z"),
    new Date("2024-07-04T00:00:00.000Z"),
  )
  .map((d) => d.toISOString().slice(0, 10));

/** Start dates favour the pool (to force ties) but still range broadly. */
const startDate = fc.oneof(
  { weight: 2, arbitrary: pooledDate },
  { weight: 1, arbitrary: broadDate },
);

/**
 * An array of timeline entries. Start dates are generated first, then each is
 * paired with a sequential `id` equal to its input index — so the input's
 * relative order is exactly id-ascending, and ids are unique. Includes the
 * empty-array edge case.
 */
const entriesArb: fc.Arbitrary<TimelineEntry[]> = fc
  .array(startDate, { minLength: 0, maxLength: 20 })
  .map((dates) => dates.map((d, id) => ({ id, startDate: d })));

describe("Property 10: timeline entries are ordered most-recent-first", () => {
  it("orderByStartDateDesc sorts descending, is a stable permutation, and does not mutate", () => {
    fc.assert(
      fc.property(entriesArb, (input) => {
        // Snapshot the input BEFORE calling, to detect mutation (3).
        const before = input.map((e) => ({ ...e }));

        const output = orderByStartDateDesc(input);

        // (1) Permutation: same length and same multiset (compare by id).
        expect(output.length).toBe(input.length);
        const byId = (a: TimelineEntry, b: TimelineEntry) => a.id - b.id;
        expect([...output].sort(byId)).toEqual([...input].sort(byId));

        // (2) Descending by parsed start date for every adjacent pair.
        for (let i = 0; i + 1 < output.length; i++) {
          expect(Date.parse(output[i]!.startDate)).toBeGreaterThanOrEqual(
            Date.parse(output[i + 1]!.startDate),
          );
        }

        // (3) Input array not mutated.
        expect(input).toEqual(before);

        // (4) Stability: within each equal-startDate group, the output ids
        // appear in the same relative order as in the input.
        const distinctDates = new Set(input.map((e) => e.startDate));
        for (const date of distinctDates) {
          const inputIds = input
            .filter((e) => e.startDate === date)
            .map((e) => e.id);
          const outputIds = output
            .filter((e) => e.startDate === date)
            .map((e) => e.id);
          expect(outputIds).toEqual(inputIds);
        }
      }),
      { numRuns: 100 },
    );
  });
});
