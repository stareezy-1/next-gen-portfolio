"use client";

/**
 * BlogSearch — client island for blog search and filter controls.
 *
 * Controlled entirely by URL search params so the state survives navigation
 * and is shareable. On every change the component pushes a new URL via
 * `useRouter` + `useSearchParams` from `next/navigation`.
 *
 * This is the only Client Component in the Blog feature; the listing page
 * itself is a Server Component.
 *
 * @see Requirements 13.2, 13.3
 */

import { useRouter, useSearchParams } from "next/navigation";
import { useCallback } from "react";
import type { BlogSearchProps } from "./BlogSearch.types";

/**
 * Builds a new URLSearchParams string from the current params, applying the
 * given overrides. Removes keys whose value is empty/undefined so the URL
 * stays clean.
 */
function buildSearchString(
  current: URLSearchParams,
  overrides: Record<string, string | undefined>,
): string {
  const next = new URLSearchParams(current.toString());

  for (const [key, value] of Object.entries(overrides)) {
    if (value === undefined || value === "") {
      next.delete(key);
    } else {
      next.set(key, value);
    }
  }

  // Reset to page 1 whenever a filter/search changes.
  if (Object.keys(overrides).some((k) => k !== "page")) {
    next.delete("page");
  }

  const str = next.toString();
  return str ? `?${str}` : "";
}

/**
 * Search input + tag/category filter dropdowns for the Blog listing.
 *
 * All state lives in the URL; the component reads from `useSearchParams` and
 * writes via `useRouter.push`. No local state is used.
 *
 * @param props - See {@link BlogSearchProps}.
 */
export function BlogSearch({ tags, categories }: BlogSearchProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const currentQ = searchParams.get("q") ?? "";
  const currentTag = searchParams.get("tag") ?? "";
  const currentCategory = searchParams.get("category") ?? "";

  const handleSearch = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      router.push(buildSearchString(searchParams, { q: e.target.value }));
    },
    [router, searchParams],
  );

  const handleTag = useCallback(
    (e: React.ChangeEvent<HTMLSelectElement>) => {
      router.push(buildSearchString(searchParams, { tag: e.target.value }));
    },
    [router, searchParams],
  );

  const handleCategory = useCallback(
    (e: React.ChangeEvent<HTMLSelectElement>) => {
      router.push(
        buildSearchString(searchParams, { category: e.target.value }),
      );
    },
    [router, searchParams],
  );

  return (
    <div role="search" aria-label="Blog search and filters">
      {/* Free-text search */}
      <label htmlFor="blog-search">Search posts</label>
      <input
        id="blog-search"
        type="search"
        name="q"
        value={currentQ}
        onChange={handleSearch}
        placeholder="Search by title, tag, or keyword…"
        aria-label="Search blog posts"
        autoComplete="off"
      />

      {/* Tag filter */}
      {tags.length > 0 && (
        <>
          <label htmlFor="blog-tag-filter">Filter by tag</label>
          <select
            id="blog-tag-filter"
            name="tag"
            value={currentTag}
            onChange={handleTag}
            aria-label="Filter by tag"
          >
            <option value="">All tags</option>
            {tags.map((tag) => (
              <option key={tag} value={tag}>
                {tag}
              </option>
            ))}
          </select>
        </>
      )}

      {/* Category filter */}
      {categories.length > 0 && (
        <>
          <label htmlFor="blog-category-filter">Filter by category</label>
          <select
            id="blog-category-filter"
            name="category"
            value={currentCategory}
            onChange={handleCategory}
            aria-label="Filter by category"
          >
            <option value="">All categories</option>
            {categories.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </>
      )}
    </div>
  );
}
