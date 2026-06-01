/**
 * Custom ESLint configuration for style and constant discipline.
 *
 * Loads the two custom rules defined in `eslint-rules/` and configures them
 * to enforce Requirements 26.1–26.5 and 3.1–3.3:
 *
 *   - `no-inline-styles`: forbids static `style={{ ... }}` object literals on
 *     JSX elements (Requirement 26.1).
 *   - `no-hardcoded-colors`: forbids hardcoded color literals in style files
 *     and component files (Requirements 3.3, 26.2, 26.3).
 *
 * Usage:
 *   Extend this config from the project's main `.eslintrc.js` / `eslint.config.js`:
 *
 *   ```js
 *   // eslint.config.js
 *   const custom = require('./.eslintrc.custom.js');
 *   module.exports = [...existingConfig, ...custom.configs.recommended];
 *   ```
 *
 *   Or run directly against specific files:
 *   ```bash
 *   npx eslint --rulesdir eslint-rules --rule '{"no-inline-styles": "error"}' src/
 *   ```
 *
 * @see Requirements 26.1, 26.2, 26.3, 26.4, 26.5, 26.7, 3.1, 3.2, 3.3
 */

"use strict";

const noInlineStyles = require("./eslint-rules/no-inline-styles");
const noHardcodedColors = require("./eslint-rules/no-hardcoded-colors");

/**
 * Plugin definition that registers both custom rules under the
 * `portfolio` namespace.
 */
const portfolioPlugin = {
  rules: {
    "no-inline-styles": noInlineStyles,
    "no-hardcoded-colors": noHardcodedColors,
  },
};

/**
 * Flat config array for use with ESLint's flat config system (eslint.config.js).
 * Apply to TypeScript/TSX source files in `src/`.
 */
const flatConfigs = [
  {
    plugins: {
      portfolio: portfolioPlugin,
    },
    rules: {
      // Forbid static inline style props on JSX elements (Requirement 26.1).
      "portfolio/no-inline-styles": "error",

      // Forbid hardcoded color literals in style and component files
      // (Requirements 3.3, 26.2, 26.3).
      // "transparent" is allowed as it is a legitimate CSS value with no
      // token equivalent.
      "portfolio/no-hardcoded-colors": ["error", { allow: ["transparent"] }],
    },
    files: ["src/**/*.ts", "src/**/*.tsx"],
  },
];

module.exports = {
  plugin: portfolioPlugin,
  configs: {
    recommended: flatConfigs,
  },
};
