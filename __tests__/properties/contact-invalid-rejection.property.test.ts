// Feature: next-gen-portfolio-platform, Property 38: Invalid contact submissions are rejected with field errors
//
// **Validates: Requirements 21.3, 21.4**
//
// Property 38: Invalid contact submissions are rejected with field errors.
// For any contact input missing a required field or containing a malformed
// email address, the Contact_Service rejects the submission and returns a
// field-level error identifying the offending field.
//
// Contract under test (`@/services/contact`):
//   validate(input: ContactInput): ContactResult
//     - Required fields: name, email, subject, message.
//     - Empty or whitespace-only value for any required field → missing-field
//       error for that field (Requirement 21.3).
//     - Non-empty email that does not match the email pattern → email format
//       error (Requirement 21.4).
//     - Returns { ok: false; fieldErrors: Record<string, string> } with a
//       non-empty message for each offending field.
//
// Two discriminated sub-cases are tested:
//   (a) Missing required field: a valid base input has one randomly-chosen
//       field replaced with "" or whitespace. validate must return
//       { ok: false } with fieldErrors[thatField] non-empty.
//   (b) Malformed email: a valid base input has its email replaced with a
//       string that does NOT match the email pattern (no "@", or no domain,
//       etc.). validate must return { ok: false } with fieldErrors.email
//       non-empty.
//
// Tooling: Vitest + fast-check, numRuns = 100.

import { describe, expect, it } from "vitest";
import * as fc from "fast-check";

import { validate } from "@/services/contact";
import type { ContactInput } from "@/types";

// ---------------------------------------------------------------------------
// Arbitraries
// ---------------------------------------------------------------------------

/** A non-empty, non-whitespace string — suitable for valid field values. */
const nonBlankString: fc.Arbitrary<string> = fc
  .string({ minLength: 1, maxLength: 80 })
  .filter((s) => s.trim().length > 0);

/** A well-formed email address that passes the service's EMAIL_PATTERN. */
const validEmail: fc.Arbitrary<string> = fc
  .tuple(
    fc.stringMatching(/^[a-z][a-z0-9]{0,15}$/),
    fc.stringMatching(/^[a-z][a-z0-9]{0,10}$/),
    fc.stringMatching(/^[a-z]{2,6}$/),
  )
  .map(([local, domain, tld]) => `${local}@${domain}.${tld}`);

/** A fully valid ContactInput — all four fields populated and email well-formed. */
const validInput: fc.Arbitrary<ContactInput> = fc.record({
  name: nonBlankString,
  email: validEmail,
  subject: nonBlankString,
  message: nonBlankString,
});

/** The four required field names. */
const REQUIRED_FIELDS = ["name", "email", "subject", "message"] as const;
type RequiredField = (typeof REQUIRED_FIELDS)[number];

/**
 * An empty or whitespace-only string — triggers the missing-field error path.
 * Includes the empty string, a single space, and multi-space/tab strings.
 */
const blankString: fc.Arbitrary<string> = fc.oneof(
  fc.constant(""),
  fc.constant("   "),
  fc.constant("\t"),
  fc.constant("  \t  "),
  fc.stringMatching(/^\s+$/).filter((s) => s.trim().length === 0),
);

/**
 * A malformed email: a string that does NOT match the service's email pattern
 * (^[^\s@]+@[^\s@]+\.[^\s@]+$). We generate strings that are clearly invalid:
 *   - no "@" at all
 *   - "@" present but no domain dot (e.g. "user@nodot")
 *   - starts with "@" (empty local part)
 *   - ends with "@" (empty domain)
 *   - contains whitespace
 */
const malformedEmail: fc.Arbitrary<string> = fc.oneof(
  // No "@" symbol at all
  fc
    .string({ minLength: 1, maxLength: 30 })
    .filter((s) => !s.includes("@") && s.trim().length > 0),
  // Has "@" but no dot in the domain part
  fc
    .tuple(
      fc.stringMatching(/^[a-z]{1,10}$/),
      fc.stringMatching(/^[a-z]{1,10}$/),
    )
    .map(([local, domain]) => `${local}@${domain}`),
  // Starts with "@" — empty local part
  fc.stringMatching(/^[a-z]{1,10}\.[a-z]{2,4}$/).map((domain) => `@${domain}`),
  // Contains a space — whitespace in address
  fc.constant("user name@example.com"),
  fc.constant("user@exam ple.com"),
  // Just "@"
  fc.constant("@"),
  // Missing TLD (ends with dot)
  fc.constant("user@domain."),
);

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe("Property 38: Invalid contact submissions are rejected with field errors", () => {
  it("(a) missing required field → ok:false with fieldErrors[field] non-empty", () => {
    fc.assert(
      fc.property(
        validInput,
        fc.constantFrom(...REQUIRED_FIELDS),
        blankString,
        (base, field: RequiredField, blank) => {
          const input: ContactInput = { ...base, [field]: blank };
          const result = validate(input);

          // Must be rejected
          expect(result.ok).toBe(false);

          if (!result.ok) {
            // The offending field must have a non-empty error message
            expect(result.fieldErrors[field]).toBeTruthy();
            expect(result.fieldErrors[field]!.trim().length).toBeGreaterThan(0);
          }
        },
      ),
      { numRuns: 100 },
    );
  });

  it("(b) malformed email → ok:false with fieldErrors.email non-empty", () => {
    fc.assert(
      fc.property(validInput, malformedEmail, (base, badEmail) => {
        const input: ContactInput = { ...base, email: badEmail };
        const result = validate(input);

        // Must be rejected
        expect(result.ok).toBe(false);

        if (!result.ok) {
          // The email field must have a non-empty error message
          expect(result.fieldErrors["email"]).toBeTruthy();
          expect(result.fieldErrors["email"]!.trim().length).toBeGreaterThan(0);
        }
      }),
      { numRuns: 100 },
    );
  });
});
