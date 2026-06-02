/**
 * Blog Detail page — React Server Component.
 * @see Requirements 14.1–14.5
 */

import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

import { marked } from "marked";
import { loadAll } from "@/content/loader";
import { publishedOnly } from "@/lib/blog/query";
import { readingTime } from "@/lib/blog/reading-time";
import { tableOfContents } from "@/lib/blog/toc";
import { ContentWidth } from "@/components/layouts";
import { ScrollReveal } from "@/components/shared/ScrollReveal";
import { canonicalUrl } from "@/services/seo";
import {
  blogPostingJsonLd,
  breadcrumbListJsonLd,
} from "@/services/seo/structured-data";
import { ROUTES, NAV_LABELS } from "@/constants";
import type { BlogPost } from "@/types/content";

const RELATED_MAX = 3;

export async function generateStaticParams(): Promise<{ slug: string }[]> {
  const { items } = loadAll("blog");
  return publishedOnly(items).map((post) => ({ slug: post.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = findPost(slug);
  if (!post) return { title: "Post Not Found" };
  return { title: post.title, description: post.description };
}

function findPost(slug: string): BlogPost | undefined {
  const { items } = loadAll("blog");
  return publishedOnly(items).find((p) => p.slug === slug);
}

function getRelatedPosts(currentSlug: string): BlogPost[] {
  const { items } = loadAll("blog");
  return publishedOnly(items)
    .filter((p) => p.slug !== currentSlug)
    .sort(
      (a, b) =>
        new Date(b.publishDate).getTime() - new Date(a.publishDate).getTime(),
    )
    .slice(0, RELATED_MAX);
}

export default async function BlogDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = findPost(slug);
  if (!post) notFound();

  const minutes = readingTime(post.body);
  const toc = tableOfContents(post.body);
  const related = getRelatedPosts(slug);
  const bodyHtml = marked.parse(post.body, {
    gfm: true,
    breaks: false,
  }) as string;

  const postUrl = canonicalUrl(`${ROUTES.BLOG}/${post.slug}`);
  const blogPostingLd = blogPostingJsonLd(post, postUrl);
  const breadcrumbLd = breadcrumbListJsonLd([
    { name: NAV_LABELS.HOME, url: canonicalUrl(ROUTES.HOME) },
    { name: NAV_LABELS.BLOG, url: canonicalUrl(ROUTES.BLOG) },
    { name: post.title, url: postUrl },
  ]);

  const formattedDate = new Date(post.publishDate).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
  const twitterShareUrl =
    "https://twitter.com/intent/tweet?text=" +
    encodeURIComponent(post.title) +
    "&url=" +
    encodeURIComponent(postUrl);
  const linkedInShareUrl =
    "https://www.linkedin.com/sharing/share-offsite/?url=" +
    encodeURIComponent(postUrl);

  return (
    <div>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(blogPostingLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }}
      />

      <div
        style={{
          position: "relative",
          width: "100%",
          aspectRatio: "21/9",
          maxHeight: "480px",
          backgroundColor: "var(--color-surface-elevated)",
          overflow: "hidden",
        }}
      >
        <Image
          loading="eager"
          src={post.heroImage}
          alt={"Hero image for " + post.title}
          fill
          style={{ objectFit: "cover" }}
          priority
          sizes="100vw"
        />
        <div
          style={{
            position: "absolute",
            inset: 0,
            background:
              "linear-gradient(to top, color-mix(in srgb, var(--color-background) 70%, transparent) 0%, transparent 60%)",
          }}
        />
        <div
          style={{
            position: "absolute",
            top: "1.5rem",
            left: "1.5rem",
            display: "flex",
            alignItems: "center",
            gap: "0.5rem",
            fontSize: "0.875rem",
          }}
        >
          <Link
            href={ROUTES.BLOG}
            style={{ color: "rgba(255,255,255,0.7)", textDecoration: "none" }}
          >
            Blog
          </Link>
          <span style={{ color: "rgba(255,255,255,0.4)" }}>›</span>
          <span style={{ color: "rgba(255,255,255,0.9)" }}>{post.title}</span>
        </div>
      </div>

      <ContentWidth as="main">
        <ScrollReveal variant="fade-up">
          <div
            style={{
              paddingTop: "2.5rem",
              paddingBottom: "2rem",
              borderBottom: "1px solid var(--color-border)",
              maxWidth: "720px",
            }}
          >
            <div
              style={{
                display: "flex",
                flexWrap: "wrap",
                gap: "0.5rem",
                marginBottom: "1.25rem",
              }}
            >
              <span
                style={{
                  padding: "0.25rem 0.75rem",
                  borderRadius: "9999px",
                  backgroundColor: "var(--color-brand)",
                  color: "var(--color-background)",
                  fontSize: "0.75rem",
                  fontWeight: 700,
                  textTransform: "uppercase",
                  letterSpacing: "0.05em",
                }}
              >
                {post.category}
              </span>
              {post.tags.map((tag) => (
                <span
                  key={tag}
                  style={{
                    padding: "0.25rem 0.625rem",
                    borderRadius: "9999px",
                    backgroundColor: "var(--color-surface-elevated)",
                    border: "1px solid var(--color-border)",
                    fontSize: "0.75rem",
                    color: "var(--color-text-muted)",
                  }}
                >
                  {tag}
                </span>
              ))}
            </div>
            <h1 style={{ marginBottom: "1.25rem", lineHeight: 1.15 }}>
              {post.title}
            </h1>
            <p
              style={{
                margin: "0 0 1.5rem",
                fontSize: "1.125rem",
                color: "var(--color-text-secondary)",
                lineHeight: 1.7,
              }}
            >
              {post.description}
            </p>
            <div
              style={{
                display: "flex",
                flexWrap: "wrap",
                gap: "1.25rem",
                alignItems: "center",
                fontSize: "0.875rem",
                color: "var(--color-text-muted)",
              }}
            >
              <div
                style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}
              >
                <div
                  style={{
                    width: "32px",
                    height: "32px",
                    borderRadius: "50%",
                    backgroundColor:
                      "color-mix(in srgb, var(--color-brand) 15%, transparent)",
                    border:
                      "1px solid color-mix(in srgb, var(--color-brand) 30%, transparent)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "0.875rem",
                    fontWeight: 700,
                    color: "var(--color-brand)",
                  }}
                >
                  {post.author.charAt(0)}
                </div>
                <span
                  style={{
                    fontWeight: 600,
                    color: "var(--color-text-secondary)",
                  }}
                >
                  {post.author}
                </span>
              </div>
              <time dateTime={post.publishDate}>{formattedDate}</time>
              <span>{minutes} min read</span>
            </div>
          </div>
        </ScrollReveal>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "minmax(0, 1fr) 260px",
            gap: "4rem",
            paddingTop: "2.5rem",
            paddingBottom: "5rem",
            alignItems: "start",
          }}
          className="two-col-layout blog-body-layout"
        >
          <ScrollReveal
            variant="fade-left"
            style={{ minWidth: 0, overflow: "hidden" }}
          >
            <article
              aria-label={post.title}
              className="prose"
              dangerouslySetInnerHTML={{ __html: bodyHtml }}
            />
            <div
              style={{
                marginTop: "3rem",
                paddingTop: "2rem",
                borderTop: "1px solid var(--color-border)",
              }}
            >
              <p
                style={{
                  margin: "0 0 1rem",
                  fontSize: "0.875rem",
                  fontWeight: 700,
                  textTransform: "uppercase",
                  letterSpacing: "0.08em",
                  color: "var(--color-text-muted)",
                }}
              >
                Share this post
              </p>
              <div
                style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap" }}
              >
                <a
                  href={twitterShareUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={"Share on X"}
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "0.5rem",
                    padding: "0.5rem 1rem",
                    borderRadius: "0.5rem",
                    border: "1px solid var(--color-border)",
                    backgroundColor: "var(--color-surface-elevated)",
                    color: "var(--color-text-primary)",
                    fontSize: "0.875rem",
                    fontWeight: 600,
                    textDecoration: "none",
                  }}
                >
                  𝕏 Share on X
                </a>
                <a
                  href={linkedInShareUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={"Share on LinkedIn"}
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "0.5rem",
                    padding: "0.5rem 1rem",
                    borderRadius: "0.5rem",
                    border: "1px solid var(--color-border)",
                    backgroundColor: "var(--color-surface-elevated)",
                    color: "var(--color-text-primary)",
                    fontSize: "0.875rem",
                    fontWeight: 600,
                    textDecoration: "none",
                  }}
                >
                  in LinkedIn
                </a>
              </div>
            </div>
          </ScrollReveal>

          {toc.length > 0 && (
            <aside style={{ position: "sticky", top: "88px" }}>
              <nav aria-label="Table of contents">
                <p
                  style={{
                    margin: "0 0 0.875rem",
                    fontSize: "0.75rem",
                    fontWeight: 700,
                    textTransform: "uppercase",
                    letterSpacing: "0.08em",
                    color: "var(--color-text-muted)",
                  }}
                >
                  On this page
                </p>
                <ol
                  style={{
                    listStyle: "none",
                    margin: 0,
                    padding: 0,
                    display: "flex",
                    flexDirection: "column",
                    gap: "0.125rem",
                  }}
                >
                  {toc.map((entry) => (
                    <li key={entry.id}>
                      <a
                        href={"#" + entry.id}
                        style={{
                          display: "block",
                          padding: "0.375rem 0.75rem",
                          borderRadius: "0.375rem",
                          fontSize: "0.875rem",
                          color: "var(--color-text-secondary)",
                          textDecoration: "none",
                          lineHeight: 1.5,
                          borderLeft: "2px solid var(--color-border)",
                        }}
                      >
                        {entry.text}
                      </a>
                    </li>
                  ))}
                </ol>
              </nav>
            </aside>
          )}
        </div>

        {related.length > 0 && (
          <section
            aria-labelledby="related-posts-heading"
            style={{
              paddingBottom: "5rem",
              borderTop: "1px solid var(--color-border)",
              paddingTop: "3rem",
            }}
          >
            <ScrollReveal variant="fade-up">
              <h2
                id="related-posts-heading"
                style={{ marginBottom: "2rem", fontSize: "1.375rem" }}
              >
                More Posts
              </h2>
            </ScrollReveal>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
                gap: "1.25rem",
              }}
            >
              {related.map((rel, i) => (
                <ScrollReveal
                  key={rel.slug}
                  variant="zoom"
                  delay={((i % 3) + 1) as 1 | 2 | 3}
                >
                  <Link
                    href={ROUTES.BLOG + "/" + rel.slug}
                    aria-label={"Read " + rel.title}
                    style={{
                      textDecoration: "none",
                      color: "inherit",
                      display: "block",
                    }}
                  >
                    <article
                      style={{
                        backgroundColor: "var(--color-surface)",
                        border: "1px solid var(--color-border)",
                        borderRadius: "0.875rem",
                        overflow: "hidden",
                      }}
                    >
                      {rel.heroImage && (
                        <div
                          style={{
                            position: "relative",
                            aspectRatio: "16/9",
                            backgroundColor: "var(--color-surface-elevated)",
                          }}
                        >
                          <Image
                            loading="eager"
                            src={rel.heroImage}
                            alt={"Hero image for " + rel.title}
                            fill
                            style={{ objectFit: "cover" }}
                            sizes="320px"
                          />
                        </div>
                      )}
                      <div style={{ padding: "1.25rem" }}>
                        <span
                          style={{
                            display: "inline-block",
                            marginBottom: "0.5rem",
                            padding: "0.2rem 0.5rem",
                            borderRadius: "9999px",
                            backgroundColor: "var(--color-brand)",
                            color: "var(--color-background)",
                            fontSize: "0.6875rem",
                            fontWeight: 700,
                            textTransform: "uppercase",
                          }}
                        >
                          {rel.category}
                        </span>
                        <h3
                          style={{
                            margin: "0 0 0.5rem",
                            fontSize: "1rem",
                            fontWeight: 700,
                            lineHeight: 1.3,
                          }}
                        >
                          {rel.title}
                        </h3>
                        <time
                          dateTime={rel.publishDate}
                          style={{
                            fontSize: "0.8125rem",
                            color: "var(--color-text-muted)",
                          }}
                        >
                          {new Date(rel.publishDate).toLocaleDateString(
                            "en-US",
                            { year: "numeric", month: "short", day: "numeric" },
                          )}
                        </time>
                      </div>
                    </article>
                  </Link>
                </ScrollReveal>
              ))}
            </div>
          </section>
        )}
      </ContentWidth>
    </div>
  );
}
