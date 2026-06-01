/**
 * Providers barrel.
 *
 * Single import surface for the platform's client context providers. The root
 * layout (task 13.2) wraps the app tree with these.
 *
 * @see Requirements 4.4, 4.5, 4.6
 */

export {
  ThemeProvider,
  useTheme,
  useThemeControl,
  type ThemeContextValue,
  type ThemeControlValue,
} from "./ThemeProvider";

export {
  AnalyticsProvider,
  useAnalytics,
  type AnalyticsContextValue,
} from "./AnalyticsProvider";
