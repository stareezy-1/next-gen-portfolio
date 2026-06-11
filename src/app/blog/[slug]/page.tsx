/**
 * Blog detail page — React Server Component, "The Logbook" direction.
 *
 * Full-width hero banner with a gradient scrim and breadcrumb. Title block
 * carries a category Badge, tag Badges, Space Grotesk title, description, and a
 * byline with Avatar + mono date and reading time. A two-column body (prose
 * article + sticky mono TOC) sits below, then share buttons and related posts.
 * Zero em-dashes; mono carries dates and reading time.
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
import { ReadingProgress } from "@/components/shared/ReadingProgress/ReadingProgress";
import { Badge } from "@/components/ui/shadcn/badge";
import { Avatar, AvatarFallback } from "@/components/ui/shadcn/avatar";
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

  const authorInitials = post.author
    .split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <div>
      <ReadingProgress />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(blogPostingLd) }}
        suppressHydrationWarning
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }}
        suppressHydrationWarning
      />

      {/* ── Hero banner — scrim + breadcrumb ─────────────────────────── */}
      <div className="detail-banner">
        <Image
          loading="eager"
          src={post.heroImage}
          alt={"Cover for " + post.title}
          width={1200}
          height={420}
          className="detail-banner-img"
          priority
          sizes="100vw"
        />
        <div className="detail-banner-scrim" aria-hidden="true" />
        <nav className="crumb" aria-label="Breadcrumb">
          <Link href={ROUTES.BLOG} className="crumb-link">
            Blog
          </Link>
          <span className="crumb-sep" aria-hidden="true">
            /
          </span>
          <span className="crumb-current">{post.title}</span>
        </nav>
      </div>

      <ContentWidth as="main">
        {/* ── Title block ────────────────────────────────────────────── */}
        <ScrollReveal variant="fade-up">
          <div className="article-head">
            <div className="article-head-badges">
              <Badge variant="outline" className="post-cat">
                {post.category}
              </Badge>
              {post.tags.map((tag) => (
                <Badge key={tag} variant="secondary" className="text-xs">
                  {tag}
                </Badge>
              ))}
            </div>

            <h1 className="article-head-title">{post.title}</h1>
            <p className="article-head-desc">{post.description}</p>

            <div className="article-byline">
              <div className="article-byline-author">
                <Avatar className="w-8 h-8">
                  <AvatarFallback className="article-avatar-fallback">
                    {authorInitials}
                  </AvatarFallback>
                </Avatar>
                <span className="article-byline-name">{post.author}</span>
              </div>
              <time dateTime={post.publishDate} className="article-byline-meta">
                {formattedDate}
              </time>
              <span className="article-byline-meta">{minutes} min read</span>
            </div>
          </div>
        </ScrollReveal>

        {/* ── Two-column: article + TOC ──────────────────────────────── */}
        <div className="article-layout two-col-layout blog-body-layout">
          <ScrollReveal variant="fade-up" className="article-main">
            <article
              aria-label={post.title}
              className="prose"
              dangerouslySetInnerHTML={{ __html: bodyHtml }}
            />

            {/* Share */}
            <div className="share">
              <p className="share-label">Share this post</p>
              <div className="share-actions">
                <a
                  href={twitterShareUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Share on X"
                  className="btn-ghost"
                >
                  Share on X
                </a>
                <a
                  href={linkedInShareUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Share on LinkedIn"
                  className="btn-ghost"
                >
                  Share on LinkedIn
                </a>
              </div>
            </div>
          </ScrollReveal>

          {toc.length > 0 && (
            <aside className="article-toc">
              <nav aria-label="Table of contents">
                <p className="toc-label">On this page</p>
                <ol className="toc-list">
                  {toc.map((entry) => (
                    <li key={entry.id}>
                      <a href={"#" + entry.id} className="toc-link">
                        {entry.text}
                      </a>
                    </li>
                  ))}
                </ol>
              </nav>
            </aside>
          )}
        </div>

        {/* ── Related posts ──────────────────────────────────────────── */}
        {related.length > 0 && (
          <section
            aria-labelledby="related-posts-heading"
            className="rel-section"
          >
            <ScrollReveal variant="fade-up">
              <h2 id="related-posts-heading" className="section-h2">
                More posts
              </h2>
            </ScrollReveal>
            <div className="rel-grid" style={{ marginTop: "2.5rem" }}>
              {related.map((rel, i) => (
                <ScrollReveal
                  key={rel.slug}
                  variant="fade-up"
                  delay={((i % 3) + 1) as 1 | 2 | 3}
                  as="div"
                >
                  <Link
                    href={ROUTES.BLOG + "/" + rel.slug}
                    aria-label={"Read " + rel.title}
                    className="rel-card"
                  >
                    {rel.heroImage && (
                      <div className="rel-card-media">
                        <Image
                          loading="eager"
                          src={rel.heroImage}
                          alt={"Cover for " + rel.title}
                          fill
                          className="rel-card-img"
                          sizes="320px"
                        />
                      </div>
                    )}
                    <div className="rel-card-body">
                      <div>
                        <Badge variant="outline" className="post-cat">
                          {rel.category}
                        </Badge>
                      </div>
                      <h3 className="rel-card-title">{rel.title}</h3>
                      <time
                        dateTime={rel.publishDate}
                        className="rel-card-date"
                      >
                        {new Date(rel.publishDate).toLocaleDateString("en-US", {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                        })}
                      </time>
                    </div>
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
