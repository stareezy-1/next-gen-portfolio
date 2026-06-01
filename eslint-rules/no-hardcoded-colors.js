/**
 * ESLint rule: no-hardcoded-colors
 *
 * Forbids hardcoded color literals in style files (`.style.ts` / `.style.tsx`)
 * and component files. All color values must originate from the Token_System
 * accessed via `token.value` or CSS custom properties (`var(--color-*)`).
 *
 * Requirements 3.3, 26.2, 26.3: The platform must not contain hardcoded color,
 * spacing, radius, shadow, or typography literals where an equivalent
 * Token_System value exists.
 *
 * Detected patterns:
 *   - Hex colors:          "#fff", "#ffffff", "#00ff88", "#00ff8880"
 *   - rgb/rgba:            "rgb(0, 0, 0)", "rgba(255, 255, 255, 0.5)"
 *   - hsl/hsla:            "hsl(120, 100%, 50%)", "hsla(0, 0%, 0%, 0.5)"
 *   - Named CSS colors:    "red", "blue", "transparent" (common subset)
 *
 * Allowed:
 *   - CSS custom properties:  "var(--color-brand)"
 *   - Token references:       colors.celurenBlue[500].value
 *   - "transparent" in specific contexts (e.g. outline: "transparent")
 *     — configure via options if needed
 *
 * @type {import('eslint').Rule.RuleModule}
 */

/** Regex for hex color literals (3, 4, 6, or 8 hex digits). */
const HEX_COLOR_RE = /^#([0-9a-fA-F]{3,4}|[0-9a-fA-F]{6}|[0-9a-fA-F]{8})$/;

/** Regex for rgb/rgba/hsl/hsla functional color notation. */
const FUNCTIONAL_COLOR_RE = /^(rgba?|hsla?)\s*\(/i;

/**
 * A subset of CSS named colors that are commonly hardcoded by mistake.
 * Does not include "transparent" or "inherit" / "currentColor" which are
 * often legitimate in style modules.
 */
const NAMED_COLORS = new Set([
  "aliceblue",
  "antiquewhite",
  "aqua",
  "aquamarine",
  "azure",
  "beige",
  "bisque",
  "black",
  "blanchedalmond",
  "blue",
  "blueviolet",
  "brown",
  "burlywood",
  "cadetblue",
  "chartreuse",
  "chocolate",
  "coral",
  "cornflowerblue",
  "cornsilk",
  "crimson",
  "cyan",
  "darkblue",
  "darkcyan",
  "darkgoldenrod",
  "darkgray",
  "darkgreen",
  "darkgrey",
  "darkkhaki",
  "darkmagenta",
  "darkolivegreen",
  "darkorange",
  "darkorchid",
  "darkred",
  "darksalmon",
  "darkseagreen",
  "darkslateblue",
  "darkslategray",
  "darkslategrey",
  "darkturquoise",
  "darkviolet",
  "deeppink",
  "deepskyblue",
  "dimgray",
  "dimgrey",
  "dodgerblue",
  "firebrick",
  "floralwhite",
  "forestgreen",
  "fuchsia",
  "gainsboro",
  "ghostwhite",
  "gold",
  "goldenrod",
  "gray",
  "green",
  "greenyellow",
  "grey",
  "honeydew",
  "hotpink",
  "indianred",
  "indigo",
  "ivory",
  "khaki",
  "lavender",
  "lavenderblush",
  "lawngreen",
  "lemonchiffon",
  "lightblue",
  "lightcoral",
  "lightcyan",
  "lightgoldenrodyellow",
  "lightgray",
  "lightgreen",
  "lightgrey",
  "lightpink",
  "lightsalmon",
  "lightseagreen",
  "lightskyblue",
  "lightslategray",
  "lightslategrey",
  "lightsteelblue",
  "lightyellow",
  "lime",
  "limegreen",
  "linen",
  "magenta",
  "maroon",
  "mediumaquamarine",
  "mediumblue",
  "mediumorchid",
  "mediumpurple",
  "mediumseagreen",
  "mediumslateblue",
  "mediumspringgreen",
  "mediumturquoise",
  "mediumvioletred",
  "midnightblue",
  "mintcream",
  "mistyrose",
  "moccasin",
  "navajowhite",
  "navy",
  "oldlace",
  "olive",
  "olivedrab",
  "orange",
  "orangered",
  "orchid",
  "palegoldenrod",
  "palegreen",
  "paleturquoise",
  "palevioletred",
  "papayawhip",
  "peachpuff",
  "peru",
  "pink",
  "plum",
  "powderblue",
  "purple",
  "rebeccapurple",
  "red",
  "rosybrown",
  "royalblue",
  "saddlebrown",
  "salmon",
  "sandybrown",
  "seagreen",
  "seashell",
  "sienna",
  "silver",
  "skyblue",
  "slateblue",
  "slategray",
  "slategrey",
  "snow",
  "springgreen",
  "steelblue",
  "tan",
  "teal",
  "thistle",
  "tomato",
  "turquoise",
  "violet",
  "wheat",
  "white",
  "whitesmoke",
  "yellow",
  "yellowgreen",
]);

/**
 * Returns true when a string literal value looks like a hardcoded color.
 *
 * @param {string} value - The string literal value to check.
 */
function isHardcodedColor(value) {
  if (HEX_COLOR_RE.test(value)) return true;
  if (FUNCTIONAL_COLOR_RE.test(value)) return true;
  if (NAMED_COLORS.has(value.toLowerCase())) return true;
  return false;
}

module.exports = {
  meta: {
    type: "suggestion",
    docs: {
      description:
        "Forbid hardcoded color literals in style files and component files",
      category: "Style Discipline",
      recommended: true,
      url: "https://github.com/placeholder/portfolio/blob/main/eslint-rules/no-hardcoded-colors.js",
    },
    messages: {
      noHardcodedColor:
        "Hardcoded color literal '{{ color }}' is forbidden. " +
        "Use a Token_System value (token.value) or a CSS custom property " +
        "(var(--color-*)). (Requirements 3.3, 26.2, 26.3)",
    },
    schema: [
      {
        type: "object",
        properties: {
          // Allow specific values (e.g. "transparent") to be whitelisted.
          allow: {
            type: "array",
            items: { type: "string" },
            default: [],
          },
        },
        additionalProperties: false,
      },
    ],
  },

  create(context) {
    const options = context.options[0] || {};
    const allowList = new Set(
      (options.allow || []).map((v) => v.toLowerCase()),
    );

    return {
      Literal(node) {
        if (typeof node.value !== "string") return;
        const value = node.value;
        if (allowList.has(value.toLowerCase())) return;
        if (isHardcodedColor(value)) {
          context.report({
            node,
            messageId: "noHardcodedColor",
            data: { color: value },
          });
        }
      },

      TemplateLiteral(node) {
        // Check static parts of template literals for color values.
        for (const quasi of node.quasis) {
          const raw = quasi.value.raw;
          // Extract potential hex colors from template literal segments.
          const hexMatches = raw.match(
            /#([0-9a-fA-F]{3,4}|[0-9a-fA-F]{6}|[0-9a-fA-F]{8})\b/g,
          );
          if (hexMatches) {
            for (const match of hexMatches) {
              if (!allowList.has(match.toLowerCase())) {
                context.report({
                  node: quasi,
                  messageId: "noHardcodedColor",
                  data: { color: match },
                });
              }
            }
          }
        }
      },
    };
  },
};
