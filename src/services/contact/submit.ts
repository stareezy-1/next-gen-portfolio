/**
 * Contact_Service submission.
 *
 * `submit` first validates the input (reusing {@link validate}). Invalid input
 * is rejected with the validation failure (Requirements 21.3, 21.4). Valid
 * input is handed to a {@link ContactTransport} that performs the actual send.
 *
 * The transport is injectable so a real network implementation (an API route,
 * email service, etc.) can be plugged in later without changing callers. The
 * default transport is a stub that resolves success, which is sufficient for
 * the property tests (Property 37) and the initial UI wiring (Requirement
 * 21.2).
 *
 * @see Requirements 21.2, 21.3, 21.4
 */

import type { ContactInput, ContactResult } from "@/types";
import { validate } from "./validate";

/**
 * Performs the side-effecting delivery of an already-validated contact
 * message. Implementations should resolve `{ ok: true }` on success and
 * `{ ok: false, fieldErrors }` on failure (a transport failure is surfaced
 * under the reserved `form` key so the UI can show a general error state).
 */
export type ContactTransport = (input: ContactInput) => Promise<ContactResult>;

/**
 * Default transport stub. Resolves success without performing any network
 * I/O. Replace via the `transport` argument to {@link submit} to wire a real
 * backend.
 */
export const stubTransport: ContactTransport = async () => ({ ok: true });

/**
 * Validates then submits a contact message.
 *
 * @param input - The raw contact form fields.
 * @param transport - Delivery mechanism for valid input. Defaults to
 *   {@link stubTransport}.
 * @returns `{ ok: true }` on a successful submission. Returns the validation
 *   failure when the input is invalid, or a `{ ok: false, fieldErrors }`
 *   result keyed by `form` when the transport itself fails.
 */
export async function submit(
  input: ContactInput,
  transport: ContactTransport = stubTransport,
): Promise<ContactResult> {
  const validation = validate(input);
  if (!validation.ok) {
    return validation;
  }

  try {
    return await transport(input);
  } catch {
    // Transport failure → general, consistent ContactResult shape. The UI
    // renders this under the reserved `form` key (error-state asset, Req 25.8).
    return {
      ok: false,
      fieldErrors: { form: "Something went wrong. Please try again." },
    };
  }
}
