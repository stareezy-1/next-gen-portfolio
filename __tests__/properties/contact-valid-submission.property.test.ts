// Feature: next-gen-portfolio-platform, Property 37: Valid contact submissions succeed
//
// Validates: Requirements 21.2
//
// Property 37: Valid contact submissions succeed.
// For any contact input with all required fields populated and a well-formed
// email address, the Contact_Service validation passes and submission returns
// a success result.
//
// Strategy
// --------
// Generate valid ContactInput objects where:
//   - name, subject, message are non-empty strings (trimmed length > 0)
//   - email matches the service's accepted pattern: [^\s@]+@[^\s@]+\.[^\s@]+
//     (generated via fc.emailAddress() which produces RFC-compliant addresses
//     that satisfy this pattern)
//
// Assertions:
//   (1) validate(input) returns { ok: true }
//   (2) submit(input) (async) returns { ok: true }
//
// Tooling: Vitest + fast-check, numRuns = 100 (>= 100 required).

import { describe, expect, it } from "vitest";
import * as fc from "fast-check";

import { validate, submit } from "@/services/contact";
import type { ContactInput } from "@/types";

// --- Generators -------------------------------------------------------------

/**
 * A non-empty string with trimmed length > 0. We filter out strings that are
 * purely whitespace so the service's trim-then-check logic always sees content.
 */
const nonEmptyStringArb: fc.Arbitrary<string> = fc
  .string({ minLength: 1, maxLength: 80 })
  .filter((s) => s.trim().length > 0);

/**
 * A valid email address. fc.emailAddress() produces addresses that conform to
 * the [^\s@]+@[^\s@]+\.[^\s@]+ pattern accepted by the Contact_Service.
 */
const validEmailArb: fc.Arbitrary<string> = fc.emailAddress();

/**
 * A fully valid ContactInput: all four required fields are non-empty and the
 * email is well-formed.
 */
const validContactInputArb: fc.Arbitrary<ContactInput> = fc.record({
  name: nonEmptyStringArb,
  email: validEmailArb,
  subject: nonEmptyStringArb,
  message: nonEmptyStringArb,
});

// --- Property ---------------------------------------------------------------

describe("Property 37: Valid contact submissions succeed", () => {
  it("validate returns { ok: true } for any valid input", () => {
    fc.assert(
      fc.property(validContactInputArb, (input) => {
        const result = validate(input);
        expect(result.ok).toBe(true);
      }),
      { numRuns: 100 },
    );
  });

  it("submit returns { ok: true } for any valid input (async)", async () => {
    await fc.assert(
      fc.asyncProperty(validContactInputArb, async (input) => {
        const result = await submit(input);
        expect(result.ok).toBe(true);
      }),
      { numRuns: 100 },
    );
  });
});
