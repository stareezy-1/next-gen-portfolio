/**
 * ProfessionalProjectRenderer — renders a single ProfessionalProject.
 *
 * Required fields rendered: title, company, role, description, image,
 * technologies, achievements, featured (Requirement 11.4).
 *
 * IMPORTANT: This renderer MUST NOT render any repository links, source-code
 * links, GitHub URLs, or internal documentation references (Requirement 11.5).
 * The ProfessionalProject type itself has no such fields; this component
 * enforces the constraint at the rendering layer as well.
 *
 * This is a React Server Component (no `'use client'`). Styles live in
 * `ProfessionalProjectRenderer.style.ts` — no inline styles here
 * (Requirement 26.1).
 *
 * @see Requirements 11.4, 11.5, 26.1, 26.2
 */

import Image from "next/image";
import type { ProfessionalProjectRendererProps } from "./ProfessionalProjectRenderer.types";
import {
  professionalProjectWrapperStyles,
  professionalProjectImageContainerStyles,
  professionalProjectImageStyles,
  professionalProjectContentStyles,
  professionalProjectHeaderStyles,
  professionalProjectTitleStyles,
  professionalProjectFeaturedBadgeStyles,
  professionalProjectCompanyRowStyles,
  professionalProjectCompanyStyles,
  professionalProjectRoleSeparatorStyles,
  professionalProjectRoleStyles,
  professionalProjectDescriptionStyles,
  professionalProjectSectionLabelStyles,
  professionalProjectTagStyles,
  professionalProjectTagsContainerStyles,
  professionalProjectListStyles,
  professionalProjectListItemStyles,
  professionalProjectSectionStyles,
} from "./ProfessionalProjectRenderer.style";

/**
 * Renders all required fields of a {@link ProfessionalProject}.
 *
 * No repository, GitHub, or source-code links are rendered — ever
 * (Requirement 11.5).
 *
 * @param props - See {@link ProfessionalProjectRendererProps}.
 */
export function ProfessionalProjectRenderer({
  project,
}: ProfessionalProjectRendererProps) {
  const {
    title,
    company,
    role,
    description,
    image,
    technologies,
    achievements,
    featured,
    liveUrl,
    // NOTE: githubUrl and repository links are intentionally absent from
    // ProfessionalProject — the type and schema both forbid them (Req 11.5, 11.6).
  } = project;

  return (
    <article style={professionalProjectWrapperStyles}>
      {/* Hero image */}
      <div style={professionalProjectImageContainerStyles}>
        <Image
          src={image}
          alt={title}
          fill
          loading="eager"
          style={professionalProjectImageStyles}
          sizes="(max-width: 768px) 100vw, 50vw"
        />
      </div>

      <div style={professionalProjectContentStyles}>
        {/* Header: title + featured badge */}
        <header style={professionalProjectHeaderStyles}>
          <h3 style={professionalProjectTitleStyles}>{title}</h3>
          {featured && (
            <span
              style={professionalProjectFeaturedBadgeStyles}
              aria-label="Featured project"
            >
              Featured
            </span>
          )}
        </header>

        {/* Company + role */}
        <div style={professionalProjectCompanyRowStyles}>
          <span style={professionalProjectCompanyStyles}>{company}</span>
          <span style={professionalProjectRoleSeparatorStyles}>·</span>
          <span style={professionalProjectRoleStyles}>{role}</span>
        </div>

        {/* Description */}
        <p style={professionalProjectDescriptionStyles}>{description}</p>

        {/* Technologies */}
        <section style={professionalProjectSectionStyles}>
          <h4 style={professionalProjectSectionLabelStyles}>Technologies</h4>
          <div style={professionalProjectTagsContainerStyles}>
            {technologies.map((tech, index) => (
              <span
                key={`${tech}-${index}`}
                style={professionalProjectTagStyles}
              >
                {tech}
              </span>
            ))}
          </div>
        </section>

        {/* Achievements */}
        <section style={professionalProjectSectionStyles}>
          <h4 style={professionalProjectSectionLabelStyles}>Achievements</h4>
          <ul style={professionalProjectListStyles}>
            {achievements.map((achievement, index) => (
              <li key={index} style={professionalProjectListItemStyles}>
                {achievement}
              </li>
            ))}
          </ul>
        </section>

        {/*
         * NO repository links, GitHub links, or source-code links are rendered
         * here. This is a hard requirement (Requirement 11.5). Do not add any
         * link to source code, repositories, or internal documentation.
         */}

        {/* Live website link */}
        {liveUrl && (
          <a
            href={liveUrl}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "0.375rem",
              marginTop: "0.5rem",
              fontSize: "0.9375rem",
              color: "var(--color-brand)",
              textDecoration: "none",
              fontWeight: 500,
            }}
          >
            Visit Website ↗
          </a>
        )}
      </div>
    </article>
  );
}
