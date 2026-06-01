// Feature: next-gen-portfolio-platform, Property 15: Professional content with a repository link is rejected
//
// Validates: Requirements 11.6
//
// Property 15: Professional content with a repository link is rejected.
// For any professional-project content item whose frontmatter contains a
// repository link, the Content_Loader rejects it with a validation error.
//
// Strategy:
//   1. Build a VALID professional-project frontmatter object (kind, slug,
//      title, company, role, description, image, technologies[],
//      achievements[], featured) so the ONLY reason validation can fail is the
//      injected forbidden field.
//   2. Inject one randomly-chosen forbidden field from
//      FORBIDDEN_REPOSITORY_FIELDS with an arbitrary URL/string value.
//   3. Serialize to canonical MDX source (frontmatter fence + empty body) and
//      run it through loadSource for the "professional-project" collection.
//   4. Assert the loader returns { ok: false } with a ValidationError that
//      names the injected forbidden field (via error.field or error.message).
//
// A separate non-property control confirms a clean professional-project
// (no forbidden field) loads OK, so the rejection is attributable to the
// repository link rather than the base shape.
//
// Tooling: Vitest + fast-check, numRuns = 100.
import { describe, expect, it } from "vitest";
import * as fc from "fast-check";
import { stringify } from "yaml";

import { loadSource, ValidationError } from "@/content";
import { FORBIDDEN_REPOSITORY_FIELDS } from "@/content/schemas";

const COLLECTION = "professional-project" as const;
const FILE = "src/content/collections/professional-project/test.mdx";

/**
 * A valid Professional_Project frontmatter shape. Every declared field is
 * present and well-typed, so this object passes the professional-project schema
 * on its own — isolating the forbidden field as the sole cause of rejection.
 */
function validProfessionalFrontmatter(): Record<string, unknown> {
  return {
    kind: "professional",
    slug: "acme-platform",
    title: "Acme Platform",
    company: "Acme Corp",
    role: "Lead Engineer",
    description: "A confidential professional engagement.",
    image: "/images/acme-platform.png",
    technologies: ["TypeScript", "Go"],
    achievements: ["Shipped v1", "Reduced p95 latency by 40%"],
    featured: true,
  };
}

/**
 * Serialize a frontmatter record into canonical MDX source: a `---`-fenced
 * YAML block (keys sorted, matching the Content_Serializer) followed by an
 * empty body. The MDX_Parser recognizes exactly this shape.
 */
function buildMdxSource(frontmatter: Record<string, unknown>): string {
  const yaml = stringify(frontmatter, { sortMapEntries: true });
  return `---\n${yaml}---\n`;
}

describe("Property 15: professional-project repository-link rejection", () => {
  it("rejects any professional-project frontmatter carrying a forbidden repository field", () => {
    fc.assert(
      fc.property(
        // Pick one forbidden repository/source field name...
        fc.constantFrom(...FORBIDDEN_REPOSITORY_FIELDS),
        // ...and an arbitrary URL/string value for it.
        fc.oneof(fc.webUrl(), fc.string()),
        (field, value) => {
          // A valid base object plus exactly one injected forbidden field.
          const frontmatter = validProfessionalFrontmatter();
          frontmatter[field] = value;

          const source = buildMdxSource(frontmatter);
          const result = loadSource(FILE, COLLECTION, source);

          // The loader must reject the content item.
          expect(result.ok).toBe(false);
          if (result.ok) {
            return; // unreachable after the assertion; narrows the type
          }

          // The failure must be a descriptive ValidationError that identifies
          // the injected forbidden field — either as the failing field or in
          // the composed message.
          const error = result.error;
          expect(error).toBeInstanceOf(ValidationError);
          expect(error.file).toBe(FILE);
          expect(
            error.field.includes(field) || error.message.includes(field),
          ).toBe(true);
        },
      ),
      { numRuns: 100 },
    );
  });

  // Control: a clean professional-project (no forbidden field) loads OK, so the
  // rejection above is caused by the repository link, not the base shape.
  it("accepts a clean professional-project with no forbidden field", () => {
    const source = buildMdxSource(validProfessionalFrontmatter());
    const result = loadSource(FILE, COLLECTION, source);

    expect(result.ok).toBe(true);
    if (!result.ok) {
      return; // unreachable after the assertion; narrows the type
    }
    expect(result.value.kind).toBe("professional");
    expect(result.value.slug).toBe("acme-platform");
  });
});
