/**
 * Next.js sitemap route — generates `sitemap.xml` at build time.
 *
 * Enumerates every indexable Platform URL:
 *   - All six primary routes
 *   - Every published blog post URL
 *   - Every project URL (personal + professional)
 *
 * @see Requirements 18.1, 18.6
 */

import type { MetadataRoute } from "next";

import { loadAll } from "@/content/loader";
import { publishedOnly } from "@/lib/blog/query";
import { sitemapEntries } from "@/services/seo";

export default function sitemap(): MetadataRoute.Sitemap {
  const { items: blogItems } = loadAll("blog");
  const published = publishedOnly(blogItems);

  const { items: personal } = loadAll("personal-project");
  const { items: professional } = loadAll("professional-project");

  const entries = sitemapEntries({
    blogSlugs: published.map((p) => p.slug),
    projectSlugs: [...personal, ...professional].map((p) => p.slug),
  });

  return entries.map((e) => ({
    url: e.url,
    lastModified: e.lastModified ? new Date(e.lastModified) : new Date(),
    changeFrequency:
      e.changeFrequency as MetadataRoute.Sitemap[0]["changeFrequency"],
    priority: e.priority,
  }));
}
