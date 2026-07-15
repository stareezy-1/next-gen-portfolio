"use client";

/**
 * ContactForm — Client Component.
 *
 * Renders the contact form with four fields (Name, Email, Subject, Message),
 * client-side validation via {@link validate}, and submission via
 * {@link submit}. Shows per-field validation errors below each field, a
 * success state after a successful submission, and an error state on
 * submission failure.
 *
 * All state is managed with `useState` — no external state library is needed
 * for this isolated island.
 *
 * @see Requirements 21.1, 21.2, 21.3, 21.4
 */

import { useState } from "react";
import { validate } from "@/services/contact";
import { apiTransport } from "@/services/contact/apiTransport";
import { useAnalytics } from "@/providers/AnalyticsProvider";
import { ANALYTICS_EVENTS } from "@/constants/analytics";
import { AssetPlayer } from "@/components/shared/AssetPlayer";
import type { ContactInput } from "@/types";

/** Initial empty form state. */
const EMPTY_INPUT: ContactInput = {
  name: "",
  email: "",
  subject: "",
  message: "",
};

/**
 * Contact form with validation, submission, success, and error states.
 *
 * Field-level validation errors are shown below each input immediately on
 * submit (Requirement 21.3, 21.4). On successful submission the form is
 * replaced by a success confirmation (Requirement 21.2). On a transport
 * failure a general error message is shown (Requirement 21.2).
 */
export function ContactForm() {
  const { track } = useAnalytics();
  const [input, setInput] = useState<ContactInput>(EMPTY_INPUT);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [status, setStatus] = useState<
    "idle" | "submitting" | "success" | "error"
  >("idle");
  const [generalError, setGeneralError] = useState<string>("");

  /** Update a single field value and clear its error on change. */
  function handleChange(field: keyof ContactInput, value: string) {
    setInput((prev) => ({ ...prev, [field]: value }));
    if (fieldErrors[field]) {
      setFieldErrors((prev) => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    }
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    // Client-side validation first (Req 21.3, 21.4).
    const validation = validate(input);
    if (!validation.ok) {
      setFieldErrors(validation.fieldErrors);
      return;
    }

    setFieldErrors({});
    setStatus("submitting");
    setGeneralError("");

    const result = await apiTransport(input);

    if (result.ok) {
      setStatus("success");
      // Track successful contact submission (Requirement 22.5).
      track(ANALYTICS_EVENTS.CONTACT_SUBMISSION);
    } else {
      setStatus("error");
      // Surface field-level errors (including the reserved `form` key for
      // transport failures) so the UI can render them.
      setFieldErrors(result.fieldErrors);
      setGeneralError(
        result.fieldErrors.form ?? "Something went wrong. Please try again.",
      );
    }
  }

  // Success state — quiet confirmation that matches the site's editorial voice.
  if (status === "success") {
    return (
      <div role="status" aria-live="polite" className="contact-success">
        {/* Lottie send animation */}
        <div className="contact-success-lottie">
          <AssetPlayer
            src="/lottie/send-message.json"
            name="Message sent animation"
            trigger="auto"
            width={140}
            height={140}
          />
        </div>

        {/* Checkmark badge */}
        <div className="contact-success-badge" aria-hidden="true">
          ✓
        </div>

        <div className="contact-success-text">
          <h3 className="contact-success-title">Message received</h3>
          <p className="contact-success-body">
            Thanks for reaching out. I&apos;ll reply within{" "}
            <strong className="contact-success-highlight">24 hours</strong>.
          </p>
        </div>

        <button
          type="button"
          onClick={() => {
            setInput(EMPTY_INPUT);
            setFieldErrors({});
            setGeneralError("");
            setStatus("idle");
          }}
          className="contact-success-reset"
        >
          Send another message
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} noValidate aria-label="Contact form">
      {/* General / transport error */}
      {status === "error" && generalError && (
        <div role="alert" aria-live="assertive" className="contact-form-alert">
          <p>{generalError}</p>
        </div>
      )}

      {/* Name field */}
      <div className="contact-field">
        <label htmlFor="contact-name">
          Name{" "}
          <span aria-hidden="true" className="contact-required">
            *
          </span>
        </label>
        <input
          id="contact-name"
          type="text"
          name="name"
          value={input.name}
          onChange={(e) => handleChange("name", e.target.value)}
          aria-required="true"
          aria-describedby={fieldErrors.name ? "contact-name-error" : undefined}
          aria-invalid={fieldErrors.name ? "true" : undefined}
          autoComplete="name"
          placeholder="Your full name"
        />
        {fieldErrors.name && (
          <p
            id="contact-name-error"
            role="alert"
            className="contact-field-error"
          >
            {fieldErrors.name}
          </p>
        )}
      </div>

      {/* Email field */}
      <div className="contact-field">
        <label htmlFor="contact-email">
          Email{" "}
          <span aria-hidden="true" className="contact-required">
            *
          </span>
        </label>
        <input
          id="contact-email"
          type="email"
          name="email"
          value={input.email}
          onChange={(e) => handleChange("email", e.target.value)}
          aria-required="true"
          aria-describedby={
            fieldErrors.email ? "contact-email-error" : undefined
          }
          aria-invalid={fieldErrors.email ? "true" : undefined}
          autoComplete="email"
          placeholder="you@example.com"
        />
        {fieldErrors.email && (
          <p
            id="contact-email-error"
            role="alert"
            className="contact-field-error"
          >
            {fieldErrors.email}
          </p>
        )}
      </div>

      {/* Subject field */}
      <div className="contact-field">
        <label htmlFor="contact-subject">
          Subject{" "}
          <span aria-hidden="true" className="contact-required">
            *
          </span>
        </label>
        <input
          id="contact-subject"
          type="text"
          name="subject"
          value={input.subject}
          onChange={(e) => handleChange("subject", e.target.value)}
          aria-required="true"
          aria-describedby={
            fieldErrors.subject ? "contact-subject-error" : undefined
          }
          aria-invalid={fieldErrors.subject ? "true" : undefined}
          placeholder="What's this about?"
        />
        {fieldErrors.subject && (
          <p
            id="contact-subject-error"
            role="alert"
            className="contact-field-error"
          >
            {fieldErrors.subject}
          </p>
        )}
      </div>

      {/* Message field */}
      <div className="contact-field contact-field--message">
        <label htmlFor="contact-message">
          Message{" "}
          <span aria-hidden="true" className="contact-required">
            *
          </span>
        </label>
        <textarea
          id="contact-message"
          name="message"
          value={input.message}
          onChange={(e) => handleChange("message", e.target.value)}
          aria-required="true"
          aria-describedby={
            fieldErrors.message ? "contact-message-error" : undefined
          }
          aria-invalid={fieldErrors.message ? "true" : undefined}
          rows={5}
          placeholder="Tell me about your project..."
        />
        {fieldErrors.message && (
          <p
            id="contact-message-error"
            role="alert"
            className="contact-field-error"
          >
            {fieldErrors.message}
          </p>
        )}
      </div>

      <button
        type="submit"
        disabled={status === "submitting"}
        className="contact-submit"
      >
        {status === "submitting" ? "Sending…" : "Send message →"}
      </button>
    </form>
  );
}
