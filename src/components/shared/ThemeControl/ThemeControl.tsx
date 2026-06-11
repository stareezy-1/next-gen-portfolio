"use client";

/**
 * ThemeControl — mode cycle + palette switcher.
 */

import { useTheme, useThemeControl } from "@/providers/ThemeProvider";
import { THEME_PALETTES } from "@/constants";
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
import type { ThemePalette } from "@/types";
import { useEffect, useState } from "react";

/** Visual accent color shown in the palette dot. */
const PALETTE_COLORS: Record<ThemePalette, string> = {
  aurora: "#2dd4a7",
  dark: "#1b5ed3",
  light: "#1a1a2e",
  "steins-gate": "#4a9eff",
};

/** Display labels for each palette. */
const PALETTE_LABELS: Record<ThemePalette, string> = {
  aurora: "Aurora",
  dark: "Dark",
  light: "Light",
  "steins-gate": "Steins;Gate",
};

export function ThemeControl({ className }: ThemeControlProps) {
  const { mode, palette } = useTheme();
  const { setMode, setPalette } = useThemeControl();
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);

  function handleModeClick() {
    const currentIndex = THEME_MODE_CYCLE.indexOf(mode);
    const nextMode =
      THEME_MODE_CYCLE[(currentIndex + 1) % THEME_MODE_CYCLE.length];
    if (nextMode !== undefined) setMode(nextMode);
  }

  const nextIndex =
    (THEME_MODE_CYCLE.indexOf(mode) + 1) % THEME_MODE_CYCLE.length;
  const nextMode = THEME_MODE_CYCLE[nextIndex];
  const nextLabel = nextMode !== undefined ? THEME_MODE_LABELS[nextMode] : "";

  return (
    <div
      style={{ ...themeControlWrapperStyles, gap: "0.5rem" }}
      className={className}
    >
      {/* Palette dots — only after hydration to avoid SSR mismatch */}
      {mounted && (
        <>
          <div
            style={{ display: "flex", alignItems: "center", gap: "0.25rem" }}
          >
            {THEME_PALETTES.filter((p) => {
              // Remove: dark palette in dark mode, light palette in dark mode, light palette in light mode
              const resolvedMode =
                mode === "system"
                  ? typeof window !== "undefined" &&
                    window.matchMedia("(prefers-color-scheme: dark)").matches
                    ? "dark"
                    : "light"
                  : mode;
              if (resolvedMode === "dark" && (p === "dark" || p === "light"))
                return false;
              if (resolvedMode === "light" && p === "light") return false;
              return true;
            }).map((p) => {
              const active = palette === p;
              return (
                <button
                  key={p}
                  type="button"
                  onClick={() => setPalette(p)}
                  aria-label={`Switch to ${PALETTE_LABELS[p]} palette`}
                  title={PALETTE_LABELS[p]}
                  style={{
                    width: active ? "20px" : "12px",
                    height: "12px",
                    borderRadius: "9999px",
                    backgroundColor: PALETTE_COLORS[p],
                    border: active
                      ? `2px solid ${PALETTE_COLORS[p]}`
                      : "2px solid transparent",
                    outline: active ? `2px solid ${PALETTE_COLORS[p]}` : "none",
                    outlineOffset: "2px",
                    cursor: "pointer",
                    padding: 0,
                    transition: "width 0.2s ease, outline 0.15s ease",
                    opacity: active ? 1 : 0.45,
                    flexShrink: 0,
                  }}
                />
              );
            })}
          </div>
          <span
            style={{
              width: "1px",
              height: "16px",
              backgroundColor: "var(--color-border)",
              flexShrink: 0,
            }}
            aria-hidden="true"
          />
        </>
      )}

      {/* Mode cycle button */}
      <button
        type="button"
        onClick={handleModeClick}
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
