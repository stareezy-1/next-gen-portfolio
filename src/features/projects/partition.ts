/**
 * Project partition utilities.
 *
 * Pure functions for splitting a mixed {@link Project} array into its
 * personal and professional groupings, and for deriving the related-projects
 * list for a detail page.
 *
 * These are the core logic units tested by Properties 13 and 16.
 *
 * @see Requirements 11.1, 12.4
 */

import type {
  PersonalProject,
  ProfessionalProject,
  SaasProject,
  Project,
} from "@/types/content";

/**
 * Partitions a mixed array of projects into personal, professional, and SaaS
 * groupings.
 *
 * Every {@link PersonalProject} (kind === "personal") ends up in `personal`;
 * every {@link ProfessionalProject} (kind === "professional") in `professional`;
 * every {@link SaasProject} (kind === "saas") in `saas`. No project appears in
 * more than one group, and every project is accounted for
 * (personal.length + professional.length + saas.length === projects.length).
 *
 * @param projects - The mixed array to partition.
 * @returns An object with `personal`, `professional`, and `saas` arrays.
 *
 * @see Requirements 11.1
 * @see Property 13
 */
export function partitionProjects(projects: Project[]): {
  personal: PersonalProject[];
  professional: ProfessionalProject[];
  saas: SaasProject[];
} {
  const personal: PersonalProject[] = [];
  const professional: ProfessionalProject[] = [];
  const saas: SaasProject[] = [];

  for (const p of projects) {
    if (p.kind === "personal") {
      personal.push(p);
    } else if (p.kind === "saas") {
      saas.push(p);
    } else {
      professional.push(p);
    }
  }

  return { personal, professional, saas };
}

/**
 * Returns all projects except the one identified by `currentSlug`.
 *
 * Used to populate the Related Projects section on a project detail page.
 * The result never contains the current project, regardless of whether it
 * appears in the input array.
 *
 * @param projects - The full pool of projects to filter.
 * @param currentSlug - The slug of the project currently being displayed.
 * @returns All projects whose slug differs from `currentSlug`.
 *
 * @see Requirements 12.4
 * @see Property 16
 */
export function getRelatedProjects(
  projects: Project[],
  currentSlug: string,
): Project[] {
  return projects.filter((p) => p.slug !== currentSlug);
}
