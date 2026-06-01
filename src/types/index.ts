/**
 * Shared type barrel for the Next-Gen Portfolio Platform.
 *
 * Re-exports every shared type so consumers can import from `@/types`.
 */

export type {
  BlogPost,
  ExperienceEntry,
  EducationEntry,
  PersonalProject,
  ProfessionalProject,
  Project,
  ContentObject,
  Collection,
  ParsedFile,
  TocEntry,
} from "./content";

export type {
  ThemeMode,
  ThemePalette,
  ResolvedMode,
  ThemeState,
} from "./theme";

export type { AnalyticsEvent } from "./analytics";

export type { ContactInput, ContactResult } from "./contact";

export type {
  SchemaType,
  RouteDescriptor,
  SitemapEntry,
  RobotsConfig,
  RssItem,
  Redirect,
  JsonLd,
} from "./seo";

export type { MotionConfig } from "./animation";
