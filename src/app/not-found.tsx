/**
 * Not-found page — React Server Component.
 * @see Requirements 2.6, 25.8
 */

import Link from "next/link";
import { ContentWidth } from "@/components/layouts";
import { ROUTES } from "@/constants";

export default function NotFound() {
  return (
    <ContentWidth as="main">
      <div
        style={{
          minHeight: "60vh",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          textAlign: "center",
          gap: "1.5rem",
          paddingTop: "5rem",
          paddingBottom: "5rem",
        }}
      >
        <div
          style={{
            fontSize: "6rem",
            lineHeight: 1,
            color: "var(--color-brand)",
            fontWeight: 800,
            letterSpacing: "-0.04em",
          }}
        >
          404
        </div>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "0.75rem",
            maxWidth: "400px",
          }}
        >
          <h1 style={{ margin: 0, fontSize: "1.5rem" }}>Page not found</h1>
          <p
            style={{
              margin: 0,
              color: "var(--color-text-secondary)",
              lineHeight: 1.7,
            }}
          >
            The page you&apos;re looking for doesn&apos;t exist or has been
            moved.
          </p>
        </div>
        <Link
          href={ROUTES.HOME}
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "0.5rem",
            padding: "0.75rem 1.75rem",
            borderRadius: "0.5rem",
            backgroundColor: "var(--color-brand)",
            color: "var(--color-background)",
            fontWeight: 700,
            fontSize: "0.9375rem",
            textDecoration: "none",
          }}
        >
          ← Go home
        </Link>
      </div>
    </ContentWidth>
  );
}
