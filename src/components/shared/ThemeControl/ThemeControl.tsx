"use client";

/**
 * ThemeControl — client island for cycling through Theme_Mode values.
 *
 * A `'use client'` component that reads the current mode from `useTheme()` and
 * advances it through the cycle dark → light → system → dark via
 * `useThemeControl().setMode()` (Requirements 6.4, 4.1, 4.3).
 *
 * Styles live in `ThemeControl.style.ts` — no inline styles here
 * (Requirement 26.1).
 *
 * @see Requirements 6.4, 4.1, 4.3, 26.1
 */

import { useTheme, useThemeControl } from "@/providers/ThemeProvider";
import {
  themeControlButtonStyles,
  themeControlIconStyles,
  themeControlWrapperStyles,
} from "./ThemeControl.style";
import {
  THEME_MODE_CYCLE,
  THEME_MODE_ICONS,
  THEME_MODE_LABELS,
} from "./ThemeControl.types";
import type { ThemeControlProps } from "./ThemeControl.types";

/**
 * A button that cycles the active Theme_Mode: dark → light → system → dark.
 *
 * Accessible: the button carries an `aria-label` that describes the *next*
 * action ("Switch to light mode") and a visible label showing the *current*
 * mode, so both sighted and screen-reader users understand the control.
 */
export function ThemeControl({ className }: ThemeControlProps) {
  const { mode } = useTheme();
  const { setMode } = useThemeControl();

  /** Advance to the next mode in the cycle. */
  function handleClick() {
    const currentIndex = THEME_MODE_CYCLE.indexOf(mode);
    const nextIndex = (currentIndex + 1) % THEME_MODE_CYCLE.length;
    const nextMode = THEME_MODE_CYCLE[nextIndex];
    if (nextMode !== undefined) {
      setMode(nextMode);
    }
  }

  const nextIndex =
    (THEME_MODE_CYCLE.indexOf(mode) + 1) % THEME_MODE_CYCLE.length;
  const nextMode = THEME_MODE_CYCLE[nextIndex];
  const nextLabel = nextMode !== undefined ? THEME_MODE_LABELS[nextMode] : "";

  return (
    <div style={themeControlWrapperStyles} className={className}>
      <button
        type="button"
        onClick={handleClick}
        style={themeControlButtonStyles}
        aria-label={`Switch to ${nextLabel.toLowerCase()} mode`}
        title={`Current: ${THEME_MODE_LABELS[mode]} — click to switch to ${nextLabel}`}
      >
        <span style={themeControlIconStyles} aria-hidden="true">
          {THEME_MODE_ICONS[mode]}
        </span>
        <span>{THEME_MODE_LABELS[mode]}</span>
      </button>
    </div>
  );
}
