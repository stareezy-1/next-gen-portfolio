// Feature: next-gen-portfolio-platform, Property 26: Changed URLs map to acyclic 301 redirects with valid targets
//
// Validates: Requirements 17.3
//
// Property 26: Changed URLs map to acyclic 301 redirects with valid targets.
// For any changed legacy URL, the redirect map emits a 301 redirect whose
// target is a currently served route, and the redirect map contains no cycles.
//
// Contract under test (`@/lib`):
//   buildRedirectMap(pairs): Redirect[]
//     - accepts an Array<{ source, destination }> OR a Record<string,string>;
//     - every produced redirect is permanent (HTTP 301): `permanent === true`.
//   hasCycle(redirects): boolean
//     - true iff the source→destination graph contains any cycle, including a
//       self-loop (a → a) or a longer ring (a → b → a, a → b → c → a, …).
//   validateRedirectMap(redirects, servedRoutes): { ok: true } | { ok: false; error }
//     - { ok: false } when a cycle exists, or when a redirect chain's terminal
//       target is not in `servedRoutes`; otherwise { ok: true }.
//
// Strategy: a discriminated arbitrary produces three scenario shapes, each
// carrying its source→destination pairs and a served-routes set. Distinct path
// namespaces keep the scenarios well-formed by construction:
//   - "/r{n}"       — served routes
//   - "/old-{n}"    — changed legacy sources (never served)
//   - "/c{n}"       — cycle nodes
//   - "/missing-{n}" — an unserved terminal target
//
//   (a) ACYCLIC valid: sources are distinct non-served paths; each destination
//       is either a served route or a STRICTLY-LATER source (forward-only
//       edges ⇒ acyclic, and the highest-index source must land on a served
//       route ⇒ every chain terminates at a served route).
//       Expect hasCycle === false and validateRedirectMap === { ok: true }.
//   (b) CYCLIC: a ring n0 → n1 → … → n0 (length 1 ⇒ self-loop).
//       Expect hasCycle === true and validateRedirectMap === { ok: false } with
//       a non-empty error.
//   (c) INVALID TARGET: a linear (acyclic) chain whose terminal destination is
//       an unserved "/missing-*" path.
//       Expect hasCycle === false and validateRedirectMap === { ok: false }
//       with a non-empty error.
//
// In EVERY shape, buildRedirectMap output has every entry permanent === true
// (301) and one entry per input pair. Each iteration also randomly feeds the
// pairs as either the array form or the equivalent Record form (sources are
// distinct in all shapes, so the record is lossless) to exercise both inputs.
//
// Tooling: Vitest + fast-check, numRuns = 200.
import { describe, expect, it } from "vitest";
import * as fc from "fast-check";

import { buildRedirectMap, hasCycle, validateRedirectMap } from "@/lib";
import type { RedirectPairs } from "@/lib";

/** A source→destination pair before it becomes a `Redirect`. */
interface Pair {
  source: string;
  destination: string;
}

/** The three scenario shapes, tagged for per-shape assertions. */
type Scenario =
  | {
      kind: "acyclic";
      pairs: Pair[];
      servedSet: Set<string>;
      useRecord: boolean;
    }
  | {
      kind: "cyclic";
      pairs: Pair[];
      servedSet: Set<string>;
      useRecord: boolean;
    }
  | {
      kind: "invalid";
      pairs: Pair[];
      servedSet: Set<string>;
      useRecord: boolean;
    };

/** Distinct served-route ids → "/r{n}" paths (a possibly-empty unique set). */
const servedRoutesArb = fc
  .uniqueArray(fc.integer({ min: 0, max: 99 }), { maxLength: 8 })
  .map((ids) => ids.map((i) => `/r${i}`));

/**
 * (a) ACYCLIC valid map. For each of `n` sources "/old-{i}", the destination is
 * either a served route or a strictly-later source "/old-{j}", j > i. The last
 * source is forced onto a served route, so every chain terminates on a served
 * route and all edges point forward ⇒ no cycle. Requires ≥1 served route.
 */
const acyclicArb: fc.Arbitrary<Scenario> = fc
  .record({
    servedIds: fc.uniqueArray(fc.integer({ min: 0, max: 99 }), {
      minLength: 1,
      maxLength: 8,
    }),
    decisions: fc.array(
      fc.record({
        pickServed: fc.boolean(),
        servedPick: fc.nat(),
        laterPick: fc.nat(),
      }),
      { maxLength: 8 },
    ),
    useRecord: fc.boolean(),
  })
  .map(({ servedIds, decisions, useRecord }) => {
    const served = servedIds.map((i) => `/r${i}`);
    const n = decisions.length;
    const pairs: Pair[] = decisions.map((d, i) => {
      const source = `/old-${i}`;
      const laterCount = n - 1 - i;
      // Force a served target for the last source or when chaining is impossible.
      if (i === n - 1 || d.pickServed || laterCount === 0) {
        return {
          source,
          destination: served[d.servedPick % served.length]!,
        };
      }
      const j = i + 1 + (d.laterPick % laterCount);
      return { source, destination: `/old-${j}` };
    });
    return { kind: "acyclic", pairs, servedSet: new Set(served), useRecord };
  });

/**
 * (b) CYCLIC map: a ring of `k` distinct nodes "/c{i}" with edges
 * n_i → n_{(i+1) mod k}. k = 1 yields a self-loop "/c0" → "/c0". The served set
 * is irrelevant to the outcome (the cycle check fails first), so it is left
 * free.
 */
const cyclicArb: fc.Arbitrary<Scenario> = fc
  .record({
    k: fc.integer({ min: 1, max: 6 }),
    servedIds: servedRoutesArb,
    useRecord: fc.boolean(),
  })
  .map(({ k, servedIds, useRecord }) => {
    const nodes = Array.from({ length: k }, (_, i) => `/c${i}`);
    const pairs: Pair[] = nodes.map((source, i) => ({
      source,
      destination: nodes[(i + 1) % k]!,
    }));
    return { kind: "cyclic", pairs, servedSet: new Set(servedIds), useRecord };
  });

/**
 * (c) INVALID TARGET: a linear chain "/old-0" → … → "/old-{n-1}" → terminal,
 * where the terminal is an unserved "/missing-{x}" path. The chain is acyclic
 * (forward-only) but its terminal target is not served, so validation fails for
 * a reason other than a cycle.
 */
const invalidTargetArb: fc.Arbitrary<Scenario> = fc
  .record({
    chainLen: fc.integer({ min: 1, max: 6 }),
    servedIds: servedRoutesArb,
    missingId: fc.integer({ min: 0, max: 99 }),
    useRecord: fc.boolean(),
  })
  .map(({ chainLen, servedIds, missingId, useRecord }) => {
    const sources = Array.from({ length: chainLen }, (_, i) => `/old-${i}`);
    const terminal = `/missing-${missingId}`; // distinct namespace ⇒ never served
    const pairs: Pair[] = sources.map((source, i) => ({
      source,
      destination: i < chainLen - 1 ? sources[i + 1]! : terminal,
    }));
    return { kind: "invalid", pairs, servedSet: new Set(servedIds), useRecord };
  });

/** The discriminated arbitrary over all three scenario shapes. */
const scenarioArb: fc.Arbitrary<Scenario> = fc.oneof(
  acyclicArb,
  cyclicArb,
  invalidTargetArb,
);

/**
 * Feeds the pairs to `buildRedirectMap` as either the array form or the
 * equivalent Record form. Sources are distinct in every shape, so the record is
 * a lossless encoding of the same edges.
 */
function toInput(pairs: Pair[], useRecord: boolean): RedirectPairs {
  if (!useRecord) {
    return pairs;
  }
  return Object.fromEntries(pairs.map((p) => [p.source, p.destination]));
}

describe("Property 26: changed URLs map to acyclic 301 redirects with valid targets", () => {
  it("builds permanent (301) redirects, detects cycles, and validates served terminal targets", () => {
    fc.assert(
      fc.property(scenarioArb, (scenario) => {
        const { pairs, servedSet, useRecord } = scenario;

        const redirects = buildRedirectMap(toInput(pairs, useRecord));

        // Holds for EVERY shape: one redirect per pair, all permanent (301).
        expect(redirects).toHaveLength(pairs.length);
        for (const redirect of redirects) {
          expect(redirect.permanent).toBe(true);
        }

        const cyclic = hasCycle(redirects);
        const result = validateRedirectMap(redirects, servedSet);

        switch (scenario.kind) {
          case "acyclic": {
            // No cycle, and every chain lands on a served route.
            expect(cyclic).toBe(false);
            expect(result).toEqual({ ok: true });
            break;
          }
          case "cyclic": {
            // A cycle exists, so validation fails with a non-empty error.
            expect(cyclic).toBe(true);
            expect(result.ok).toBe(false);
            if (!result.ok) {
              expect(result.error.length).toBeGreaterThan(0);
            }
            break;
          }
          case "invalid": {
            // Acyclic, but the terminal target is not served ⇒ failure for a
            // reason other than a cycle.
            expect(cyclic).toBe(false);
            expect(result.ok).toBe(false);
            if (!result.ok) {
              expect(result.error.length).toBeGreaterThan(0);
            }
            break;
          }
        }
      }),
      { numRuns: 200 },
    );
  });
});
