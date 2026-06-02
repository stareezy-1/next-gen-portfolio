/**
 * Contact page — React Server Component.
 * @see Requirements 21.1–21.5
 */

import type { Metadata } from "next";
import { ContentWidth } from "@/components/layouts";
import { MotionWrapper } from "@/components/shared/MotionWrapper";
import { ScrollReveal } from "@/components/shared/ScrollReveal";
import { ContactForm } from "@/features/contact/ContactForm";
import { canonicalUrl } from "@/services/seo";
import { breadcrumbListJsonLd } from "@/services/seo/structured-data";
import { ROUTES, NAV_LABELS } from "@/constants/routes";

export const metadata: Metadata = {
  title: "Contact",
  description:
    "Get in touch with Muhammad Bintang Al Akbar — Senior Front-End & Mobile Engineer based in Jakarta, Indonesia. Available for freelance, consulting, and full-time opportunities.",
  alternates: { canonical: "https://stareezy.tech/contact" },
};

const DIRECT_LINKS = [
  {
    label: "LinkedIn",
    href: "https://www.linkedin.com/in/muhammad-bintang-al-akbar-72302812a/",
    icon: "in",
    description: "muhammad-bintang-al-akbar",
    color: "#0077b5",
  },
  {
    label: "GitHub",
    href: "https://github.com/stareezy-1",
    icon: "⌥",
    description: "github.com/stareezy-1",
    color: "var(--color-brand)",
  },
  {
    label: "Email",
    href: "mailto:bintangmuhammad12@gmail.com",
    icon: "✉",
    description: "bintangmuhammad12@gmail.com",
    color: "#ea4335",
  },
  {
    label: "WhatsApp",
    href: "https://wa.me/6282260820643",
    icon: "◈",
    description: "+62 822-6082-0643",
    color: "#25d366",
  },
];

export default function ContactPage() {
  const breadcrumbLd = breadcrumbListJsonLd([
    { name: NAV_LABELS.HOME, url: canonicalUrl(ROUTES.HOME) },
    { name: NAV_LABELS.CONTACT, url: canonicalUrl(ROUTES.CONTACT) },
  ]);

  return (
    <ContentWidth as="main">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }}
      />

      {/* Page header */}
      <div
        style={{
          paddingTop: "4rem",
          paddingBottom: "3rem",
          borderBottom: "1px solid var(--color-border)",
        }}
      >
        <ScrollReveal variant="fade-up">
          <p
            style={{
              fontSize: "0.75rem",
              fontWeight: 700,
              textTransform: "uppercase",
              letterSpacing: "0.12em",
              color: "var(--color-brand)",
              marginBottom: "0.75rem",
            }}
          >
            Contact
          </p>
          <h1 style={{ marginBottom: "1rem" }}>Let&apos;s work together</h1>
          <p
            style={{
              fontSize: "1.0625rem",
              color: "var(--color-text-secondary)",
              lineHeight: 1.7,
              maxWidth: "560px",
              margin: 0,
            }}
          >
            Have a project in mind or just want to say hello? I&apos;d love to
            hear from you. I typically respond within 24 hours.
          </p>
        </ScrollReveal>
      </div>

      {/* Two-column layout — stacks on mobile */}
      <div
        style={{
          paddingTop: "3rem",
          paddingBottom: "5rem",
          display: "grid",
          gridTemplateColumns: "minmax(0, 1fr) minmax(0, 1.6fr)",
          gap: "3rem",
          alignItems: "start",
        }}
        className="two-col-layout"
      >
        {/* Left: direct links */}
        <ScrollReveal variant="fade-left" delay={1}>
          <div
            style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}
          >
            <div>
              <h2
                id="direct-contact-heading"
                style={{ marginBottom: "0.5rem", fontSize: "1.125rem" }}
              >
                Reach me directly
              </h2>
              <p
                style={{
                  margin: 0,
                  fontSize: "0.9375rem",
                  color: "var(--color-text-secondary)",
                  lineHeight: 1.6,
                }}
              >
                Pick your preferred channel.
              </p>
            </div>

            <nav aria-labelledby="direct-contact-heading">
              <ul
                style={{
                  listStyle: "none",
                  margin: 0,
                  padding: 0,
                  display: "flex",
                  flexDirection: "column",
                  gap: "0.75rem",
                }}
              >
                {DIRECT_LINKS.map((link) => (
                  <li key={link.label}>
                    <a
                      href={link.href}
                      target={
                        link.href.startsWith("http") ? "_blank" : undefined
                      }
                      rel={
                        link.href.startsWith("http")
                          ? "noopener noreferrer"
                          : undefined
                      }
                      aria-label={link.label}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "1rem",
                        padding: "0.875rem 1.125rem",
                        backgroundColor: "var(--color-surface)",
                        border: "1px solid var(--color-border)",
                        borderRadius: "0.75rem",
                        textDecoration: "none",
                        color: "inherit",
                        transition:
                          "border-color 0.2s ease, transform 0.15s ease",
                      }}
                    >
                      <span
                        style={{
                          width: "40px",
                          height: "40px",
                          borderRadius: "0.5rem",
                          flexShrink: 0,
                          backgroundColor: `color-mix(in srgb, ${link.color} 12%, transparent)`,
                          border: `1px solid color-mix(in srgb, ${link.color} 25%, transparent)`,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontSize: "0.9375rem",
                          fontWeight: 700,
                          color: link.color,
                        }}
                      >
                        {link.icon}
                      </span>
                      <div style={{ minWidth: 0 }}>
                        <p
                          style={{
                            margin: 0,
                            fontWeight: 600,
                            fontSize: "0.9375rem",
                          }}
                        >
                          {link.label}
                        </p>
                        <p
                          style={{
                            margin: 0,
                            fontSize: "0.8125rem",
                            color: "var(--color-text-muted)",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            whiteSpace: "nowrap",
                          }}
                        >
                          {link.description}
                        </p>
                      </div>
                    </a>
                  </li>
                ))}
              </ul>
            </nav>

            {/* Location card */}
            <div
              style={{
                padding: "1.25rem",
                backgroundColor: "var(--color-surface)",
                border: "1px solid var(--color-border)",
                borderRadius: "0.75rem",
                display: "flex",
                alignItems: "center",
                gap: "0.875rem",
              }}
            >
              <span
                style={{
                  width: "40px",
                  height: "40px",
                  borderRadius: "0.5rem",
                  flexShrink: 0,
                  backgroundColor:
                    "color-mix(in srgb, var(--color-accent) 12%, transparent)",
                  border:
                    "1px solid color-mix(in srgb, var(--color-accent) 25%, transparent)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "1.125rem",
                }}
              >
                📍
              </span>
              <div>
                <p
                  style={{ margin: 0, fontWeight: 600, fontSize: "0.9375rem" }}
                >
                  Jakarta, Indonesia
                </p>
                <p
                  style={{
                    margin: 0,
                    fontSize: "0.8125rem",
                    color: "var(--color-text-muted)",
                  }}
                >
                  UTC+7 · Open to remote
                </p>
              </div>
            </div>
          </div>
        </ScrollReveal>

        {/* Right: contact form */}
        <ScrollReveal variant="fade-right" delay={2}>
          <div
            style={{
              backgroundColor: "var(--color-surface)",
              border: "1px solid var(--color-border)",
              borderRadius: "1rem",
              padding: "2rem",
            }}
          >
            <h2
              id="contact-form-heading"
              style={{ marginBottom: "0.375rem", fontSize: "1.125rem" }}
            >
              Send a message
            </h2>
            <p
              style={{
                margin: "0 0 1.5rem",
                fontSize: "0.875rem",
                color: "var(--color-text-secondary)",
              }}
            >
              I&apos;ll get back to you within 24 hours.
            </p>
            <ContactForm />
          </div>
        </ScrollReveal>
      </div>
    </ContentWidth>
  );
}
