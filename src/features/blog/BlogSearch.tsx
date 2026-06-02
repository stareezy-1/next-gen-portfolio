"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import type { BlogSearchProps } from "./BlogSearch.types";

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
  if (Object.keys(overrides).some((k) => k !== "page")) {
    next.delete("page");
  }
  const str = next.toString();
  // Always return a full path so router.replace never gets a bare "" or "?..."
  const base =
    typeof window !== "undefined" ? window.location.pathname : "/blog";
  return str ? `${base}?${str}` : base;
}

export function BlogSearch({ tags, categories }: BlogSearchProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const urlQ = searchParams.get("q") ?? "";
  const currentTag = searchParams.get("tag") ?? "";
  const currentCategory = searchParams.get("category") ?? "";

  const [inputValue, setInputValue] = useState(urlQ);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    setInputValue(urlQ);
  }, [urlQ]);

  const searchParamsRef = useRef(searchParams);
  useEffect(() => {
    searchParamsRef.current = searchParams;
  }, [searchParams]);

  const handleSearchChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const val = e.target.value;
      setInputValue(val);
      if (debounceRef.current) clearTimeout(debounceRef.current);
      debounceRef.current = setTimeout(() => {
        router.replace(buildSearchString(searchParamsRef.current, { q: val }), {
          scroll: false,
        });
      }, 300);
    },
    [router],
  );

  const clearSearch = useCallback(() => {
    setInputValue("");
    if (debounceRef.current) clearTimeout(debounceRef.current);
    router.replace(buildSearchString(searchParamsRef.current, { q: "" }), {
      scroll: false,
    });
  }, [router]);

  const handleTag = useCallback(
    (tag: string) => {
      router.replace(
        buildSearchString(searchParamsRef.current, {
          tag: tag === currentTag ? "" : tag,
        }),
        { scroll: false },
      );
    },
    [router, currentTag],
  );

  const handleCategory = useCallback(
    (cat: string) => {
      router.replace(
        buildSearchString(searchParamsRef.current, {
          category: cat === currentCategory ? "" : cat,
        }),
        { scroll: false },
      );
    },
    [router, currentCategory],
  );

  const clearAll = () => {
    setInputValue("");
    if (debounceRef.current) clearTimeout(debounceRef.current);
    router.replace(window.location.pathname, { scroll: false });
  };

  const hasFilters = inputValue || currentTag || currentCategory;

  return (
    <div
      role="search"
      aria-label="Blog search and filters"
      style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}
    >
      {/* Search bar */}
      <div style={{ position: "relative" }}>
        <svg
          aria-hidden="true"
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          style={{
            position: "absolute",
            left: "1rem",
            top: "50%",
            transform: "translateY(-50%)",
            color: "var(--color-text-muted)",
            pointerEvents: "none",
          }}
        >
          <circle cx="11" cy="11" r="8" />
          <line x1="21" y1="21" x2="16.65" y2="16.65" />
        </svg>
        <input
          id="blog-search"
          type="text"
          name="q"
          value={inputValue}
          onChange={handleSearchChange}
          placeholder="Search by title, tag, or keyword…"
          aria-label="Search blog posts"
          autoComplete="off"
          spellCheck={false}
          style={{
            width: "100%",
            padding: "0.8125rem 2.75rem",
            backgroundColor: "var(--color-surface)",
            border: "1.5px solid var(--color-border)",
            borderRadius: "0.875rem",
            color: "var(--color-text-primary)",
            fontSize: "0.9375rem",
            fontFamily: "inherit",
            lineHeight: 1.5,
            outline: "none",
            transition: "border-color 0.18s ease, box-shadow 0.18s ease",
            boxSizing: "border-box",
          }}
          onFocus={(e) => {
            e.currentTarget.style.borderColor = "var(--color-brand)";
            e.currentTarget.style.boxShadow =
              "0 0 0 3px color-mix(in srgb, var(--color-brand) 12%, transparent)";
          }}
          onBlur={(e) => {
            e.currentTarget.style.borderColor = "var(--color-border)";
            e.currentTarget.style.boxShadow = "none";
          }}
        />
        {inputValue && (
          <button
            type="button"
            aria-label="Clear search"
            onClick={clearSearch}
            style={{
              position: "absolute",
              right: "0.75rem",
              top: "50%",
              transform: "translateY(-50%)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: "20px",
              height: "20px",
              borderRadius: "50%",
              background:
                "color-mix(in srgb, var(--color-text-muted) 20%, transparent)",
              border: "none",
              cursor: "pointer",
              color: "var(--color-text-muted)",
              padding: 0,
              lineHeight: 1,
              fontSize: "0.6875rem",
            }}
          >
            ✕
          </button>
        )}
      </div>

      {/* Filter pills */}
      {(categories.length > 0 || tags.length > 0) && (
        <div
          style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}
        >
          {categories.length > 0 && (
            <div
              style={{
                display: "flex",
                flexWrap: "wrap",
                alignItems: "center",
                gap: "0.5rem",
              }}
            >
              <span
                style={{
                  fontSize: "0.6875rem",
                  fontWeight: 700,
                  color: "var(--color-text-muted)",
                  textTransform: "uppercase",
                  letterSpacing: "0.08em",
                  whiteSpace: "nowrap",
                  minWidth: "4.5rem",
                }}
              >
                Category
              </span>
              {categories.map((cat) => {
                const active = currentCategory === cat;
                return (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => handleCategory(cat)}
                    aria-pressed={active}
                    style={{
                      padding: "0.3125rem 0.875rem",
                      borderRadius: "9999px",
                      border: `1.5px solid ${
                        active ? "var(--color-brand)" : "var(--color-border)"
                      }`,
                      backgroundColor: active
                        ? "color-mix(in srgb, var(--color-brand) 14%, transparent)"
                        : "transparent",
                      color: active
                        ? "var(--color-brand)"
                        : "var(--color-text-secondary)",
                      fontSize: "0.8125rem",
                      fontWeight: active ? 700 : 500,
                      cursor: "pointer",
                      fontFamily: "inherit",
                      transition: "all 0.15s ease",
                      whiteSpace: "nowrap",
                      lineHeight: 1.4,
                    }}
                  >
                    {cat}
                  </button>
                );
              })}
            </div>
          )}
          {tags.length > 0 && (
            <div
              style={{
                display: "flex",
                flexWrap: "wrap",
                alignItems: "center",
                gap: "0.5rem",
              }}
            >
              <span
                style={{
                  fontSize: "0.6875rem",
                  fontWeight: 700,
                  color: "var(--color-text-muted)",
                  textTransform: "uppercase",
                  letterSpacing: "0.08em",
                  whiteSpace: "nowrap",
                  minWidth: "4.5rem",
                }}
              >
                Tag
              </span>
              {tags.map((tag) => {
                const active = currentTag === tag;
                return (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => handleTag(tag)}
                    aria-pressed={active}
                    style={{
                      padding: "0.25rem 0.625rem",
                      borderRadius: "9999px",
                      border: `1px solid ${
                        active ? "var(--color-brand)" : "var(--color-border)"
                      }`,
                      backgroundColor: active
                        ? "color-mix(in srgb, var(--color-brand) 12%, transparent)"
                        : "transparent",
                      color: active
                        ? "var(--color-brand)"
                        : "var(--color-text-muted)",
                      fontSize: "0.75rem",
                      fontWeight: active ? 700 : 400,
                      cursor: "pointer",
                      fontFamily: "inherit",
                      transition: "all 0.15s ease",
                      whiteSpace: "nowrap",
                      lineHeight: 1.4,
                    }}
                  >
                    #{tag}
                  </button>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Active filter summary */}
      {hasFilters && (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "0.5rem",
            flexWrap: "wrap",
            padding: "0.625rem 0.875rem",
            borderRadius: "0.625rem",
            backgroundColor:
              "color-mix(in srgb, var(--color-surface-elevated) 60%, transparent)",
            border: "1px solid var(--color-border)",
          }}
        >
          <span
            style={{
              fontSize: "0.75rem",
              color: "var(--color-text-muted)",
              fontWeight: 500,
              marginRight: "0.25rem",
            }}
          >
            Filtering by:
          </span>
          {inputValue && (
            <span
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "0.35rem",
                padding: "0.15rem 0.5rem",
                borderRadius: "9999px",
                backgroundColor: "var(--color-surface-elevated)",
                border: "1px solid var(--color-border)",
                fontSize: "0.75rem",
                color: "var(--color-text-secondary)",
              }}
            >
              &ldquo;{inputValue}&rdquo;
            </span>
          )}
          {currentCategory && (
            <span
              style={{
                display: "inline-flex",
                alignItems: "center",
                padding: "0.15rem 0.5rem",
                borderRadius: "9999px",
                backgroundColor:
                  "color-mix(in srgb, var(--color-brand) 10%, transparent)",
                border:
                  "1px solid color-mix(in srgb, var(--color-brand) 30%, transparent)",
                fontSize: "0.75rem",
                color: "var(--color-brand)",
                fontWeight: 600,
              }}
            >
              {currentCategory}
            </span>
          )}
          {currentTag && (
            <span
              style={{
                display: "inline-flex",
                alignItems: "center",
                padding: "0.15rem 0.5rem",
                borderRadius: "9999px",
                backgroundColor: "var(--color-surface-elevated)",
                border: "1px solid var(--color-border)",
                fontSize: "0.75rem",
                color: "var(--color-text-muted)",
              }}
            >
              #{currentTag}
            </span>
          )}
          <button
            type="button"
            onClick={clearAll}
            style={{
              marginLeft: "auto",
              padding: "0.2rem 0.75rem",
              borderRadius: "9999px",
              border: "1px solid var(--color-border)",
              backgroundColor: "transparent",
              color: "var(--color-text-muted)",
              fontSize: "0.75rem",
              cursor: "pointer",
              fontFamily: "inherit",
              fontWeight: 500,
              whiteSpace: "nowrap",
            }}
          >
            Clear all
          </button>
        </div>
      )}
    </div>
  );
}
