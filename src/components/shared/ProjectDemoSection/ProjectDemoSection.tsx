"use client";

import { useState } from "react";

export interface ProjectDemoSectionProps {
  liveUrl: string;
  title: string;
}

export function ProjectDemoSection({
  liveUrl,
  title,
}: ProjectDemoSectionProps) {
  const [showDemo, setShowDemo] = useState(false);
  const [failed, setFailed] = useState(false);

  return (
    <section aria-labelledby="demo-heading">
      <h2
        id="demo-heading"
        style={{
          marginBottom: "1rem",
          fontSize: "1.25rem",
          display: "flex",
          alignItems: "center",
          gap: "0.625rem",
        }}
      >
        <span
          style={{
            width: "3px",
            height: "1.25em",
            backgroundColor: "var(--color-brand)",
            borderRadius: "2px",
            display: "inline-block",
            flexShrink: 0,
          }}
        />
        Live Demo
      </h2>

      {!showDemo ? (
        /* Launch card */
        <div
          style={{
            border: "1px solid var(--color-border)",
            borderRadius: "0.875rem",
            overflow: "hidden",
            backgroundColor: "var(--color-surface)",
          }}
        >
          {/* Preview bar */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.5rem",
              padding: "0.75rem 1rem",
              backgroundColor: "var(--color-surface-elevated)",
              borderBottom: "1px solid var(--color-border)",
            }}
          >
            <div style={{ display: "flex", gap: "0.375rem" }}>
              {["#ff5f57", "#febc2e", "#28c840"].map((c) => (
                <span
                  key={c}
                  style={{
                    width: "12px",
                    height: "12px",
                    borderRadius: "50%",
                    backgroundColor: c,
                  }}
                />
              ))}
            </div>
            <span
              style={{
                flex: 1,
                fontSize: "0.8125rem",
                color: "var(--color-text-muted)",
                backgroundColor: "var(--color-surface)",
                padding: "0.25rem 0.75rem",
                borderRadius: "0.375rem",
                border: "1px solid var(--color-border)",
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}
            >
              {liveUrl}
            </span>
          </div>

          {/* CTA area */}
          <div
            style={{
              padding: "3rem 2rem",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: "1.25rem",
              textAlign: "center",
            }}
          >
            <div
              style={{
                width: "64px",
                height: "64px",
                borderRadius: "1rem",
                backgroundColor:
                  "color-mix(in srgb, var(--color-brand) 12%, transparent)",
                border:
                  "1px solid color-mix(in srgb, var(--color-brand) 30%, transparent)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "2rem",
              }}
            >
              ▶
            </div>
            <div>
              <p
                style={{
                  margin: "0 0 0.375rem",
                  fontWeight: 700,
                  fontSize: "1rem",
                }}
              >
                Try it live
              </p>
              <p
                style={{
                  margin: 0,
                  fontSize: "0.875rem",
                  color: "var(--color-text-muted)",
                }}
              >
                Run the app directly in your browser
              </p>
            </div>
            <div
              style={{
                display: "flex",
                gap: "0.75rem",
                flexWrap: "wrap",
                justifyContent: "center",
              }}
            >
              <button
                type="button"
                onClick={() => setShowDemo(true)}
                style={{
                  padding: "0.625rem 1.5rem",
                  borderRadius: "0.5rem",
                  backgroundColor: "var(--color-brand)",
                  color: "var(--color-background)",
                  fontWeight: 700,
                  fontSize: "0.9375rem",
                  border: "none",
                  cursor: "pointer",
                }}
              >
                Launch Demo
              </button>
              <a
                href={liveUrl}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  padding: "0.625rem 1.5rem",
                  borderRadius: "0.5rem",
                  border: "1px solid var(--color-border)",
                  backgroundColor: "var(--color-surface-elevated)",
                  color: "var(--color-text-primary)",
                  fontWeight: 600,
                  fontSize: "0.9375rem",
                  textDecoration: "none",
                }}
              >
                Open in New Tab ↗
              </a>
            </div>
          </div>
        </div>
      ) : failed ? (
        /* Fallback when iframe fails */
        <div
          style={{
            border: "1px solid var(--color-border)",
            borderRadius: "0.875rem",
            padding: "3rem 2rem",
            backgroundColor: "var(--color-surface)",
            textAlign: "center",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: "1rem",
          }}
        >
          <span style={{ fontSize: "2.5rem" }}>🌐</span>
          <p style={{ margin: 0, fontWeight: 700 }}>
            Demo can&apos;t load in iframe
          </p>
          <p
            style={{
              margin: 0,
              fontSize: "0.875rem",
              color: "var(--color-text-muted)",
            }}
          >
            The site blocks embedding. Open it directly instead.
          </p>
          <a
            href={liveUrl}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              padding: "0.625rem 1.5rem",
              borderRadius: "0.5rem",
              backgroundColor: "var(--color-brand)",
              color: "var(--color-background)",
              fontWeight: 700,
              fontSize: "0.9375rem",
              textDecoration: "none",
            }}
          >
            Open {title} ↗
          </a>
        </div>
      ) : (
        /* Iframe */
        <div
          style={{
            border: "1px solid var(--color-border)",
            borderRadius: "0.875rem",
            overflow: "hidden",
            backgroundColor: "var(--color-surface)",
          }}
        >
          {/* Browser chrome */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.5rem",
              padding: "0.75rem 1rem",
              backgroundColor: "var(--color-surface-elevated)",
              borderBottom: "1px solid var(--color-border)",
            }}
          >
            <div style={{ display: "flex", gap: "0.375rem" }}>
              {["#ff5f57", "#febc2e", "#28c840"].map((c) => (
                <span
                  key={c}
                  style={{
                    width: "12px",
                    height: "12px",
                    borderRadius: "50%",
                    backgroundColor: c,
                  }}
                />
              ))}
            </div>
            <span
              style={{
                flex: 1,
                fontSize: "0.8125rem",
                color: "var(--color-text-muted)",
                backgroundColor: "var(--color-surface)",
                padding: "0.25rem 0.75rem",
                borderRadius: "0.375rem",
                border: "1px solid var(--color-border)",
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}
            >
              {liveUrl}
            </span>
            <a
              href={liveUrl}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Open in new tab"
              style={{
                fontSize: "1rem",
                color: "var(--color-text-muted)",
                textDecoration: "none",
                flexShrink: 0,
              }}
            >
              ↗
            </a>
            <button
              type="button"
              onClick={() => setShowDemo(false)}
              aria-label="Close demo"
              style={{
                fontSize: "1rem",
                color: "var(--color-text-muted)",
                background: "none",
                border: "none",
                cursor: "pointer",
                flexShrink: 0,
                padding: "0 0.25rem",
              }}
            >
              ✕
            </button>
          </div>
          <iframe
            src={liveUrl}
            title={`${title} live demo`}
            width="100%"
            height={560}
            style={{ border: "none", display: "block" }}
            onError={() => setFailed(true)}
            loading="lazy"
            sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
          />
        </div>
      )}
    </section>
  );
}
