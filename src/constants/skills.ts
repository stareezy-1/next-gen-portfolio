/**
 * Skill-group names.
 *
 * The fixed six categories the Home skills section groups skills under
 * (Requirement 7.4). Defined as named constants so the category labels are
 * never inlined at use sites (Requirements 26.4, 26.5).
 */

/** Stable identifier for each skill group. */
export const SKILL_GROUP_KEYS = {
  FRONTEND: "frontend",
  BACKEND: "backend",
  MOBILE: "mobile",
  CLOUD: "cloud",
  DEVOPS: "devops",
  AI: "ai",
} as const;

/** Union of skill-group identifiers. */
export type SkillGroupKey =
  (typeof SKILL_GROUP_KEYS)[keyof typeof SKILL_GROUP_KEYS];

/** Human-readable label for each skill group. */
export const SKILL_GROUP_LABELS = {
  FRONTEND: "Frontend",
  BACKEND: "Backend",
  MOBILE: "Mobile",
  CLOUD: "Cloud",
  DEVOPS: "DevOps",
  AI: "AI",
} as const;

/** A single skill group: identifier and display label. */
export interface SkillGroup {
  readonly key: SkillGroupKey;
  readonly label: string;
}

/**
 * The fixed, ordered list of the six skill groups (Requirement 7.4):
 * Frontend, Backend, Mobile, Cloud, DevOps, AI.
 */
export const SKILL_GROUPS: readonly SkillGroup[] = [
  { key: SKILL_GROUP_KEYS.FRONTEND, label: SKILL_GROUP_LABELS.FRONTEND },
  { key: SKILL_GROUP_KEYS.BACKEND, label: SKILL_GROUP_LABELS.BACKEND },
  { key: SKILL_GROUP_KEYS.MOBILE, label: SKILL_GROUP_LABELS.MOBILE },
  { key: SKILL_GROUP_KEYS.CLOUD, label: SKILL_GROUP_LABELS.CLOUD },
  { key: SKILL_GROUP_KEYS.DEVOPS, label: SKILL_GROUP_LABELS.DEVOPS },
  { key: SKILL_GROUP_KEYS.AI, label: SKILL_GROUP_LABELS.AI },
] as const;
