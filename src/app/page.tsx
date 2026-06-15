/**
 * Home page (React Server Component).
 *
 * Direction: "The Logbook", an editorial-technical index. The hero is a
 * thesis (what he builds and why it matters), not a photo-card. Work is a
 * numbered catalog where the numbering encodes true chronology. A monospace
 * rail carries metadata; Space Grotesk carries the voice.
 *
 * Eyebrow budget: max 1 per 3 sections. Copy rewritten to be concrete and
 * specific. Zero em-dashes.
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
import { Badge } from "@/components/ui/shadcn/badge";

export const metadata: Metadata = {
  title: "M Bintang Al Akbar — Senior Front-End & Mobile Engineer",
  description:
    "Senior Front-End and Mobile Engineer building cross-platform products, design systems, and the tooling underneath them. WSA Global Winner 2025.",
  alternates: { canonical: "https://stareezy.tech" },
  openGraph: {
    url: "https://stareezy.tech",
    type: "website",
  },
};

/**
 * Capability groups: the domains Bintang works across. Labels are plain and
 * scannable; the list under each is the real toolset (no skill "levels").
 */
const CAPABILITIES: { label: string; items: string[] }[] = [
  {
    label: "Interface",
    items: [
      "React",
      "Next.js",
      "TypeScript",
      "Tailwind CSS",
      "Expo React Native Web",
      "PWA",
    ],
  },
  {
    label: "Mobile",
    items: [
      "React Native",
      "Expo",
      "EAS Build",
      "EAS Submit",
      "App Store Connect",
      "Google Play",
    ],
  },
  {
    label: "Systems & state",
    items: [
      "Design Token Systems",
      "O(1) CSS Registries",
      "Zustand",
      "Redux",
      "MobX",
      "SWR",
    ],
  },
  {
    label: "Backend",
    items: [
      "Go",
      "Hono.js",
      ".NET Core / C#",
      "REST APIs",
      "SQL Server",
      "MySQL",
      "PHP",
    ],
  },
  {
    label: "Quality",
    items: ["Jest", "Vitest", "Katalon Studio", "E2E Testing", "CI/CD"],
  },
  {
    label: "Cloud & AI",
    items: [
      "Cloudflare",
      "AWS Amplify",
      "LLMs",
      "Prompt Engineering",
      "RAG",
      "Embeddings",
    ],
  },
];

/** Two-digit catalog number for the work index (01, 02, ...). */
function catalogNumber(index: number): string {
  return String(index + 1).padStart(2, "0");
}

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
        suppressHydrationWarning
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteLd) }}
        suppressHydrationWarning
      />

      {/* ── HERO — editorial thesis ──────────────────────────────────────── */}
      {/*
        The hero states what he builds, in his own voice. A monospace rail
        on the left carries identity metadata; the statement headline carries
        the message. The portrait sits in the right column, anchored by a thin
        brand rule, never as a floating card or spinning ring.
      */}
      <section aria-labelledby="hero-heading" className="hero">
        <ContentWidth>
          <div className="hero-layout">
            {/* Left: metadata rail + statement */}
            <div className="hero-main">
              <ScrollReveal variant="fade-up">
                <ul className="hero-rail" aria-label="At a glance">
                  <li>
                    <span className="hero-rail-key">role</span>
                    <span className="hero-rail-val">
                      Senior Front-End &amp; Mobile Engineer
                    </span>
                  </li>
                  <li>
                    <span className="hero-rail-key">based</span>
                    <span className="hero-rail-val">Jakarta, Indonesia</span>
                  </li>
                  <li>
                    <span className="hero-rail-key">status</span>
                    <span className="hero-rail-val hero-rail-live">
                      <span className="hero-live-dot" aria-hidden="true" />
                      Open to new work
                    </span>
                  </li>
                </ul>
              </ScrollReveal>

              <ScrollReveal variant="fade-up" delay={1}>
                <h1 id="hero-heading" className="hero-statement">
                  I&apos;m Bintang. I build the{" "}
                  <span className="hero-accent">systems</span> that products
                  stand on.
                </h1>
              </ScrollReveal>

              <ScrollReveal variant="fade-up" delay={2}>
                <p className="hero-lead">
                  Design token systems, an O(1) CSS runtime, a build-time
                  compiler, and a WSA-winning waste-management ERP. Six years of
                  shipping React, React Native, and Go across web and mobile
                  from one codebase.
                </p>
              </ScrollReveal>

              <ScrollReveal variant="fade-up" delay={3}>
                <div className="hero-actions">
                  <Link href={ROUTES.PROJECTS} className="btn-primary">
                    See the work
                  </Link>
                  <Link href={ROUTES.CONTACT} className="btn-ghost">
                    Start a conversation
                  </Link>
                </div>
              </ScrollReveal>
            </div>

            {/* Right: portrait, anchored by a thin brand rule */}
            <ScrollReveal variant="fade-left" delay={2} className="hero-aside">
              <figure className="hero-portrait">
                <div className="hero-portrait-frame">
                  <Image
                    src="https://res.cloudinary.com/diwktkaxv/image/upload/v1780403660/my-photo_h9nqyh.png"
                    alt="Muhammad Bintang Al Akbar"
                    fill
                    className="hero-portrait-img"
                    priority
                    sizes="(max-width: 860px) 240px, 360px"
                  />
                </div>
                <figcaption className="hero-portrait-cap">
                  <span className="hero-portrait-award">WSA Global Winner</span>
                  <span className="hero-portrait-year">2025</span>
                </figcaption>
              </figure>
            </ScrollReveal>
          </div>
        </ContentWidth>
      </section>

      {/* ── Selected work — numbered catalog ─────────────────────────────── */}
      {/*
        The numbering (01, 02, 03) is true: it indexes the selected set. Each
        entry is a full-bleed row, alternating image side, so the section never
        reads as three identical cards.
        Eyebrow budget: 1 of 3 used here.
      */}
      <section aria-labelledby="work-heading" className="work">
        <ContentWidth>
          <ScrollReveal variant="fade-up">
            <div className="section-head">
              <div>
                <p className="section-kicker">Selected work</p>
                <h2 id="work-heading" className="section-h2">
                  Things I designed and shipped
                </h2>
              </div>
              <Link href={ROUTES.PROJECTS} className="section-link">
                Full index
                <span aria-hidden="true"> →</span>
              </Link>
            </div>
          </ScrollReveal>

          {featuredProjects.length === 0 ? (
            <p className="empty-state">No featured projects yet.</p>
          ) : (
            <ol className="work-index">
              {featuredProjects.map((project, i) => (
                <ScrollReveal
                  key={project.slug}
                  variant="fade-up"
                  delay={((i % 3) + 1) as 1 | 2 | 3}
                  as="li"
                >
                  <Link
                    href={`${ROUTES.PROJECTS}/${project.slug}`}
                    aria-label={`View ${project.title}`}
                    className="work-row"
                  >
                    {/* Left zone: thumbnail + index */}
                    <div className="work-row-media">
                      <div className="work-row-thumb">
                        {project.image ? (
                          <Image
                            src={project.image}
                            alt={project.title}
                            fill
                            className="work-row-img"
                            sizes="(max-width: 640px) 5rem, 11rem"
                          />
                        ) : (
                          <span
                            className="work-row-placeholder"
                            aria-hidden="true"
                          >
                            {catalogNumber(i)}
                          </span>
                        )}
                      </div>
                      <span className="work-row-num" aria-hidden="true">
                        {catalogNumber(i)}
                      </span>
                    </div>

                    {/* Right zone: title, desc, tags */}
                    <div className="work-row-body">
                      <h3 className="work-row-title">{project.title}</h3>
                      <p className="work-row-desc">{project.description}</p>
                      <div className="work-row-tags">
                        {project.technologies.slice(0, 5).map((tech) => (
                          <span key={tech} className="tech-tag">
                            {tech}
                          </span>
                        ))}
                      </div>
                    </div>
                  </Link>
                </ScrollReveal>
              ))}
            </ol>
          )}
        </ContentWidth>
      </section>

      {/* ── Experience — vertical rail ───────────────────────────────────── */}
      {/* No eyebrow (2nd section). */}
      <section aria-labelledby="exp-heading" className="exp">
        <ContentWidth>
          <ScrollReveal variant="fade-up">
            <div className="section-head">
              <div>
                <h2 id="exp-heading" className="section-h2">
                  Where I&apos;ve been building
                </h2>
              </div>
              <Link href={ROUTES.EXPERIENCE} className="section-link">
                Full history
                <span aria-hidden="true"> →</span>
              </Link>
            </div>
          </ScrollReveal>

          {/* Ledger header row */}
          <div className="home-xp-header" aria-hidden="true">
            <span className="home-xp-header-num">#</span>
            <span className="home-xp-header-role">Role</span>
            <span className="home-xp-header-date">Period</span>
          </div>

          <ol className="home-xp-ledger" aria-label="Recent experience">
            {recentExperience.map((entry, i) => {
              const isActive = !entry.endDate;
              const dateRange = isActive
                ? `${entry.startDate.slice(0, 7)} to now`
                : `${entry.startDate.slice(0, 7)} to ${entry.endDate!.slice(
                    0,
                    7,
                  )}`;
              return (
                <ScrollReveal
                  key={`${entry.company}-${i}`}
                  variant="fade-up"
                  delay={((i % 3) + 1) as 1 | 2 | 3}
                  as="li"
                >
                  <article
                    className={`home-xp-strip${
                      isActive ? " home-xp-strip--active" : ""
                    }`}
                  >
                    <span className="home-xp-strip-num" aria-hidden="true">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <div className="home-xp-strip-body">
                      <div className="home-xp-strip-title-row">
                        <h3 className="home-xp-strip-role">{entry.role}</h3>
                        {isActive && (
                          <span className="xp-live" aria-label="Current role">
                            <span className="xp-live-dot" aria-hidden="true" />
                            Now
                          </span>
                        )}
                      </div>
                      <p className="home-xp-strip-company">
                        {entry.company}
                        <span className="home-xp-strip-loc">
                          {entry.location}
                        </span>
                      </p>
                    </div>
                    <code className="home-xp-strip-date">{dateRange}</code>
                  </article>
                </ScrollReveal>
              );
            })}
          </ol>
        </ContentWidth>
      </section>

      {/* ── Capabilities — grouped columns ───────────────────────────────── */}
      {/* No eyebrow (3rd section, budget reserved for the closing CTA). */}
      <section aria-labelledby="cap-heading" className="cap">
        <ContentWidth>
          <ScrollReveal variant="fade-up">
            <h2 id="cap-heading" className="section-h2 cap-title">
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
        </ContentWidth>
      </section>

      {/* ── Writing — horizontal cards ───────────────────────────────────── */}
      {recentPosts.length > 0 && (
        <section aria-labelledby="writing-heading" className="writing">
          <ContentWidth>
            <ScrollReveal variant="fade-up">
              <div className="section-head">
                <div>
                  <h2 id="writing-heading" className="section-h2">
                    Notes from the build
                  </h2>
                </div>
                <Link href={ROUTES.BLOG} className="section-link">
                  All writing
                  <span aria-hidden="true"> →</span>
                </Link>
              </div>
            </ScrollReveal>

            <div className="post-list">
              {recentPosts.map((post, i) => (
                <ScrollReveal
                  key={post.slug}
                  variant="fade-up"
                  delay={((i % 3) + 1) as 1 | 2 | 3}
                  as="div"
                >
                  <Link
                    href={`${ROUTES.BLOG}/${post.slug}`}
                    aria-label={`Read ${post.title}`}
                    className="post-row"
                  >
                    {post.heroImage && (
                      <div className="post-row-media">
                        <Image
                          src={post.heroImage}
                          alt={`Cover for ${post.title}`}
                          fill
                          className="post-row-img"
                          sizes="(max-width: 768px) 100vw, 280px"
                        />
                      </div>
                    )}
                    <div className="post-row-body">
                      <div className="post-row-meta">
                        <Badge variant="outline" className="post-cat">
                          {post.category}
                        </Badge>
                        <time dateTime={post.publishDate} className="post-date">
                          {new Date(post.publishDate).toLocaleDateString(
                            "en-US",
                            { year: "numeric", month: "short", day: "numeric" },
                          )}
                        </time>
                      </div>
                      <h3 className="post-title">{post.title}</h3>
                      <p className="post-desc">{post.description}</p>
                    </div>
                  </Link>
                </ScrollReveal>
              ))}
            </div>
          </ContentWidth>
        </section>
      )}

      {/* ── Closing CTA — statement + one orchestrated motion moment ─────── */}
      {/* Eyebrow budget: final 1 of 3 used here. */}
      <section aria-labelledby="cta-heading" className="cta">
        <ContentWidth>
          <div className="cta-grid">
            <ScrollReveal variant="fade-right">
              <div className="cta-text">
                <p className="section-kicker">Let&apos;s talk</p>
                <h2 id="cta-heading" className="cta-h2">
                  Got something hard to build?
                </h2>
                <p className="cta-lead">
                  I take on freelance work, full-time roles, and open-source
                  collaboration. Tell me what you&apos;re making.
                </p>
                <Link
                  href={ROUTES.CONTACT}
                  className="btn-primary btn-primary--lg"
                >
                  Start a conversation
                </Link>
              </div>
            </ScrollReveal>
            <ScrollReveal variant="fade-left" delay={1}>
              <div className="cta-art" aria-hidden="true">
                <AssetPlayer
                  src="/lottie/send-message.json"
                  decorative
                  trigger="visible"
                  width="100%"
                  height="100%"
                />
              </div>
            </ScrollReveal>
          </div>
        </ContentWidth>
      </section>
    </MaxContentWidth>
  );
}
