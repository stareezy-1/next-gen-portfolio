/**
 * EducationRenderer — renders a single EducationEntry.
 *
 * Required fields rendered: school, degree, major, startDate, endDate
 * (Requirement 10.2).
 * Optional fields rendered only when present: gpa (Requirement 10.3),
 * achievements (Requirement 10.4).
 *
 * This is a React Server Component (no `'use client'`). Styles live in
 * `EducationRenderer.style.ts` — no inline styles here (Requirement 26.1).
 *
 * @see Requirements 10.2, 10.3, 10.4, 26.1, 26.2
 */

import type { EducationRendererProps } from "./EducationRenderer.types";
import {
  educationWrapperStyles,
  educationHeaderStyles,
  educationDegreeStyles,
  educationMajorStyles,
  educationSchoolStyles,
  educationMetaStyles,
  educationGpaStyles,
  educationSectionLabelStyles,
  educationListStyles,
  educationListItemStyles,
  educationSectionStyles,
} from "./EducationRenderer.style";

/**
 * Renders all required fields of an {@link EducationEntry}, plus optional
 * fields (GPA, achievements) when present.
 *
 * @param props - See {@link EducationRendererProps}.
 */
export function EducationRenderer({ entry }: EducationRendererProps) {
  const { school, degree, major, startDate, endDate, gpa, achievements } =
    entry;

  return (
    <article style={educationWrapperStyles}>
      {/* Header: degree, major, school */}
      <header style={educationHeaderStyles}>
        <h3 style={educationDegreeStyles}>{degree}</h3>
        <p style={educationMajorStyles}>{major}</p>
        <p style={educationSchoolStyles}>{school}</p>
      </header>

      {/* Meta: date range + optional GPA */}
      <div style={educationMetaStyles}>
        <span aria-label={`${startDate} to ${endDate ?? "Present"}`}>
          {startDate} – {endDate ?? "Present"}
        </span>

        {/* GPA — rendered only when present (Requirement 10.3) */}
        {gpa !== undefined && (
          <span style={educationGpaStyles}>
            <span aria-label="Grade point average">GPA:</span> {gpa}
          </span>
        )}
      </div>

      {/* Achievements — rendered only when present (Requirement 10.4) */}
      {achievements !== undefined && achievements.length > 0 && (
        <section style={educationSectionStyles}>
          <h4 style={educationSectionLabelStyles}>Achievements</h4>
          <ul style={educationListStyles}>
            {achievements.map((achievement, index) => (
              <li key={index} style={educationListItemStyles}>
                {achievement}
              </li>
            ))}
          </ul>
        </section>
      )}
    </article>
  );
}
