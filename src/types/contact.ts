/**
 * Contact data models for the Contact_Service.
 *
 * @see Requirements 21.2, 21.3, 21.4
 */

/** The fields submitted through the contact form. */
export interface ContactInput {
  name: string;
  email: string;
  subject: string;
  message: string;
}

/**
 * Outcome of validating or submitting a contact message. On failure,
 * `fieldErrors` maps each offending field name to a message.
 */
export type ContactResult =
  | { ok: true }
  | { ok: false; fieldErrors: Record<string, string> };
