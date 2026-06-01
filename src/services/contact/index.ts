/**
 * Contact_Service barrel.
 *
 * Pure validation plus a transport-pluggable submit for contact form messages.
 * `validate` enforces required fields and email format (Requirements 21.3,
 * 21.4); `submit` validates then delegates delivery to an injectable transport
 * (Requirement 21.2). Backs Property 37 (valid → success) and Property 38
 * (invalid → field errors).
 *
 * @see Requirements 21.2, 21.3, 21.4
 */

export { validate, isValidEmail } from "./validate";
export { submit, stubTransport, type ContactTransport } from "./submit";
