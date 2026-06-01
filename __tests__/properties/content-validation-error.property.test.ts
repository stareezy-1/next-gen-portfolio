// Feature: next-gen-portfolio-platform, Property 24: Invalid content yields a descriptive validation error
//
// Validates: Requirements 15.2, 15.3
//
// Property 24: Invalid content yields a descriptive validation error.
// For any content file whose frontmatter violates its collection schema
// (a missing required field, or a required field set to the wrong type), the
// Content_Loader rejects it with a validation error that identifies BOTH the
// file and the failing field.
//
// Strategy (per generated case):
//   1. Pick one of the five collections.
//   2. Generate a VALID frontmatter object containing exactly that collection's
//      required fields (optional fields are omitted — a required-only object
//      still validates, so the baseline is clean).
//   3. CORRUPT exactly one required field by either:
//        (a) deleting it, or
//        (b) setting it to a value of the wrong type (a number/boolean where a
//            string is expected, a number/array where a boolean is expected, a
//            number/boolean where an array is expected).
//      Wrong-type values are chosen so they round-trip through YAML to a type
//      that is unambiguously different from the one the schema expects, so the
//      ONLY validation failure is the field we corrupted.
//   4. Serialize the corrupted frontmatter to canonical MDX via the real
//      Content_Serializer, and pair it with a random `posts/<slug>.mdx` path.
//
// Because exactly one required field is corrupted, the loader reports exactly
// that field — letting us prove the error names a specific field, not merely a
// non-empty one.
//
// Tooling: Vitest + fast-check, numRuns = 200.
import { describe, expect, it } from "vitest";
import * as fc from "fast-check";

import { loadSource, serialize, ValidationError } from "@/content";
import type { Collection, ContentObject } from "@/types";

/** The schema-expected type of a generated frontmatter field. */
type FieldKind = "string" | "isoDate" | "boolean" | "array" | "kind";

interface RequiredField {
  name: string;
  kind: FieldKind;
}

/**
 * The required (non-optional) frontmatter fields of every collection, with the
 * type each field expects. Corrupting any of these is guaranteed to be a schema
 * violation, so they are the safe surface to mutate.
 */
const SPECS: { collection: Collection; required: RequiredField[] }[] = [
  {
    collection: "blog",
    required: [
      { name: "slug", kind: "string" },
      { name: "title", kind: "string" },
      { name: "description", kind: "string" },
      { name: "heroImage", kind: "string" },
      { name: "author", kind: "string" },
      { name: "publishDate", kind: "isoDate" },
      { name: "tags", kind: "array" },
      { name: "category", kind: "string" },
      { name: "published", kind: "boolean" },
    ],
  },
  {
    collection: "experience",
    required: [
      { name: "company", kind: "string" },
      { name: "role", kind: "string" },
      { name: "location", kind: "string" },
      { name: "startDate", kind: "isoDate" },
      { name: "achievements", kind: "array" },
      { name: "technologies", kind: "array" },
      { name: "impactMetrics", kind: "array" },
    ],
  },
  {
    collection: "education",
    required: [
      { name: "school", kind: "string" },
      { name: "degree", kind: "string" },
      { name: "major", kind: "string" },
      { name: "startDate", kind: "isoDate" },
    ],
  },
  {
    collection: "personal-project",
    required: [
      { name: "kind", kind: "kind" },
      { name: "slug", kind: "string" },
      { name: "title", kind: "string" },
      { name: "description", kind: "string" },
      { name: "image", kind: "string" },
      { name: "technologies", kind: "array" },
      { name: "featured", kind: "boolean" },
      { name: "startDate", kind: "isoDate" },
    ],
  },
  {
    collection: "professional-project",
    required: [
      { name: "kind", kind: "kind" },
      { name: "slug", kind: "string" },
      { name: "title", kind: "string" },
      { name: "company", kind: "string" },
      { name: "role", kind: "string" },
      { name: "description", kind: "string" },
      { name: "image", kind: "string" },
      { name: "technologies", kind: "array" },
      { name: "achievements", kind: "array" },
      { name: "featured", kind: "boolean" },
    ],
  },
];

/** The discriminant literal a project collection's `kind` field must hold. */
function kindLiteral(collection: Collection): "personal" | "professional" {
  return collection === "personal-project" ? "personal" : "professional";
}

/** A small integer that YAML round-trips unambiguously as a number. */
const intArb = fc.integer({ min: -1_000_000, max: 1_000_000 });

/** A valid ISO-8601 calendar date string within a sane 4-digit-year range. */
const isoDateArb = fc
  .date({
    min: new Date(Date.UTC(1970, 0, 1)),
    max: new Date(Date.UTC(2100, 11, 31)),
  })
  .map((d) => d.toISOString().slice(0, 10));

/** Produces a schema-valid value for a required field of the given kind. */
function validValueArb(
  field: RequiredField,
  collection: Collection,
): fc.Arbitrary<unknown> {
  switch (field.kind) {
    case "string":
      return fc.string();
    case "isoDate":
      return isoDateArb;
    case "boolean":
      return fc.boolean();
    case "array":
      return fc.array(fc.string(), { maxLength: 4 });
    case "kind":
      return fc.constant(kindLiteral(collection));
  }
}

/**
 * Produces a value whose YAML-round-tripped type is unambiguously DIFFERENT
 * from the one the field expects, guaranteeing a single wrong-type violation.
 */
function wrongTypeArb(field: RequiredField): fc.Arbitrary<unknown> {
  switch (field.kind) {
    case "string":
    case "isoDate":
    case "kind":
      // Expected a string → a number or boolean is the wrong type.
      return fc.oneof(intArb, fc.boolean());
    case "boolean":
      // Expected a boolean → a number or an array is the wrong type.
      return fc.oneof(intArb, fc.array(intArb, { minLength: 1, maxLength: 3 }));
    case "array":
      // Expected an array → a number or boolean is the wrong type.
      return fc.oneof(intArb, fc.boolean());
  }
}

interface InvalidCase {
  collection: Collection;
  file: string;
  source: string;
  corruptedField: string;
  mode: "delete" | "wrongType";
}

/** Builds an arbitrary of corrupted-content cases for a single collection. */
function caseArb(spec: {
  collection: Collection;
  required: RequiredField[];
}): fc.Arbitrary<InvalidCase> {
  const valueArbs = spec.required.map((f) => validValueArb(f, spec.collection));

  return fc
    .record({
      values: fc.tuple(...valueArbs),
      targetIndex: fc.integer({ min: 0, max: spec.required.length - 1 }),
      mode: fc.constantFrom("delete" as const, "wrongType" as const),
      slug: fc.hexaString({ minLength: 1, maxLength: 10 }),
    })
    .chain(({ values, targetIndex, mode, slug }) => {
      // `targetIndex` is generated in [0, spec.required.length - 1], so this
      // index is always in range.
      const target = spec.required[targetIndex]!;
      return wrongTypeArb(target).map((wrongValue) => {
        // Assemble a valid, required-only frontmatter object...
        const frontmatter: Record<string, unknown> = {};
        spec.required.forEach((f, i) => {
          frontmatter[f.name] = values[i];
        });

        // ...then corrupt exactly one required field.
        if (mode === "delete") {
          delete frontmatter[target.name];
        } else {
          frontmatter[target.name] = wrongValue;
        }

        const source = serialize(frontmatter as unknown as ContentObject);
        return {
          collection: spec.collection,
          file: `posts/${slug}.mdx`,
          source,
          corruptedField: target.name,
          mode,
        };
      });
    });
}

const invalidCaseArb: fc.Arbitrary<InvalidCase> = fc.oneof(
  ...SPECS.map(caseArb),
);

describe("Property 24: invalid content yields a descriptive validation error", () => {
  it("rejects schema-violating frontmatter with an error naming the file and failing field", () => {
    fc.assert(
      fc.property(
        invalidCaseArb,
        ({ collection, file, source, corruptedField }) => {
          const result = loadSource(file, collection, source);

          // The corrupted file must be rejected.
          expect(result.ok).toBe(false);
          if (result.ok) {
            return; // unreachable; narrows the Result union for the type checker
          }

          const { error } = result;
          expect(error).toBeInstanceOf(ValidationError);

          // The error identifies the file (Requirement 15.3).
          expect(error.file).toBe(file);

          // The error names a specific, non-empty field — the one we corrupted.
          expect(error.field.length).toBeGreaterThan(0);
          expect(error.field).toContain(corruptedField);

          // A descriptive detail is present.
          expect(error.detail.length).toBeGreaterThan(0);

          // The composed message surfaces both the file and the failing field.
          expect(error.message).toContain(file);
          expect(error.message).toContain(error.field);
        },
      ),
      { numRuns: 200 },
    );
  });
});
