/**
 * Projects listing page — React Server Component.
 * @see Requirements 11.1, 11.2, 11.4, 11.5
 */

import Image from "next/image";
import type { Metadata } from "next";
import { loadAll } from "@/content/loader";
import { partitionProjects } from "@/features/projects/partition";
import { ContentWidth } from "@/components/layouts";
import { MotionWrapper } from "@/components/shared/MotionWrapper";
import { TrackedProjectCard } from "@/components/shared/TrackedProjectCard";
import { canonicalUrl } from "@/services/seo";
import { breadcrumbListJsonLd } from "@/services/seo/structured-data";
import { ROUTES, NAV_LABELS } from "@/constants/routes";

export const metadata: Metadata = {
  title: "Projects",
  description:
    "Open-source and professional projects by Muhammad Bintang Al Akbar — Stareezy UI (design token system), Aurora PDF (WebAssembly PDF toolkit), and more. React, React Native, TypeScript.",
  alternates: { canonical: "https://stareezy.tech/projects" },
};

export default async function ProjectsPage() {
  const { items: personalProjects } = loadAll("personal-project");
  const { items: professionalProjects } = loadAll("professional-project");
  const { personal, professional } = partitionProjects([
    ...personalProjects,
    ...professionalProjects,
  ]);

  const breadcrumbLd = breadcrumbListJsonLd([
    { name: NAV_LABELS.HOME, url: canonicalUrl(ROUTES.HOME) },
    { name: NAV_LABELS.PROJECTS, url: canonicalUrl(ROUTES.PROJECTS) },
  ]);

  return (
    <ContentWidth as="main">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }}
      />

      {/* Page header */}
      <div
        style={{
          paddingTop: "4rem",
          paddingBottom: "3rem",
          borderBottom: "1px solid var(--color-border)",
        }}
      >
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
            Portfolio
          </p>
          <h1 style={{ marginBottom: "1rem" }}>Projects</h1>
          <p
            style={{
              fontSize: "1.125rem",
              color: "var(--color-text-secondary)",
              lineHeight: 1.7,
              maxWidth: "560px",
            }}
          >
            Open-source work, client builds, and personal experiments. Each
            project is a story.
          </p>
        </MotionWrapper>
      </div>

      {/* Personal Projects */}
      <section
        aria-labelledby="personal-projects-heading"
        style={{ paddingTop: "3rem", paddingBottom: "3rem" }}
      >
        <MotionWrapper variant="sectionReveal">
          <h2
            id="personal-projects-heading"
            style={{ marginBottom: "2rem", fontSize: "1.375rem" }}
          >
            Personal &amp; Open Source
          </h2>
        </MotionWrapper>

        {personal.length === 0 ? (
          <p style={{ color: "var(--color-text-muted)" }}>
            No personal projects yet.
          </p>
        ) : (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))",
              gap: "1.5rem",
            }}
          >
            {personal.map((project) => (
              <MotionWrapper key={project.slug} variant="sectionReveal">
                <TrackedProjectCard
                  href={`${ROUTES.PROJECTS}/${project.slug}`}
                  slug={project.slug}
                  aria-label={`View ${project.title} project details`}
                >
                  <article
                    className="card-hover"
                    style={{
                      backgroundColor: "var(--color-surface)",
                      border: "1px solid var(--color-border)",
                      borderRadius: "1rem",
                      overflow: "hidden",
                      display: "flex",
                      flexDirection: "column",
                      transition: "border-color 0.2s ease, transform 0.2s ease",
                      height: "100%",
                    }}
                  >
                    <div
                      style={{
                        position: "relative",
                        width: "100%",
                        aspectRatio: "16/9",
                        backgroundColor: "var(--color-surface-elevated)",
                      }}
                    >
                      {project.image ? (
                        <Image
                          src={project.image}
                          alt={project.title}
                          fill
                          style={{ objectFit: "cover" }}
                          sizes="(max-width: 768px) 100vw, 400px"
                        />
                      ) : (
                        <div
                          style={{
                            width: "100%",
                            height: "100%",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontSize: "3rem",
                            color: "var(--color-brand)",
                          }}
                        >
                          ⬡
                        </div>
                      )}
                      {project.featured && (
                        <span
                          style={{
                            position: "absolute",
                            top: "0.75rem",
                            right: "0.75rem",
                            padding: "0.25rem 0.625rem",
                            borderRadius: "9999px",
                            backgroundColor: "var(--color-brand)",
                            color: "var(--color-background)",
                            fontSize: "0.6875rem",
                            fontWeight: 700,
                            textTransform: "uppercase",
                          }}
                        >
                          Featured
                        </span>
                      )}
                    </div>
                    <div
                      style={{
                        padding: "1.5rem",
                        display: "flex",
                        flexDirection: "column",
                        gap: "0.875rem",
                        flex: 1,
                      }}
                    >
                      <h3
                        style={{
                          margin: 0,
                          fontSize: "1.0625rem",
                          fontWeight: 700,
                          color: "var(--color-text-primary)",
                          lineHeight: 1.3,
                        }}
                      >
                        {project.title}
                      </h3>
                      <p
                        style={{
                          margin: 0,
                          fontSize: "0.9rem",
                          color: "var(--color-text-secondary)",
                          lineHeight: 1.65,
                          display: "-webkit-box",
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: "vertical",
                          overflow: "hidden",
                        }}
                      >
                        {project.description}
                      </p>
                      <div
                        style={{
                          display: "flex",
                          flexWrap: "wrap",
                          gap: "0.375rem",
                          marginTop: "auto",
                        }}
                      >
                        {project.technologies.slice(0, 4).map((tech) => (
                          <span
                            key={tech}
                            style={{
                              padding: "0.2rem 0.5rem",
                              borderRadius: "9999px",
                              backgroundColor: "var(--color-surface-elevated)",
                              border: "1px solid var(--color-border)",
                              fontSize: "0.75rem",
                              color: "var(--color-text-muted)",
                            }}
                          >
                            {tech}
                          </span>
                        ))}
                      </div>
                      {(project.githubUrl || project.liveUrl) && (
                        <div
                          style={{
                            display: "flex",
                            gap: "1rem",
                            paddingTop: "0.75rem",
                            borderTop: "1px solid var(--color-border)",
                          }}
                        >
                          {project.githubUrl && (
                            <span
                              style={{
                                fontSize: "0.875rem",
                                color: "var(--color-brand)",
                                fontWeight: 600,
                              }}
                            >
                              GitHub ↗
                            </span>
                          )}
                          {project.liveUrl && (
                            <span
                              style={{
                                fontSize: "0.875rem",
                                color: "var(--color-brand)",
                                fontWeight: 600,
                              }}
                            >
                              Live Demo ↗
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  </article>
                </TrackedProjectCard>
              </MotionWrapper>
            ))}
          </div>
        )}
      </section>

      {/* Professional Projects */}
      {professional.length > 0 && (
        <section
          aria-labelledby="professional-projects-heading"
          style={{
            paddingTop: "2rem",
            paddingBottom: "5rem",
            borderTop: "1px solid var(--color-border)",
          }}
        >
          <MotionWrapper variant="sectionReveal">
            <div style={{ marginBottom: "2rem", marginTop: "2rem" }}>
              <h2
                id="professional-projects-heading"
                style={{ marginBottom: "0.5rem", fontSize: "1.375rem" }}
              >
                Professional Work
              </h2>
              <p
                style={{
                  margin: 0,
                  fontSize: "0.9375rem",
                  color: "var(--color-text-muted)",
                }}
              >
                Client and employer projects — source code not publicly
                available.
              </p>
            </div>
          </MotionWrapper>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))",
              gap: "1.5rem",
            }}
          >
            {professional.map((project) => (
              <MotionWrapper key={project.slug} variant="sectionReveal">
                <TrackedProjectCard
                  href={`${ROUTES.PROJECTS}/${project.slug}`}
                  slug={project.slug}
                  aria-label={`View ${project.title} project details`}
                >
                  <article
                    className="card-hover"
                    style={{
                      backgroundColor: "var(--color-surface)",
                      border: "1px solid var(--color-border)",
                      borderRadius: "1rem",
                      overflow: "hidden",
                      display: "flex",
                      flexDirection: "column",
                      height: "100%",
                    }}
                  >
                    <div
                      style={{
                        position: "relative",
                        width: "100%",
                        aspectRatio: "16/9",
                        backgroundColor: "var(--color-surface-elevated)",
                      }}
                    >
                      {project.image ? (
                        <Image
                          src={project.image}
                          alt={project.title}
                          fill
                          style={{ objectFit: "cover" }}
                          sizes="(max-width: 768px) 100vw, 400px"
                        />
                      ) : (
                        <div
                          style={{
                            width: "100%",
                            height: "100%",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontSize: "3rem",
                            color: "var(--color-accent)",
                          }}
                        >
                          ⬢
                        </div>
                      )}
                    </div>
                    <div
                      style={{
                        padding: "1.5rem",
                        display: "flex",
                        flexDirection: "column",
                        gap: "0.75rem",
                        flex: 1,
                      }}
                    >
                      <div>
                        <h3
                          style={{
                            margin: 0,
                            fontSize: "1.0625rem",
                            fontWeight: 700,
                            color: "var(--color-text-primary)",
                            lineHeight: 1.3,
                          }}
                        >
                          {project.title}
                        </h3>
                        <p
                          style={{
                            margin: "0.25rem 0 0",
                            fontSize: "0.8125rem",
                            color: "var(--color-brand)",
                            fontWeight: 600,
                          }}
                        >
                          {project.company} · {project.role}
                        </p>
                      </div>
                      <p
                        style={{
                          margin: 0,
                          fontSize: "0.9rem",
                          color: "var(--color-text-secondary)",
                          lineHeight: 1.65,
                          display: "-webkit-box",
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: "vertical",
                          overflow: "hidden",
                        }}
                      >
                        {project.description}
                      </p>
                      <div
                        style={{
                          display: "flex",
                          flexWrap: "wrap",
                          gap: "0.375rem",
                          marginTop: "auto",
                        }}
                      >
                        {project.technologies.slice(0, 4).map((tech) => (
                          <span
                            key={tech}
                            style={{
                              padding: "0.2rem 0.5rem",
                              borderRadius: "9999px",
                              backgroundColor: "var(--color-surface-elevated)",
                              border: "1px solid var(--color-border)",
                              fontSize: "0.75rem",
                              color: "var(--color-text-muted)",
                            }}
                          >
                            {tech}
                          </span>
                        ))}
                      </div>
                    </div>
                  </article>
                </TrackedProjectCard>
              </MotionWrapper>
            ))}
          </div>
        </section>
      )}
    </ContentWidth>
  );
}
