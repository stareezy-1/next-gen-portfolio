// Feature: next-gen-portfolio-platform, Task 1 harness smoke test
//
// This is NOT one of the 47 design correctness properties. It exists only to
// confirm the test harness wiring for Task 1:
//   - Vitest runs under jsdom
//   - fast-check property tests execute (numRuns >= 100)
//   - the `@stareezy-ui/tokens` package is consumed via token *values* only
//
// It can remain as a permanent guard that the foundation stays intact.
import { describe, expect, it } from "vitest";
import * as fc from "fast-check";
import { spacing, motion } from "@stareezy-ui/tokens";

describe("Task 1 harness smoke", () => {
  it("runs a fast-check property with >= 100 runs", () => {
    fc.assert(
      fc.property(fc.integer(), fc.integer(), (a, b) => {
        // commutativity of addition — trivial, just to exercise the runner
        return a + b === b + a;
      }),
      { numRuns: 100 },
    );
  });

  it("consumes @stareezy-ui/tokens through token.value only", () => {
    // spacing tokens expose numeric primitives via `.value`
    expect(typeof spacing[4].value).toBe("number");
    // motion duration tokens expose numeric primitives via `.value`
    expect(typeof motion.duration.normal.value).toBe("number");
    // motion easing tokens expose string primitives via `.value`
    expect(typeof motion.easing.easeOut.value).toBe("string");
  });

  it("jsdom environment is active", () => {
    expect(typeof document).toBe("object");
    expect(typeof window).toBe("object");
  });
});
