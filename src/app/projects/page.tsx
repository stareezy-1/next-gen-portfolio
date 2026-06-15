/**
 * Projects index page — React Server Component, "The Logbook" direction.
 *
 * Personal and open-source work is a numbered catalog (home .work-* primitives)
 * with alternating media sides and mono GitHub/Live indicators. Professional
 * work uses a deliberately different layout: horizontal cards with an image on
 * the left and a company.role meta line. Eyebrow budget: 1 ("Index").
 * Zero em-dashes; mono carries numbers and labels.
 */

import Image from "next/image";
import type { Metadata } from "next";
import { loadAll } from "@/content/loader";
import { partitionProjects } from "@/features/projects/partition";
import { ContentWidth } from "@/components/layouts";
import { ScrollReveal } from "@/components/shared/ScrollReveal";
import { TrackedProjectCard } from "@/components/shared/TrackedProjectCard";
import { canonicalUrl } from "@/services/seo";
import { breadcrumbListJsonLd } from "@/services/seo/structured-data";
import { ROUTES, NAV_LABELS } from "@/constants/routes";

export const metadata: Metadata = {
  title: "Projects",
  description:
    "Open-source and professional projects by Muhammad Bintang Al Akbar. Stareezy UI design token system, Aurora PDF WebAssembly toolkit, and more. React, React Native, TypeScript.",
  alternates: { canonical: "https://stareezy.tech/projects" },
};

/** Two-digit catalog number (01, 02, ...). */
function catalogNumber(index: number): string {
  return String(index + 1).padStart(2, "0");
}

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
        suppressHydrationWarning
      />

      {/* ── Page header ──────────────────────────────────────────────── */}
      <section aria-labelledby="projects-page-heading" className="page-head">
        <ScrollReveal variant="fade-up">
          <p className="section-kicker">Index</p>
          <h1 id="projects-page-heading" className="page-head-title">
            Things I built, and how they work
          </h1>
          <p className="page-head-sub">
            Open-source libraries, client builds, and personal experiments. Each
            entry opens into the full story.
          </p>
        </ScrollReveal>
      </section>

      {/* ── Personal & open source — numbered catalog ────────────────── */}
      <section aria-labelledby="personal-heading" className="page-section">
        <ScrollReveal variant="fade-up">
          <h2 id="personal-heading" className="section-h2">
            Personal &amp; open source
          </h2>
        </ScrollReveal>

        {personal.length === 0 ? (
          <p className="empty-state">No personal projects yet.</p>
        ) : (
          <ol className="work-index" style={{ marginTop: "2.5rem" }}>
            {personal.map((project, i) => (
              <ScrollReveal
                key={project.slug}
                variant="fade-up"
                delay={((i % 3) + 1) as 1 | 2 | 3}
                as="li"
              >
                <TrackedProjectCard
                  href={`${ROUTES.PROJECTS}/${project.slug}`}
                  slug={project.slug}
                  aria-label={`View ${project.title}`}
                >
                  <div className="work-row">
                    {/* Left: thumbnail + index */}
                    <div className="work-row-media">
                      <div className="work-row-thumb">
                        {project.image ? (
                          <Image
                            src={project.image}
                            alt={project.title}
                            fill
                            className="work-row-img"
                            sizes="(max-width: 640px) 5rem, 11rem"
                          />
                        ) : (
                          <span
                            className="work-row-placeholder"
                            aria-hidden="true"
                          >
                            {catalogNumber(i)}
                          </span>
                        )}
                      </div>
                      <span className="work-row-num" aria-hidden="true">
                        {catalogNumber(i)}
                      </span>
                    </div>
                    {/* Right: body */}
                    <div className="work-row-body">
                      <h3 className="work-row-title">{project.title}</h3>
                      <p className="work-row-desc">{project.description}</p>
                      <div className="work-row-tags">
                        {project.technologies.slice(0, 5).map((tech) => (
                          <span key={tech} className="tech-tag">
                            {tech}
                          </span>
                        ))}
                      </div>
                      {(project.githubUrl || project.liveUrl) && (
                        <div className="work-row-links">
                          {project.githubUrl && (
                            <span className="work-row-link">GitHub ↗</span>
                          )}
                          {project.liveUrl && (
                            <span className="work-row-link">Live ↗</span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </TrackedProjectCard>
              </ScrollReveal>
            ))}
          </ol>
        )}
      </section>

      {/* ── Professional work — same logbook rows ─────────────────────── */}
      {professional.length > 0 && (
        <section
          aria-labelledby="professional-heading"
          className="page-section page-section--last"
        >
          <ScrollReveal variant="fade-up">
            <h2 id="professional-heading" className="section-h2">
              Professional work
            </h2>
            <p className="page-head-sub" style={{ marginTop: "0.875rem" }}>
              Client and employer projects. Source code stays private.
            </p>
          </ScrollReveal>

          <ol className="work-index" style={{ marginTop: "2.5rem" }}>
            {professional.map((project, i) => (
              <ScrollReveal
                key={project.slug}
                variant="fade-up"
                delay={((i % 3) + 1) as 1 | 2 | 3}
                as="li"
              >
                <TrackedProjectCard
                  href={`${ROUTES.PROJECTS}/${project.slug}`}
                  slug={project.slug}
                  aria-label={`View ${project.title}`}
                >
                  <div className="work-row">
                    {/* Left: thumbnail + index */}
                    <div className="work-row-media">
                      <div className="work-row-thumb">
                        {project.image ? (
                          <Image
                            src={project.image}
                            alt={project.title}
                            fill
                            className="work-row-img"
                            sizes="(max-width: 640px) 5rem, 11rem"
                          />
                        ) : (
                          <span
                            className="work-row-placeholder"
                            aria-hidden="true"
                          >
                            {catalogNumber(i)}
                          </span>
                        )}
                      </div>
                      <span className="work-row-num" aria-hidden="true">
                        {catalogNumber(i)}
                      </span>
                    </div>
                    {/* Right: body with company/role meta */}
                    <div className="work-row-body">
                      <p className="proj-work-meta">
                        {project.company} · {project.role}
                      </p>
                      <h3 className="work-row-title">{project.title}</h3>
                      <p className="work-row-desc">{project.description}</p>
                      <div className="work-row-tags">
                        {project.technologies.slice(0, 5).map((tech) => (
                          <span key={tech} className="tech-tag">
                            {tech}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </TrackedProjectCard>
              </ScrollReveal>
            ))}
          </ol>
        </section>
      )}
    </ContentWidth>
  );
}
