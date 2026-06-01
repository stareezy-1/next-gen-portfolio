// Feature: next-gen-portfolio-platform, Property 39: User actions dispatch the correct analytics event
//
// Validates: Requirements 22.2, 22.3, 22.4, 22.5
//
// Property 39: User actions dispatch the correct analytics event.
// For any tracked user action (activating a project link, activating a GitHub
// link, downloading the resume, successfully submitting the contact form), the
// Analytics_Service records exactly the corresponding event.
//
// Strategy
// --------
// The `analyticsAdapters` array is the mutable dispatch registry that `track`
// fans out across. Before each property iteration the array is cleared and a
// recording sink is pushed in. After calling `track(event, props)` the sink
// must have been called exactly once with the correct event and props.
//
// Two sub-properties are verified:
//
//   (1) CORRECT DISPATCH — for any event name from ANALYTICS_EVENTS and any
//       optional props object, `track` calls the recording sink exactly once
//       with the exact event and props values.
//
//   (2) BEST-EFFORT ISOLATION — when a throwing adapter is inserted BEFORE the
//       recording sink, `track` still calls the recording sink exactly once
//       (the throwing adapter must not prevent dispatch to subsequent adapters).
//
// Arbitraries:
//   - event:  fc.constantFrom(...Object.values(ANALYTICS_EVENTS))
//   - props:  fc.option(fc.dictionary(fc.string(), fc.jsonValue()))
//             (undefined when the option produces null/undefined)
//
// Tooling: Vitest + fast-check, numRuns = 200 (>= 100 required).

import { afterEach, beforeEach, describe, expect, it } from "vitest";
import * as fc from "fast-check";

import { track, analyticsAdapters } from "@/services/analytics";
import { ANALYTICS_EVENTS } from "@/constants";
import type { AnalyticsEvent } from "@/types";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** A recorded call to the sink adapter. */
interface SinkCall {
  event: AnalyticsEvent;
  props: Record<string, unknown> | undefined;
}

/** Clears the adapter registry and installs a fresh recording sink. */
function installSink(): SinkCall[] {
  const calls: SinkCall[] = [];
  // Mutate the exported array in-place so `track` sees the change.
  analyticsAdapters.length = 0;
  analyticsAdapters.push((event, props) => {
    calls.push({ event: event as AnalyticsEvent, props });
  });
  return calls;
}

/** Clears the adapter registry and installs a throwing adapter followed by a recording sink. */
function installThrowingThenSink(): SinkCall[] {
  const calls: SinkCall[] = [];
  analyticsAdapters.length = 0;
  // First adapter always throws — must not block the second.
  analyticsAdapters.push(() => {
    throw new Error("adapter failure");
  });
  analyticsAdapters.push((event, props) => {
    calls.push({ event: event as AnalyticsEvent, props });
  });
  return calls;
}

// ---------------------------------------------------------------------------
// Arbitraries
// ---------------------------------------------------------------------------

/** Any canonical analytics event name. */
const eventArb: fc.Arbitrary<AnalyticsEvent> = fc.constantFrom(
  ...Object.values(ANALYTICS_EVENTS),
) as fc.Arbitrary<AnalyticsEvent>;

/**
 * Optional props: either undefined (no props argument) or a
 * Record<string, unknown> built from a fast-check dictionary.
 *
 * `fc.option` produces `null` for the "absent" case; we normalise that to
 * `undefined` so the test mirrors the real call-site behaviour.
 */
const propsArb: fc.Arbitrary<Record<string, unknown> | undefined> = fc
  .option(
    fc.dictionary(fc.string({ minLength: 1, maxLength: 20 }), fc.jsonValue()),
  )
  .map((v) => (v === null ? undefined : (v as Record<string, unknown>)));

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe("Property 39: User actions dispatch the correct analytics event", () => {
  // Restore the original adapters after the whole suite so other tests are
  // not affected.
  const originalAdapters = [...analyticsAdapters];

  afterEach(() => {
    analyticsAdapters.length = 0;
    originalAdapters.forEach((a) => analyticsAdapters.push(a));
  });

  it("(1) track calls the recording sink exactly once with the correct event and props", () => {
    fc.assert(
      fc.property(eventArb, propsArb, (event, props) => {
        const calls = installSink();

        // Act
        if (props !== undefined) {
          track(event, props);
        } else {
          track(event);
        }

        // Assert: exactly one call, correct event, correct props.
        expect(calls).toHaveLength(1);
        expect(calls[0]!.event).toBe(event);
        expect(calls[0]!.props).toEqual(props);
      }),
      { numRuns: 200 },
    );
  });

  it("(2) track still calls remaining adapters when an earlier adapter throws", () => {
    fc.assert(
      fc.property(eventArb, propsArb, (event, props) => {
        const calls = installThrowingThenSink();

        // Act — must not throw into the test even though the first adapter throws.
        expect(() => {
          if (props !== undefined) {
            track(event, props);
          } else {
            track(event);
          }
        }).not.toThrow();

        // Assert: the recording sink (second adapter) was still called exactly once.
        expect(calls).toHaveLength(1);
        expect(calls[0]!.event).toBe(event);
        expect(calls[0]!.props).toEqual(props);
      }),
      { numRuns: 200 },
    );
  });
});
