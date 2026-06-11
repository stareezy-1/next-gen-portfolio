/**
 * Experience and Education page — React Server Component, "The Logbook" direction.
 *
 * Headline-only header. Work history is a vertical timeline (home .tl-* / .timeline
 * primitives) with mono date ranges, brand company names, indented mono achievement
 * markers, and tech tags. The active role gets the brand dot. Education sits in two
 * shadcn cards. Zero em-dashes; mono carries every date.
 */

import type { Metadata } from "next";
import { loadAll } from "@/content/loader";
import { orderByStartDateDesc } from "@/lib/timeline";
import { ContentWidth } from "@/components/layouts";
import { ScrollReveal } from "@/components/shared/ScrollReveal";
import { Card, CardHeader, CardContent } from "@/components/ui/shadcn/card";
import { canonicalUrl } from "@/services/seo";
import { breadcrumbListJsonLd } from "@/services/seo/structured-data";
import { ROUTES, NAV_LABELS } from "@/constants/routes";

export const metadata: Metadata = {
  title: "Experience",
  description:
    "Professional experience of Muhammad Bintang Al Akbar, Senior Front-End and Mobile Engineer. WSA Global Winner 2025 at Rekosistem. Six years across React Native, Expo, TypeScript, and AWS Amplify.",
  alternates: { canonical: "https://stareezy.tech/experience" },
};

/** Format a YYYY-MM range with "to", never a dash. */
function formatRange(startDate: string, endDate?: string): string {
  const start = startDate.slice(0, 7);
  return endDate ? `${start} to ${endDate.slice(0, 7)}` : `${start} to now`;
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

      {/* ── Page header — headline only ──────────────────────────────── */}
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

      {/* ── Work Experience — vertical timeline ──────────────────────── */}
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
            className="timeline"
            style={{ marginTop: "2.5rem" }}
          >
            {experience.map((entry, index) => {
              const isActive = !entry.endDate;
              return (
                <ScrollReveal
                  key={`${entry.company}-${entry.startDate}-${index}`}
                  variant="fade-up"
                  delay={((index % 3) + 1) as 1 | 2 | 3}
                  as="li"
                >
                  <div
                    className={`tl-item${isActive ? " tl-item--active" : ""}`}
                  >
                    <div className="tl-rail" aria-hidden="true">
                      <span className="tl-dot" />
                    </div>
                    <div className="tl-body">
                      <div className="tl-meta">
                        <code className="tl-date">
                          {formatRange(entry.startDate, entry.endDate)}
                        </code>
                        {isActive && <span className="tl-now">Current</span>}
                      </div>
                      <h3 className="tl-role">{entry.role}</h3>
                      <p className="tl-company">{entry.company}</p>
                      <p className="tl-loc">{entry.location}</p>

                      {entry.achievements.length > 0 && (
                        <ul className="tl-achievements" aria-label="Highlights">
                          {entry.achievements.map((a, i) => (
                            <li key={i} className="tl-achievement">
                              {a}
                            </li>
                          ))}
                        </ul>
                      )}

                      {entry.technologies.length > 0 && (
                        <div className="tl-tags">
                          {entry.technologies.map((tech) => (
                            <span key={tech} className="tech-tag">
                              {tech}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </ScrollReveal>
              );
            })}
          </ol>
        )}
      </section>

      {/* ── Education — two-col cards ─────────────────────────────────── */}
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
          <div className="edu-cards" style={{ marginTop: "2.5rem" }}>
            {education.map((entry, index) => (
              <ScrollReveal
                key={`${entry.school}-${entry.startDate}-${index}`}
                variant="fade-up"
                delay={((index % 2) + 1) as 1 | 2}
                as="div"
              >
                <Card className="edu-card">
                  <CardHeader className="px-6 pt-6 pb-3">
                    <h3 className="edu-degree">
                      {entry.degree} in {entry.major}
                    </h3>
                    <p className="edu-school">{entry.school}</p>
                    <p className="edu-date">
                      {formatRange(entry.startDate, entry.endDate)}
                    </p>
                  </CardHeader>
                  <CardContent className="px-6 pb-6 pt-0">
                    {entry.gpa && <p className="edu-gpa">GPA {entry.gpa}</p>}
                    {entry.achievements && entry.achievements.length > 0 && (
                      <ul className="edu-achievements">
                        {entry.achievements.map((a, i) => (
                          <li key={i} className="edu-achievement-item">
                            {a}
                          </li>
                        ))}
                      </ul>
                    )}
                  </CardContent>
                </Card>
              </ScrollReveal>
            ))}
          </div>
        )}
      </section>
    </ContentWidth>
  );
}
