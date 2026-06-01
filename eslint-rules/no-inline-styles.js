/**
 * ESLint rule: no-inline-styles
 *
 * Forbids static inline `style` props with object literals on JSX elements.
 * Inline styles bypass the token-driven style module system and make it
 * impossible to enforce design-token discipline at the component level.
 *
 * Requirement 26.1: Component styles must live in a dedicated `.style.ts`
 * module, not as inline `style={{ ... }}` props.
 *
 * Violations:
 *   <div style={{ color: 'red' }} />          ← static object literal — FAIL
 *   <div style={{ ...someStyles }} />         ← spread in object literal — FAIL
 *
 * Allowed:
 *   <div style={styles.container} />          ← reference to style module — OK
 *   <div style={dynamicStyle} />              ← variable reference — OK
 *   <div style={condition ? a : b} />         ← ternary — OK (not an object literal)
 *
 * @type {import('eslint').Rule.RuleModule}
 */
module.exports = {
  meta: {
    type: "suggestion",
    docs: {
      description:
        "Forbid static inline style props (object literals) on JSX elements",
      category: "Style Discipline",
      recommended: true,
      url: "https://github.com/placeholder/portfolio/blob/main/eslint-rules/no-inline-styles.js",
    },
    messages: {
      noInlineStyle:
        "Inline style props with object literals are forbidden. " +
        "Move styles to a dedicated `.style.ts` module and reference them by name. " +
        "(Requirement 26.1)",
    },
    schema: [],
  },

  create(context) {
    return {
      JSXAttribute(node) {
        // Only interested in the `style` prop.
        if (node.name.name !== "style") return;

        const value = node.value;
        if (!value) return;

        // style={...} — the value is a JSX expression container.
        if (value.type !== "JSXExpressionContainer") return;

        const expr = value.expression;

        // style={{ ... }} — direct object expression is always a violation.
        if (expr.type === "ObjectExpression") {
          context.report({ node, messageId: "noInlineStyle" });
        }
      },
    };
  },
};
