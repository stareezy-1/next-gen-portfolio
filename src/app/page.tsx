/**
 * Home page: a calm, product-led portfolio with one optical glass signature.
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
import { Badge } from "@/components/ui/shadcn/badge";
import { Button } from "@/components/ui/shadcn/button";
import { Card } from "@/components/ui/shadcn/card";
import { ROUTES, BLOG_PREVIEW_COUNT } from "@/constants";
import { personJsonLd, websiteJsonLd } from "@/services/seo/structured-data";

export const metadata: Metadata = {
  title: "M Bintang Al Akbar | Front-End & AI-Native Engineer",
  description:
    "Front-End and AI-Native Engineer building cross-platform products, design systems, edge services, and practical AI tooling.",
  alternates: { canonical: "https://stareezy.tech" },
  openGraph: {
    url: "https://stareezy.tech",
    type: "website",
  },
};

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
      "MCP Servers",
      "Claude Skills",
      "LLM Integration",
      "Prompt Engineering",
      "RAG",
    ],
  },
];

function catalogNumber(index: number): string {
  return String(index + 1).padStart(2, "0");
}

export default function HomePage() {
  const { items: personalProjects } = loadAll("personal-project");
  const { items: professionalProjects } = loadAll("professional-project");
  const { items: saasProjects } = loadAll("saas-project");
  const featuredProjects = getFeaturedProjects([
    ...saasProjects,
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

  return (
    <MaxContentWidth as="div" className="home-shell">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(personJsonLd()) }}
        suppressHydrationWarning
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteJsonLd()) }}
        suppressHydrationWarning
      />

      <section aria-labelledby="hero-heading" className="hero">
        <ContentWidth className="hero-content">
          <div className="hero-layout">
            <div className="hero-main">
              <ScrollReveal variant="fade-up">
                <ul className="hero-rail" aria-label="At a glance">
                  <li>
                    <span className="hero-rail-key">role</span>
                    <span className="hero-rail-val">
                      Front-End &amp; AI-Native Engineer
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
                  I build complete products, from interface to the{" "}
                  <span className="hero-accent">edge</span>.
                </h1>
              </ScrollReveal>

              <ScrollReveal variant="fade-up" delay={2}>
                <p className="hero-lead">
                  Cross-platform products, design systems, edge services, and AI
                  tooling built as one coherent system.
                </p>
              </ScrollReveal>

              <ScrollReveal variant="fade-up" delay={3}>
                <div className="hero-actions">
                  <Button asChild size="lg" className="btn-primary">
                    <Link href={ROUTES.PROJECTS}>See the work</Link>
                  </Button>
                  <Button
                    asChild
                    size="lg"
                    variant="outline"
                    className="btn-ghost"
                  >
                    <Link href={ROUTES.CONTACT}>Start a conversation</Link>
                  </Button>
                </div>
              </ScrollReveal>
            </div>

            <ScrollReveal variant="fade-left" delay={2} className="hero-aside">
              <figure className="hero-portrait">
                <div className="hero-portrait-frame">
                  <Image
                    src="https://res.cloudinary.com/diwktkaxv/image/upload/v1780403660/my-photo_h9nqyh.png"
                    alt="Muhammad Bintang Al Akbar"
                    fill
                    className="hero-portrait-img"
                    priority
                    sizes="(max-width: 859px) 76vw, 360px"
                  />
                  <span className="hero-edge-lens" aria-hidden="true" />
                </div>
              </figure>
            </ScrollReveal>
          </div>
        </ContentWidth>
      </section>

      <section aria-labelledby="work-heading" className="work">
        <ContentWidth>
          <ScrollReveal variant="fade-up">
            <div className="section-head">
              <div>
                <p className="section-kicker">Selected work</p>
                <h2 id="work-heading" className="section-h2">
                  Products shaped from system to surface
                </h2>
              </div>
              <Link href={ROUTES.PROJECTS} className="section-link">
                Full index <span aria-hidden="true">→</span>
              </Link>
            </div>
          </ScrollReveal>

          {featuredProjects.length === 0 ? (
            <p className="empty-state">No featured projects yet.</p>
          ) : (
            <ol className="work-index">
              {featuredProjects.map((project, index) => (
                <ScrollReveal
                  key={project.slug}
                  variant="fade-up"
                  delay={((index % 3) + 1) as 1 | 2 | 3}
                  as="li"
                >
                  <Link
                    href={`${ROUTES.PROJECTS}/${project.slug}`}
                    aria-label={`View ${project.title}`}
                    className="work-row"
                  >
                    <span className="work-row-num" aria-hidden="true">
                      {catalogNumber(index)}
                    </span>
                    <div className="work-row-thumb">
                      {project.image ? (
                        <Image
                          src={project.image}
                          alt={project.title}
                          fill
                          className="work-row-img"
                          sizes="(max-width: 599px) 72px, 176px"
                        />
                      ) : (
                        <span
                          className="work-row-placeholder"
                          aria-hidden="true"
                        >
                          {catalogNumber(index)}
                        </span>
                      )}
                    </div>
                    <div className="work-row-body">
                      <h3 className="work-row-title">{project.title}</h3>
                      <p className="work-row-desc">{project.description}</p>
                      <div className="work-row-tags">
                        {project.technologies.slice(0, 5).map((tech) => (
                          <Badge
                            key={tech}
                            variant="outline"
                            className="tech-tag"
                          >
                            {tech}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    <span className="work-row-arrow" aria-hidden="true">
                      ↗
                    </span>
                  </Link>
                </ScrollReveal>
              ))}
            </ol>
          )}
        </ContentWidth>
      </section>

      <section aria-labelledby="exp-heading" className="exp">
        <ContentWidth>
          <ScrollReveal variant="fade-up">
            <div className="section-head">
              <h2 id="exp-heading" className="section-h2">
                Where I&apos;ve been building
              </h2>
              <Link href={ROUTES.EXPERIENCE} className="section-link">
                Full history <span aria-hidden="true">→</span>
              </Link>
            </div>
          </ScrollReveal>

          <div className="home-xp-panel">
            <div className="home-xp-header" aria-hidden="true">
              <span>#</span>
              <span>Role</span>
              <span>Period</span>
            </div>
            <ol className="home-xp-ledger" aria-label="Recent experience">
              {recentExperience.map((entry, index) => {
                const isActive = !entry.endDate;
                const dateRange = isActive
                  ? `${entry.startDate.slice(0, 7)} to now`
                  : `${entry.startDate.slice(0, 7)} to ${entry.endDate!.slice(
                      0,
                      7,
                    )}`;

                return (
                  <ScrollReveal
                    key={`${entry.company}-${index}`}
                    variant="fade-up"
                    delay={((index % 3) + 1) as 1 | 2 | 3}
                    as="li"
                  >
                    <article className="home-xp-strip">
                      <span className="home-xp-strip-num" aria-hidden="true">
                        {catalogNumber(index)}
                      </span>
                      <div className="home-xp-strip-body">
                        <div className="home-xp-strip-title-row">
                          <h3 className="home-xp-strip-role">{entry.role}</h3>
                          {isActive && (
                            <Badge
                              className="xp-live"
                              aria-label="Current role"
                            >
                              Now
                            </Badge>
                          )}
                        </div>
                        <p className="home-xp-strip-company">
                          {entry.company}
                          <span className="home-xp-strip-loc">
                            {entry.location}
                          </span>
                        </p>
                      </div>
                      <time className="home-xp-strip-date">{dateRange}</time>
                    </article>
                  </ScrollReveal>
                );
              })}
            </ol>
          </div>
        </ContentWidth>
      </section>

      <section aria-labelledby="cap-heading" className="cap">
        <ContentWidth>
          <ScrollReveal variant="fade-up">
            <h2 id="cap-heading" className="section-h2 cap-title">
              The toolkit, grouped by what it does
            </h2>
          </ScrollReveal>

          <div className="cap-grid">
            {CAPABILITIES.map((group, index) => (
              <ScrollReveal
                key={group.label}
                variant="fade-up"
                delay={((index % 3) + 1) as 1 | 2 | 3}
              >
                <Card className="cap-col">
                  <h3 className="cap-col-label">{group.label}</h3>
                  <ul className="cap-list">
                    {group.items.map((item) => (
                      <li key={item} className="cap-list-item">
                        {item}
                      </li>
                    ))}
                  </ul>
                </Card>
              </ScrollReveal>
            ))}
          </div>
        </ContentWidth>
      </section>

      {recentPosts.length > 0 && (
        <section aria-labelledby="writing-heading" className="writing">
          <ContentWidth>
            <ScrollReveal variant="fade-up">
              <div className="section-head">
                <h2 id="writing-heading" className="section-h2">
                  Notes from the build
                </h2>
                <Link href={ROUTES.BLOG} className="section-link">
                  All writing <span aria-hidden="true">→</span>
                </Link>
              </div>
            </ScrollReveal>

            <div className="post-list">
              {recentPosts.map((post, index) => (
                <ScrollReveal
                  key={post.slug}
                  variant="fade-up"
                  delay={((index % 3) + 1) as 1 | 2 | 3}
                >
                  <Link
                    href={`${ROUTES.BLOG}/${post.slug}`}
                    aria-label={`Read ${post.title}`}
                    className="post-row"
                  >
                    <Card className="post-card">
                      {post.heroImage && (
                        <div className="post-row-media">
                          <Image
                            src={post.heroImage}
                            alt={`Cover for ${post.title}`}
                            fill
                            className="post-row-img"
                            sizes="(max-width: 639px) 100vw, (max-width: 959px) 50vw, 33vw"
                          />
                        </div>
                      )}
                      <div className="post-row-body">
                        <div className="post-row-meta">
                          <Badge variant="outline" className="post-cat">
                            {post.category}
                          </Badge>
                          <time
                            dateTime={post.publishDate}
                            className="post-date"
                          >
                            {new Date(post.publishDate).toLocaleDateString(
                              "en-US",
                              {
                                year: "numeric",
                                month: "short",
                                day: "numeric",
                              },
                            )}
                          </time>
                        </div>
                        <h3 className="post-title">{post.title}</h3>
                        <p className="post-desc">{post.description}</p>
                      </div>
                    </Card>
                  </Link>
                </ScrollReveal>
              ))}
            </div>
          </ContentWidth>
        </section>
      )}

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
                  I&apos;m open to senior product engineering roles, focused
                  freelance work, and useful open-source collaboration.
                </p>
                <Button asChild size="lg" className="btn-primary">
                  <Link href={ROUTES.CONTACT}>Start a conversation</Link>
                </Button>
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
