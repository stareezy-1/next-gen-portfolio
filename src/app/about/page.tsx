/**
 * About page — React Server Component, "The Logbook" direction.
 *
 * Portrait intro with a thin brand rule (echoing the home hero), a reading-width
 * editorial narrative with Space Grotesk subheads, capabilities grouped into
 * mono columns, and a small languages row. Eyebrow budget: 1 on the whole page.
 * Zero em-dashes. All layout/type/color lives in pages.styles.css.
 */

import type { Metadata } from "next";
import Image from "next/image";
import { ContentWidth } from "@/components/layouts";
import { ScrollReveal } from "@/components/shared/ScrollReveal";
import { Badge } from "@/components/ui/shadcn/badge";
import { canonicalUrl } from "@/services/seo";
import {
  personJsonLd,
  breadcrumbListJsonLd,
} from "@/services/seo/structured-data";
import { SITE_DESCRIPTION } from "@/constants/seo";
import { ROUTES, NAV_LABELS } from "@/constants/routes";

export const metadata: Metadata = {
  title: "About",
  description:
    "Muhammad Bintang Al Akbar, Front-End and AI-Native Engineer based in Jakarta. WSA Global Winner 2025. Four years building cross-platform products with React, TypeScript, and the Cloudflare edge, plus an MCP server and open-source Claude skills.",
  alternates: { canonical: "https://stareezy.tech/about" },
};

/** Capability groups, by what they do. Mono lists, no skill levels. */
const CAPABILITIES: { label: string; items: string[] }[] = [
  {
    label: "Frontend & mobile",
    items: [
      "React",
      "React Native",
      "Expo",
      "Expo React Native Web",
      "Next.js",
      "TypeScript",
      "Tailwind CSS",
      "PWA",
    ],
  },
  {
    label: "Architecture & state",
    items: [
      "Design Token Systems",
      "Compile-time CSS Extraction",
      "O(1) Registries",
      "Zustand",
      "Redux (Thunk)",
      "MobX",
      "SWR",
    ],
  },
  {
    label: "Testing & automation",
    items: [
      "Jest",
      "Vitest",
      "Katalon Studio",
      "E2E Testing",
      "Regression Validation",
      "Component Testing",
    ],
  },
  {
    label: "Cloud & delivery",
    items: [
      "Cloudflare",
      "AWS Amplify",
      "EAS Build",
      "EAS Submit",
      "App Store Connect",
      "Google Play Console",
      "CI/CD",
    ],
  },
  {
    label: "Backend & data",
    items: [
      "Go",
      "Hono.js",
      ".NET Core",
      "C#",
      "PHP",
      "Microsoft SQL Server",
      "MySQL",
    ],
  },
  {
    label: "AI & developer tooling",
    items: [
      "MCP Servers",
      "Claude Skills",
      "LLM Integration",
      "Prompt Engineering",
      "RAG",
      "AI-Assisted Workflows",
    ],
  },
  {
    label: "Working with teams",
    items: [
      "Technical Leadership",
      "Roadmap Ownership",
      "Cross-team Communication",
      "Proactive Problem-solving",
    ],
  },
];

const LANGUAGES: { lang: string; level: string }[] = [
  { lang: "Indonesian", level: "Native" },
  { lang: "English", level: "Professional" },
  { lang: "Japanese", level: "Conversational" },
];

/** Narrative blocks. Prose preserved from the original content. */
const ABOUT_SECTIONS: { id: string; title: string; content: string }[] = [
  {
    id: "who-i-am",
    title: "Who I am",
    content:
      "I build cross-platform products and the systems under them, and I ship them solo, end to end. That runs from token systems and build-time compilers on one side to Cloudflare Workers and live payment integrations on the other. I reach for the smallest thing that survives production over the cleverest thing on paper.",
  },
  {
    id: "my-journey",
    title: "My journey",
    content:
      "I started by tinkering with HTML and wondering how the web held together. That turned into a career across frontend, backend, mobile, and the edge. I co-architected a waste-management ERP that won WSA Global 2025, and I now build and operate my own SaaS products in the open. The throughline is the same as day one: figure out how it actually works.",
  },
  {
    id: "how-i-think",
    title: "How I think",
    content:
      "Building Lyra's payment layer taught me the real work lives in the edge cases: signature formats, timezone-correct timestamps, telling a transient failure from a permanent one. So I verify every assumption against the live system, not just the docs. That habit is the difference between an integration that ships and one that stalls.",
  },
  {
    id: "what-i-build",
    title: "What I build",
    content:
      "I specialise in cross-platform web and mobile, from token-driven design systems to Go and Hono APIs on the Cloudflare edge. My AI-native work is concrete: an MCP server that exposes my design system as callable tools, and an open-source suite of Claude skills, published on skills.sh, that teach assistants my architecture and conventions. Current focus is server-first React with Next.js and Server Components.",
  },
  {
    id: "beyond-coding",
    title: "Beyond coding",
    content:
      "Away from the editor I read, distributed-systems papers, philosophy, history, because the best models for an engineering problem usually come from somewhere unrelated. I also write about what I ship and mentor engineers earlier in their careers.",
  },
];

export default function AboutPage() {
  const personLd = personJsonLd({
    name: "Muhammad Bintang Al Akbar",
    url: canonicalUrl(ROUTES.ABOUT),
    description: SITE_DESCRIPTION,
  });
  const breadcrumbLd = breadcrumbListJsonLd([
    { name: NAV_LABELS.HOME, url: canonicalUrl(ROUTES.HOME) },
    { name: NAV_LABELS.ABOUT, url: canonicalUrl(ROUTES.ABOUT) },
  ]);

  return (
    <ContentWidth as="main">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(personLd) }}
        suppressHydrationWarning
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }}
        suppressHydrationWarning
      />

      {/* ── Intro: portrait + identity ───────────────────────────────── */}
      <section aria-labelledby="about-heading" className="page-head">
        <ScrollReveal variant="fade-up">
          <div className="about-intro">
            <figure className="about-portrait">
              <div className="about-portrait-frame">
                <Image
                  src="https://res.cloudinary.com/diwktkaxv/image/upload/v1780403660/my-photo_h9nqyh.png"
                  alt="Muhammad Bintang Al Akbar"
                  fill
                  className="about-portrait-img"
                  priority
                  sizes="(max-width: 720px) 90vw, 300px"
                />
              </div>
              <figcaption className="about-portrait-cap">
                <span className="about-portrait-award">WSA Global Winner</span>
                <span className="about-portrait-year">2025</span>
              </figcaption>
            </figure>

            <div className="about-intro-body">
              <p className="section-kicker">About</p>
              <h1 id="about-heading" className="about-intro-name">
                Muhammad Bintang Al Akbar
              </h1>
              <p className="about-intro-role">
                Front-End &amp; AI-Native Engineer
              </p>
              <p className="about-intro-lead">
                I build cross-platform products and the systems underneath them,
                then sweat the details until they feel effortless. Four years
                in, still asking questions.
              </p>
              <ul className="about-intro-meta" aria-label="Quick facts">
                <li>
                  <span className="about-intro-meta-key">based</span>
                  <span className="about-intro-meta-val">
                    Jakarta, Indonesia
                  </span>
                </li>
                <li>
                  <span className="about-intro-meta-key">email</span>
                  <span className="about-intro-meta-val">
                    bintangmuhammad12@gmail.com
                  </span>
                </li>
                <li>
                  <span className="about-intro-meta-key">phone</span>
                  <span className="about-intro-meta-val">
                    +62 822-6082-0643
                  </span>
                </li>
              </ul>
            </div>
          </div>
        </ScrollReveal>
      </section>

      {/* ── Narrative — reading-width editorial column ───────────────── */}
      <section aria-label="Background" className="page-section">
        <div className="about-narrative">
          {ABOUT_SECTIONS.map((section, i) => (
            <ScrollReveal
              key={section.id}
              variant="fade-up"
              delay={((i % 3) + 1) as 1 | 2 | 3}
              as="div"
            >
              <article aria-labelledby={`${section.id}-heading`}>
                <h2 id={`${section.id}-heading`} className="about-block-title">
                  {section.title}
                </h2>
                <p className="about-block-text">{section.content}</p>
              </article>
            </ScrollReveal>
          ))}
        </div>
      </section>

      {/* ── Capabilities — grouped mono columns ──────────────────────── */}
      <section aria-labelledby="capabilities-heading" className="page-section">
        <ScrollReveal variant="fade-up">
          <h2 id="capabilities-heading" className="section-h2 cap-title">
            The toolkit, grouped by what it does
          </h2>
        </ScrollReveal>

        <div className="cap-grid">
          {CAPABILITIES.map((group, i) => (
            <ScrollReveal
              key={group.label}
              variant="fade-up"
              delay={((i % 3) + 1) as 1 | 2 | 3}
              as="div"
            >
              <div className="cap-col">
                <p className="cap-col-label">{group.label}</p>
                <ul className="cap-list">
                  {group.items.map((item) => (
                    <li key={item} className="cap-list-item">
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </ScrollReveal>
          ))}
        </div>
      </section>

      {/* ── Languages — small Badge row ──────────────────────────────── */}
      <section
        aria-labelledby="languages-heading"
        className="page-section page-section--last"
      >
        <ScrollReveal variant="fade-up">
          <h2 id="languages-heading" className="section-h2">
            Languages I work in
          </h2>
          <div className="lang-row">
            {LANGUAGES.map((l) => (
              <Badge
                key={l.lang}
                variant="outline"
                className="text-sm px-4 py-1.5 font-semibold gap-1.5"
              >
                {l.lang}
                <span className="font-normal text-xs opacity-60">
                  {l.level}
                </span>
              </Badge>
            ))}
          </div>
        </ScrollReveal>
      </section>
    </ContentWidth>
  );
}
