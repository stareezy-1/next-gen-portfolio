/**
 * RSS feed route — serves `/feed.xml` with published blog posts.
 *
 * Posts are sorted newest-first. The feed uses standard RSS 2.0 format with
 * CDATA-wrapped title and description to handle special characters safely.
 *
 * @see Requirements 18.4
 */

import { loadAll } from "@/content/loader";
import { publishedOnly } from "@/lib/blog/query";
import { rssItems } from "@/services/seo";
import { SITE_NAME, SITE_URL, SITE_DESCRIPTION } from "@/constants";

export function GET(): Response {
  const { items } = loadAll("blog");
  const published = publishedOnly(items).sort(
    (a, b) =>
      new Date(b.publishDate).getTime() - new Date(a.publishDate).getTime(),
  );
  const feedItems = rssItems(published);

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
  <channel>
    <title>${SITE_NAME}</title>
    <link>${SITE_URL}</link>
    <description>${SITE_DESCRIPTION}</description>
    ${feedItems
      .map(
        (item) => `
    <item>
      <title><![CDATA[${item.title}]]></title>
      <link>${item.link}</link>
      <description><![CDATA[${item.description}]]></description>
      <pubDate>${item.pubDate}</pubDate>
      <guid>${item.guid}</guid>
    </item>`,
      )
      .join("")}
  </channel>
</rss>`;

  return new Response(xml, {
    headers: { "Content-Type": "application/rss+xml; charset=utf-8" },
  });
}
