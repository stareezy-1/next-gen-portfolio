/**
 * About page — React Server Component.
 * @see Requirements 8.1, 8.2, 19.1, 19.4
 */

import type { Metadata } from "next";
import Image from "next/image";
import { ContentWidth, ReadingWidth } from "@/components/layouts";
import { MotionWrapper } from "@/components/shared/MotionWrapper";
import { ScrollReveal } from "@/components/shared/ScrollReveal";
import { AssetPlayer } from "@/components/shared/AssetPlayer";
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
    "Muhammad Bintang Al Akbar — Senior Front-End & Mobile Engineer based in Jakarta, Indonesia. WSA Global Winner 2025. 3+ years building cross-platform enterprise products with React, React Native, and TypeScript.",
  alternates: { canonical: "https://stareezy.tech/about" },
};

const SKILL_CATEGORIES = [
  {
    title: "Frontend & Mobile",
    icon: "⬡",
    color: "var(--color-brand)",
    skills: [
      "React.js",
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
    title: "Testing & Automation",
    icon: "⬟",
    color: "#ec4899",
    skills: [
      "Jest",
      "Vitest",
      "Katalon Studio",
      "E2E Testing",
      "Regression Validation",
      "Automated Component Testing",
    ],
  },
  {
    title: "Architecture & State",
    icon: "⬢",
    color: "var(--color-accent)",
    skills: [
      "Zustand",
      "Redux (Thunk)",
      "MobX",
      "SWR",
      "Design Token Systems",
      "Compile-time CSS Extraction",
      "O(1) Registries",
    ],
  },
  {
    title: "Cloud & DevOps",
    icon: "◉",
    color: "#3b82f6",
    skills: [
      "AWS Amplify",
      "EAS Build",
      "EAS Submit",
      "App Store Connect",
      "Google Play Console",
      "CI/CD",
    ],
  },
  {
    title: "Backend & Database",
    icon: "◈",
    color: "#f59e0b",
    skills: [".NET Core", "C#", "PHP", "Microsoft SQL Server", "MySQL"],
  },
  {
    title: "Soft Skills",
    icon: "◆",
    color: "#8b5cf6",
    skills: [
      "Technical Leadership",
      "Product Roadmap Management",
      "Cross-team Communication",
      "Proactive Problem-solving",
    ],
  },
];

const LANGUAGES = [
  { lang: "Indonesian", level: "Native" },
  { lang: "English", level: "Professional" },
  { lang: "Japanese", level: "Conversational" },
];

const ABOUT_SECTIONS = [
  {
    id: "who-i-am",
    icon: "◈",
    title: "Who I Am",
    content:
      'A Senior Front-End and Mobile Engineer passionate about building premium digital experiences at the intersection of performance, design, and developer ergonomics. I care deeply about the craft — from architecture decisions that shape a system to the micro-interactions that make an interface feel alive. I bring a product mindset to every technical problem: understanding the "why" before reaching for the "how".',
  },
  {
    id: "my-journey",
    icon: "⬡",
    title: "My Journey",
    content:
      "My path started with curiosity — tinkering with HTML and wondering how the web worked. That grew into a career spanning frontend, backend, mobile, and cloud engineering. I've shipped production systems used by thousands, led cross-functional teams, and earned a WSA Global Winner 2025 title for digital innovation. Along the way I've learned that the best engineers never stop asking questions.",
  },
  {
    id: "how-i-think",
    icon: "◉",
    title: "How I Think",
    content:
      "I approach problems by first seeking to understand the constraints — technical, business, and human. Good solutions are rarely the most clever ones; they are the ones that are clear, maintainable, and appropriate for the context. I favour systems thinking over local optimisation, and I believe writing code is ultimately an act of communication — with future maintainers as much as with the machine.",
  },
  {
    id: "what-i-build",
    icon: "⬢",
    title: "What I Build",
    content:
      "I specialise in cross-platform web and mobile applications — from token-driven design systems and component libraries to Go REST APIs, AWS Amplify microservices, and cloud-native infrastructure. My current focus is on server-first React architectures (Next.js, React Server Components) and AI-augmented developer tooling.",
  },
  {
    id: "beyond-coding",
    icon: "⬟",
    title: "Beyond Coding",
    content:
      "When I'm not building software I'm usually reading — distributed systems papers, philosophy, history. The best mental models for engineering problems often come from unrelated fields. I also enjoy contributing to open-source, writing technical articles, and mentoring engineers earlier in their careers.",
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
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }}
      />

      {/* ── Page header ──────────────────────────────────────────────────── */}
      <div
        style={{
          paddingTop: "4rem",
          paddingBottom: "3rem",
          borderBottom: "1px solid var(--color-border)",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Animated background accent */}
        <div
          aria-hidden="true"
          style={{
            position: "absolute",
            top: "-40%",
            right: "-5%",
            width: "400px",
            height: "400px",
            borderRadius: "50%",
            background:
              "radial-gradient(circle, color-mix(in srgb, var(--color-brand) 8%, transparent) 0%, transparent 70%)",
            pointerEvents: "none",
          }}
          className="hero-pulse"
        />
        {/* Lottie developer character decoration */}
        <div
          className="lottie-section-deco"
          style={{
            right: "2%",
            bottom: "-10%",
            width: "240px",
            height: "240px",
          }}
        >
          <AssetPlayer
            src="/lottie/orbit-rings.json"
            decorative
            trigger="visible"
            width={240}
            height={240}
          />
        </div>
        <MotionWrapper variant="heroWordReveal">
          <div
            className="about-two-col"
            style={{
              display: "flex",
              gap: "3rem",
              alignItems: "flex-start",
            }}
          >
            {/* Photo frame */}
            <div className="about-photo-frame">
              {/* Glow border */}
              <div
                style={{
                  position: "absolute",
                  inset: "-3px",
                  borderRadius: "1.25rem",
                  background:
                    "linear-gradient(135deg, var(--color-brand), var(--color-accent), var(--color-brand))",
                  backgroundSize: "200% 200%",
                  animation: "gradient-shift 4s ease infinite",
                  zIndex: 0,
                }}
              />
              {/* Photo */}
              <div
                style={{
                  position: "absolute",
                  inset: "3px",
                  borderRadius: "1.125rem",
                  overflow: "hidden",
                  zIndex: 1,
                }}
              >
                <Image
                  src="https://res.cloudinary.com/diwktkaxv/image/upload/v1780403660/my-photo_h9nqyh.png"
                  alt="Muhammad Bintang Al Akbar"
                  fill
                  style={{ objectFit: "cover", objectPosition: "center top" }}
                  priority
                  sizes="(max-width: 768px) 180px, 280px"
                />
              </div>
              {/* Floating WSA badge */}
              <div
                style={{
                  position: "absolute",
                  bottom: "-16px",
                  left: "50%",
                  transform: "translateX(-50%)",
                  zIndex: 2,
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "0.375rem",
                  padding: "0.4rem 1rem",
                  borderRadius: "9999px",
                  backgroundColor: "var(--color-surface-elevated)",
                  border:
                    "1px solid color-mix(in srgb, var(--color-brand) 40%, transparent)",
                  fontSize: "0.6875rem",
                  fontWeight: 700,
                  color: "var(--color-brand)",
                  whiteSpace: "nowrap",
                  boxShadow:
                    "0 4px 16px color-mix(in srgb, var(--color-brand) 20%, transparent)",
                }}
              >
                🏆 WSA Global Winner 2025
              </div>
            </div>

            {/* Text content */}
            <div style={{ flex: 1, minWidth: 0, paddingTop: "0.5rem" }}>
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
                About Me
              </p>
              <h1 style={{ marginBottom: "0.5rem" }}>
                Muhammad Bintang Al Akbar{" "}
                <span className="wave-hand" aria-hidden="true">
                  👋
                </span>
              </h1>
              <p
                style={{
                  fontSize: "1.125rem",
                  color: "var(--color-brand)",
                  fontWeight: 600,
                  marginBottom: "1rem",
                }}
              >
                Senior Front-End &amp; Mobile Engineer
              </p>
              <p
                style={{
                  fontSize: "1rem",
                  color: "var(--color-text-secondary)",
                  lineHeight: 1.7,
                  maxWidth: "560px",
                  margin: 0,
                }}
              >
                Jakarta, Indonesia · +62 822-6082-0643 ·
                bintangmuhammad12@gmail.com
              </p>
              {/* Quick stat pills */}
              <div
                style={{
                  display: "flex",
                  flexWrap: "wrap",
                  gap: "0.625rem",
                  marginTop: "1.5rem",
                }}
              >
                {[
                  { icon: "⚡", label: "3+ yrs experience" },
                  { icon: "📱", label: "React Native" },
                  { icon: "🌐", label: "Next.js" },
                  { icon: "🚀", label: "Open to work" },
                ].map((pill) => (
                  <span
                    key={pill.label}
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "0.375rem",
                      padding: "0.3rem 0.75rem",
                      borderRadius: "9999px",
                      backgroundColor: "var(--color-surface)",
                      border: "1px solid var(--color-border)",
                      fontSize: "0.8125rem",
                      color: "var(--color-text-secondary)",
                    }}
                  >
                    {pill.icon} {pill.label}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </MotionWrapper>
      </div>

      {/* ── Summary ──────────────────────────────────────────────────────── */}
      <ScrollReveal variant="fade-up">
        <div
          style={{
            paddingTop: "3rem",
            paddingBottom: "2.5rem",
            borderBottom: "1px solid var(--color-border)",
          }}
        >
          <ReadingWidth>
            <h2 style={{ marginBottom: "1.25rem", fontSize: "1.25rem" }}>
              Summary
            </h2>
            <p
              style={{
                fontSize: "1rem",
                color: "var(--color-text-secondary)",
                lineHeight: 1.85,
                margin: 0,
              }}
            >
              Performance-driven Senior Front-End and Mobile Engineer with over
              3 years of professional experience specializing in React, React
              Native, and high-performance cross-platform enterprise
              architectures. Designated core system architect securing the{" "}
              <strong style={{ color: "var(--color-brand)" }}>
                World Summit Awards (WSA) Global Winner
              </strong>{" "}
              title for digital innovation at Rekosistem. Expert at driving
              proactive problem-solving across engineering teams, managing
              complex product roadmaps, deploying AWS Amplify microservices, and
              crafting scalable interfaces with Tailwind CSS. Strong advocate
              for engineering teamwork and cross-team communication to align
              software metrics with core business objectives.
            </p>
          </ReadingWidth>
        </div>
      </ScrollReveal>

      {/* ── Skills Profile ───────────────────────────────────────────────── */}
      <div
        style={{
          paddingTop: "3rem",
          paddingBottom: "3rem",
          borderBottom: "1px solid var(--color-border)",
        }}
      >
        <ScrollReveal variant="fade-up">
          <h2 style={{ marginBottom: "2rem", fontSize: "1.25rem" }}>
            Skills Profile
          </h2>
        </ScrollReveal>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
            gap: "1.25rem",
          }}
        >
          {SKILL_CATEGORIES.map((cat, i) => (
            <ScrollReveal
              key={cat.title}
              variant="zoom"
              delay={((i % 3) + 1) as 1 | 2 | 3}
            >
              <div
                className="card-hover"
                style={{
                  padding: "1.25rem",
                  backgroundColor: "var(--color-surface)",
                  border: "1px solid var(--color-border)",
                  borderRadius: "0.875rem",
                  display: "flex",
                  flexDirection: "column",
                  gap: "1rem",
                  height: "100%",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "0.625rem",
                  }}
                >
                  <span
                    style={{
                      width: "36px",
                      height: "36px",
                      borderRadius: "0.5rem",
                      flexShrink: 0,
                      backgroundColor: `color-mix(in srgb, ${cat.color} 12%, transparent)`,
                      border: `1px solid color-mix(in srgb, ${cat.color} 25%, transparent)`,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: "1rem",
                      color: cat.color,
                    }}
                  >
                    {cat.icon}
                  </span>
                  <h3
                    style={{ margin: 0, fontSize: "0.875rem", fontWeight: 700 }}
                  >
                    {cat.title}
                  </h3>
                </div>
                <div
                  style={{ display: "flex", flexWrap: "wrap", gap: "0.375rem" }}
                >
                  {cat.skills.map((skill) => (
                    <span
                      key={skill}
                      style={{
                        padding: "0.2rem 0.5rem",
                        borderRadius: "9999px",
                        backgroundColor: "var(--color-surface-elevated)",
                        border: "1px solid var(--color-border)",
                        fontSize: "0.75rem",
                        color: "var(--color-text-secondary)",
                        transition: "border-color 0.2s ease, color 0.2s ease",
                      }}
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            </ScrollReveal>
          ))}
        </div>
      </div>

      {/* ── About sections ───────────────────────────────────────────────── */}
      <div
        style={{
          paddingTop: "3rem",
          paddingBottom: "3rem",
          borderBottom: "1px solid var(--color-border)",
          display: "flex",
          flexDirection: "column",
          gap: "2.5rem",
        }}
      >
        {ABOUT_SECTIONS.map((section, i) => (
          <ScrollReveal
            key={section.id}
            variant={i % 2 === 0 ? "fade-left" : "fade-right"}
          >
            <ReadingWidth>
              <section
                aria-labelledby={`${section.id}-heading`}
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "0.875rem",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "0.75rem",
                  }}
                >
                  <span
                    style={{
                      fontSize: "1rem",
                      color: "var(--color-brand)",
                      width: "36px",
                      height: "36px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      backgroundColor:
                        "color-mix(in srgb, var(--color-brand) 10%, transparent)",
                      borderRadius: "0.5rem",
                      flexShrink: 0,
                    }}
                  >
                    {section.icon}
                  </span>
                  <h2
                    id={`${section.id}-heading`}
                    style={{ margin: 0, fontSize: "1.125rem" }}
                  >
                    {section.title}
                  </h2>
                </div>
                <p
                  style={{
                    margin: 0,
                    fontSize: "1rem",
                    color: "var(--color-text-secondary)",
                    lineHeight: 1.8,
                    paddingLeft: "3rem",
                  }}
                >
                  {section.content}
                </p>
              </section>
            </ReadingWidth>
          </ScrollReveal>
        ))}
      </div>

      {/* ── Languages ────────────────────────────────────────────────────── */}
      <ScrollReveal variant="fade-up">
        <div style={{ paddingTop: "3rem", paddingBottom: "5rem" }}>
          <h2 style={{ marginBottom: "1.5rem", fontSize: "1.25rem" }}>
            Languages
          </h2>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "0.75rem" }}>
            {LANGUAGES.map((l, i) => (
              <ScrollReveal
                key={l.lang}
                variant="zoom"
                delay={(i + 1) as 1 | 2 | 3}
              >
                <div
                  style={{
                    padding: "0.625rem 1.25rem",
                    backgroundColor: "var(--color-surface)",
                    border: "1px solid var(--color-border)",
                    borderRadius: "9999px",
                    display: "flex",
                    alignItems: "center",
                    gap: "0.5rem",
                    transition: "border-color 0.2s ease, transform 0.2s ease",
                  }}
                >
                  <span style={{ fontWeight: 700, fontSize: "0.9375rem" }}>
                    {l.lang}
                  </span>
                  <span
                    style={{
                      fontSize: "0.8125rem",
                      color: "var(--color-text-muted)",
                    }}
                  >
                    · {l.level}
                  </span>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </ScrollReveal>
    </ContentWidth>
  );
}
