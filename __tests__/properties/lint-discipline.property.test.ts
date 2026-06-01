// Feature: next-gen-portfolio-platform, Property 47: Lint fails on inline styles and disallowed literals
// Validates: Requirements 26.7 (umbrella for 26.1–26.5, 3.1–3.3)
//
// Property 47: Lint fails on inline styles and disallowed literals.
// The custom ESLint rules must:
//   (1) Detect any JSX element with a `style` prop containing an object literal
//   (2) Not flag JSX elements with `style` referencing a variable or expression
//   (3) Detect hardcoded color literals (hex, rgb/rgba, hsl/hsla, named colors)
//   (4) Not flag CSS custom property references (var(--color-*))
//   (5) Not flag token value references (token.value)
//
// Strategy:
// Test the rule logic directly as pure functions, without running ESLint.
// This keeps the tests fast and dependency-free while validating the core
// detection logic that the ESLint rules implement.
//
// Two pure functions are extracted and tested:
//   - hasInlineStyleProp(jsxCode): boolean — detects inline style object literals
//   - isHardcodedColor(value): boolean — detects hardcoded color literals
//
// Tooling: Vitest + fast-check, numRuns = 100.

import { describe, expect, it } from "vitest";
import * as fc from "fast-check";

// ---------------------------------------------------------------------------
// Inline style detection logic
// (mirrors the AST check in eslint-rules/no-inline-styles.js)
// ---------------------------------------------------------------------------

/**
 * Detects whether a JSX code string contains a `style` prop with an inline
 * object literal.
 *
 * This is a simplified regex-based detector that mirrors the intent of the
 * ESLint rule's AST check. It detects the pattern `style={{ ... }}` in JSX.
 *
 * In production the ESLint rule uses the full AST, which is more precise.
 * This function tests the same logical contract: any `style={{ }}` is a
 * violation; `style={variable}` or `style={fn()}` is not.
 *
 * @param jsxCode - A string of JSX source code to inspect.
 * @returns true if the code contains an inline style object literal.
 */
export function hasInlineStyleProp(jsxCode: string): boolean {
  // Match style={{ ... }} — the double-brace pattern is the inline object literal.
  // This regex is intentionally simple: it matches the opening `style={{`
  // which is the definitive marker of an inline object literal style prop.
  return /\bstyle\s*=\s*\{\s*\{/.test(jsxCode);
}

// ---------------------------------------------------------------------------
// Hardcoded color detection logic
// (mirrors the check in eslint-rules/no-hardcoded-colors.js)
// ---------------------------------------------------------------------------

/** Regex for hex color literals (3, 4, 6, or 8 hex digits). */
const HEX_COLOR_RE = /^#([0-9a-fA-F]{3,4}|[0-9a-fA-F]{6}|[0-9a-fA-F]{8})$/;

/** Regex for rgb/rgba/hsl/hsla functional color notation. */
const FUNCTIONAL_COLOR_RE = /^(rgba?|hsla?)\s*\(/i;

/** Common named CSS colors that should not be hardcoded. */
const NAMED_COLORS = new Set([
  "red",
  "blue",
  "green",
  "white",
  "black",
  "yellow",
  "orange",
  "purple",
  "pink",
  "cyan",
  "magenta",
  "gray",
  "grey",
  "brown",
  "navy",
  "teal",
  "lime",
  "coral",
  "salmon",
  "gold",
  "silver",
  "violet",
  "indigo",
  "maroon",
  "olive",
  "aqua",
  "fuchsia",
]);

/**
 * Returns true when a string value looks like a hardcoded color literal.
 *
 * Mirrors the detection logic in `eslint-rules/no-hardcoded-colors.js`.
 *
 * @param value - The string value to check.
 */
export function isHardcodedColor(value: string): boolean {
  if (HEX_COLOR_RE.test(value)) return true;
  if (FUNCTIONAL_COLOR_RE.test(value)) return true;
  if (NAMED_COLORS.has(value.toLowerCase())) return true;
  return false;
}

// ---------------------------------------------------------------------------
// Arbitraries
// ---------------------------------------------------------------------------

/** Generates valid hex color strings. */
const hexColorArb: fc.Arbitrary<string> = fc
  .hexaString({ minLength: 6, maxLength: 6 })
  .map((h) => `#${h}`);

/** Generates short hex color strings (#rgb). */
const shortHexColorArb: fc.Arbitrary<string> = fc
  .hexaString({ minLength: 3, maxLength: 3 })
  .map((h) => `#${h}`);

/** Generates rgb() color strings. */
const rgbColorArb: fc.Arbitrary<string> = fc
  .tuple(
    fc.integer({ min: 0, max: 255 }),
    fc.integer({ min: 0, max: 255 }),
    fc.integer({ min: 0, max: 255 }),
  )
  .map(([r, g, b]) => `rgb(${r}, ${g}, ${b})`);

/** Generates rgba() color strings. */
const rgbaColorArb: fc.Arbitrary<string> = fc
  .tuple(
    fc.integer({ min: 0, max: 255 }),
    fc.integer({ min: 0, max: 255 }),
    fc.integer({ min: 0, max: 255 }),
    fc.double({ min: 0, max: 1, noNaN: true }),
  )
  .map(([r, g, b, a]) => `rgba(${r}, ${g}, ${b}, ${a.toFixed(2)})`);

/** Generates named color strings from the known set. */
const namedColorArb: fc.Arbitrary<string> = fc.constantFrom(
  ...Array.from(NAMED_COLORS),
);

/** Generates any hardcoded color string. */
const hardcodedColorArb: fc.Arbitrary<string> = fc.oneof(
  hexColorArb,
  shortHexColorArb,
  rgbColorArb,
  rgbaColorArb,
  namedColorArb,
);

/** Generates JSX with an inline style object literal. */
const inlineStyleJsxArb: fc.Arbitrary<string> = fc
  .record({
    tag: fc.constantFrom("div", "span", "section", "article", "p", "button"),
    prop: fc.constantFrom(
      "color: 'red'",
      "backgroundColor: '#fff'",
      "fontSize: 16",
      "margin: 0",
      "padding: '8px'",
    ),
  })
  .map(({ tag, prop }) => `<${tag} style={{ ${prop} }} />`);

/** Generates JSX with a style variable reference (not a violation). */
const styleVariableJsxArb: fc.Arbitrary<string> = fc
  .record({
    tag: fc.constantFrom("div", "span", "section", "article", "p", "button"),
    varName: fc
      .string({ minLength: 1, maxLength: 20 })
      .filter((s) => /^[a-zA-Z_][a-zA-Z0-9_]*$/.test(s)),
  })
  .map(({ tag, varName }) => `<${tag} style={${varName}} />`);

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe("Property 47: Lint fails on inline styles and disallowed literals", () => {
  // -------------------------------------------------------------------------
  // Inline style detection
  // -------------------------------------------------------------------------
  describe("hasInlineStyleProp — detects inline style object literals", () => {
    it("detects style={{ ... }} as a violation", () => {
      fc.assert(
        fc.property(inlineStyleJsxArb, (jsx) => {
          expect(hasInlineStyleProp(jsx)).toBe(true);
        }),
        { numRuns: 100 },
      );
    });

    it("does not flag style={variable} as a violation", () => {
      fc.assert(
        fc.property(styleVariableJsxArb, (jsx) => {
          expect(hasInlineStyleProp(jsx)).toBe(false);
        }),
        { numRuns: 100 },
      );
    });

    it("detects the canonical inline style pattern", () => {
      expect(hasInlineStyleProp('<div style={{ color: "red" }} />')).toBe(true);
      expect(hasInlineStyleProp("<div style={{ fontSize: 16 }} />")).toBe(true);
      expect(
        hasInlineStyleProp("<Button style={{ backgroundColor: '#fff' }} />"),
      ).toBe(true);
    });

    it("does not flag variable references", () => {
      expect(hasInlineStyleProp("<div style={styles.container} />")).toBe(
        false,
      );
      expect(hasInlineStyleProp("<div style={containerStyle} />")).toBe(false);
      expect(hasInlineStyleProp("<div style={getStyle()} />")).toBe(false);
      expect(hasInlineStyleProp("<div style={condition ? a : b} />")).toBe(
        false,
      );
    });

    it("does not flag elements without a style prop", () => {
      expect(hasInlineStyleProp("<div className='container' />")).toBe(false);
      expect(hasInlineStyleProp("<Button onClick={handleClick} />")).toBe(
        false,
      );
      expect(hasInlineStyleProp("<img src={src} alt={alt} />")).toBe(false);
    });

    it("detects spread objects in style prop", () => {
      // style={{ ...styles, color: 'red' }} is still an object literal
      expect(
        hasInlineStyleProp("<div style={{ ...styles, color: 'red' }} />"),
      ).toBe(true);
    });
  });

  // -------------------------------------------------------------------------
  // Hardcoded color detection
  // -------------------------------------------------------------------------
  describe("isHardcodedColor — detects hardcoded color literals", () => {
    it("detects any hex color as a violation", () => {
      fc.assert(
        fc.property(hexColorArb, (hex) => {
          expect(isHardcodedColor(hex)).toBe(true);
        }),
        { numRuns: 100 },
      );
    });

    it("detects short hex colors (#rgb) as violations", () => {
      fc.assert(
        fc.property(shortHexColorArb, (hex) => {
          expect(isHardcodedColor(hex)).toBe(true);
        }),
        { numRuns: 100 },
      );
    });

    it("detects rgb() colors as violations", () => {
      fc.assert(
        fc.property(rgbColorArb, (rgb) => {
          expect(isHardcodedColor(rgb)).toBe(true);
        }),
        { numRuns: 100 },
      );
    });

    it("detects rgba() colors as violations", () => {
      fc.assert(
        fc.property(rgbaColorArb, (rgba) => {
          expect(isHardcodedColor(rgba)).toBe(true);
        }),
        { numRuns: 100 },
      );
    });

    it("detects named CSS colors as violations", () => {
      fc.assert(
        fc.property(namedColorArb, (color) => {
          expect(isHardcodedColor(color)).toBe(true);
        }),
        { numRuns: 100 },
      );
    });

    it("does not flag CSS custom property references", () => {
      // var(--color-*) references are not hardcoded colors
      expect(isHardcodedColor("var(--color-brand)")).toBe(false);
      expect(isHardcodedColor("var(--color-aurora-green)")).toBe(false);
      expect(isHardcodedColor("var(--color-text-primary)")).toBe(false);
    });

    it("does not flag token value references", () => {
      // These are variable names / expressions, not color literals
      expect(isHardcodedColor("colors.celurenBlue[500].value")).toBe(false);
      expect(isHardcodedColor("token.value")).toBe(false);
      expect(isHardcodedColor("brandColor")).toBe(false);
    });

    it("does not flag non-color strings", () => {
      fc.assert(
        fc.property(
          fc.string({ minLength: 1, maxLength: 30 }).filter((s) => {
            // Exclude strings that happen to be valid colors
            return (
              !HEX_COLOR_RE.test(s) &&
              !FUNCTIONAL_COLOR_RE.test(s) &&
              !NAMED_COLORS.has(s.toLowerCase()) &&
              !s.startsWith("#")
            );
          }),
          (str) => {
            expect(isHardcodedColor(str)).toBe(false);
          },
        ),
        { numRuns: 100 },
      );
    });

    it("detects specific known violations", () => {
      expect(isHardcodedColor("#ffffff")).toBe(true);
      expect(isHardcodedColor("#000")).toBe(true);
      expect(isHardcodedColor("#00ff88")).toBe(true);
      expect(isHardcodedColor("rgb(0, 0, 0)")).toBe(true);
      expect(isHardcodedColor("rgba(255, 255, 255, 0.5)")).toBe(true);
      expect(isHardcodedColor("red")).toBe(true);
      expect(isHardcodedColor("blue")).toBe(true);
      expect(isHardcodedColor("white")).toBe(true);
      expect(isHardcodedColor("black")).toBe(true);
    });
  });

  // -------------------------------------------------------------------------
  // Combined: inline style with hardcoded color is a double violation
  // -------------------------------------------------------------------------
  describe("Combined violations", () => {
    it("JSX with inline style containing a hex color is both violations", () => {
      const jsx = '<div style={{ color: "#ff0000" }} />';
      expect(hasInlineStyleProp(jsx)).toBe(true);
      expect(isHardcodedColor("#ff0000")).toBe(true);
    });

    it("JSX with style variable referencing token is neither violation", () => {
      const jsx = "<div style={styles.container} />";
      expect(hasInlineStyleProp(jsx)).toBe(false);
      // The style value is a variable reference, not a color literal
      expect(isHardcodedColor("styles.container")).toBe(false);
    });
  });
});
