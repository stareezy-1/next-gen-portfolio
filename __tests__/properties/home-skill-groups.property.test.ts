// Feature: next-gen-portfolio-platform, Property 8: Skills are grouped into the fixed six categories
//
// **Validates: Requirements 7.4**
//
// Property 8: Skills are grouped into the fixed six categories.
// For any set of skills, the Home skills section groups them under exactly the
// categories Frontend, Backend, Mobile, Cloud, DevOps, and AI, and every skill
// appears under its declared category.
//
// Contracts under test (SKILL_GROUPS from @/constants):
//
//   1. SKILL_GROUPS has exactly 6 items.
//   2. Contains exactly the keys: frontend, backend, mobile, cloud, devops, ai.
//   3. Contains exactly the labels: Frontend, Backend, Mobile, Cloud, DevOps, AI.
//   4. No duplicate keys or labels.
//   5. For any skill assigned to a group key, the key is one of the six valid keys.
//
// Strategy:
//   The constant itself is deterministic — assert its shape directly.
//   Use fc.assert to verify that any skill assigned to a group key is correctly
//   categorized (i.e., the key exists in SKILL_GROUPS).
//
// Tooling: Vitest + fast-check, numRuns = 100.

import { describe, it, expect } from "vitest";
import * as fc from "fast-check";

import {
  SKILL_GROUPS,
  SKILL_GROUP_KEYS,
  SKILL_GROUP_LABELS,
} from "@/constants/skills";

// ---------------------------------------------------------------------------
// Expected values
// ---------------------------------------------------------------------------

const EXPECTED_KEYS = [
  SKILL_GROUP_KEYS.FRONTEND,
  SKILL_GROUP_KEYS.BACKEND,
  SKILL_GROUP_KEYS.MOBILE,
  SKILL_GROUP_KEYS.CLOUD,
  SKILL_GROUP_KEYS.DEVOPS,
  SKILL_GROUP_KEYS.AI,
] as const;

const EXPECTED_LABELS = [
  SKILL_GROUP_LABELS.FRONTEND,
  SKILL_GROUP_LABELS.BACKEND,
  SKILL_GROUP_LABELS.MOBILE,
  SKILL_GROUP_LABELS.CLOUD,
  SKILL_GROUP_LABELS.DEVOPS,
  SKILL_GROUP_LABELS.AI,
] as const;

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe("Property 8: Skills are grouped into the fixed six categories", () => {
  // -------------------------------------------------------------------------
  // Deterministic shape assertions on the SKILL_GROUPS constant
  // -------------------------------------------------------------------------

  it("SKILL_GROUPS has exactly 6 items", () => {
    expect(SKILL_GROUPS.length).toBe(6);
  });

  it("SKILL_GROUPS contains exactly the six expected keys", () => {
    const actualKeys = SKILL_GROUPS.map((g) => g.key);

    for (const expectedKey of EXPECTED_KEYS) {
      expect(
        actualKeys,
        `SKILL_GROUPS must contain key "${expectedKey}"`,
      ).toContain(expectedKey);
    }

    expect(actualKeys.length, "SKILL_GROUPS must contain exactly 6 keys").toBe(
      EXPECTED_KEYS.length,
    );
  });

  it("SKILL_GROUPS contains exactly the six expected labels", () => {
    const actualLabels = SKILL_GROUPS.map((g) => g.label);

    for (const expectedLabel of EXPECTED_LABELS) {
      expect(
        actualLabels,
        `SKILL_GROUPS must contain label "${expectedLabel}"`,
      ).toContain(expectedLabel);
    }

    expect(
      actualLabels.length,
      "SKILL_GROUPS must contain exactly 6 labels",
    ).toBe(EXPECTED_LABELS.length);
  });

  it("SKILL_GROUPS has no duplicate keys", () => {
    const keys = SKILL_GROUPS.map((g) => g.key);
    const uniqueKeys = new Set(keys);

    expect(uniqueKeys.size, "All skill group keys must be unique").toBe(
      keys.length,
    );
  });

  it("SKILL_GROUPS has no duplicate labels", () => {
    const labels = SKILL_GROUPS.map((g) => g.label);
    const uniqueLabels = new Set(labels);

    expect(uniqueLabels.size, "All skill group labels must be unique").toBe(
      labels.length,
    );
  });

  // -------------------------------------------------------------------------
  // Property: any skill assigned to a group key is correctly categorized
  // -------------------------------------------------------------------------

  it("any skill assigned to a group key belongs to a valid group", () => {
    const validKeys = new Set(SKILL_GROUPS.map((g) => g.key));

    // Generate arbitrary (skillName, groupKey) pairs where the key is one of
    // the six valid keys, and verify the key is recognized by SKILL_GROUPS.
    fc.assert(
      fc.property(
        fc.string({ minLength: 1, maxLength: 40 }),
        fc.constantFrom(...EXPECTED_KEYS),
        (skillName, groupKey) => {
          // The group key must exist in SKILL_GROUPS
          expect(
            validKeys.has(groupKey),
            `Group key "${groupKey}" for skill "${skillName}" must be one of the six valid keys`,
          ).toBe(true);

          // The group with this key must have a label
          const group = SKILL_GROUPS.find((g) => g.key === groupKey);
          expect(
            group,
            `A group with key "${groupKey}" must exist in SKILL_GROUPS`,
          ).toBeDefined();
          expect(
            group!.label.length,
            `Group "${groupKey}" must have a non-empty label`,
          ).toBeGreaterThan(0);
        },
      ),
      { numRuns: 100 },
    );
  });

  it("each group key maps to exactly one label", () => {
    fc.assert(
      fc.property(fc.constantFrom(...EXPECTED_KEYS), (key) => {
        const matches = SKILL_GROUPS.filter((g) => g.key === key);

        expect(
          matches.length,
          `Key "${key}" must appear exactly once in SKILL_GROUPS`,
        ).toBe(1);
      }),
      { numRuns: 100 },
    );
  });
});
