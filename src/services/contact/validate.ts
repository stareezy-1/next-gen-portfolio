/**
 * Contact_Service validation.
 *
 * Pure, side-effect-free validation of a {@link ContactInput}. Every required
 * field must be non-empty after trimming, and the email must match a
 * reasonable email format. The result identifies *every* offending field so
 * the UI can render per-field validation errors (Requirements 21.3, 21.4).
 *
 * Backs Property 38 (invalid input → field errors).
 *
 * @see Requirements 21.3, 21.4
 */

import type { ContactInput, ContactResult } from "@/types";

/** The required fields, in canonical (form) order. */
const REQUIRED_FIELDS = ["name", "email", "subject", "message"] as const;

/**
 * Reasonable email format: a non-empty local part, a single `@`, and a domain
 * with at least one dot-separated label and a 2+ character TLD. Intentionally
 * pragmatic — it rejects clearly malformed addresses (missing `@`, missing
 * domain, whitespace) without attempting full RFC 5322 conformance.
 */
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** Per-field message shown when a required field is empty. */
function missingMessage(field: (typeof REQUIRED_FIELDS)[number]): string {
  const label = field.charAt(0).toUpperCase() + field.slice(1);
  return `${label} is required.`;
}

/**
 * Returns `true` when `value` is a well-formed email address per
 * {@link EMAIL_PATTERN}.
 */
export function isValidEmail(value: string): boolean {
  return EMAIL_PATTERN.test(value.trim());
}

/**
 * Validates a contact submission.
 *
 * - A required field that is empty (or whitespace-only) after trimming yields
 *   its own `fieldErrors` entry (Requirement 21.3).
 * - A non-empty email that does not match the email format yields an `email`
 *   error (Requirement 21.4). When the email is empty, the missing-field error
 *   takes precedence so a single, clear message is shown per field.
 *
 * @param input - The raw contact form fields.
 * @returns `{ ok: true }` when every field is valid; otherwise
 *   `{ ok: false, fieldErrors }` with a message for each offending field.
 */
export function validate(input: ContactInput): ContactResult {
  const fieldErrors: Record<string, string> = {};

  for (const field of REQUIRED_FIELDS) {
    if (input[field].trim().length === 0) {
      fieldErrors[field] = missingMessage(field);
    }
  }

  // Only check email format when a value was provided; an empty email already
  // has its missing-field message above.
  if (fieldErrors.email === undefined && !isValidEmail(input.email)) {
    fieldErrors.email = "Enter a valid email address.";
  }

  if (Object.keys(fieldErrors).length > 0) {
    return { ok: false, fieldErrors };
  }
  return { ok: true };
}
