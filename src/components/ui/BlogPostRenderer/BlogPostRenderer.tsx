/**
 * BlogPostRenderer — renders a single BlogPost card.
 *
 * Required fields rendered: title, heroImage, author, publishDate,
 * description, tags, category (Requirement 14.1).
 * Optional: readingTimeMinutes — displayed when provided (Requirement 14.1).
 *
 * This is a React Server Component (no `'use client'`). Styles live in
 * `BlogPostRenderer.style.ts` — no inline styles here (Requirement 26.1).
 *
 * @see Requirements 14.1, 26.1, 26.2
 */

import Image from "next/image";
import type { BlogPostRendererProps } from "./BlogPostRenderer.types";
import {
  blogPostWrapperStyles,
  blogPostHeroContainerStyles,
  blogPostHeroImageStyles,
  blogPostContentStyles,
  blogPostCategoryRowStyles,
  blogPostCategoryStyles,
  blogPostTagStyles,
  blogPostTitleStyles,
  blogPostDescriptionStyles,
  blogPostMetaStyles,
  blogPostAuthorStyles,
  blogPostMetaSeparatorStyles,
  blogPostReadingTimeStyles,
} from "./BlogPostRenderer.style";

/**
 * Renders all required fields of a {@link BlogPost}.
 *
 * When `readingTimeMinutes` is provided it is shown in the meta row alongside
 * the author and publish date (Requirement 14.1).
 *
 * @param props - See {@link BlogPostRendererProps}.
 */
export function BlogPostRenderer({
  post,
  readingTimeMinutes,
}: BlogPostRendererProps) {
  const { title, heroImage, author, publishDate, description, tags, category } =
    post;

  /** Format the ISO publish date for display. */
  const formattedDate = new Date(publishDate).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <article style={blogPostWrapperStyles}>
      {/* Hero image */}
      <div style={blogPostHeroContainerStyles}>
        <Image
          src={heroImage}
          alt={`Hero image for ${title}`}
          fill
          loading="eager"
          style={blogPostHeroImageStyles}
          sizes="(max-width: 768px) 100vw, 50vw"
          priority={false}
        />
      </div>

      <div style={blogPostContentStyles}>
        {/* Category + tags */}
        <div style={blogPostCategoryRowStyles}>
          <span style={blogPostCategoryStyles}>{category}</span>
          {tags.map((tag, index) => (
            <span key={`${tag}-${index}`} style={blogPostTagStyles}>
              {tag}
            </span>
          ))}
        </div>

        {/* Title */}
        <h2 style={blogPostTitleStyles}>{title}</h2>

        {/* Description */}
        <p style={blogPostDescriptionStyles}>{description}</p>

        {/* Meta: author · date · reading time */}
        <footer style={blogPostMetaStyles}>
          <span style={blogPostAuthorStyles}>{author}</span>

          <span style={blogPostMetaSeparatorStyles} aria-hidden="true">
            ·
          </span>

          <time dateTime={publishDate}>{formattedDate}</time>

          {/* Reading time — rendered only when provided (Requirement 14.1) */}
          {readingTimeMinutes !== undefined && (
            <>
              <span style={blogPostMetaSeparatorStyles} aria-hidden="true">
                ·
              </span>
              <span
                style={blogPostReadingTimeStyles}
                aria-label={`${readingTimeMinutes} minute read`}
              >
                {readingTimeMinutes} min read
              </span>
            </>
          )}
        </footer>
      </div>
    </article>
  );
}
