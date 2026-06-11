/**
 * Contact page — React Server Component, "The Logbook" direction.
 *
 * Headline-only header. Direct channels are a list with a brand left-border on
 * hover and mono handles. A location item sits beneath. The form is wrapped in
 * a shadcn Card. Zero em-dashes; mono carries the handles and locale.
 */

import type { Metadata } from "next";
import type { CSSProperties } from "react";
import { ContentWidth } from "@/components/layouts";
import { ScrollReveal } from "@/components/shared/ScrollReveal";
import { ContactForm } from "@/features/contact/ContactForm";
import { Card, CardHeader, CardContent } from "@/components/ui/shadcn/card";
import { canonicalUrl } from "@/services/seo";
import { breadcrumbListJsonLd } from "@/services/seo/structured-data";
import { ROUTES, NAV_LABELS } from "@/constants/routes";

export const metadata: Metadata = {
  title: "Contact",
  description:
    "Get in touch with Muhammad Bintang Al Akbar, Senior Front-End and Mobile Engineer based in Jakarta. Open to freelance, consulting, and full-time work.",
  alternates: { canonical: "https://stareezy.tech/contact" },
};

const DIRECT_LINKS: {
  label: string;
  href: string;
  description: string;
  platformColor: string;
}[] = [
  {
    label: "LinkedIn",
    href: "https://www.linkedin.com/in/muhammad-bintang-al-akbar-72302812a/",
    description: "muhammad-bintang-al-akbar",
    platformColor: "#0077b5",
  },
  {
    label: "GitHub",
    href: "https://github.com/stareezy-1",
    description: "github.com/stareezy-1",
    platformColor: "var(--color-brand)",
  },
  {
    label: "Email",
    href: "mailto:bintangmuhammad12@gmail.com",
    description: "bintangmuhammad12@gmail.com",
    platformColor: "#ea4335",
  },
  {
    label: "WhatsApp",
    href: "https://wa.me/6282260820643",
    description: "+62 822-6082-0643",
    platformColor: "#25d366",
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
        suppressHydrationWarning
      />

      {/* ── Page header — no eyebrow ─────────────────────────────────── */}
      <section aria-labelledby="contact-page-heading" className="page-head">
        <ScrollReveal variant="fade-up">
          <h1 id="contact-page-heading" className="page-head-title">
            Tell me what you are building
          </h1>
          <p className="page-head-sub">
            Freelance, full-time, or an open-source collaboration. Send a note
            and I will reply within a day.
          </p>
        </ScrollReveal>
      </section>

      {/* ── Two-column: channels + form ──────────────────────────────── */}
      <div className="contact-layout">
        {/* Left: direct channels */}
        <ScrollReveal variant="fade-up" delay={1} as="div">
          <div className="contact-aside">
            <div>
              <h2 id="direct-contact-heading" className="contact-aside-title">
                Reach me directly
              </h2>
              <p className="contact-aside-sub">
                Pick whichever channel suits you.
              </p>
            </div>

            <nav aria-labelledby="direct-contact-heading">
              <ul className="contact-link-list">
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
                      className="contact-link-item"
                      style={
                        {
                          "--contact-platform-color": link.platformColor,
                        } as CSSProperties
                      }
                    >
                      <div className="contact-link-info">
                        <p className="contact-link-label">{link.label}</p>
                        <p className="contact-link-desc">{link.description}</p>
                      </div>
                    </a>
                  </li>
                ))}
              </ul>
            </nav>

            <div className="contact-location-item">
              <div>
                <p className="contact-location-label">Jakarta, Indonesia</p>
                <p className="contact-location-meta">UTC+7 · open to remote</p>
              </div>
            </div>
          </div>
        </ScrollReveal>

        {/* Right: form in a shadcn Card */}
        <ScrollReveal variant="fade-up" delay={2} as="div">
          <Card className="border-border bg-surface">
            <CardHeader className="px-6 pt-6 pb-1">
              <h2 id="contact-form-heading" className="contact-form-title">
                Send a message
              </h2>
              <p className="contact-form-sub">
                I will get back to you within 24 hours.
              </p>
            </CardHeader>
            <CardContent className="px-6 pb-6 pt-4">
              <ContactForm />
            </CardContent>
          </Card>
        </ScrollReveal>
      </div>
    </ContentWidth>
  );
}
