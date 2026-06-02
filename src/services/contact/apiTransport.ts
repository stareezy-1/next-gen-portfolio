/**
 * API transport for the contact form.
 *
 * POSTs the form data to /api/contact which sends via Resend.
 * Conforms to the ContactTransport interface.
 */

import type { ContactInput, ContactResult } from "@/types";

export async function apiTransport(
  input: ContactInput,
): Promise<ContactResult> {
  const response = await fetch("/api/contact", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });

  if (response.ok) {
    return { ok: true };
  }

  // Try to parse field errors from the API
  try {
    const data = (await response.json()) as {
      fieldErrors?: Record<string, string>;
      error?: string;
    };
    if (data.fieldErrors) {
      return { ok: false, fieldErrors: data.fieldErrors };
    }
    return {
      ok: false,
      fieldErrors: {
        form: data.error ?? "Something went wrong. Please try again.",
      },
    };
  } catch {
    return {
      ok: false,
      fieldErrors: { form: "Something went wrong. Please try again." },
    };
  }
}
