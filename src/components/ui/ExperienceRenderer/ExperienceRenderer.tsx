/**
 * ExperienceRenderer — renders a single ExperienceEntry.
 *
 * Required fields rendered: company, role, location, startDate, endDate
 * (displayed as "Present" when absent — Requirement 9.3), achievements,
 * technologies, impactMetrics (Requirement 9.2).
 *
 * This is a React Server Component (no `'use client'`). Styles live in
 * `ExperienceRenderer.style.ts` — no inline styles here (Requirement 26.1).
 *
 * @see Requirements 9.2, 9.3, 26.1, 26.2
 */

import type { ExperienceRendererProps } from "./ExperienceRenderer.types";
import {
  experienceWrapperStyles,
  experienceHeaderStyles,
  experienceRoleStyles,
  experienceCompanyStyles,
  experienceMetaStyles,
  experienceSectionLabelStyles,
  experienceListStyles,
  experienceListItemStyles,
  experienceTagStyles,
  experienceTagsContainerStyles,
  experienceSectionStyles,
} from "./ExperienceRenderer.style";

/**
 * Renders all required fields of an {@link ExperienceEntry}.
 *
 * When `entry.endDate` is absent the position is current and "Present" is
 * displayed (Requirement 9.3).
 *
 * @param props - See {@link ExperienceRendererProps}.
 */
export function ExperienceRenderer({ entry }: ExperienceRendererProps) {
  const {
    company,
    role,
    location,
    startDate,
    endDate,
    achievements,
    technologies,
    impactMetrics,
  } = entry;

  /** Display label for the end date — "Present" when absent (Req 9.3). */
  const endDateLabel = endDate ?? "Present";

  return (
    <article style={experienceWrapperStyles}>
      {/* Header: role, company */}
      <header style={experienceHeaderStyles}>
        <h3 style={experienceRoleStyles}>{role}</h3>
        <p style={experienceCompanyStyles}>{company}</p>
      </header>

      {/* Meta: location and date range */}
      <div style={experienceMetaStyles}>
        <span>{location}</span>
        <span aria-label={`${startDate} to ${endDateLabel}`}>
          {startDate} – {endDateLabel}
        </span>
      </div>

      {/* Achievements */}
      <section style={experienceSectionStyles}>
        <h4 style={experienceSectionLabelStyles}>Achievements</h4>
        <ul style={experienceListStyles}>
          {achievements.map((achievement, index) => (
            <li key={index} style={experienceListItemStyles}>
              {achievement}
            </li>
          ))}
        </ul>
      </section>

      {/* Technologies */}
      <section style={experienceSectionStyles}>
        <h4 style={experienceSectionLabelStyles}>Technologies</h4>
        <div style={experienceTagsContainerStyles}>
          {technologies.map((tech, index) => (
            <span key={`${tech}-${index}`} style={experienceTagStyles}>
              {tech}
            </span>
          ))}
        </div>
      </section>

      {/* Impact Metrics */}
      <section style={experienceSectionStyles}>
        <h4 style={experienceSectionLabelStyles}>Impact</h4>
        <ul style={experienceListStyles}>
          {impactMetrics.map((metric, index) => (
            <li key={index} style={experienceListItemStyles}>
              {metric}
            </li>
          ))}
        </ul>
      </section>
    </article>
  );
}
