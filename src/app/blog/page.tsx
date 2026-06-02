/**
 * Blog listing page — React Server Component.
 * @see Requirements 13.1–13.6
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
import { MotionWrapper } from "@/components/shared/MotionWrapper";
import { BlogSearch } from "@/features/blog/BlogSearch";
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

  const breadcrumbLd = breadcrumbListJsonLd([
    { name: NAV_LABELS.HOME, url: canonicalUrl(ROUTES.HOME) },
    { name: NAV_LABELS.BLOG, url: canonicalUrl(ROUTES.BLOG) },
  ]);

  return (
    <ContentWidth as="main">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }}
      />

      {/* Page header */}
      <div
        style={{
          paddingTop: "4rem",
          paddingBottom: "3rem",
          borderBottom: "1px solid var(--color-border)",
        }}
      >
        <MotionWrapper variant="heroWordReveal">
          <p
            style={{
              fontSize: "0.8125rem",
              fontWeight: 700,
              textTransform: "uppercase",
              letterSpacing: "0.1em",
              color: "var(--color-brand)",
              marginBottom: "0.75rem",
            }}
          >
            Writing
          </p>
          <h1 style={{ marginBottom: "1rem" }}>Blog</h1>
          <p
            style={{
              fontSize: "1.125rem",
              color: "var(--color-text-secondary)",
              lineHeight: 1.7,
              maxWidth: "560px",
            }}
          >
            Technical articles, tutorials, and thoughts on software engineering,
            design systems, and developer experience.
          </p>
        </MotionWrapper>
      </div>

      {/* Search / filter */}
      <div style={{ paddingTop: "2rem", paddingBottom: "1.5rem" }}>
        <Suspense fallback={null}>
          <BlogSearch tags={allTags} categories={allCategories} />
        </Suspense>
      </div>

      {/* Empty state */}
      {isEmpty ? (
        <MotionWrapper variant="sectionReveal">
          <div
            style={{
              textAlign: "center",
              padding: "5rem 2rem",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: "1rem",
            }}
          >
            <span style={{ fontSize: "3rem" }}>📭</span>
            <h2 style={{ margin: 0, fontSize: "1.25rem" }}>
              {hasFilters ? "No posts found" : "No posts yet"}
            </h2>
            <p style={{ margin: 0, color: "var(--color-text-muted)" }}>
              {hasFilters
                ? "Try a different search or filter."
                : "Check back soon."}
            </p>
          </div>
        </MotionWrapper>
      ) : (
        <>
          <section aria-label="Blog posts" style={{ paddingBottom: "3rem" }}>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
                gap: "1.5rem",
              }}
            >
              {posts.map((post) => (
                <MotionWrapper key={post.slug} variant="sectionReveal">
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
                        transition: "border-color 0.2s ease",
                      }}
                    >
                      {post.heroImage && (
                        <div
                          style={{
                            position: "relative",
                            width: "100%",
                            aspectRatio: "16/9",
                            backgroundColor: "var(--color-surface-elevated)",
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
                          gap: "0.875rem",
                          flex: 1,
                        }}
                      >
                        <div
                          style={{
                            display: "flex",
                            flexWrap: "wrap",
                            gap: "0.375rem",
                          }}
                        >
                          <span
                            style={{
                              padding: "0.2rem 0.625rem",
                              borderRadius: "9999px",
                              backgroundColor: "var(--color-brand)",
                              color: "var(--color-background)",
                              fontSize: "0.6875rem",
                              fontWeight: 700,
                              textTransform: "uppercase",
                              letterSpacing: "0.05em",
                            }}
                          >
                            {post.category}
                          </span>
                          {post.tags.slice(0, 2).map((tag) => (
                            <span
                              key={tag}
                              style={{
                                padding: "0.2rem 0.5rem",
                                borderRadius: "9999px",
                                backgroundColor:
                                  "var(--color-surface-elevated)",
                                border: "1px solid var(--color-border)",
                                fontSize: "0.6875rem",
                                color: "var(--color-text-muted)",
                              }}
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                        <h2
                          style={{
                            margin: 0,
                            fontSize: "1.0625rem",
                            fontWeight: 700,
                            lineHeight: 1.3,
                            color: "var(--color-text-primary)",
                            textDecoration: "none",
                          }}
                        >
                          {post.title}
                        </h2>
                        <p
                          style={{
                            margin: 0,
                            fontSize: "0.9rem",
                            color: "var(--color-text-secondary)",
                            lineHeight: 1.65,
                            display: "-webkit-box",
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: "vertical",
                            overflow: "hidden",
                            textDecoration: "none",
                          }}
                        >
                          {post.description}
                        </p>
                        <div
                          style={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                            marginTop: "auto",
                            paddingTop: "0.75rem",
                            borderTop: "1px solid var(--color-border)",
                          }}
                        >
                          <time
                            dateTime={post.publishDate}
                            style={{
                              fontSize: "0.8125rem",
                              color: "var(--color-text-muted)",
                            }}
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
                          <span
                            style={{
                              fontSize: "0.8125rem",
                              color: "var(--color-text-muted)",
                            }}
                          >
                            {readingTime(post.body)} min read
                          </span>
                        </div>
                      </div>
                    </article>
                  </Link>
                </MotionWrapper>
              ))}
            </div>
          </section>

          {/* Pagination */}
          {totalPages > 1 && (
            <nav
              aria-label="Blog pagination"
              style={{
                display: "flex",
                justifyContent: "center",
                gap: "0.75rem",
                paddingBottom: "4rem",
              }}
            >
              {page > 1 && (
                <a
                  href={buildPageUrl(page - 1)}
                  aria-label="Previous page"
                  style={{
                    padding: "0.5rem 1rem",
                    borderRadius: "0.5rem",
                    border: "1px solid var(--color-border)",
                    backgroundColor: "var(--color-surface)",
                    color: "var(--color-text-primary)",
                    textDecoration: "none",
                    fontSize: "0.9375rem",
                  }}
                >
                  ← Previous
                </a>
              )}
              <span
                style={{
                  padding: "0.5rem 1rem",
                  borderRadius: "0.5rem",
                  backgroundColor: "var(--color-brand)",
                  color: "var(--color-background)",
                  fontSize: "0.9375rem",
                  fontWeight: 600,
                }}
              >
                {page} / {totalPages}
              </span>
              {page < totalPages && (
                <a
                  href={buildPageUrl(page + 1)}
                  aria-label="Next page"
                  style={{
                    padding: "0.5rem 1rem",
                    borderRadius: "0.5rem",
                    border: "1px solid var(--color-border)",
                    backgroundColor: "var(--color-surface)",
                    color: "var(--color-text-primary)",
                    textDecoration: "none",
                    fontSize: "0.9375rem",
                  }}
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
