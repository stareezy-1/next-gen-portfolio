/**
 * PersonalProjectRenderer — renders a single PersonalProject.
 *
 * Required fields rendered always: title, slug, description, image,
 * technologies, featured, startDate (Requirement 11.2).
 *
 * Optional fields rendered only when present: githubUrl, liveUrl, endDate,
 * challenges, solutions, results (Requirement 11.3).
 *
 * This is a React Server Component (no `'use client'`). Styles live in
 * `PersonalProjectRenderer.style.ts` — no inline styles here
 * (Requirement 26.1).
 *
 * @see Requirements 11.2, 11.3, 26.1, 26.2
 */

import Image from "next/image";
import type { PersonalProjectRendererProps } from "./PersonalProjectRenderer.types";
import { TrackedGithubLink } from "@/components/shared/TrackedGithubLink";
import {
  projectWrapperStyles,
  projectImageContainerStyles,
  projectImageStyles,
  projectContentStyles,
  projectHeaderStyles,
  projectTitleStyles,
  projectFeaturedBadgeStyles,
  projectDescriptionStyles,
  projectMetaStyles,
  projectSectionLabelStyles,
  projectTagStyles,
  projectTagsContainerStyles,
  projectLinksStyles,
  projectLinkStyles,
  projectListStyles,
  projectListItemStyles,
  projectSectionStyles,
} from "./PersonalProjectRenderer.style";

/**
 * Renders all required fields of a {@link PersonalProject}, plus optional
 * fields only when present.
 *
 * @param props - See {@link PersonalProjectRendererProps}.
 */
export function PersonalProjectRenderer({
  project,
}: PersonalProjectRendererProps) {
  const {
    title,
    description,
    image,
    technologies,
    featured,
    startDate,
    // Optional fields
    githubUrl,
    liveUrl,
    endDate,
    challenges,
    solutions,
    results,
  } = project;

  const hasLinks = githubUrl !== undefined || liveUrl !== undefined;
  const hasChallenges = challenges !== undefined && challenges.length > 0;
  const hasSolutions = solutions !== undefined && solutions.length > 0;
  const hasResults = results !== undefined && results.length > 0;

  return (
    <article style={projectWrapperStyles}>
      {/* Hero image */}
      <div style={projectImageContainerStyles}>
        <Image
          src={image}
          alt={title}
          fill
          style={projectImageStyles}
          sizes="(max-width: 768px) 100vw, 50vw"
        />
      </div>

      <div style={projectContentStyles}>
        {/* Header: title + featured badge */}
        <header style={projectHeaderStyles}>
          <h3 style={projectTitleStyles}>{title}</h3>
          {featured && (
            <span
              style={projectFeaturedBadgeStyles}
              aria-label="Featured project"
            >
              Featured
            </span>
          )}
        </header>

        {/* Description */}
        <p style={projectDescriptionStyles}>{description}</p>

        {/* Meta: start date + optional end date (Req 11.3) */}
        <div style={projectMetaStyles}>
          <span>
            {startDate}
            {endDate !== undefined && ` – ${endDate}`}
          </span>
        </div>

        {/* Technologies */}
        <section style={projectSectionStyles}>
          <h4 style={projectSectionLabelStyles}>Technologies</h4>
          <div style={projectTagsContainerStyles}>
            {technologies.map((tech, index) => (
              <span key={`${tech}-${index}`} style={projectTagStyles}>
                {tech}
              </span>
            ))}
          </div>
        </section>

        {/* Links — rendered only when present (Requirement 11.3) */}
        {hasLinks && (
          <div style={projectLinksStyles}>
            {githubUrl !== undefined && (
              <TrackedGithubLink
                href={githubUrl}
                aria-label={`View ${title} source code on GitHub`}
              >
                GitHub ↗
              </TrackedGithubLink>
            )}
            {liveUrl !== undefined && (
              <a
                href={liveUrl}
                style={projectLinkStyles}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={`View ${title} live demo`}
              >
                Live Demo ↗
              </a>
            )}
          </div>
        )}

        {/* Challenges — rendered only when present (Requirement 11.3) */}
        {hasChallenges && (
          <section style={projectSectionStyles}>
            <h4 style={projectSectionLabelStyles}>Challenges</h4>
            <ul style={projectListStyles}>
              {challenges!.map((item, index) => (
                <li key={index} style={projectListItemStyles}>
                  {item}
                </li>
              ))}
            </ul>
          </section>
        )}

        {/* Solutions — rendered only when present (Requirement 11.3) */}
        {hasSolutions && (
          <section style={projectSectionStyles}>
            <h4 style={projectSectionLabelStyles}>Solutions</h4>
            <ul style={projectListStyles}>
              {solutions!.map((item, index) => (
                <li key={index} style={projectListItemStyles}>
                  {item}
                </li>
              ))}
            </ul>
          </section>
        )}

        {/* Results — rendered only when present (Requirement 11.3) */}
        {hasResults && (
          <section style={projectSectionStyles}>
            <h4 style={projectSectionLabelStyles}>Results</h4>
            <ul style={projectListStyles}>
              {results!.map((item, index) => (
                <li key={index} style={projectListItemStyles}>
                  {item}
                </li>
              ))}
            </ul>
          </section>
        )}
      </div>
    </article>
  );
}
