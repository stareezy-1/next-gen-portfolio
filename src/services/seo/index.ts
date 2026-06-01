/**
 * SEO_Engine — core functions for metadata, canonical URLs, sitemap, robots,
 * RSS feed, structured data, and redirects.
 *
 * All functions are pure and framework-agnostic except `buildMetadata`, which
 * returns a Next.js `Metadata` object.
 *
 * @see Requirements 17.1, 17.2, 17.3, 17.4, 18.1, 18.2, 18.3, 18.4, 18.5,
 *      18.6, 19.1, 19.2, 19.3, 19.4, 19.5, 19.7
 */

import type { Metadata } from "next";

import { SITE_URL, OG_IMAGE_PATH } from "@/constants/seo";
import { ROUTES } from "@/constants/routes";
import type {
  RouteDescriptor,
  SitemapEntry,
  RobotsConfig,
  RssItem,
  Redirect,
  JsonLd,
  SchemaType,
} from "@/types/seo";
import type { BlogPost } from "@/types/content";

// ---------------------------------------------------------------------------
// canonicalUrl
// ---------------------------------------------------------------------------

/**
 * Build an absolute canonical URL for a path.
 *
 * Rules:
 *   - Prepend `SITE_URL` to `path`.
 *   - For "/", return `SITE_URL` with no trailing slash.
 *   - For any other path, return `SITE_URL + path` (no trailing slash added).
 *   - Never produce double slashes.
 *
 * @example
 *   canonicalUrl("/")              → "https://rekosistem.com"
 *   canonicalUrl("/blog/my-post")  → "https://rekosistem.com/blog/my-post"
 *
 * @see Requirements 17.4
 */
export function canonicalUrl(path: string): string {
  // Normalize: ensure path starts with "/"
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;

  // Root path → return base URL without trailing slash
  if (normalizedPath === "/") {
    return SITE_URL;
  }

  // Remove trailing slash from non-root paths
  const withoutTrailingSlash = normalizedPath.endsWith("/")
    ? normalizedPath.slice(0, -1)
    : normalizedPath;

  return `${SITE_URL}${withoutTrailingSlash}`;
}

// ---------------------------------------------------------------------------
// buildMetadata
// ---------------------------------------------------------------------------

/**
 * Build a Next.js `Metadata` object for a route.
 *
 * Returns:
 *   - `title`: route.title
 *   - `description`: route.description
 *   - `alternates.canonical`: absolute canonical URL for the route path
 *   - `openGraph.images`: array with the absolute OG image URL
 *
 * @see Requirements 18.3, 18.5
 */
export function buildMetadata(route: RouteDescriptor): Metadata {
  const canonical = canonicalUrl(route.path);
  const ogImageUrl = canonicalUrl(route.ogImage ?? OG_IMAGE_PATH);

  return {
    title: route.title,
    description: route.description,
    alternates: {
      canonical,
    },
    openGraph: {
      images: [ogImageUrl],
    },
  };
}

// ---------------------------------------------------------------------------
// Primary routes for sitemap
// ---------------------------------------------------------------------------

/**
 * The primary routes that are always included in the sitemap.
 * Each entry carries its change frequency and priority.
 */
const PRIMARY_SITEMAP_ROUTES: Array<{
  path: string;
  changeFrequency: SitemapEntry["changeFrequency"];
  priority: number;
}> = [
  { path: ROUTES.HOME, changeFrequency: "weekly", priority: 1.0 },
  { path: ROUTES.ABOUT, changeFrequency: "monthly", priority: 0.8 },
  { path: ROUTES.EXPERIENCE, changeFrequency: "monthly", priority: 0.7 },
  { path: ROUTES.PROJECTS, changeFrequency: "weekly", priority: 0.9 },
  { path: ROUTES.BLOG, changeFrequency: "daily", priority: 0.9 },
  { path: ROUTES.CONTACT, changeFrequency: "yearly", priority: 0.6 },
];

// ---------------------------------------------------------------------------
// sitemapEntries
// ---------------------------------------------------------------------------

/**
 * Build sitemap entries for all indexable pages.
 *
 * Includes:
 *   - All six primary routes (Home, About, Experience, Projects, Blog, Contact)
 *   - All blog post URLs: `/blog/${slug}` for each slug
 *   - All project URLs: `/projects/${slug}` for each slug
 *
 * All URLs are absolute (via `canonicalUrl`). No duplicates are produced.
 *
 * @see Requirements 18.1, 18.6
 */
export function sitemapEntries(options: {
  blogSlugs: string[];
  projectSlugs: string[];
}): SitemapEntry[] {
  const { blogSlugs, projectSlugs } = options;
  const seen = new Set<string>();
  const entries: SitemapEntry[] = [];

  function addEntry(entry: SitemapEntry): void {
    if (!seen.has(entry.url)) {
      seen.add(entry.url);
      entries.push(entry);
    }
  }

  // Primary routes
  for (const route of PRIMARY_SITEMAP_ROUTES) {
    addEntry({
      url: canonicalUrl(route.path),
      lastModified: new Date().toISOString().split("T")[0],
      changeFrequency: route.changeFrequency,
      priority: route.priority,
    });
  }

  // Blog post URLs
  for (const slug of blogSlugs) {
    addEntry({
      url: canonicalUrl(`/blog/${slug}`),
      lastModified: new Date().toISOString().split("T")[0],
      changeFrequency: "monthly",
      priority: 0.7,
    });
  }

  // Project URLs
  for (const slug of projectSlugs) {
    addEntry({
      url: canonicalUrl(`/projects/${slug}`),
      lastModified: new Date().toISOString().split("T")[0],
      changeFrequency: "monthly",
      priority: 0.8,
    });
  }

  return entries;
}

// ---------------------------------------------------------------------------
// robots
// ---------------------------------------------------------------------------

/**
 * Build robots.txt configuration.
 *
 * Returns rules allowing all crawlers plus the sitemap location.
 *
 * @see Requirements 18.2
 */
export function robots(): RobotsConfig {
  return {
    rules: [
      {
        userAgent: "*",
        allow: ["/"],
      },
    ],
    sitemap: canonicalUrl("/sitemap.xml"),
  };
}

// ---------------------------------------------------------------------------
// rssItems
// ---------------------------------------------------------------------------

/**
 * Build RSS feed items from published blog posts.
 *
 * Maps each `BlogPost` to an `RssItem`:
 *   - `title`: post.title
 *   - `link`: absolute URL for the post (`/blog/${post.slug}`)
 *   - `description`: post.description
 *   - `pubDate`: post.publishDate
 *   - `guid`: same as link
 *
 * @see Requirements 18.4
 */
export function rssItems(posts: BlogPost[]): RssItem[] {
  return posts.map((post) => {
    const link = canonicalUrl(`/blog/${post.slug}`);
    return {
      title: post.title,
      link,
      description: post.description,
      pubDate: post.publishDate,
      guid: link,
    };
  });
}

// ---------------------------------------------------------------------------
// structuredData
// ---------------------------------------------------------------------------

/**
 * Build a JSON-LD structured data object.
 *
 * Returns `{ "@context": "https://schema.org", "@type": type, ...data }`.
 *
 * @see Requirements 19.1, 19.2, 19.3, 19.4, 19.5, 19.7
 */
export function structuredData(
  type: SchemaType,
  data: Record<string, unknown>,
): JsonLd {
  return {
    "@context": "https://schema.org",
    "@type": type,
    ...data,
  };
}

// ---------------------------------------------------------------------------
// redirects
// ---------------------------------------------------------------------------

/**
 * Build the redirect map for changed legacy URLs.
 *
 * Returns an empty array for now; populated during the content migration task
 * (Task 25) when legacy URL changes are identified.
 *
 * @see Requirements 17.3
 */
export function redirects(): Redirect[] {
  return [];
}
