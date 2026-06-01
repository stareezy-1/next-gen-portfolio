import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";

/**
 * Vitest configuration for the Next-Gen Portfolio Platform.
 *
 * - jsdom environment for component/DOM assertions (@testing-library/react).
 * - React plugin enables JSX/TSX transform for React 19.
 * - `@/` path alias mirrors tsconfig.json so imports resolve identically in
 *   source and tests.
 * - Property-based tests live in `__tests__/properties/` as `*.property.test.ts`.
 */
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
  test: {
    globals: true,
    environment: "jsdom",
    setupFiles: ["./vitest.setup.ts"],
    include: [
      "src/**/*.{test,spec}.{ts,tsx}",
      "__tests__/**/*.{test,spec}.{ts,tsx}",
    ],
    passWithNoTests: true,
  },
});
