/**
 * Experience and Education timeline page — React Server Component.
 * @see Requirements 9.1–9.4, 10.1–10.4
 */

import type { Metadata } from "next";
import { loadAll } from "@/content/loader";
import { orderByStartDateDesc } from "@/lib/timeline";
import { ContentWidth } from "@/components/layouts";
import { MotionWrapper } from "@/components/shared/MotionWrapper";
import { ScrollReveal } from "@/components/shared/ScrollReveal";
import { AssetPlayer } from "@/components/shared/AssetPlayer";
import { canonicalUrl } from "@/services/seo";
import { breadcrumbListJsonLd } from "@/services/seo/structured-data";
import { ROUTES, NAV_LABELS } from "@/constants/routes";

export const metadata: Metadata = {
  title: "Experience",
  description:
    "Professional experience of Muhammad Bintang Al Akbar — Senior Front-End & Mobile Engineer. WSA Global Winner 2025 at Rekosistem. 3+ years across React Native, Expo, TypeScript, and AWS Amplify.",
  alternates: { canonical: "https://stareezy.tech/experience" },
};

export default function ExperiencePage() {
  const { items: experienceItems } = loadAll("experience");
  const experience = orderByStartDateDesc(experienceItems);

  const { items: educationItems } = loadAll("education");
  const education = orderByStartDateDesc(educationItems);

  const breadcrumbLd = breadcrumbListJsonLd([
    { name: NAV_LABELS.HOME, url: canonicalUrl(ROUTES.HOME) },
    { name: NAV_LABELS.EXPERIENCE, url: canonicalUrl(ROUTES.EXPERIENCE) },
  ]);

  return (
    <ContentWidth as="main">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }}
      />

      {/* ── Page header ──────────────────────────────────────────────────── */}
      <div
        style={{
          paddingTop: "4rem",
          paddingBottom: "3rem",
          borderBottom: "1px solid var(--color-border)",
          position: "relative",
          overflow: "hidden",
        }}
      >
        <div
          aria-hidden="true"
          className="hero-pulse"
          style={{
            position: "absolute",
            top: "-60%",
            left: "-5%",
            width: "350px",
            height: "350px",
            borderRadius: "50%",
            background:
              "radial-gradient(circle, color-mix(in srgb, var(--color-accent) 8%, transparent) 0%, transparent 70%)",
            pointerEvents: "none",
          }}
        />
        {/* Lottie pulse decoration */}
        <div
          className="lottie-section-deco"
          style={{
            right: "4%",
            top: "50%",
            transform: "translateY(-50%)",
            width: "180px",
            height: "180px",
            opacity: 0.5,
          }}
        >
          <AssetPlayer
            src="/lottie/pulse-dot.json"
            decorative
            trigger="visible"
            width={180}
            height={180}
          />
        </div>
        <MotionWrapper variant="heroWordReveal">
          <p
            style={{
              fontSize: "0.8125rem",
              fontWeight: 700,
              textTransform: "uppercase",
              letterSpacing: "0.1em",
              color: "var(--color-brand)",
              marginBottom: "0.75rem",
            }}
          >
            Career
          </p>
          <h1 style={{ marginBottom: "1rem" }}>Experience &amp; Education</h1>
          <p
            style={{
              fontSize: "1.125rem",
              color: "var(--color-text-secondary)",
              lineHeight: 1.7,
              maxWidth: "560px",
            }}
          >
            A timeline of my professional journey and academic background.
          </p>
        </MotionWrapper>
      </div>

      {/* ── Work Experience ───────────────────────────────────────────────── */}
      <section
        aria-labelledby="experience-heading"
        style={{ paddingTop: "3rem", paddingBottom: "3rem" }}
      >
        <ScrollReveal variant="fade-up">
          <h2
            id="experience-heading"
            style={{ marginBottom: "2rem", fontSize: "1.5rem" }}
          >
            Work Experience
          </h2>
        </ScrollReveal>

        {experience.length === 0 ? (
          <p style={{ color: "var(--color-text-muted)" }}>
            No experience entries yet.
          </p>
        ) : (
          <ol
            aria-label="Professional experience timeline"
            style={{
              listStyle: "none",
              margin: 0,
              padding: 0,
              display: "flex",
              flexDirection: "column",
              gap: "0",
            }}
          >
            {experience.map((entry, index) => (
              <ScrollReveal
                key={`${entry.company}-${entry.startDate}-${index}`}
                variant="fade-left"
                delay={Math.min(index + 1, 6) as 1 | 2 | 3 | 4 | 5 | 6}
              >
                <li
                  style={{
                    display: "flex",
                    gap: "1.5rem",
                    position: "relative",
                  }}
                >
                  {/* Timeline spine */}
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      flexShrink: 0,
                    }}
                  >
                    <div
                      className="breathe"
                      style={{
                        width: "44px",
                        height: "44px",
                        borderRadius: "50%",
                        backgroundColor:
                          "color-mix(in srgb, var(--color-brand) 12%, transparent)",
                        border:
                          "2px solid color-mix(in srgb, var(--color-brand) 40%, transparent)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: "1rem",
                        fontWeight: 800,
                        color: "var(--color-brand)",
                        flexShrink: 0,
                        zIndex: 1,
                      }}
                    >
                      {entry.company.charAt(0)}
                    </div>
                    {index < experience.length - 1 && (
                      <div
                        style={{
                          width: "2px",
                          flex: 1,
                          minHeight: "2rem",
                          background:
                            "linear-gradient(to bottom, color-mix(in srgb, var(--color-brand) 40%, transparent), var(--color-border))",
                          margin: "0.5rem 0",
                        }}
                      />
                    )}
                  </div>

                  {/* Card */}
                  <div
                    style={{
                      flex: 1,
                      paddingBottom:
                        index < experience.length - 1 ? "2rem" : "0",
                      paddingTop: "0.25rem",
                    }}
                  >
                    <div
                      className="card-hover"
                      style={{
                        backgroundColor: "var(--color-surface)",
                        border: "1px solid var(--color-border)",
                        borderRadius: "0.875rem",
                        padding: "1.5rem",
                        display: "flex",
                        flexDirection: "column",
                        gap: "1rem",
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          flexWrap: "wrap",
                          gap: "0.5rem",
                        }}
                      >
                        <div>
                          <h3
                            style={{
                              margin: 0,
                              fontSize: "1.0625rem",
                              fontWeight: 700,
                            }}
                          >
                            {entry.role}
                          </h3>
                          <p
                            style={{
                              margin: "0.25rem 0 0",
                              fontSize: "0.9375rem",
                              color: "var(--color-brand)",
                              fontWeight: 600,
                            }}
                          >
                            {entry.company}
                          </p>
                        </div>
                        <div
                          style={{
                            display: "flex",
                            flexDirection: "column",
                            alignItems: "flex-end",
                            gap: "0.25rem",
                          }}
                        >
                          <span
                            style={{
                              padding: "0.25rem 0.75rem",
                              borderRadius: "9999px",
                              backgroundColor: entry.endDate
                                ? "var(--color-surface-elevated)"
                                : "color-mix(in srgb, var(--color-brand) 12%, transparent)",
                              border: `1px solid ${
                                entry.endDate
                                  ? "var(--color-border)"
                                  : "color-mix(in srgb, var(--color-brand) 30%, transparent)"
                              }`,
                              fontSize: "0.75rem",
                              fontWeight: 600,
                              color: entry.endDate
                                ? "var(--color-text-muted)"
                                : "var(--color-brand)",
                            }}
                          >
                            {entry.endDate ? "Past" : "Current"}
                          </span>
                          <span
                            style={{
                              fontSize: "0.8125rem",
                              color: "var(--color-text-muted)",
                            }}
                          >
                            {entry.startDate.slice(0, 7)} –{" "}
                            {entry.endDate
                              ? entry.endDate.slice(0, 7)
                              : "Present"}
                          </span>
                        </div>
                      </div>

                      <p
                        style={{
                          margin: 0,
                          fontSize: "0.875rem",
                          color: "var(--color-text-secondary)",
                        }}
                      >
                        {entry.location}
                      </p>

                      {entry.achievements.length > 0 && (
                        <div>
                          <p
                            style={{
                              margin: "0 0 0.5rem",
                              fontSize: "0.75rem",
                              fontWeight: 700,
                              textTransform: "uppercase",
                              letterSpacing: "0.06em",
                              color: "var(--color-text-muted)",
                            }}
                          >
                            Achievements
                          </p>
                          <ul
                            style={{
                              margin: 0,
                              paddingLeft: "1.25rem",
                              display: "flex",
                              flexDirection: "column",
                              gap: "0.375rem",
                            }}
                          >
                            {entry.achievements.map((a, i) => (
                              <li
                                key={i}
                                style={{
                                  fontSize: "0.9375rem",
                                  color: "var(--color-text-primary)",
                                  lineHeight: 1.6,
                                }}
                              >
                                {a}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {entry.technologies.length > 0 && (
                        <div
                          style={{
                            display: "flex",
                            flexWrap: "wrap",
                            gap: "0.375rem",
                          }}
                        >
                          {entry.technologies.map((tech) => (
                            <span
                              key={tech}
                              style={{
                                padding: "0.2rem 0.5rem",
                                borderRadius: "9999px",
                                backgroundColor:
                                  "var(--color-surface-elevated)",
                                border: "1px solid var(--color-border)",
                                fontSize: "0.75rem",
                                color: "var(--color-text-muted)",
                              }}
                            >
                              {tech}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </li>
              </ScrollReveal>
            ))}
          </ol>
        )}
      </section>

      {/* ── Education ────────────────────────────────────────────────────── */}
      <section
        aria-labelledby="education-heading"
        style={{
          paddingTop: "2rem",
          paddingBottom: "5rem",
          borderTop: "1px solid var(--color-border)",
        }}
      >
        <ScrollReveal variant="fade-up">
          <h2
            id="education-heading"
            style={{
              marginBottom: "2rem",
              marginTop: "2rem",
              fontSize: "1.5rem",
            }}
          >
            Education
          </h2>
        </ScrollReveal>

        {education.length === 0 ? (
          <p style={{ color: "var(--color-text-muted)" }}>
            No education entries yet.
          </p>
        ) : (
          <div
            style={{ display: "flex", flexDirection: "column", gap: "1rem" }}
          >
            {education.map((entry, index) => (
              <ScrollReveal
                key={`${entry.school}-${entry.startDate}-${index}`}
                variant="tilt"
                delay={Math.min(index + 1, 4) as 1 | 2 | 3 | 4}
              >
                <div
                  className="card-hover"
                  style={{
                    backgroundColor: "var(--color-surface)",
                    border: "1px solid var(--color-border)",
                    borderRadius: "0.875rem",
                    padding: "1.5rem",
                    display: "flex",
                    gap: "1.25rem",
                    alignItems: "flex-start",
                  }}
                >
                  <div
                    style={{
                      width: "44px",
                      height: "44px",
                      borderRadius: "0.75rem",
                      flexShrink: 0,
                      backgroundColor:
                        "color-mix(in srgb, var(--color-accent) 12%, transparent)",
                      border:
                        "1px solid color-mix(in srgb, var(--color-accent) 30%, transparent)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: "1.25rem",
                    }}
                  >
                    🎓
                  </div>
                  <div style={{ flex: 1 }}>
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        flexWrap: "wrap",
                        gap: "0.5rem",
                        marginBottom: "0.25rem",
                      }}
                    >
                      <h3
                        style={{
                          margin: 0,
                          fontSize: "1rem",
                          fontWeight: 700,
                        }}
                      >
                        {entry.degree} in {entry.major}
                      </h3>
                      <span
                        style={{
                          fontSize: "0.8125rem",
                          color: "var(--color-text-muted)",
                        }}
                      >
                        {entry.startDate.slice(0, 7)} –{" "}
                        {entry.endDate ? entry.endDate.slice(0, 7) : "Present"}
                      </span>
                    </div>
                    <p
                      style={{
                        margin: 0,
                        fontSize: "0.9375rem",
                        color: "var(--color-brand)",
                        fontWeight: 600,
                      }}
                    >
                      {entry.school}
                    </p>
                    {entry.gpa && (
                      <p
                        style={{
                          margin: "0.5rem 0 0",
                          fontSize: "0.875rem",
                          color: "var(--color-text-secondary)",
                        }}
                      >
                        GPA: {entry.gpa}
                      </p>
                    )}
                    {entry.achievements && entry.achievements.length > 0 && (
                      <ul
                        style={{
                          margin: "0.75rem 0 0",
                          paddingLeft: "1.25rem",
                          display: "flex",
                          flexDirection: "column",
                          gap: "0.25rem",
                        }}
                      >
                        {entry.achievements.map((a, i) => (
                          <li
                            key={i}
                            style={{
                              fontSize: "0.875rem",
                              color: "var(--color-text-secondary)",
                            }}
                          >
                            {a}
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                </div>
              </ScrollReveal>
            ))}
          </div>
        )}
      </section>
    </ContentWidth>
  );
}
