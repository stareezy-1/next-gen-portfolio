/** Portfolio studio presentation; content and routes preserved. */

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
import { HomeMotion } from "@/features/home/components/HomeMotion";
import { SectionHeading } from "@/features/home/components/SectionHeading";
import { PortfolioHero } from "@/features/home/components/PortfolioHero";
import {
  ContributionLedger,
  selectOpenSourceHighlights,
} from "@/features/open-source";
import { getOpenSourceContributions } from "@/features/open-source/server";
import {
  ROUTES,
  BLOG_PREVIEW_COUNT,
  OPEN_SOURCE_PREVIEW_COUNT,
} from "@/constants";
import { personJsonLd, websiteJsonLd } from "@/services/seo/structured-data";
import { Badge } from "@/components/ui/shadcn/badge";

export const metadata: Metadata = {
  title: "M Bintang Al Akbar — Front-End & AI-Native Engineer",
  description:
    "Front-End and AI-Native Engineer building products, design systems, and the edge tooling underneath them with React, Cloudflare Workers, and Hono. I ship an MCP server and open-source Claude skills on top. WSA Global Winner 2025.",
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
      "MCP Servers",
      "Claude Skills",
      "LLM Integration",
      "Prompt Engineering",
      "RAG",
    ],
  },
];

/** Two-digit catalog number for the work index (01, 02, ...). */
function catalogNumber(index: number): string {
  return String(index + 1).padStart(2, "0");
}

// Retry a failed refresh sooner; successful contribution data retains its six-hour cache.
export const revalidate = 300;

export default async function HomePage() {
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
  const contributionSnapshot = await getOpenSourceContributions();
  const contributionPreview = selectOpenSourceHighlights(
    contributionSnapshot.contributions,
    OPEN_SOURCE_PREVIEW_COUNT,
  );
  const jsonLd = personJsonLd();
  const websiteLd = websiteJsonLd();

  return (
    <MaxContentWidth as="div" className="studio-home">
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

      <HomeMotion>
        <PortfolioHero projects={featuredProjects} />

        {/* ── Selected work — numbered catalog ─────────────────────────────── */}
        <section aria-labelledby="work-heading" className="work" id="work">
          <ContentWidth>
            <ScrollReveal variant="fade-up">
              <div className="section-head">
                <div>
                  <p className="section-kicker">01 / Selected work</p>
                  <SectionHeading id="work-heading" className="section-h2">
                    {"Things I designed and shipped"}
                  </SectionHeading>
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
                              sizes="(max-width: 700px) 100vw, 50vw"
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

        <section
          aria-labelledby="open-source-heading"
          className="oss-home"
          id="open-source"
        >
          <ContentWidth>
            <ScrollReveal variant="fade-up">
              <div className="section-head">
                <div>
                  <p className="section-kicker">02 / Open-source record</p>
                  <SectionHeading
                    id="open-source-heading"
                    className="section-h2"
                  >
                    {"Merged outside my own repositories"}
                  </SectionHeading>
                </div>
                <Link href={ROUTES.OPEN_SOURCE} className="section-link">
                  Every accepted change <span aria-hidden="true">→</span>
                </Link>
              </div>
            </ScrollReveal>

            {contributionSnapshot.status !== "unavailable" &&
            contributionPreview.length > 0 ? (
              <ScrollReveal variant="fade-up" delay={1}>
                {contributionSnapshot.status === "stale" && (
                  <p className="oss-snapshot-note">
                    Verified GitHub record ·{" "}
                    {new Date(
                      contributionSnapshot.generatedAt!,
                    ).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                      timeZone: "UTC",
                    })}
                    . Live refresh will retry.
                  </p>
                )}
                <ContributionLedger
                  contributions={contributionPreview}
                  variant="preview"
                />
              </ScrollReveal>
            ) : (
              <div className="oss-home-empty">
                <p>
                  The live contribution ledger is temporarily unavailable. The
                  full index will return when GitHub is reachable.
                </p>
                <Link href={ROUTES.OPEN_SOURCE}>
                  Open the contribution page
                </Link>
              </div>
            )}
          </ContentWidth>
        </section>

        {/* ── Experience — vertical rail ───────────────────────────────────── */}
        <section aria-labelledby="exp-heading" className="exp" id="experience">
          <ContentWidth>
            <ScrollReveal variant="fade-up">
              <div className="section-head">
                <div>
                  <p className="section-kicker">03 / Experience</p>
                  <SectionHeading id="exp-heading" className="section-h2">
                    {"Where I've been building"}
                  </SectionHeading>
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
                              <span
                                className="xp-live-dot"
                                aria-hidden="true"
                              />
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
        <section
          aria-labelledby="cap-heading"
          className="cap"
          id="capabilities"
        >
          <ContentWidth>
            <ScrollReveal variant="fade-up">
              <p className="section-kicker">04 / Capabilities</p>
              <SectionHeading id="cap-heading" className="section-h2 cap-title">
                {"The toolkit, grouped by what it does"}
              </SectionHeading>
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
          <section
            aria-labelledby="writing-heading"
            className="writing"
            id="writing"
          >
            <ContentWidth>
              <ScrollReveal variant="fade-up">
                <div className="section-head">
                  <div>
                    <p className="section-kicker">05 / Writing</p>
                    <SectionHeading id="writing-heading" className="section-h2">
                      {"Notes from the build"}
                    </SectionHeading>
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
                    </Link>
                  </ScrollReveal>
                ))}
              </div>
            </ContentWidth>
          </section>
        )}

        {/* ── Closing CTA — statement + one orchestrated motion moment ─────── */}
        <section aria-labelledby="cta-heading" className="cta" id="contact">
          <ContentWidth>
            <div className="cta-grid">
              <ScrollReveal variant="fade-right">
                <div className="cta-text">
                  <p className="section-kicker">Let&apos;s talk</p>
                  <SectionHeading id="cta-heading" className="cta-h2">
                    {"Got something hard to build?"}
                  </SectionHeading>
                  <p className="cta-lead">
                    I&apos;m looking for a senior front-end or systems role
                    where I can own products end to end. Open to freelance and
                    open-source too. Tell me what you&apos;re building.
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
      </HomeMotion>
    </MaxContentWidth>
  );
}
