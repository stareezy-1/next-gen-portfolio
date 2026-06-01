/**
 * Blog query utilities: search, filter, and pagination over Blog Posts.
 *
 * These are pure, framework-agnostic functions that back the Blog listing
 * page's search box, tag/category filters, and pagination control. They never
 * mutate their inputs and always return new arrays.
 *
 * Empty-results signal: {@link searchPosts} and {@link filterPosts} return an
 * empty array (`[]`) when nothing matches, and {@link paginate} returns a page
 * with empty `posts`, so the UI can render an empty-results state
 * (Requirement 13.6).
 *
 * @see Requirements 13.1, 13.2, 13.3, 13.4, 13.5, 13.6
 * @see Property 17 — filtering returns only matching posts
 * @see Property 18 — search returns exactly the matching posts
 * @see Property 19 — pagination partitions posts into bounded pages
 */

import { BLOG_PAGE_SIZE } from "@/constants";
import type { BlogPost } from "@/types";

/**
 * A blog listing query: an optional free-text search, optional tag/category
 * filters, and the requested 1-indexed page number.
 *
 * @see Requirements 13.2, 13.3, 13.4, 13.5
 */
export interface BlogQuery {
  /** Free-text search query. Empty/whitespace means "no search". */
  q?: string;
  /** Tag filter. When set, only posts whose `tags` include it match. */
  tag?: string;
  /** Category filter. When set, only posts whose `category` equals it match. */
  category?: string;
  /** Requested 1-indexed page number. */
  page: number;
}

/**
 * One page of a paginated Blog listing.
 *
 * @see Requirements 13.4, 13.5
 */
export interface BlogPage {
  /** The posts belonging to this page (at most `pageSize`). */
  posts: BlogPost[];
  /** The 1-indexed page number this slice represents (clamped to range). */
  page: number;
  /** Total number of pages across the whole post list. */
  totalPages: number;
  /** The page size used to partition the posts. */
  pageSize: number;
}

/**
 * Build the case-insensitive indexed text for a post.
 *
 * The indexed text is the concatenation of the fields a reader would expect a
 * search to match: title, description, every tag, the category, and the body.
 * Joining with spaces keeps adjacent fields from accidentally merging into a
 * single token (so a query never spans a field boundary as one word).
 *
 * @param post - The post to index.
 * @returns The lower-cased searchable text for the post.
 */
function indexedText(post: BlogPost): string {
  return [post.title, post.description, ...post.tags, post.category, post.body]
    .join(" ")
    .toLowerCase();
}

/**
 * Return the posts whose indexed text matches the search query `q`.
 *
 * Matching is a case-insensitive substring test over each post's indexed text
 * (title + description + tags + category + body). The query is trimmed and
 * lower-cased before comparison.
 *
 * An empty or whitespace-only query is treated as "no search": every post is
 * returned (a defensive copy), with original order preserved. When the query is
 * non-empty and no post matches, the result is an empty array — the
 * empty-results signal the Blog listing uses to render its empty state
 * (Requirement 13.6).
 *
 * The input array is never mutated.
 *
 * @param posts - The posts to search.
 * @param q - The free-text search query.
 * @returns The matching posts, in their original relative order.
 *
 * @see Requirements 13.2, 13.6
 * @see Property 18
 */
export function searchPosts(posts: BlogPost[], q: string): BlogPost[] {
  const needle = q.trim().toLowerCase();
  if (needle.length === 0) {
    // Empty query → no filtering; return a defensive copy.
    return [...posts];
  }
  return posts.filter((post) => indexedText(post).includes(needle));
}

/**
 * Return the posts that satisfy every active filter.
 *
 * Filters are conjunctive (AND): a post is kept only if it satisfies all
 * filters that are currently active. A filter is active when its argument is
 * provided (not `undefined`):
 *
 * - `tag`: the post's `tags` array must include this exact tag.
 * - `category`: the post's `category` must equal this exact value.
 *
 * When neither filter is provided, all posts are returned (a defensive copy)
 * with original order preserved. When filters are active but no post satisfies
 * them, the result is an empty array (empty-results signal, Requirement 13.6).
 *
 * Published-status note: published-vs-draft filtering is intentionally NOT done
 * here. The Blog listing enumerates only *published* posts (Requirement 13.1),
 * which is a stable, list-wide concern rather than a reader-selected facet like
 * tag/category. Keeping `filterPosts` focused on the reader-selected facets
 * keeps it simple and composable; callers apply {@link publishedOnly} first to
 * restrict the corpus to published posts, then search/filter/paginate the
 * result. This is the documented choice for Property 17's "published status"
 * dimension.
 *
 * The input array is never mutated.
 *
 * @param posts - The posts to filter.
 * @param tag - Optional tag the post's `tags` must include.
 * @param category - Optional category the post's `category` must equal.
 * @returns The posts satisfying all active filters, in original order.
 *
 * @see Requirements 13.1, 13.3
 * @see Property 17
 */
export function filterPosts(
  posts: BlogPost[],
  tag?: string,
  category?: string,
): BlogPost[] {
  return posts.filter((post) => {
    if (tag !== undefined && !post.tags.includes(tag)) {
      return false;
    }
    if (category !== undefined && post.category !== category) {
      return false;
    }
    return true;
  });
}

/**
 * Return only the published posts from `posts`.
 *
 * Companion to {@link filterPosts}: the Blog listing restricts its corpus to
 * published posts (Requirement 13.1) before applying reader-selected search and
 * tag/category filters. Kept as a separate helper so the published-status
 * concern stays explicit and composable.
 *
 * The input array is never mutated.
 *
 * @param posts - The posts to restrict.
 * @returns A new array containing only posts whose `published` flag is `true`.
 *
 * @see Requirements 13.1
 */
export function publishedOnly(posts: BlogPost[]): BlogPost[] {
  return posts.filter((post) => post.published);
}

/**
 * Partition `posts` into a single bounded page.
 *
 * The post list is split into consecutive pages of at most `size` posts each.
 * Pages are 1-indexed: page 1 is `posts[0 .. size-1]`, page 2 is
 * `posts[size .. 2*size-1]`, and so on. Concatenating every page in order
 * reproduces the original ordered list with no duplicates or omissions
 * (Property 19).
 *
 * Page-size handling: `size` defaults to {@link BLOG_PAGE_SIZE} when omitted,
 * and any non-positive or non-finite `size` is coerced to `BLOG_PAGE_SIZE` so a
 * page always has a sane, positive bound.
 *
 * Total pages: `ceil(posts.length / size)`. An empty post list yields
 * `totalPages === 0` and an empty `posts` slice (the empty-results signal;
 * Requirement 13.6).
 *
 * Out-of-range page handling: the requested `page` is clamped into the valid
 * range. Values below 1 clamp to 1; values above `totalPages` clamp to
 * `totalPages` (or to 1 when there are no posts, so the returned `page` is never
 * 0). The returned `page` field reflects the clamped value actually used to
 * compute the slice, so callers can detect that a clamp occurred.
 *
 * The input array is never mutated.
 *
 * @param posts - The full, ordered list of posts to paginate.
 * @param page - The requested 1-indexed page number (clamped to range).
 * @param size - The maximum posts per page. Defaults to {@link BLOG_PAGE_SIZE}.
 * @returns The requested page slice plus pagination metadata.
 *
 * @see Requirements 13.4, 13.5, 13.6
 * @see Property 19
 */
export function paginate(
  posts: BlogPost[],
  page: number,
  size: number = BLOG_PAGE_SIZE,
): BlogPage {
  // Guard the page size: fall back to the configured default for any
  // non-positive or non-finite value so the slice bound is always sane.
  const pageSize =
    Number.isFinite(size) && size > 0 ? Math.floor(size) : BLOG_PAGE_SIZE;

  const totalPages = Math.ceil(posts.length / pageSize);

  // Clamp the requested page into [1, totalPages]; when there are no posts
  // (totalPages === 0) the lower bound of 1 keeps `page` from being 0.
  const requested = Number.isFinite(page) ? Math.floor(page) : 1;
  const clampedPage = Math.min(Math.max(requested, 1), Math.max(totalPages, 1));

  const start = (clampedPage - 1) * pageSize;
  const slice = posts.slice(start, start + pageSize);

  return {
    posts: slice,
    page: clampedPage,
    totalPages,
    pageSize,
  };
}
