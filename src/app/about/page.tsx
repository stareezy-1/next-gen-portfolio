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
    "Muhammad Bintang Al Akbar, Senior Front-End and Mobile Engineer based in Jakarta. WSA Global Winner 2025. Six years building cross-platform products with React, React Native, and TypeScript.",
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
      'A Senior Front-End and Mobile Engineer who builds premium digital experiences at the intersection of performance, design, and developer ergonomics. I care about the whole craft, from the architecture decisions that shape a system to the micro-interactions that make an interface feel alive. I bring a product mindset to every technical problem, understanding the "why" before reaching for the "how".',
  },
  {
    id: "my-journey",
    title: "My journey",
    content:
      "My path started with curiosity, tinkering with HTML and wondering how the web worked. That grew into a career spanning frontend, backend, mobile, and cloud engineering. I have shipped production systems used by thousands, led cross-functional teams, and earned a WSA Global Winner 2025 title for digital innovation. Along the way I learned that the best engineers never stop asking questions.",
  },
  {
    id: "how-i-think",
    title: "How I think",
    content:
      "I approach problems by first understanding the constraints, technical, business, and human. Good solutions are rarely the most clever ones. They are the ones that are clear, maintainable, and appropriate for the context. I favour systems thinking over local optimisation, and I treat writing code as an act of communication with future maintainers as much as with the machine.",
  },
  {
    id: "what-i-build",
    title: "What I build",
    content:
      "I specialise in cross-platform web and mobile applications, from token-driven design systems and component libraries to Go REST APIs, AWS Amplify microservices, and cloud-native infrastructure. My current focus is server-first React architectures with Next.js and React Server Components, and AI-augmented developer tooling.",
  },
  {
    id: "beyond-coding",
    title: "Beyond coding",
    content:
      "When I am not building software I am usually reading, distributed systems papers, philosophy, history. The best mental models for engineering problems often come from unrelated fields. I also enjoy contributing to open source, writing technical articles, and mentoring engineers earlier in their careers.",
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
                Senior Front-End &amp; Mobile Engineer
              </p>
              <p className="about-intro-lead">
                I build cross-platform products and the systems underneath them,
                then sweat the details until they feel effortless. Six years in,
                still asking questions.
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
