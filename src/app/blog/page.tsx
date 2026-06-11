/**
 * Blog index page — React Server Component, "The Logbook" direction.
 *
 * Horizontal post rows (home .post-* primitives) with an outline category Badge
 * and mono date + reading time. Pagination uses .btn-ghost with a mono page
 * indicator. The stars-sparkle empty state is preserved. BlogSearch is untouched.
 * Zero em-dashes; mono carries dates and counts.
 */

import { Suspense } from "react";
import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";

import { loadAll } from "@/content/loader";
import {
  publishedOnly,
  searchPosts,
  filterPosts,
  paginate,
} from "@/lib/blog/query";
import { readingTime } from "@/lib/blog/reading-time";
import { ContentWidth } from "@/components/layouts";
import { ScrollReveal } from "@/components/shared/ScrollReveal";
import { AssetPlayer } from "@/components/shared/AssetPlayer";
import { BlogSearch } from "@/features/blog/BlogSearch";
import { Badge } from "@/components/ui/shadcn/badge";
import { canonicalUrl } from "@/services/seo";
import { breadcrumbListJsonLd } from "@/services/seo/structured-data";
import { ROUTES, NAV_LABELS, BLOG_PAGE_SIZE } from "@/constants";

export const metadata: Metadata = {
  title: "Blog",
  description:
    "Technical articles on React, React Native, TypeScript, design token systems, and cross-platform engineering by Muhammad Bintang Al Akbar.",
  alternates: { canonical: "https://stareezy.tech/blog" },
};

function uniqueSorted(values: string[]): string[] {
  return [...new Set(values)].sort((a, b) => a.localeCompare(b));
}

export default async function BlogPage({
  searchParams,
}: {
  searchParams: Promise<{
    q?: string;
    tag?: string;
    category?: string;
    page?: string;
  }>;
}) {
  const { q, tag, category, page: pageParam } = await searchParams;

  const { items } = loadAll("blog");
  const published = publishedOnly(items);
  const allTags = uniqueSorted(published.flatMap((p) => p.tags));
  const allCategories = uniqueSorted(published.map((p) => p.category));

  const searched = q ? searchPosts(published, q) : published;
  const filtered = filterPosts(
    searched,
    tag || undefined,
    category || undefined,
  );
  const requestedPage = pageParam ? parseInt(pageParam, 10) : 1;
  const { posts, page, totalPages } = paginate(
    filtered,
    Number.isFinite(requestedPage) ? requestedPage : 1,
    BLOG_PAGE_SIZE,
  );

  const buildPageUrl = (p: number) => {
    const params = new URLSearchParams();
    if (q) params.set("q", q);
    if (tag) params.set("tag", tag);
    if (category) params.set("category", category);
    if (p > 1) params.set("page", String(p));
    const qs = params.toString();
    return `${ROUTES.BLOG}${qs ? `?${qs}` : ""}`;
  };

  const isEmpty = posts.length === 0;
  const hasFilters = Boolean(q || tag || category);

  // Featured lead: the newest post, shown only on the unfiltered first page.
  const showLead = page === 1 && !hasFilters && posts.length > 0;
  const leadPost = showLead ? posts[0] : undefined;
  const restPosts = showLead ? posts.slice(1) : posts;

  const breadcrumbLd = breadcrumbListJsonLd([
    { name: NAV_LABELS.HOME, url: canonicalUrl(ROUTES.HOME) },
    { name: NAV_LABELS.BLOG, url: canonicalUrl(ROUTES.BLOG) },
  ]);

  return (
    <ContentWidth as="main">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }}
        suppressHydrationWarning
      />

      {/* ── Page header ──────────────────────────────────────────────── */}
      <section aria-labelledby="blog-page-heading" className="page-head">
        <ScrollReveal variant="fade-up">
          <p className="section-kicker">Writing</p>
          <h1 id="blog-page-heading" className="page-head-title">
            Notes from the build
          </h1>
          <p className="page-head-sub">
            Articles and write-ups on React, design systems, and the tooling I
            reach for when shipping cross-platform.
          </p>
        </ScrollReveal>
      </section>

      {/* ── Search / filter (client component, untouched) ────────────── */}
      <div style={{ paddingTop: "2rem", paddingBottom: "1.5rem" }}>
        <Suspense fallback={null}>
          <BlogSearch tags={allTags} categories={allCategories} />
        </Suspense>
      </div>

      {/* ── Empty state ──────────────────────────────────────────────── */}
      {isEmpty ? (
        <ScrollReveal variant="zoom">
          <div className="blog-empty">
            <div className="blog-empty-lottie" aria-hidden="true">
              <AssetPlayer
                src="/lottie/stars-sparkle.json"
                decorative
                trigger="auto"
                width="100%"
                height="100%"
              />
            </div>
            <h2 className="blog-empty-title">
              {hasFilters ? "Nothing matched" : "No posts yet"}
            </h2>
            <p className="blog-empty-text">
              {hasFilters
                ? "Try a different search or clear the filters."
                : "Check back soon."}
            </p>
          </div>
        </ScrollReveal>
      ) : (
        <>
          {/* ── Featured lead post (only on page 1, no active filters) ── */}
          {showLead && leadPost && (
            <ScrollReveal variant="fade-up">
              <Link
                href={`${ROUTES.BLOG}/${leadPost.slug}`}
                aria-label={`Read ${leadPost.title}`}
                className="blog-lead"
              >
                {leadPost.heroImage && (
                  <div className="blog-lead-media">
                    <Image
                      loading="eager"
                      src={leadPost.heroImage}
                      alt={`Cover for ${leadPost.title}`}
                      fill
                      className="blog-lead-img"
                      sizes="(max-width: 860px) 100vw, 620px"
                      priority
                    />
                  </div>
                )}
                <div className="blog-lead-body">
                  <div className="blog-lead-meta">
                    <span className="blog-lead-flag">Latest</span>
                    <Badge variant="outline" className="post-cat">
                      {leadPost.category}
                    </Badge>
                    <time dateTime={leadPost.publishDate} className="post-date">
                      {new Date(leadPost.publishDate).toLocaleDateString(
                        "en-US",
                        { year: "numeric", month: "short", day: "numeric" },
                      )}
                    </time>
                    <span className="post-date">
                      {readingTime(leadPost.body)} min read
                    </span>
                  </div>
                  <h2 className="blog-lead-title">{leadPost.title}</h2>
                  <p className="blog-lead-desc">{leadPost.description}</p>
                  <span className="blog-lead-cta" aria-hidden="true">
                    Read the post ↗
                  </span>
                </div>
              </Link>
            </ScrollReveal>
          )}

          {/* ── Post list — horizontal rows ────────────────────────── */}
          <section aria-label="Blog posts" style={{ paddingBottom: "3rem" }}>
            <div className="post-list">
              {restPosts.map((post, i) => (
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
                          loading="eager"
                          src={post.heroImage}
                          alt={`Cover for ${post.title}`}
                          fill
                          className="post-row-img"
                          sizes="(max-width: 640px) 100vw, 240px"
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
                        <span className="post-date">
                          {readingTime(post.body)} min read
                        </span>
                      </div>
                      <h2 className="post-title">{post.title}</h2>
                      <p className="post-desc">{post.description}</p>
                    </div>
                  </Link>
                </ScrollReveal>
              ))}
            </div>
          </section>

          {/* ── Pagination ─────────────────────────────────────────── */}
          {totalPages > 1 && (
            <nav aria-label="Blog pagination" className="pager">
              {page > 1 && (
                <a
                  href={buildPageUrl(page - 1)}
                  aria-label="Previous page"
                  className="btn-ghost"
                >
                  ← Previous
                </a>
              )}
              <span
                className="pager-current"
                aria-current="page"
                aria-label={`Page ${page} of ${totalPages}`}
              >
                {page} / {totalPages}
              </span>
              {page < totalPages && (
                <a
                  href={buildPageUrl(page + 1)}
                  aria-label="Next page"
                  className="btn-ghost"
                >
                  Next →
                </a>
              )}
            </nav>
          )}
        </>
      )}
    </ContentWidth>
  );
}
