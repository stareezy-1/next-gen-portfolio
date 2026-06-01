/**
 * SEO data models for the SEO_Engine.
 *
 * These are kept minimal but typed, matching the SeoEngine interface from the
 * design: metadata, canonical URLs, sitemap, robots, RSS, redirects, and
 * structured data.
 *
 * @see Requirements 17.x, 18.x, 19.x
 */

/** The schema.org structured-data types the SEO_Engine emits. */
export type SchemaType =
  | "Person"
  | "WebSite"
  | "BlogPosting"
  | "CreativeWork"
  | "BreadcrumbList"
  | "FAQPage";

/** Describes a route for metadata generation. */
export interface RouteDescriptor {
  /** Route path, e.g. `/blog/my-post`. */
  path: string;
  title: string;
  description: string;
  /** Open Graph image URL for the route. */
  ogImage?: string;
  /** Whether the page should be enumerated in the sitemap. */
  indexable?: boolean;
}

/** A single entry in the generated sitemap. */
export interface SitemapEntry {
  /** Absolute URL of the page. */
  url: string;
  lastModified?: string;
  changeFrequency?:
    | "always"
    | "hourly"
    | "daily"
    | "weekly"
    | "monthly"
    | "yearly"
    | "never";
  priority?: number;
}

/** Robots crawl configuration. */
export interface RobotsConfig {
  rules: Array<{
    userAgent: string;
    allow?: string[];
    disallow?: string[];
  }>;
  /** Absolute URL of the sitemap. */
  sitemap: string;
}

/** A single item in the generated RSS feed. */
export interface RssItem {
  title: string;
  /** Absolute URL of the post. */
  link: string;
  description: string;
  /** ISO-8601 publish date string. */
  pubDate: string;
  guid: string;
}

/** A permanent (301) redirect from a changed legacy URL to a current route. */
export interface Redirect {
  source: string;
  destination: string;
  /** True for a permanent (301) redirect. */
  permanent: boolean;
}

/**
 * A JSON-LD structured-data object. Always declares a schema.org context and
 * type; remaining properties depend on the type.
 */
export interface JsonLd {
  "@context": "https://schema.org";
  "@type": SchemaType;
  [key: string]: unknown;
}
