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

  // Success state — beautiful confirmation UI
  if (status === "success") {
    return (
      <div
        role="status"
        aria-live="polite"
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          textAlign: "center",
          padding: "2rem 1rem",
          gap: "1.25rem",
          animation: "fadeInUp 0.5s cubic-bezier(0.16,1,0.3,1) both",
        }}
      >
        {/* Lottie send animation */}
        <div style={{ width: "140px", height: "140px" }}>
          <AssetPlayer
            src="/lottie/send-message.json"
            name="Message sent animation"
            trigger="auto"
            width={140}
            height={140}
          />
        </div>

        {/* Checkmark badge */}
        <div
          style={{
            width: "56px",
            height: "56px",
            borderRadius: "50%",
            backgroundColor:
              "color-mix(in srgb, var(--color-brand) 15%, transparent)",
            border: "2px solid var(--color-brand)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "1.5rem",
            boxShadow:
              "0 0 24px color-mix(in srgb, var(--color-brand) 30%, transparent)",
          }}
        >
          ✓
        </div>

        <div
          style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}
        >
          <h3
            style={{
              margin: 0,
              fontSize: "1.375rem",
              fontWeight: 800,
              color: "var(--color-text-primary)",
              letterSpacing: "-0.02em",
            }}
          >
            Message sent!
          </h3>
          <p
            style={{
              margin: 0,
              fontSize: "0.9375rem",
              color: "var(--color-text-secondary)",
              lineHeight: 1.6,
              maxWidth: "320px",
            }}
          >
            Thanks for reaching out. I&apos;ll get back to you within{" "}
            <strong style={{ color: "var(--color-brand)" }}>24 hours</strong>.
          </p>
        </div>

        {/* Response time indicators */}
        <div
          style={{
            display: "flex",
            gap: "0.75rem",
            flexWrap: "wrap",
            justifyContent: "center",
          }}
        >
          {[
            { icon: "📧", text: "Email confirmed" },
            { icon: "⚡", text: "Quick response" },
          ].map((item) => (
            <div
              key={item.text}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "0.375rem",
                padding: "0.3rem 0.75rem",
                borderRadius: "9999px",
                backgroundColor:
                  "color-mix(in srgb, var(--color-brand) 8%, transparent)",
                border:
                  "1px solid color-mix(in srgb, var(--color-brand) 20%, transparent)",
                fontSize: "0.8125rem",
                color: "var(--color-text-secondary)",
              }}
            >
              <span>{item.icon}</span>
              <span>{item.text}</span>
            </div>
          ))}
        </div>

        <button
          type="button"
          onClick={() => {
            setInput(EMPTY_INPUT);
            setFieldErrors({});
            setGeneralError("");
            setStatus("idle");
          }}
          style={{
            marginTop: "0.5rem",
            padding: "0.625rem 1.5rem",
            borderRadius: "0.5rem",
            border: "1px solid var(--color-border)",
            backgroundColor: "var(--color-surface-elevated)",
            color: "var(--color-text-secondary)",
            fontSize: "0.875rem",
            fontWeight: 600,
            cursor: "pointer",
            transition: "border-color 0.2s ease, color 0.2s ease",
          }}
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
        <div role="alert" aria-live="assertive">
          <p>{generalError}</p>
        </div>
      )}

      {/* Name field */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          marginBottom: "1.25rem",
        }}
      >
        <label htmlFor="contact-name">
          Name{" "}
          <span aria-hidden="true" style={{ color: "var(--color-error)" }}>
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
            style={{
              margin: "0.375rem 0 0",
              fontSize: "0.8125rem",
              color: "var(--color-error)",
            }}
          >
            {fieldErrors.name}
          </p>
        )}
      </div>

      {/* Email field */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          marginBottom: "1.25rem",
        }}
      >
        <label htmlFor="contact-email">
          Email{" "}
          <span aria-hidden="true" style={{ color: "var(--color-error)" }}>
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
            style={{
              margin: "0.375rem 0 0",
              fontSize: "0.8125rem",
              color: "var(--color-error)",
            }}
          >
            {fieldErrors.email}
          </p>
        )}
      </div>

      {/* Subject field */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          marginBottom: "1.25rem",
        }}
      >
        <label htmlFor="contact-subject">
          Subject{" "}
          <span aria-hidden="true" style={{ color: "var(--color-error)" }}>
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
            style={{
              margin: "0.375rem 0 0",
              fontSize: "0.8125rem",
              color: "var(--color-error)",
            }}
          >
            {fieldErrors.subject}
          </p>
        )}
      </div>

      {/* Message field */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          marginBottom: "1.5rem",
        }}
      >
        <label htmlFor="contact-message">
          Message{" "}
          <span aria-hidden="true" style={{ color: "var(--color-error)" }}>
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
            style={{
              margin: "0.375rem 0 0",
              fontSize: "0.8125rem",
              color: "var(--color-error)",
            }}
          >
            {fieldErrors.message}
          </p>
        )}
      </div>

      <button
        type="submit"
        disabled={status === "submitting"}
        style={{
          width: "100%",
          padding: "0.75rem 1.5rem",
          borderRadius: "0.5rem",
          backgroundColor: "var(--color-brand)",
          color: "var(--color-background)",
          fontWeight: 700,
          fontSize: "0.9375rem",
          border: "none",
          cursor: status === "submitting" ? "not-allowed" : "pointer",
          opacity: status === "submitting" ? 0.7 : 1,
          transition: "opacity 0.2s ease",
        }}
      >
        {status === "submitting" ? "Sending…" : "Send message →"}
      </button>
    </form>
  );
}
