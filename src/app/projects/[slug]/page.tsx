/**
 * Project Detail page — React Server Component.
 * @see Requirements 12.1, 12.2, 12.3, 12.4
 */

import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

import { loadAll } from "@/content/loader";
import { getRelatedProjects } from "@/features/projects/partition";
import { ContentWidth } from "@/components/layouts";
import { MotionWrapper } from "@/components/shared/MotionWrapper";
import { ProjectDemoSection } from "@/components/shared/ProjectDemoSection";
import { canonicalUrl } from "@/services/seo";
import {
  creativeWorkJsonLd,
  breadcrumbListJsonLd,
} from "@/services/seo/structured-data";
import { ROUTES, NAV_LABELS } from "@/constants/routes";
import type { Project } from "@/types/content";

const RELATED_MAX = 3;

export async function generateStaticParams(): Promise<{ slug: string }[]> {
  const { items: personal } = loadAll("personal-project");
  const { items: professional } = loadAll("professional-project");
  return [...personal, ...professional].map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const project = findProject(slug);
  if (!project) return { title: "Project Not Found" };
  return { title: project.title, description: project.description };
}

function findProject(slug: string): Project | undefined {
  const { items: personal } = loadAll("personal-project");
  const { items: professional } = loadAll("professional-project");
  return [...personal, ...professional].find((p) => p.slug === slug);
}

export default async function ProjectDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const project = findProject(slug);
  if (!project) notFound();

  const { items: personal } = loadAll("personal-project");
  const { items: professional } = loadAll("professional-project");
  const related = getRelatedProjects(
    [...personal, ...professional],
    slug,
  ).slice(0, RELATED_MAX);

  const isPersonal = project.kind === "personal";
  const liveUrl = project.liveUrl;
  const githubUrl = isPersonal ? project.githubUrl : undefined;

  const projectUrl = canonicalUrl(`${ROUTES.PROJECTS}/${project.slug}`);
  const creativeWorkLd = creativeWorkJsonLd(project, projectUrl);
  const breadcrumbLd = breadcrumbListJsonLd([
    { name: NAV_LABELS.HOME, url: canonicalUrl(ROUTES.HOME) },
    { name: NAV_LABELS.PROJECTS, url: canonicalUrl(ROUTES.PROJECTS) },
    { name: project.title, url: projectUrl },
  ]);

  const sections = [
    project.overview && {
      id: "overview",
      title: "Overview",
      content: project.overview,
    },
    project.problem && {
      id: "problem",
      title: "Problem",
      content: project.problem,
    },
    project.solution && {
      id: "solution",
      title: "Solution",
      content: project.solution,
    },
    project.architecture && {
      id: "architecture",
      title: "Architecture",
      content: project.architecture,
    },
    project.lessonsLearned && {
      id: "lessons",
      title: "Lessons Learned",
      content: project.lessonsLearned,
    },
  ].filter(Boolean) as { id: string; title: string; content: string }[];

  return (
    <div>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(creativeWorkLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }}
      />

      {/* Hero banner */}
      <div
        style={{
          position: "relative",
          width: "100%",
          aspectRatio: "21/9",
          backgroundColor: "var(--color-surface-elevated)",
          overflow: "hidden",
          maxHeight: "480px",
        }}
      >
        {project.image ? (
          <Image
            loading="eager"
            src={project.image}
            alt={project.title}
            fill
            style={{ objectFit: "cover" }}
            priority
            sizes="100vw"
          />
        ) : (
          <div
            style={{
              width: "100%",
              height: "100%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "5rem",
              color: "var(--color-brand)",
            }}
          >
            ⬡
          </div>
        )}
        {/* Gradient overlay */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            background:
              "linear-gradient(to top, color-mix(in srgb, var(--color-background) 80%, transparent) 0%, transparent 60%)",
          }}
        />

        {/* Breadcrumb */}
        <div
          style={{
            position: "absolute",
            top: "1.5rem",
            left: "1.5rem",
            display: "flex",
            alignItems: "center",
            gap: "0.5rem",
            fontSize: "0.875rem",
          }}
        >
          <Link
            href={ROUTES.PROJECTS}
            style={{ color: "rgba(255,255,255,0.7)", textDecoration: "none" }}
          >
            Projects
          </Link>
          <span style={{ color: "rgba(255,255,255,0.4)" }}>›</span>
          <span style={{ color: "rgba(255,255,255,0.9)" }}>
            {project.title}
          </span>
        </div>
      </div>

      <ContentWidth as="main">
        {/* Title + meta row */}
        <MotionWrapper variant="heroWordReveal">
          <div
            style={{
              paddingTop: "2.5rem",
              paddingBottom: "2rem",
              borderBottom: "1px solid var(--color-border)",
            }}
          >
            <div
              style={{
                display: "flex",
                flexWrap: "wrap",
                gap: "0.5rem",
                marginBottom: "1rem",
              }}
            >
              {project.kind === "professional" && (
                <span
                  style={{
                    padding: "0.25rem 0.75rem",
                    borderRadius: "9999px",
                    backgroundColor:
                      "color-mix(in srgb, var(--color-accent) 15%, transparent)",
                    border:
                      "1px solid color-mix(in srgb, var(--color-accent) 30%, transparent)",
                    fontSize: "0.75rem",
                    fontWeight: 700,
                    color: "var(--color-accent)",
                    textTransform: "uppercase",
                    letterSpacing: "0.05em",
                  }}
                >
                  Professional
                </span>
              )}
              {project.featured && (
                <span
                  style={{
                    padding: "0.25rem 0.75rem",
                    borderRadius: "9999px",
                    backgroundColor:
                      "color-mix(in srgb, var(--color-brand) 15%, transparent)",
                    border:
                      "1px solid color-mix(in srgb, var(--color-brand) 30%, transparent)",
                    fontSize: "0.75rem",
                    fontWeight: 700,
                    color: "var(--color-brand)",
                    textTransform: "uppercase",
                    letterSpacing: "0.05em",
                  }}
                >
                  Featured
                </span>
              )}
            </div>

            <h1
              style={{
                marginBottom: "0.75rem",
                fontSize: "clamp(1.75rem, 4vw, 2.75rem)",
              }}
            >
              {project.title}
            </h1>
            {project.kind === "professional" && (
              <p
                style={{
                  margin: "0 0 0.75rem",
                  fontSize: "1rem",
                  color: "var(--color-brand)",
                  fontWeight: 600,
                }}
              >
                {project.company} · {project.role}
              </p>
            )}
            <p
              style={{
                margin: 0,
                fontSize: "1.0625rem",
                color: "var(--color-text-secondary)",
                lineHeight: 1.7,
                maxWidth: "680px",
              }}
            >
              {project.description}
            </p>

            {/* Action buttons */}
            <div
              style={{
                display: "flex",
                flexWrap: "wrap",
                gap: "0.75rem",
                marginTop: "1.5rem",
              }}
            >
              {liveUrl && (
                <a
                  href={liveUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "0.5rem",
                    padding: "0.625rem 1.25rem",
                    borderRadius: "0.5rem",
                    backgroundColor: "var(--color-brand)",
                    color: "var(--color-background)",
                    fontWeight: 700,
                    fontSize: "0.9375rem",
                    textDecoration: "none",
                  }}
                >
                  ↗ Live Demo
                </a>
              )}
              {githubUrl && (
                <a
                  href={githubUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "0.5rem",
                    padding: "0.625rem 1.25rem",
                    borderRadius: "0.5rem",
                    border: "1px solid var(--color-border)",
                    backgroundColor: "var(--color-surface-elevated)",
                    color: "var(--color-text-primary)",
                    fontWeight: 600,
                    fontSize: "0.9375rem",
                    textDecoration: "none",
                  }}
                >
                  ⌥ GitHub
                </a>
              )}
            </div>
          </div>
        </MotionWrapper>

        {/* Two-column layout: content + sidebar */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "minmax(0, 1fr) 280px",
            gap: "3rem",
            paddingTop: "2.5rem",
            paddingBottom: "5rem",
            alignItems: "start",
          }}
          className="two-col-layout"
        >
          {/* Main content */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "2.5rem",
              minWidth: 0,
            }}
          >
            {/* Text sections */}
            {sections.map((section) => (
              <MotionWrapper key={section.id} variant="sectionReveal">
                <section aria-labelledby={`${section.id}-heading`}>
                  <h2
                    id={`${section.id}-heading`}
                    style={{
                      marginBottom: "0.875rem",
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
                    {section.title}
                  </h2>
                  <p
                    style={{
                      margin: 0,
                      fontSize: "1rem",
                      color: "var(--color-text-secondary)",
                      lineHeight: 1.8,
                    }}
                  >
                    {section.content}
                  </p>
                </section>
              </MotionWrapper>
            ))}

            {/* Challenges */}
            {isPersonal &&
              project.challenges &&
              project.challenges.length > 0 && (
                <MotionWrapper variant="sectionReveal">
                  <section aria-labelledby="challenges-heading">
                    <h2
                      id="challenges-heading"
                      style={{
                        marginBottom: "0.875rem",
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
                      Challenges
                    </h2>
                    <ul
                      style={{
                        margin: 0,
                        paddingLeft: "1.25rem",
                        display: "flex",
                        flexDirection: "column",
                        gap: "0.625rem",
                      }}
                    >
                      {project.challenges.map((item, i) => (
                        <li
                          key={i}
                          style={{
                            fontSize: "1rem",
                            color: "var(--color-text-secondary)",
                            lineHeight: 1.7,
                          }}
                        >
                          {item}
                        </li>
                      ))}
                    </ul>
                  </section>
                </MotionWrapper>
              )}

            {/* Results */}
            {isPersonal && project.results && project.results.length > 0 && (
              <MotionWrapper variant="sectionReveal">
                <section aria-labelledby="results-heading">
                  <h2
                    id="results-heading"
                    style={{
                      marginBottom: "0.875rem",
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
                    Results
                  </h2>
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns:
                        "repeat(auto-fill, minmax(200px, 1fr))",
                      gap: "1rem",
                    }}
                  >
                    {project.results.map((item, i) => (
                      <div
                        key={i}
                        style={{
                          padding: "1rem 1.25rem",
                          backgroundColor: "var(--color-surface)",
                          border: "1px solid var(--color-border)",
                          borderRadius: "0.75rem",
                        }}
                      >
                        <p
                          style={{
                            margin: 0,
                            fontSize: "0.9375rem",
                            color: "var(--color-text-primary)",
                            lineHeight: 1.6,
                          }}
                        >
                          {item}
                        </p>
                      </div>
                    ))}
                  </div>
                </section>
              </MotionWrapper>
            )}

            {/* Gallery */}
            {project.gallery && project.gallery.length > 0 && (
              <MotionWrapper variant="sectionReveal">
                <section aria-labelledby="gallery-heading">
                  <h2
                    id="gallery-heading"
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
                    Gallery
                  </h2>
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns:
                        "repeat(auto-fill, minmax(280px, 1fr))",
                      gap: "1rem",
                    }}
                  >
                    {project.gallery.map((src, i) => (
                      <div
                        key={i}
                        style={{
                          position: "relative",
                          aspectRatio: "16/9",
                          borderRadius: "0.75rem",
                          overflow: "hidden",
                          backgroundColor: "var(--color-surface-elevated)",
                        }}
                      >
                        <Image
                          loading="eager"
                          src={src}
                          alt={`${project.title} screenshot ${i + 1}`}
                          fill
                          style={{ objectFit: "cover" }}
                        />
                      </div>
                    ))}
                  </div>
                </section>
              </MotionWrapper>
            )}

            {/* Live Demo iframe */}
            {liveUrl && (
              <MotionWrapper variant="sectionReveal">
                <ProjectDemoSection liveUrl={liveUrl} title={project.title} />
              </MotionWrapper>
            )}
          </div>

          {/* Sidebar */}
          <aside
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "1.5rem",
              position: "sticky",
              top: "88px",
            }}
          >
            {/* Technologies */}
            <div
              style={{
                backgroundColor: "var(--color-surface)",
                border: "1px solid var(--color-border)",
                borderRadius: "0.875rem",
                padding: "1.25rem",
              }}
            >
              <h3
                style={{
                  margin: "0 0 1rem",
                  fontSize: "0.8125rem",
                  fontWeight: 700,
                  textTransform: "uppercase",
                  letterSpacing: "0.08em",
                  color: "var(--color-text-muted)",
                }}
              >
                Technologies
              </h3>
              <div
                style={{ display: "flex", flexWrap: "wrap", gap: "0.375rem" }}
              >
                {project.technologies.map((tech) => (
                  <span
                    key={tech}
                    style={{
                      padding: "0.25rem 0.625rem",
                      borderRadius: "9999px",
                      backgroundColor: "var(--color-surface-elevated)",
                      border: "1px solid var(--color-border)",
                      fontSize: "0.8125rem",
                      color: "var(--color-text-secondary)",
                    }}
                  >
                    {tech}
                  </span>
                ))}
              </div>
            </div>

            {/* Project info */}
            <div
              style={{
                backgroundColor: "var(--color-surface)",
                border: "1px solid var(--color-border)",
                borderRadius: "0.875rem",
                padding: "1.25rem",
                display: "flex",
                flexDirection: "column",
                gap: "0.875rem",
              }}
            >
              <h3
                style={{
                  margin: 0,
                  fontSize: "0.8125rem",
                  fontWeight: 700,
                  textTransform: "uppercase",
                  letterSpacing: "0.08em",
                  color: "var(--color-text-muted)",
                }}
              >
                Project Info
              </h3>
              {isPersonal && project.startDate && (
                <div>
                  <p
                    style={{
                      margin: "0 0 0.25rem",
                      fontSize: "0.75rem",
                      color: "var(--color-text-muted)",
                    }}
                  >
                    Started
                  </p>
                  <p
                    style={{
                      margin: 0,
                      fontSize: "0.9375rem",
                      color: "var(--color-text-primary)",
                      fontWeight: 500,
                    }}
                  >
                    {project.startDate.slice(0, 7)}
                  </p>
                </div>
              )}
              {isPersonal && project.endDate && (
                <div>
                  <p
                    style={{
                      margin: "0 0 0.25rem",
                      fontSize: "0.75rem",
                      color: "var(--color-text-muted)",
                    }}
                  >
                    Completed
                  </p>
                  <p
                    style={{
                      margin: 0,
                      fontSize: "0.9375rem",
                      color: "var(--color-text-primary)",
                      fontWeight: 500,
                    }}
                  >
                    {project.endDate.slice(0, 7)}
                  </p>
                </div>
              )}
              <div>
                <p
                  style={{
                    margin: "0 0 0.25rem",
                    fontSize: "0.75rem",
                    color: "var(--color-text-muted)",
                  }}
                >
                  Type
                </p>
                <p
                  style={{
                    margin: 0,
                    fontSize: "0.9375rem",
                    color: "var(--color-text-primary)",
                    fontWeight: 500,
                    textTransform: "capitalize",
                  }}
                >
                  {project.kind}
                </p>
              </div>
            </div>

            {/* Links */}
            {(liveUrl || githubUrl) && (
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "0.625rem",
                }}
              >
                {liveUrl && (
                  <a
                    href={liveUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: "0.5rem",
                      padding: "0.625rem",
                      borderRadius: "0.5rem",
                      backgroundColor: "var(--color-brand)",
                      color: "var(--color-background)",
                      fontWeight: 700,
                      fontSize: "0.875rem",
                      textDecoration: "none",
                    }}
                  >
                    ↗ View Live Site
                  </a>
                )}
                {githubUrl && (
                  <a
                    href={githubUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: "0.5rem",
                      padding: "0.625rem",
                      borderRadius: "0.5rem",
                      border: "1px solid var(--color-border)",
                      backgroundColor: "var(--color-surface-elevated)",
                      color: "var(--color-text-primary)",
                      fontWeight: 600,
                      fontSize: "0.875rem",
                      textDecoration: "none",
                    }}
                  >
                    ⌥ Source Code
                  </a>
                )}
              </div>
            )}
          </aside>
        </div>

        {/* Related Projects */}
        {related.length > 0 && (
          <section
            aria-labelledby="related-heading"
            style={{
              paddingBottom: "5rem",
              borderTop: "1px solid var(--color-border)",
              paddingTop: "3rem",
            }}
          >
            <MotionWrapper variant="sectionReveal">
              <h2
                id="related-heading"
                style={{ marginBottom: "2rem", fontSize: "1.375rem" }}
              >
                More Projects
              </h2>
            </MotionWrapper>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
                gap: "1.25rem",
              }}
            >
              {related.map((rel) => (
                <MotionWrapper key={rel.slug} variant="sectionReveal">
                  <Link
                    href={`${ROUTES.PROJECTS}/${rel.slug}`}
                    aria-label={`View ${rel.title}`}
                    style={{
                      textDecoration: "none",
                      color: "inherit",
                      display: "block",
                    }}
                  >
                    <article
                      style={{
                        backgroundColor: "var(--color-surface)",
                        border: "1px solid var(--color-border)",
                        borderRadius: "0.875rem",
                        overflow: "hidden",
                        transition: "border-color 0.2s ease",
                      }}
                    >
                      <div
                        style={{
                          position: "relative",
                          aspectRatio: "16/9",
                          backgroundColor: "var(--color-surface-elevated)",
                        }}
                      >
                        {rel.image ? (
                          <Image
                            src={rel.image}
                            alt={rel.title}
                            fill
                            loading="eager"
                            style={{ objectFit: "cover" }}
                            sizes="320px"
                          />
                        ) : (
                          <div
                            style={{
                              width: "100%",
                              height: "100%",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              fontSize: "2rem",
                              color: "var(--color-brand)",
                            }}
                          >
                            ⬡
                          </div>
                        )}
                      </div>
                      <div style={{ padding: "1.25rem" }}>
                        <h3
                          style={{
                            margin: "0 0 0.5rem",
                            fontSize: "1rem",
                            fontWeight: 700,
                          }}
                        >
                          {rel.title}
                        </h3>
                        <p
                          style={{
                            margin: 0,
                            fontSize: "0.875rem",
                            color: "var(--color-text-secondary)",
                            lineHeight: 1.6,
                            display: "-webkit-box",
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: "vertical",
                            overflow: "hidden",
                          }}
                        >
                          {rel.description}
                        </p>
                      </div>
                    </article>
                  </Link>
                </MotionWrapper>
              ))}
            </div>
          </section>
        )}
      </ContentWidth>
    </div>
  );
}
