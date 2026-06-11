/**
 * Project detail page — React Server Component, "The Logbook" direction.
 *
 * Full-width banner with a gradient scrim and breadcrumb. Title block carries a
 * kind Badge, large Space Grotesk title, company.role meta when professional,
 * and action buttons. A two-column body (content sections with a brand
 * left-border + sticky sidebar cards) sits below, then related projects.
 * MotionWrapper usage is preserved. Zero em-dashes; mono carries dates.
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
import { Card, CardHeader, CardContent } from "@/components/ui/shadcn/card";
import { Badge } from "@/components/ui/shadcn/badge";
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
      title: "Lessons learned",
      content: project.lessonsLearned,
    },
  ].filter(Boolean) as { id: string; title: string; content: string }[];

  return (
    <div>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(creativeWorkLd) }}
        suppressHydrationWarning
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }}
        suppressHydrationWarning
      />

      {/* ── Banner — full-width with scrim + breadcrumb ──────────────── */}
      <div className="detail-banner">
        {project.image ? (
          <Image
            loading="eager"
            src={project.image}
            alt={project.title}
            width={1200}
            height={420}
            className="detail-banner-img"
            priority
            sizes="100vw"
          />
        ) : (
          <div className="detail-banner-placeholder" aria-hidden="true">
            {project.title.charAt(0)}
          </div>
        )}
        <div className="detail-banner-scrim" aria-hidden="true" />
        <nav className="crumb" aria-label="Breadcrumb">
          <Link href={ROUTES.PROJECTS} className="crumb-link">
            Projects
          </Link>
          <span className="crumb-sep" aria-hidden="true">
            /
          </span>
          <span className="crumb-current">{project.title}</span>
        </nav>
      </div>

      <ContentWidth as="main">
        {/* ── Title block ────────────────────────────────────────────── */}
        <MotionWrapper variant="heroWordReveal">
          <div className="detail-head">
            <div className="detail-head-badges">
              {project.kind === "professional" && (
                <Badge variant="secondary">Professional</Badge>
              )}
              {project.featured && <Badge variant="outline">Featured</Badge>}
            </div>

            <h1 className="detail-head-title">{project.title}</h1>

            {project.kind === "professional" && (
              <p className="detail-head-meta">
                {project.company} · {project.role}
              </p>
            )}

            <p className="detail-head-desc">{project.description}</p>

            <div className="detail-head-actions">
              {liveUrl && (
                <a
                  href={liveUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-primary"
                >
                  Live demo ↗
                </a>
              )}
              {githubUrl && (
                <a
                  href={githubUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-ghost"
                >
                  GitHub ↗
                </a>
              )}
            </div>
          </div>
        </MotionWrapper>

        {/* ── Two-column: content + sidebar ──────────────────────────── */}
        <div className="detail-layout two-col-layout">
          <div className="detail-main">
            {sections.map((section) => (
              <MotionWrapper key={section.id} variant="sectionReveal">
                <section aria-labelledby={`${section.id}-heading`}>
                  <h2
                    id={`${section.id}-heading`}
                    className="detail-section-h2"
                  >
                    {section.title}
                  </h2>
                  <p className="detail-section-text">{section.content}</p>
                </section>
              </MotionWrapper>
            ))}

            {/* Challenges */}
            {isPersonal &&
              project.challenges &&
              project.challenges.length > 0 && (
                <MotionWrapper variant="sectionReveal">
                  <section aria-labelledby="challenges-heading">
                    <h2 id="challenges-heading" className="detail-section-h2">
                      Challenges
                    </h2>
                    <ul className="detail-list">
                      {project.challenges.map((item, i) => (
                        <li key={i} className="detail-list-item">
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
                  <h2 id="results-heading" className="detail-section-h2">
                    Results
                  </h2>
                  <div className="detail-results">
                    {project.results.map((item, i) => (
                      <div key={i} className="detail-result">
                        <p className="detail-result-text">{item}</p>
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
                  <h2 id="gallery-heading" className="detail-section-h2">
                    Gallery
                  </h2>
                  <div className="detail-gallery">
                    {project.gallery.map((src, i) => (
                      <div key={i} className="detail-gallery-item">
                        <Image
                          loading="eager"
                          src={src}
                          alt={`${project.title} screenshot ${i + 1}`}
                          fill
                          className="detail-gallery-img"
                          sizes="(max-width: 640px) 100vw, 480px"
                        />
                      </div>
                    ))}
                  </div>
                </section>
              </MotionWrapper>
            )}

            {/* Live demo iframe */}
            {liveUrl && (
              <MotionWrapper variant="sectionReveal">
                <ProjectDemoSection liveUrl={liveUrl} title={project.title} />
              </MotionWrapper>
            )}
          </div>

          {/* ── Sidebar ─────────────────────────────────────────────── */}
          <aside className="detail-aside sidebar-sticky">
            <Card className="sidebar-card">
              <CardHeader className="px-5 py-4">
                <h2 className="sidebar-card-title">Technologies</h2>
              </CardHeader>
              <CardContent className="px-5 pb-5 pt-0">
                <div className="sidebar-tags">
                  {project.technologies.map((tech) => (
                    <Badge key={tech} variant="outline" className="text-xs">
                      {tech}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className="sidebar-card">
              <CardHeader className="px-5 py-4">
                <h2 className="sidebar-card-title">Project info</h2>
              </CardHeader>
              <CardContent className="px-5 pb-5 pt-0">
                <div className="sidebar-info">
                  {isPersonal && project.startDate && (
                    <div>
                      <p className="sidebar-info-label">Started</p>
                      <p className="sidebar-info-val">
                        {project.startDate.slice(0, 7)}
                      </p>
                    </div>
                  )}
                  {isPersonal && project.endDate && (
                    <div>
                      <p className="sidebar-info-label">Completed</p>
                      <p className="sidebar-info-val">
                        {project.endDate.slice(0, 7)}
                      </p>
                    </div>
                  )}
                  <div>
                    <p className="sidebar-info-label">Type</p>
                    <p className="sidebar-info-val sidebar-info-val--plain">
                      {project.kind}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {(liveUrl || githubUrl) && (
              <div className="sidebar-actions">
                {liveUrl && (
                  <a
                    href={liveUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-primary"
                    style={{ justifyContent: "center" }}
                  >
                    View live site ↗
                  </a>
                )}
                {githubUrl && (
                  <a
                    href={githubUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-ghost"
                    style={{ justifyContent: "center" }}
                  >
                    Source code ↗
                  </a>
                )}
              </div>
            )}
          </aside>
        </div>

        {/* ── Related projects ───────────────────────────────────────── */}
        {related.length > 0 && (
          <section aria-labelledby="related-heading" className="rel-section">
            <MotionWrapper variant="sectionReveal">
              <h2 id="related-heading" className="section-h2">
                More projects
              </h2>
            </MotionWrapper>
            <div className="rel-grid" style={{ marginTop: "2.5rem" }}>
              {related.map((rel) => (
                <MotionWrapper key={rel.slug} variant="sectionReveal">
                  <Link
                    href={`${ROUTES.PROJECTS}/${rel.slug}`}
                    aria-label={`View ${rel.title}`}
                    className="rel-card"
                  >
                    <div className="rel-card-media">
                      {rel.image ? (
                        <Image
                          src={rel.image}
                          alt={rel.title}
                          fill
                          loading="eager"
                          className="rel-card-img"
                          sizes="320px"
                        />
                      ) : (
                        <span
                          className="rel-card-placeholder"
                          aria-hidden="true"
                        >
                          {rel.title.charAt(0)}
                        </span>
                      )}
                    </div>
                    <div className="rel-card-body">
                      <h3 className="rel-card-title">{rel.title}</h3>
                      <p className="rel-card-desc">{rel.description}</p>
                    </div>
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
