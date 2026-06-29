/**
 * Experience and Education page — React Server Component.
 *
 * Work history: full-width logbook rows. Each row splits into three zones:
 * mono index+date column left, editorial role/company center, tech tags right.
 * Hairlines divide rows. Hover sweeps a brand wash. Active role is always lit.
 * No rail, no dots, no card borders — the typography IS the structure.
 *
 * Education: two-column grid where each card is a tall typographic block,
 * not a bordered container. School name as the visual anchor, degree + date
 * in the secondary voice.
 */

import type { Metadata } from "next";
import { loadAll } from "@/content/loader";
import { orderByStartDateDesc } from "@/lib/timeline";
import { ContentWidth } from "@/components/layouts";
import { ScrollReveal } from "@/components/shared/ScrollReveal";
import { canonicalUrl } from "@/services/seo";
import { breadcrumbListJsonLd } from "@/services/seo/structured-data";
import { ROUTES, NAV_LABELS } from "@/constants/routes";

export const metadata: Metadata = {
  title: "Experience",
  description:
    "Professional experience of Muhammad Bintang Al Akbar, Front-End and AI-Native Engineer. WSA Global Winner 2025 at Rekosistem. Four years across React, React Native, Expo, TypeScript, and the Cloudflare edge.",
  alternates: { canonical: "https://stareezy.tech/experience" },
};

function formatRange(startDate: string, endDate?: string): string {
  const start = startDate.slice(0, 7);
  return endDate ? `${start} to ${endDate.slice(0, 7)}` : `${start} to now`;
}

function twoDigit(n: number): string {
  return String(n).padStart(2, "0");
}

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
        suppressHydrationWarning
      />

      {/* ── Page header ──────────────────────────────────────────────── */}
      <section aria-labelledby="experience-page-heading" className="page-head">
        <ScrollReveal variant="fade-up">
          <h1 id="experience-page-heading" className="page-head-title">
            Where I have built, and what I learned
          </h1>
          <p className="page-head-sub">
            A working record of roles and study, most recent first.
          </p>
        </ScrollReveal>
      </section>

      {/* ── Work — logbook rows ───────────────────────────────────────── */}
      <section aria-labelledby="work-heading" className="page-section">
        <ScrollReveal variant="fade-up">
          <h2 id="work-heading" className="section-h2">
            Work
          </h2>
        </ScrollReveal>

        {experience.length === 0 ? (
          <p className="empty-state">No experience entries yet.</p>
        ) : (
          <ol
            aria-label="Professional experience timeline"
            className="xp-index"
          >
            {experience.map((entry, index) => {
              const isActive = !entry.endDate;
              return (
                <ScrollReveal
                  key={`${entry.company}-${entry.startDate}-${index}`}
                  variant="fade-up"
                  delay={1}
                  as="li"
                >
                  <article
                    className={`xp-row${isActive ? " xp-row--active" : ""}`}
                  >
                    {/* Left column: index + date */}
                    <div className="xp-row-left" aria-hidden="true">
                      <span className="xp-row-idx">{twoDigit(index + 1)}</span>
                      <code className="xp-row-date">
                        {formatRange(entry.startDate, entry.endDate)}
                      </code>
                    </div>

                    {/* Center column: role + company + location + achievements */}
                    <div className="xp-row-center">
                      <div className="xp-row-title-row">
                        <h3 className="xp-row-role">{entry.role}</h3>
                        {isActive && (
                          <span className="xp-live" aria-label="Current role">
                            <span className="xp-live-dot" aria-hidden="true" />
                            Now
                          </span>
                        )}
                      </div>
                      <p className="xp-row-company">
                        {entry.company}
                        <span className="xp-row-loc">{entry.location}</span>
                      </p>

                      {entry.achievements.length > 0 && (
                        <ul
                          className="xp-row-achievements"
                          aria-label="Key achievements"
                        >
                          {entry.achievements.map((a, i) => (
                            <li key={i} className="xp-row-achievement">
                              {a}
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>

                    {/* Right column: tech tags */}
                    {entry.technologies.length > 0 && (
                      <div className="xp-row-right" aria-label="Technologies">
                        {entry.technologies.map((tech) => (
                          <span key={tech} className="xp-tag">
                            {tech}
                          </span>
                        ))}
                      </div>
                    )}
                  </article>
                </ScrollReveal>
              );
            })}
          </ol>
        )}
      </section>

      {/* ── Education ─────────────────────────────────────────────────── */}
      <section
        aria-labelledby="education-heading"
        className="page-section page-section--last"
      >
        <ScrollReveal variant="fade-up">
          <h2 id="education-heading" className="section-h2">
            Education
          </h2>
        </ScrollReveal>

        {education.length === 0 ? (
          <p className="empty-state">No education entries yet.</p>
        ) : (
          <div className="edu-index">
            {education.map((entry, index) => (
              <ScrollReveal
                key={`${entry.school}-${entry.startDate}-${index}`}
                variant="fade-up"
                delay={((index % 2) + 1) as 1 | 2}
                as="div"
              >
                <article className="edu-block">
                  <div className="edu-block-idx" aria-hidden="true">
                    {twoDigit(index + 1)}
                  </div>
                  <div className="edu-block-body">
                    <p className="edu-block-school">{entry.school}</p>
                    <h3 className="edu-block-degree">
                      {entry.degree} in {entry.major}
                    </h3>
                    <div className="edu-block-meta">
                      <code className="tl-date">
                        {formatRange(entry.startDate, entry.endDate)}
                      </code>
                      {entry.gpa && (
                        <span className="edu-block-gpa">
                          <span className="edu-block-gpa-label">GPA</span>
                          {entry.gpa}
                        </span>
                      )}
                    </div>
                    {entry.achievements && entry.achievements.length > 0 && (
                      <ul className="edu-block-achievements">
                        {entry.achievements.map((a, i) => (
                          <li key={i} className="edu-block-achievement">
                            {a}
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                </article>
              </ScrollReveal>
            ))}
          </div>
        )}
      </section>
    </ContentWidth>
  );
}
