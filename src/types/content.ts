/**
 * Content data models for the Content_Store.
 *
 * All dates are ISO-8601 strings. All models are produced by the
 * Content_Loader after schema validation.
 *
 * @see Requirements 9.2, 10.2, 11.2, 11.4, 12.2, 14.1, 15.1
 */

/** A technical or educational article authored in MDX. */
export interface BlogPost {
  slug: string;
  title: string;
  description: string;
  heroImage: string;
  author: string;
  /** ISO-8601 date string. */
  publishDate: string;
  tags: string[];
  category: string;
  published: boolean;
  /** MDX body. */
  body: string;
}

/** A single professional experience timeline entry. */
export interface ExperienceEntry {
  company: string;
  role: string;
  location: string;
  /** ISO-8601 date string. */
  startDate: string;
  /** ISO-8601 date string. Absent implies the current position. */
  endDate?: string;
  achievements: string[];
  technologies: string[];
  impactMetrics: string[];
}

/** A single education timeline entry. */
export interface EducationEntry {
  school: string;
  degree: string;
  major: string;
  /** ISO-8601 date string. */
  startDate: string;
  /** ISO-8601 date string. */
  endDate?: string;
  gpa?: string;
  achievements?: string[];
}

/** A project that may expose source code and repository links. */
export interface PersonalProject {
  kind: "personal";
  slug: string;
  title: string;
  description: string;
  image: string;
  technologies: string[];
  featured: boolean;
  /** ISO-8601 date string. */
  startDate: string;
  githubUrl?: string;
  liveUrl?: string;
  /** ISO-8601 date string. */
  endDate?: string;
  challenges?: string[];
  solutions?: string[];
  results?: string[];
  // Detail-page sections.
  overview?: string;
  problem?: string;
  solution?: string;
  architecture?: string;
  lessonsLearned?: string;
  gallery?: string[];
}

/**
 * A project that must not expose source code, repository links, or internal
 * documentation. The schema deliberately omits `githubUrl`/repository fields.
 *
 * @see Requirements 11.5, 11.6
 */
export interface ProfessionalProject {
  kind: "professional";
  slug: string;
  title: string;
  company: string;
  role: string;
  description: string;
  image: string;
  technologies: string[];
  achievements: string[];
  featured: boolean;
  // Detail-page sections.
  overview?: string;
  problem?: string;
  solution?: string;
  architecture?: string;
  lessonsLearned?: string;
  gallery?: string[];
  playStoreUrl?: string;
  appStoreUrl?: string;
  liveUrl?: string;
}

/** Discriminated union of project content, keyed on `kind`. */
export type Project = PersonalProject | ProfessionalProject;

/** Any validated content object produced by the Content_Loader. */
export type ContentObject =
  | BlogPost
  | ExperienceEntry
  | EducationEntry
  | Project;

/** The set of content collections defined by the Content_Store. */
export type Collection =
  | "blog"
  | "experience"
  | "education"
  | "personal-project"
  | "professional-project";

/** Result of splitting an MDX source file into frontmatter and body. */
export interface ParsedFile {
  frontmatter: Record<string, unknown>;
  body: string;
}

/** A single table-of-contents entry derived from a body heading. */
export interface TocEntry {
  id: string;
  text: string;
  level: number;
}
