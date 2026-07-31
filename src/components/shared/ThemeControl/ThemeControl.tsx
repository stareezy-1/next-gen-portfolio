"use client";

import { useEffect, useState } from "react";
import { THEME_PALETTES } from "@/constants";
import { useTheme, useThemeControl } from "@/providers/ThemeProvider";
import {
  THEME_MODE_CYCLE,
  THEME_MODE_ICONS,
  THEME_MODE_LABELS,
} from "./ThemeControl.types";
import type { ThemeControlProps } from "./ThemeControl.types";
import type { ThemePalette } from "@/types";
import "./ThemeControl.style.css";

const PALETTE_LABELS: Record<ThemePalette, string> = {
  aurora: "Aurora",
  dark: "Dark",
  light: "Light",
  "steins-gate": "Steins;Gate",
};

export function ThemeControl({ className }: ThemeControlProps) {
  const { mode, palette, resolved } = useTheme();
  const { setMode, setPalette } = useThemeControl();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  function handleModeClick() {
    const currentIndex = THEME_MODE_CYCLE.indexOf(mode);
    const nextMode =
      THEME_MODE_CYCLE[(currentIndex + 1) % THEME_MODE_CYCLE.length];
    if (nextMode !== undefined) setMode(nextMode);
  }

  const nextIndex =
    (THEME_MODE_CYCLE.indexOf(mode) + 1) % THEME_MODE_CYCLE.length;
  const nextMode = THEME_MODE_CYCLE[nextIndex];
  const nextLabel = nextMode ? THEME_MODE_LABELS[nextMode] : "";
  const visiblePalettes = THEME_PALETTES.filter((candidate) => {
    if (
      resolved === "dark" &&
      (candidate === "dark" || candidate === "light")
    ) {
      return false;
    }
    return !(resolved === "light" && candidate === "light");
  });

  return (
    <div className={["theme-control", className].filter(Boolean).join(" ")}>
      {mounted && (
        <>
          <div className="theme-palette-list" aria-label="Color palette">
            {visiblePalettes.map((candidate) => {
              const active = palette === candidate;
              return (
                <button
                  key={candidate}
                  type="button"
                  onClick={() => setPalette(candidate)}
                  aria-label={`Switch to ${PALETTE_LABELS[candidate]} palette`}
                  aria-pressed={active}
                  title={PALETTE_LABELS[candidate]}
                  className="theme-palette-button"
                >
                  <span
                    aria-hidden="true"
                    className={`theme-palette-dot theme-palette-dot--${candidate}${
                      active ? " theme-palette-dot--active" : ""
                    }`}
                  />
                </button>
              );
            })}
          </div>

          <span className="theme-control-separator" aria-hidden="true" />
        </>
      )}

      <button
        type="button"
        onClick={handleModeClick}
        className="theme-mode-button"
        aria-label={`Switch to ${nextLabel.toLowerCase()} mode`}
        title={`Current: ${THEME_MODE_LABELS[mode]}. Switch to ${nextLabel}.`}
      >
        <span className="theme-mode-icon" aria-hidden="true">
          {THEME_MODE_ICONS[mode]}
        </span>
        <span>{THEME_MODE_LABELS[mode]}</span>
      </button>
    </div>
  );
}
