/**
 * Home page — React Server Component.
 * @see Requirements 7.1–7.7, 20.3, 25.8
 */

import Link from "next/link";
import Image from "next/image";
import type { Metadata } from "next";

import { loadAll } from "@/content/loader";
import { publishedOnly } from "@/lib/blog/query";
import { orderByStartDateDesc } from "@/lib/timeline";
import {
  getFeaturedProjects,
  getRecentBlogPosts,
} from "@/features/home/selectors";
import { ContentWidth, MaxContentWidth } from "@/components/layouts";
import { ScrollReveal } from "@/components/shared/ScrollReveal";
import { AssetPlayer } from "@/components/shared/AssetPlayer";
import { ROUTES, BLOG_PREVIEW_COUNT } from "@/constants";
import { personJsonLd, websiteJsonLd } from "@/services/seo/structured-data";

export const metadata: Metadata = {
  title: "M Bintang Al Akbar — Senior Front-End & Mobile Engineer",
  description:
    "Performance-driven Senior Front-End and Mobile Engineer with 3+ years building cross-platform enterprise products. WSA Global Winner 2025.",
  alternates: { canonical: "https://stareezy.tech" },
  openGraph: {
    url: "https://stareezy.tech",
    type: "website",
  },
};

const SKILLS_BY_GROUP: Record<string, { name: string; level: number }[]> = {
  frontend: [
    { name: "React.js", level: 95 },
    { name: "Next.js", level: 92 },
    { name: "TypeScript", level: 90 },
    { name: "Tailwind CSS", level: 90 },
    { name: "Expo React Native Web", level: 88 },
    { name: "PWA", level: 82 },
  ],
  mobile: [
    { name: "React Native", level: 93 },
    { name: "Expo Ecosystem", level: 92 },
    { name: "EAS Build", level: 88 },
    { name: "EAS Submit", level: 85 },
    { name: "App Store Connect", level: 82 },
    { name: "Google Play Console", level: 82 },
  ],
  backend: [
    { name: ".NET Core / C#", level: 78 },
    { name: "REST APIs", level: 85 },
    { name: "Microsoft SQL Server", level: 75 },
    { name: "MySQL", level: 75 },
    { name: "PHP", level: 70 },
  ],
  devops: [
    { name: "Jest", level: 88 },
    { name: "Vitest", level: 88 },
    { name: "Katalon Studio", level: 80 },
    { name: "E2E Testing", level: 82 },
    { name: "CI/CD", level: 85 },
    { name: "AWS Amplify", level: 80 },
  ],
  architecture: [
    { name: "Zustand", level: 92 },
    { name: "Redux (Thunk)", level: 88 },
    { name: "MobX", level: 85 },
    { name: "SWR", level: 85 },
    { name: "Design Token Systems", level: 95 },
    { name: "O(1) CSS Registries", level: 88 },
  ],
  ai: [
    { name: "LLMs", level: 75 },
    { name: "Prompt Engineering", level: 78 },
    { name: "RAG", level: 70 },
    { name: "Embeddings", level: 68 },
  ],
};

const SKILL_ICONS: Record<string, string> = {
  frontend: "⬡",
  mobile: "◈",
  backend: "⬢",
  devops: "⬟",
  architecture: "◉",
  ai: "◆",
};

const SKILL_COLORS: Record<string, string> = {
  frontend: "var(--color-brand)",
  mobile: "#f59e0b",
  backend: "var(--color-accent)",
  devops: "#ec4899",
  architecture: "#3b82f6",
  ai: "#8b5cf6",
};

const SKILL_LABELS: Record<string, string> = {
  frontend: "Frontend",
  mobile: "Mobile",
  backend: "Backend & Database",
  devops: "Testing & DevOps",
  architecture: "Architecture & State",
  ai: "AI",
};

export default function HomePage() {
  const { items: personalProjects } = loadAll("personal-project");
  const { items: professionalProjects } = loadAll("professional-project");
  const featuredProjects = getFeaturedProjects([
    ...personalProjects,
    ...professionalProjects,
  ]);
  const recentExperience = orderByStartDateDesc(
    loadAll("experience").items,
  ).slice(0, 3);
  const recentPosts = getRecentBlogPosts(
    publishedOnly(loadAll("blog").items),
    BLOG_PREVIEW_COUNT,
  );
  const jsonLd = personJsonLd();
  const websiteLd = websiteJsonLd();

  return (
    <MaxContentWidth as="div">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteLd) }}
      />

      {/* ── HERO ─────────────────────────────────────────────────────────── */}
      <section
        aria-labelledby="hero-heading"
        className="hero-section"
        style={{
          minHeight: "calc(100vh - 68px)",
          display: "flex",
          alignItems: "center",
          position: "relative",
          overflow: "hidden",
          paddingTop: "4rem",
          paddingBottom: "4rem",
        }}
      >
        {/* Animated background */}
        <div
          aria-hidden="true"
          style={{
            position: "absolute",
            inset: 0,
            pointerEvents: "none",
            overflow: "hidden",
          }}
        >
          <div
            className="hero-pulse"
            style={{
              position: "absolute",
              top: "-20%",
              right: "-10%",
              width: "600px",
              height: "600px",
              borderRadius: "50%",
              background:
                "radial-gradient(circle, color-mix(in srgb, var(--color-brand) 15%, transparent) 0%, transparent 70%)",
            }}
          />
          <div
            className="hero-pulse"
            style={{
              position: "absolute",
              bottom: "-20%",
              left: "-10%",
              width: "500px",
              height: "500px",
              borderRadius: "50%",
              background:
                "radial-gradient(circle, color-mix(in srgb, var(--color-accent) 10%, transparent) 0%, transparent 70%)",
              animationDelay: "1.5s",
            }}
          />
          <div
            style={{
              position: "absolute",
              inset: 0,
              backgroundImage:
                "linear-gradient(var(--color-border) 1px, transparent 1px), linear-gradient(90deg, var(--color-border) 1px, transparent 1px)",
              backgroundSize: "60px 60px",
              opacity: 0.3,
              maskImage:
                "radial-gradient(ellipse 80% 80% at 50% 50%, black 30%, transparent 100%)",
            }}
          />
          {/* Lottie orbit — right side, desktop only */}
          <div
            className="lottie-section-deco"
            style={{
              right: "1%",
              bottom: "8%",
              width: "240px",
              height: "240px",
              opacity: 0.15,
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
          {/* Floating shapes — left side */}
          <div
            className="lottie-section-deco"
            style={{
              left: "1%",
              top: "10%",
              width: "200px",
              height: "200px",
              opacity: 0.12,
            }}
          >
            <AssetPlayer
              src="/lottie/floating-shapes.json"
              decorative
              trigger="visible"
              width={200}
              height={200}
            />
          </div>
          {/* Stars sparkle — center top */}
          <div
            className="lottie-section-deco"
            style={{
              left: "28%",
              top: "2%",
              width: "380px",
              height: "380px",
              opacity: 0.18,
            }}
          >
            <AssetPlayer
              src="/lottie/stars-sparkle.json"
              decorative
              trigger="visible"
              width={380}
              height={380}
            />
          </div>{" "}
        </div>

        <ContentWidth>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "auto 1fr auto",
              gap: "3rem",
              alignItems: "center",
            }}
            className="hero-three-col"
          >
            {/* Photo column */}
            <ScrollReveal variant="fade-right">
              <div
                className="hero-photo-col"
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: "1rem",
                }}
              >
                {/* Outer container — size driven inline so CSS overrides are reliable */}
                <div
                  className="hero-photo-size"
                  style={{
                    position: "relative",
                    width: "220px",
                    height: "220px",
                    flexShrink: 0,
                    marginTop: "8px",
                  }}
                >
                  {/* Spinning conic glow ring */}
                  <div
                    aria-hidden="true"
                    style={{
                      position: "absolute",
                      inset: "-3px",
                      borderRadius: "50%",
                      background:
                        "conic-gradient(from 0deg, var(--color-brand), var(--color-accent), var(--color-brand))",
                      animation: "spin-slow 8s linear infinite",
                      zIndex: 0,
                    }}
                  />
                  {/* Background gap so glow ring looks separated */}
                  <div
                    aria-hidden="true"
                    style={{
                      position: "absolute",
                      inset: "3px",
                      borderRadius: "50%",
                      backgroundColor: "var(--color-background)",
                      zIndex: 1,
                    }}
                  />
                  {/* Photo circle */}
                  <div
                    style={{
                      position: "absolute",
                      inset: "7px",
                      borderRadius: "50%",
                      overflow: "hidden",
                      zIndex: 2,
                    }}
                  >
                    <Image
                      src="https://res.cloudinary.com/diwktkaxv/image/upload/v1780403660/my-photo_h9nqyh.png"
                      alt="Muhammad Bintang Al Akbar — Senior Front-End & Mobile Engineer"
                      fill
                      style={{
                        objectFit: "cover",
                        objectPosition: "center 15%",
                      }}
                      priority
                      sizes="(max-width: 768px) 88px, (max-width: 1024px) 160px, 220px"
                    />
                  </div>
                  {/* Online status dot */}
                  <div
                    className="breathe"
                    style={{
                      position: "absolute",
                      bottom: "12px",
                      right: "12px",
                      zIndex: 3,
                      width: "18px",
                      height: "18px",
                      borderRadius: "50%",
                      backgroundColor: "#22c55e",
                      border: "3px solid var(--color-background)",
                      boxShadow: "0 0 8px #22c55e",
                    }}
                  />
                </div>
                {/* WSA badge */}
                <div
                  className="hero-wsa-badge"
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "0.375rem",
                    padding: "0.375rem 0.875rem",
                    borderRadius: "9999px",
                    backgroundColor:
                      "color-mix(in srgb, var(--color-brand) 12%, transparent)",
                    border:
                      "1px solid color-mix(in srgb, var(--color-brand) 30%, transparent)",
                    fontSize: "0.6875rem",
                    fontWeight: 700,
                    color: "var(--color-brand)",
                    letterSpacing: "0.04em",
                    textTransform: "uppercase",
                    whiteSpace: "nowrap",
                  }}
                >
                  🏆 WSA Global Winner 2025
                </div>
              </div>
            </ScrollReveal>
            {/* Left: text */}
            <div
              className="hero-text-col"
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "1.75rem",
              }}
            >
              <ScrollReveal variant="fade-down" delay={1}>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "0.625rem",
                  }}
                >
                  <span
                    style={{
                      width: "8px",
                      height: "8px",
                      borderRadius: "50%",
                      backgroundColor: "var(--color-brand)",
                      boxShadow: "0 0 12px var(--color-brand)",
                      display: "inline-block",
                    }}
                    className="hero-pulse"
                  />
                  <span
                    style={{
                      fontSize: "0.8125rem",
                      fontWeight: 600,
                      color: "var(--color-brand)",
                      letterSpacing: "0.05em",
                      textTransform: "uppercase",
                    }}
                  >
                    Available for new projects
                  </span>
                </div>
              </ScrollReveal>

              <ScrollReveal variant="fade-up" delay={2}>
                <h1
                  id="hero-heading"
                  style={{
                    fontSize: "clamp(2.25rem, 5vw, 4rem)",
                    fontWeight: 800,
                    lineHeight: 1.05,
                    letterSpacing: "-0.03em",
                    margin: 0,
                  }}
                >
                  Hi, I&apos;m{" "}
                  <span
                    style={{
                      color: "var(--color-brand)",
                      textShadow:
                        "0 0 40px color-mix(in srgb, var(--color-brand) 40%, transparent)",
                    }}
                  >
                    Bintang
                  </span>
                  <br />
                  <span
                    style={{
                      color: "var(--color-text-secondary)",
                      fontSize: "0.75em",
                      fontWeight: 700,
                    }}
                  >
                    Senior Front-End &amp; Mobile Engineer
                  </span>
                </h1>
              </ScrollReveal>

              <ScrollReveal variant="fade-up" delay={3}>
                <p
                  style={{
                    fontSize: "clamp(0.9375rem, 1.5vw, 1.125rem)",
                    color: "var(--color-text-secondary)",
                    lineHeight: 1.75,
                    margin: 0,
                  }}
                >
                  I build fast, accessible, token-driven products from first
                  principles — specializing in{" "}
                  <strong style={{ color: "var(--color-text-primary)" }}>
                    React
                  </strong>
                  ,{" "}
                  <strong style={{ color: "var(--color-text-primary)" }}>
                    Next.js
                  </strong>
                  ,{" "}
                  <strong style={{ color: "var(--color-text-primary)" }}>
                    Go
                  </strong>
                  , and{" "}
                  <strong style={{ color: "var(--color-text-primary)" }}>
                    React Native
                  </strong>
                  .
                </p>
              </ScrollReveal>

              <ScrollReveal variant="fade-up" delay={4}>
                <div
                  style={{ display: "flex", flexWrap: "wrap", gap: "0.875rem" }}
                  className="hero-cta-row"
                >
                  <Link
                    href={ROUTES.PROJECTS}
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "0.5rem",
                      padding: "0.75rem 1.75rem",
                      borderRadius: "0.5rem",
                      backgroundColor: "var(--color-brand)",
                      color: "var(--color-background)",
                      fontWeight: 700,
                      fontSize: "0.9375rem",
                      textDecoration: "none",
                      boxShadow:
                        "0 4px 20px color-mix(in srgb, var(--color-brand) 30%, transparent)",
                      transition: "transform 0.15s ease, box-shadow 0.15s ease",
                    }}
                  >
                    View Projects →
                  </Link>
                  <Link
                    href={ROUTES.CONTACT}
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "0.5rem",
                      padding: "0.75rem 1.75rem",
                      borderRadius: "0.5rem",
                      border: "1px solid var(--color-border)",
                      backgroundColor:
                        "color-mix(in srgb, var(--color-surface) 80%, transparent)",
                      color: "var(--color-text-primary)",
                      fontWeight: 600,
                      fontSize: "0.9375rem",
                      textDecoration: "none",
                      backdropFilter: "blur(8px)",
                    }}
                  >
                    Get in Touch
                  </Link>
                </div>
              </ScrollReveal>

              {/* Stats */}
              <ScrollReveal variant="fade-up" delay={5}>
                <div
                  className="hero-stats"
                  style={{
                    display: "flex",
                    flexWrap: "wrap",
                    gap: "2rem",
                    paddingTop: "1.5rem",
                    borderTop: "1px solid var(--color-border)",
                  }}
                >
                  {[
                    { value: "3+", label: "Years Exp." },
                    { value: "9+", label: "Projects" },
                    { value: "3", label: "Open Source" },
                  ].map((stat) => (
                    <div
                      key={stat.label}
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        gap: "0.25rem",
                      }}
                    >
                      <span
                        style={{
                          fontSize: "1.875rem",
                          fontWeight: 800,
                          color: "var(--color-brand)",
                          lineHeight: 1,
                          letterSpacing: "-0.02em",
                        }}
                      >
                        {stat.value}
                      </span>
                      <span
                        style={{
                          fontSize: "0.75rem",
                          color: "var(--color-text-muted)",
                          textTransform: "uppercase",
                          letterSpacing: "0.06em",
                        }}
                      >
                        {stat.label}
                      </span>
                    </div>
                  ))}
                </div>
              </ScrollReveal>
            </div>

            {/* Right: floating code card */}
            <ScrollReveal variant="tilt">
              <div
                className="hero-float hero-code-card"
                style={{ position: "relative" }}
              >
                {/* Main card */}
                <div
                  style={{
                    backgroundColor: "var(--color-surface)",
                    border: "1px solid var(--color-border)",
                    borderRadius: "1.25rem",
                    overflow: "hidden",
                    boxShadow:
                      "0 24px 64px color-mix(in srgb, var(--color-background) 60%, transparent)",
                  }}
                >
                  {/* Window chrome */}
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "0.5rem",
                      padding: "0.875rem 1.25rem",
                      backgroundColor: "var(--color-surface-elevated)",
                      borderBottom: "1px solid var(--color-border)",
                    }}
                  >
                    {["#ff5f57", "#febc2e", "#28c840"].map((c) => (
                      <span
                        key={c}
                        style={{
                          width: "12px",
                          height: "12px",
                          borderRadius: "50%",
                          backgroundColor: c,
                        }}
                      />
                    ))}
                    <span
                      style={{
                        marginLeft: "0.5rem",
                        fontSize: "0.75rem",
                        color: "var(--color-text-muted)",
                      }}
                    >
                      portfolio.ts
                    </span>
                  </div>
                  {/* Code */}
                  <div
                    style={{
                      padding: "1.5rem",
                      fontFamily: "'SF Mono', 'Fira Code', monospace",
                      fontSize: "0.8125rem",
                      lineHeight: 1.8,
                    }}
                  >
                    <div>
                      <span style={{ color: "#7c3aed" }}>const</span>{" "}
                      <span style={{ color: "var(--color-brand)" }}>
                        engineer
                      </span>{" "}
                      <span style={{ color: "var(--color-text-muted)" }}>
                        =
                      </span>{" "}
                      <span style={{ color: "#f59e0b" }}>{"{"}</span>
                    </div>
                    <div style={{ paddingLeft: "1.5rem" }}>
                      <div>
                        <span style={{ color: "var(--color-text-secondary)" }}>
                          name
                        </span>
                        <span style={{ color: "var(--color-text-muted)" }}>
                          :
                        </span>{" "}
                        <span style={{ color: "#34d399" }}>
                          &quot;M Bintang Al Akbar&quot;
                        </span>
                        <span style={{ color: "var(--color-text-muted)" }}>
                          ,
                        </span>
                      </div>
                      <div>
                        <span style={{ color: "var(--color-text-secondary)" }}>
                          role
                        </span>
                        <span style={{ color: "var(--color-text-muted)" }}>
                          :
                        </span>{" "}
                        <span style={{ color: "#34d399" }}>
                          &quot;Front End Engineer&quot;
                        </span>
                        <span style={{ color: "var(--color-text-muted)" }}>
                          ,
                        </span>
                      </div>
                      <div>
                        <span style={{ color: "var(--color-text-secondary)" }}>
                          stack
                        </span>
                        <span style={{ color: "var(--color-text-muted)" }}>
                          :
                        </span>{" "}
                        <span style={{ color: "#f59e0b" }}>[</span>
                      </div>
                      <div style={{ paddingLeft: "1.5rem" }}>
                        {["React", "Next.js", "Go", "React Native"].map((s) => (
                          <div key={s}>
                            <span style={{ color: "#34d399" }}>
                              &quot;{s}&quot;
                            </span>
                            <span style={{ color: "var(--color-text-muted)" }}>
                              ,
                            </span>
                          </div>
                        ))}
                      </div>
                      <div>
                        <span style={{ color: "#f59e0b" }}>]</span>
                        <span style={{ color: "var(--color-text-muted)" }}>
                          ,
                        </span>
                      </div>
                      <div>
                        <span style={{ color: "var(--color-text-secondary)" }}>
                          available
                        </span>
                        <span style={{ color: "var(--color-text-muted)" }}>
                          :
                        </span>{" "}
                        <span style={{ color: "var(--color-brand)" }}>
                          true
                        </span>
                        <span style={{ color: "var(--color-text-muted)" }}>
                          ,
                        </span>
                      </div>
                    </div>
                    <div>
                      <span style={{ color: "#f59e0b" }}>{"}"}</span>
                      <span style={{ color: "var(--color-text-muted)" }}>
                        ;
                      </span>
                    </div>
                    <div style={{ marginTop: "0.5rem" }}>
                      <span style={{ color: "var(--color-text-muted)" }}>
                        //{" "}
                      </span>
                      <span style={{ color: "var(--color-text-muted)" }}>
                        ready to build something great
                      </span>
                      <span
                        className="cursor-blink"
                        style={{
                          color: "var(--color-brand)",
                          marginLeft: "2px",
                        }}
                      >
                        |
                      </span>
                    </div>
                  </div>
                </div>

                {/* Floating badge — top right */}
                <div
                  style={{
                    position: "absolute",
                    top: "-1rem",
                    right: "-1rem",
                    backgroundColor: "var(--color-brand)",
                    color: "var(--color-background)",
                    borderRadius: "0.75rem",
                    padding: "0.5rem 0.875rem",
                    fontSize: "0.75rem",
                    fontWeight: 700,
                    boxShadow:
                      "0 4px 16px color-mix(in srgb, var(--color-brand) 40%, transparent)",
                  }}
                >
                  Open to work ✓
                </div>

                {/* Floating tech pill — bottom left */}
                <div
                  style={{
                    position: "absolute",
                    bottom: "-1rem",
                    left: "-1rem",
                    backgroundColor: "var(--color-surface-elevated)",
                    border: "1px solid var(--color-border)",
                    borderRadius: "0.75rem",
                    padding: "0.625rem 1rem",
                    display: "flex",
                    alignItems: "center",
                    gap: "0.5rem",
                    fontSize: "0.8125rem",
                    fontWeight: 600,
                    boxShadow:
                      "0 4px 16px color-mix(in srgb, var(--color-background) 50%, transparent)",
                  }}
                >
                  <span style={{ color: "var(--color-brand)" }}>⬡</span>
                  <span style={{ color: "var(--color-text-primary)" }}>
                    3+ years building
                  </span>
                </div>
              </div>
            </ScrollReveal>
          </div>
        </ContentWidth>
      </section>

      {/* ── Featured Projects ─────────────────────────────────────────────── */}
      <section
        aria-labelledby="featured-projects-heading"
        style={{
          paddingTop: "6rem",
          paddingBottom: "6rem",
          backgroundColor: "var(--color-surface)",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Stars decoration — below the fold, lazy loads */}
        <div
          className="lottie-section-deco"
          style={{
            right: "0%",
            top: "0%",
            width: "280px",
            height: "280px",
            opacity: 0.2,
          }}
        >
          <AssetPlayer
            src="/lottie/stars-sparkle.json"
            decorative
            trigger="visible"
            width={280}
            height={280}
          />
        </div>
        <ContentWidth>
          <ScrollReveal variant="fade-up">
            <div
              style={{
                display: "flex",
                alignItems: "flex-end",
                justifyContent: "space-between",
                marginBottom: "3rem",
                flexWrap: "wrap",
                gap: "1rem",
              }}
            >
              <div>
                <p
                  style={{
                    fontSize: "0.75rem",
                    fontWeight: 700,
                    textTransform: "uppercase",
                    letterSpacing: "0.12em",
                    color: "var(--color-brand)",
                    marginBottom: "0.5rem",
                  }}
                >
                  Selected Work
                </p>
                <h2 id="featured-projects-heading" style={{ margin: 0 }}>
                  Featured Projects
                </h2>
              </div>
              <Link
                href={ROUTES.PROJECTS}
                style={{
                  fontSize: "0.9375rem",
                  color: "var(--color-brand)",
                  textDecoration: "none",
                  fontWeight: 600,
                }}
              >
                View all →
              </Link>
            </div>
          </ScrollReveal>

          {featuredProjects.length === 0 ? (
            <p style={{ color: "var(--color-text-muted)" }}>
              No featured projects yet.
            </p>
          ) : (
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
                gap: "1.5rem",
              }}
            >
              {featuredProjects.map((project, i) => (
                <ScrollReveal
                  key={project.slug}
                  variant="zoom"
                  delay={((i % 3) + 1) as 1 | 2 | 3}
                >
                  <Link
                    href={`${ROUTES.PROJECTS}/${project.slug}`}
                    aria-label={`View ${project.title}`}
                    style={{
                      textDecoration: "none",
                      color: "inherit",
                      display: "block",
                      height: "100%",
                    }}
                  >
                    <article
                      className="card-hover"
                      style={{
                        backgroundColor: "var(--color-surface-elevated)",
                        border: "1px solid var(--color-border)",
                        borderRadius: "1rem",
                        overflow: "hidden",
                        height: "100%",
                        display: "flex",
                        flexDirection: "column",
                      }}
                    >
                      <div
                        style={{
                          position: "relative",
                          width: "100%",
                          aspectRatio: "16/9",
                          backgroundColor: "var(--color-surface)",
                          overflow: "hidden",
                        }}
                      >
                        {project.image ? (
                          <Image
                            src={project.image}
                            alt={project.title}
                            fill
                            style={{ objectFit: "cover" }}
                            sizes="(max-width: 768px) 100vw, 400px"
                          />
                        ) : (
                          <div
                            style={{
                              width: "100%",
                              height: "100%",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              fontSize: "3rem",
                              color: "var(--color-brand)",
                            }}
                          >
                            {SKILL_ICONS.frontend}
                          </div>
                        )}
                        {project.featured && (
                          <span
                            style={{
                              position: "absolute",
                              top: "0.75rem",
                              right: "0.75rem",
                              padding: "0.25rem 0.625rem",
                              borderRadius: "9999px",
                              backgroundColor: "var(--color-brand)",
                              color: "var(--color-background)",
                              fontSize: "0.6875rem",
                              fontWeight: 700,
                              textTransform: "uppercase",
                            }}
                          >
                            Featured
                          </span>
                        )}
                      </div>
                      <div
                        style={{
                          padding: "1.5rem",
                          display: "flex",
                          flexDirection: "column",
                          gap: "0.75rem",
                          flex: 1,
                        }}
                      >
                        <h3
                          style={{
                            margin: 0,
                            fontSize: "1.0625rem",
                            fontWeight: 700,
                          }}
                        >
                          {project.title}
                        </h3>
                        <p
                          style={{
                            margin: 0,
                            fontSize: "0.9375rem",
                            color: "var(--color-text-secondary)",
                            lineHeight: 1.6,
                            display: "-webkit-box",
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: "vertical",
                            overflow: "hidden",
                          }}
                        >
                          {project.description}
                        </p>
                        <div
                          style={{
                            display: "flex",
                            flexWrap: "wrap",
                            gap: "0.375rem",
                            marginTop: "auto",
                          }}
                        >
                          {project.technologies.slice(0, 4).map((tech) => (
                            <span
                              key={tech}
                              style={{
                                padding: "0.2rem 0.5rem",
                                borderRadius: "9999px",
                                backgroundColor: "var(--color-surface)",
                                border: "1px solid var(--color-border)",
                                fontSize: "0.75rem",
                                color: "var(--color-text-muted)",
                              }}
                            >
                              {tech}
                            </span>
                          ))}
                        </div>
                      </div>
                    </article>
                  </Link>
                </ScrollReveal>
              ))}
            </div>
          )}
        </ContentWidth>
      </section>

      {/* ── Experience Snapshot ───────────────────────────────────────────── */}
      <section
        aria-labelledby="experience-heading"
        style={{
          paddingTop: "6rem",
          paddingBottom: "6rem",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Wave lines decoration */}
        <div
          className="lottie-section-deco"
          style={{
            right: "2%",
            bottom: "10%",
            width: "300px",
            height: "150px",
            opacity: 0.3,
          }}
        >
          <AssetPlayer
            src="/lottie/wave-lines.json"
            decorative
            trigger="visible"
            width={300}
            height={150}
          />
        </div>
        <ContentWidth>
          <ScrollReveal variant="fade-up">
            <div
              style={{
                display: "flex",
                alignItems: "flex-end",
                justifyContent: "space-between",
                marginBottom: "3rem",
                flexWrap: "wrap",
                gap: "1rem",
              }}
            >
              <div>
                <p
                  style={{
                    fontSize: "0.75rem",
                    fontWeight: 700,
                    textTransform: "uppercase",
                    letterSpacing: "0.12em",
                    color: "var(--color-brand)",
                    marginBottom: "0.5rem",
                  }}
                >
                  Career
                </p>
                <h2 id="experience-heading" style={{ margin: 0 }}>
                  Experience
                </h2>
              </div>
              <Link
                href={ROUTES.EXPERIENCE}
                style={{
                  fontSize: "0.9375rem",
                  color: "var(--color-brand)",
                  textDecoration: "none",
                  fontWeight: 600,
                }}
              >
                Full timeline →
              </Link>
            </div>
          </ScrollReveal>

          <div
            style={{ display: "flex", flexDirection: "column", gap: "1rem" }}
          >
            {recentExperience.map((entry, i) => (
              <ScrollReveal
                key={`${entry.company}-${i}`}
                variant="fade-left"
                delay={((i % 3) + 1) as 1 | 2 | 3}
              >
                <div
                  className="card-hover"
                  style={{
                    display: "flex",
                    gap: "1.25rem",
                    alignItems: "flex-start",
                    padding: "1.5rem",
                    backgroundColor: "var(--color-surface)",
                    border: "1px solid var(--color-border)",
                    borderRadius: "0.875rem",
                  }}
                >
                  <div
                    style={{
                      width: "48px",
                      height: "48px",
                      borderRadius: "0.75rem",
                      flexShrink: 0,
                      background: `linear-gradient(135deg, color-mix(in srgb, var(--color-brand) 20%, transparent), color-mix(in srgb, var(--color-accent) 20%, transparent))`,
                      border:
                        "1px solid color-mix(in srgb, var(--color-brand) 25%, transparent)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: "1.25rem",
                      fontWeight: 800,
                      color: "var(--color-brand)",
                    }}
                  >
                    {entry.company.charAt(0)}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        flexWrap: "wrap",
                        gap: "0.5rem",
                        marginBottom: "0.25rem",
                      }}
                    >
                      <h3
                        style={{ margin: 0, fontSize: "1rem", fontWeight: 700 }}
                      >
                        {entry.role}
                      </h3>
                      <span
                        style={{
                          padding: "0.2rem 0.625rem",
                          borderRadius: "9999px",
                          backgroundColor: entry.endDate
                            ? "var(--color-surface-elevated)"
                            : "color-mix(in srgb, var(--color-brand) 12%, transparent)",
                          border: `1px solid ${
                            entry.endDate
                              ? "var(--color-border)"
                              : "color-mix(in srgb, var(--color-brand) 30%, transparent)"
                          }`,
                          fontSize: "0.75rem",
                          fontWeight: 600,
                          color: entry.endDate
                            ? "var(--color-text-muted)"
                            : "var(--color-brand)",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {entry.endDate
                          ? `${entry.startDate.slice(
                              0,
                              7,
                            )} – ${entry.endDate.slice(0, 7)}`
                          : "Current"}
                      </span>
                    </div>
                    <p
                      style={{
                        margin: 0,
                        fontSize: "0.9375rem",
                        color: "var(--color-brand)",
                        fontWeight: 600,
                      }}
                    >
                      {entry.company}
                    </p>
                    <p
                      style={{
                        margin: "0.25rem 0 0",
                        fontSize: "0.8125rem",
                        color: "var(--color-text-muted)",
                      }}
                    >
                      {entry.location}
                    </p>
                  </div>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </ContentWidth>
      </section>

      {/* ── Skills ───────────────────────────────────────────────────────── */}
      <section
        aria-labelledby="skills-heading"
        style={{
          paddingTop: "8rem",
          paddingBottom: "8rem",
          backgroundColor: "var(--color-surface)",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Lottie left decoration */}
        <div
          className="lottie-section-deco"
          style={{
            left: "-60px",
            top: "50%",
            transform: "translateY(-50%)",
            width: "320px",
            height: "320px",
          }}
        >
          <AssetPlayer
            src="/lottie/orbit-rings.json"
            decorative
            trigger="visible"
            width={320}
            height={320}
          />
        </div>
        {/* Lottie right decoration */}
        <div
          className="lottie-section-deco"
          style={{
            right: "-60px",
            top: "50%",
            transform: "translateY(-50%)",
            width: "300px",
            height: "300px",
          }}
        >
          <AssetPlayer
            src="/lottie/code-typing.json"
            decorative
            trigger="visible"
            width={300}
            height={300}
          />
        </div>
        <ContentWidth>
          <ScrollReveal variant="fade-up">
            <div style={{ textAlign: "center", marginBottom: "4rem" }}>
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
                Expertise
              </p>
              <h2 id="skills-heading" style={{ margin: 0 }}>
                Skills &amp; Technologies
              </h2>
            </div>
          </ScrollReveal>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
              gap: "1.25rem",
            }}
          >
            {Object.keys(SKILLS_BY_GROUP).map((key, i) => {
              const color = SKILL_COLORS[key] ?? "var(--color-brand)";
              const skills = SKILLS_BY_GROUP[key] ?? [];
              const label = SKILL_LABELS[key] ?? key;
              return (
                <ScrollReveal
                  key={key}
                  variant="flip"
                  delay={((i % 3) + 1) as 1 | 2 | 3}
                >
                  <div
                    className="card-hover"
                    style={{
                      padding: "1.5rem",
                      backgroundColor: "var(--color-surface-elevated)",
                      border: "1px solid var(--color-border)",
                      borderRadius: "1rem",
                      display: "flex",
                      flexDirection: "column",
                      gap: "1.25rem",
                      height: "100%",
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
                          fontSize: "1.25rem",
                          color,
                          width: "40px",
                          height: "40px",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          backgroundColor: `color-mix(in srgb, ${color} 12%, transparent)`,
                          borderRadius: "0.625rem",
                          flexShrink: 0,
                        }}
                      >
                        {SKILL_ICONS[key]}
                      </span>
                      <h3
                        style={{
                          margin: 0,
                          fontSize: "0.9375rem",
                          fontWeight: 700,
                        }}
                      >
                        {label}
                      </h3>
                    </div>
                    <div
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        gap: "0.625rem",
                      }}
                    >
                      {skills.map((skill) => (
                        <div key={skill.name}>
                          <div
                            style={{
                              display: "flex",
                              justifyContent: "space-between",
                              marginBottom: "0.25rem",
                            }}
                          >
                            <span
                              style={{
                                fontSize: "0.8125rem",
                                color: "var(--color-text-secondary)",
                                fontWeight: 500,
                              }}
                            >
                              {skill.name}
                            </span>
                            <span
                              style={{
                                fontSize: "0.75rem",
                                color: "var(--color-text-muted)",
                              }}
                            >
                              {skill.level}%
                            </span>
                          </div>
                          <div
                            style={{
                              height: "4px",
                              backgroundColor: "var(--color-surface)",
                              borderRadius: "2px",
                              overflow: "hidden",
                            }}
                          >
                            <div
                              style={{
                                height: "100%",
                                width: `${skill.level}%`,
                                background: `linear-gradient(90deg, ${color}, color-mix(in srgb, ${color} 60%, transparent))`,
                                borderRadius: "2px",
                                transition: "width 1s ease",
                              }}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </ScrollReveal>
              );
            })}
          </div>
        </ContentWidth>
      </section>

      {/* ── Blog Preview ─────────────────────────────────────────────────── */}
      {recentPosts.length > 0 && (
        <section
          aria-labelledby="blog-preview-heading"
          style={{
            paddingTop: "6rem",
            paddingBottom: "6rem",
            position: "relative",
            overflow: "hidden",
          }}
        >
          {/* Stars sparkle decoration */}
          <div
            className="lottie-section-deco"
            style={{
              right: "0%",
              top: "0%",
              width: "300px",
              height: "300px",
              opacity: 0.25,
            }}
          >
            <AssetPlayer
              src="/lottie/stars-sparkle.json"
              decorative
              trigger="visible"
              width={300}
              height={300}
            />
          </div>
          <ContentWidth>
            <ScrollReveal variant="fade-up">
              <div
                style={{
                  display: "flex",
                  alignItems: "flex-end",
                  justifyContent: "space-between",
                  marginBottom: "3rem",
                  flexWrap: "wrap",
                  gap: "1rem",
                }}
              >
                <div>
                  <p
                    style={{
                      fontSize: "0.75rem",
                      fontWeight: 700,
                      textTransform: "uppercase",
                      letterSpacing: "0.12em",
                      color: "var(--color-brand)",
                      marginBottom: "0.5rem",
                    }}
                  >
                    Writing
                  </p>
                  <h2 id="blog-preview-heading" style={{ margin: 0 }}>
                    Latest Posts
                  </h2>
                </div>
                <Link
                  href={ROUTES.BLOG}
                  style={{
                    fontSize: "0.9375rem",
                    color: "var(--color-brand)",
                    textDecoration: "none",
                    fontWeight: 600,
                  }}
                >
                  All posts →
                </Link>
              </div>
            </ScrollReveal>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
                gap: "1.5rem",
              }}
            >
              {recentPosts.map((post, i) => (
                <ScrollReveal
                  key={post.slug}
                  variant="fade-up"
                  delay={((i % 3) + 1) as 1 | 2 | 3}
                >
                  <Link
                    href={`${ROUTES.BLOG}/${post.slug}`}
                    aria-label={`Read ${post.title}`}
                    style={{
                      textDecoration: "none",
                      color: "inherit",
                      display: "block",
                      height: "100%",
                    }}
                  >
                    <article
                      className="card-hover"
                      style={{
                        backgroundColor: "var(--color-surface)",
                        border: "1px solid var(--color-border)",
                        borderRadius: "1rem",
                        overflow: "hidden",
                        display: "flex",
                        flexDirection: "column",
                        height: "100%",
                      }}
                    >
                      {post.heroImage && (
                        <div
                          style={{
                            position: "relative",
                            width: "100%",
                            aspectRatio: "16/9",
                            backgroundColor: "var(--color-surface-elevated)",
                            overflow: "hidden",
                          }}
                        >
                          <Image
                            src={post.heroImage}
                            alt={`Hero image for ${post.title}`}
                            fill
                            style={{ objectFit: "cover" }}
                            sizes="(max-width: 768px) 100vw, 400px"
                          />
                        </div>
                      )}
                      <div
                        style={{
                          padding: "1.5rem",
                          display: "flex",
                          flexDirection: "column",
                          gap: "0.75rem",
                          flex: 1,
                        }}
                      >
                        <span
                          style={{
                            display: "inline-flex",
                            width: "fit-content",
                            padding: "0.2rem 0.625rem",
                            borderRadius: "9999px",
                            backgroundColor: "var(--color-brand)",
                            color: "var(--color-background)",
                            fontSize: "0.6875rem",
                            fontWeight: 700,
                            textTransform: "uppercase",
                          }}
                        >
                          {post.category}
                        </span>
                        <h3
                          style={{
                            margin: 0,
                            fontSize: "1.0625rem",
                            fontWeight: 700,
                            lineHeight: 1.3,
                          }}
                        >
                          {post.title}
                        </h3>
                        <p
                          style={{
                            margin: 0,
                            fontSize: "0.875rem",
                            color: "var(--color-text-secondary)",
                            lineHeight: 1.6,
                            display: "-webkit-box",
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: "vertical",
                            overflow: "hidden",
                          }}
                        >
                          {post.description}
                        </p>
                        <time
                          dateTime={post.publishDate}
                          style={{
                            fontSize: "0.8125rem",
                            color: "var(--color-text-muted)",
                            marginTop: "auto",
                          }}
                        >
                          {new Date(post.publishDate).toLocaleDateString(
                            "en-US",
                            { year: "numeric", month: "long", day: "numeric" },
                          )}
                        </time>
                      </div>
                    </article>
                  </Link>
                </ScrollReveal>
              ))}
            </div>
          </ContentWidth>
        </section>
      )}

      {/* ── Contact CTA ──────────────────────────────────────────────────── */}
      <section
        aria-labelledby="contact-cta-heading"
        style={{
          paddingTop: "9rem",
          paddingBottom: "9rem",
          position: "relative",
          overflow: "hidden",
          backgroundColor: "var(--color-surface)",
        }}
      >
        {/* Deep glow */}
        <div
          aria-hidden="true"
          style={{
            position: "absolute",
            inset: 0,
            pointerEvents: "none",
            background:
              "radial-gradient(ellipse 70% 70% at 50% 50%, color-mix(in srgb, var(--color-brand) 8%, transparent), transparent)",
          }}
        />
        {/* Lottie left */}
        <div
          className="lottie-section-deco"
          style={{
            left: "3%",
            top: "50%",
            transform: "translateY(-50%)",
            width: "280px",
            height: "280px",
            opacity: 0.5,
          }}
        >
          <AssetPlayer
            src="/lottie/orbit-rings.json"
            decorative
            trigger="visible"
            width={280}
            height={280}
          />
        </div>
        {/* Lottie right */}
        <div
          className="lottie-section-deco"
          style={{
            right: "3%",
            top: "50%",
            transform: "translateY(-50%)",
            width: "240px",
            height: "240px",
            opacity: 0.5,
          }}
        >
          <AssetPlayer
            src="/lottie/send-message.json"
            decorative
            trigger="visible"
            width={240}
            height={240}
          />
        </div>
        <ContentWidth>
          <ScrollReveal variant="zoom">
            <div
              style={{
                textAlign: "center",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: "1.5rem",
              }}
            >
              <p
                style={{
                  fontSize: "0.75rem",
                  fontWeight: 700,
                  textTransform: "uppercase",
                  letterSpacing: "0.12em",
                  color: "var(--color-brand)",
                  margin: 0,
                }}
              >
                Let&apos;s Connect
              </p>
              <h2
                id="contact-cta-heading"
                style={{ margin: 0, fontSize: "clamp(1.75rem, 4vw, 3rem)" }}
              >
                Have a project in mind?
              </h2>
              <p
                style={{
                  fontSize: "1.0625rem",
                  color: "var(--color-text-secondary)",
                  maxWidth: "480px",
                  lineHeight: 1.7,
                  margin: 0,
                }}
              >
                I&apos;m always open to discussing new opportunities,
                interesting projects, or just a good conversation about tech.
              </p>
              <div
                style={{
                  display: "flex",
                  flexWrap: "wrap",
                  gap: "1rem",
                  justifyContent: "center",
                }}
              >
                <Link
                  href={ROUTES.CONTACT}
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "0.5rem",
                    padding: "0.875rem 2rem",
                    borderRadius: "0.5rem",
                    backgroundColor: "var(--color-brand)",
                    color: "var(--color-background)",
                    fontWeight: 700,
                    fontSize: "1rem",
                    textDecoration: "none",
                    boxShadow:
                      "0 4px 20px color-mix(in srgb, var(--color-brand) 30%, transparent)",
                  }}
                >
                  Get in Touch →
                </Link>
                <Link
                  href={ROUTES.PROJECTS}
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "0.5rem",
                    padding: "0.875rem 2rem",
                    borderRadius: "0.5rem",
                    border: "1px solid var(--color-border)",
                    backgroundColor: "var(--color-surface-elevated)",
                    color: "var(--color-text-primary)",
                    fontWeight: 600,
                    fontSize: "1rem",
                    textDecoration: "none",
                  }}
                >
                  View Work
                </Link>
              </div>
            </div>
          </ScrollReveal>
        </ContentWidth>
      </section>
    </MaxContentWidth>
  );
}
