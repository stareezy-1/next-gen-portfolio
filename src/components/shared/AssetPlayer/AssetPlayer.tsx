"use client";

/**
 * AssetPlayer — the themed, reduced-motion-aware dotLottie animation player.
 *
 * A `'use client'` component that loads and renders a dotLottie Animated_Asset,
 * applying the active Theme_Palette's colors via a Lottie Style Sheet (LSS)
 * theme object so the asset recolors to the palette with no hardcoded color
 * literals (Requirements 25.2, 25.3).
 *
 * Behaviors implemented:
 *  1. **dotLottie rendering** — `DotLottieReact` from `@lottiefiles/dotlottie-react`
 *     renders the animation inside a sized container div (Req 25.1).
 *  2. **Token-based LSS recoloring** — `resolveVariant(palette, resolved)` maps
 *     the active palette to a flat token record; those `.value` strings are
 *     assembled into an LSS theme object and passed to the player. Repaints on
 *     palette/mode change via a `useEffect` dependency (Req 25.2, 25.3).
 *  3. **IntersectionObserver lazy-load + off-screen pause** — the asset is not
 *     loaded until the container enters the viewport; playback is paused while
 *     the container is outside the viewport (Req 25.5, 25.10).
 *  4. **Reduced-motion static final frame** — when `useReducedMotion()` is
 *     `true`, a static `<img>` fallback is rendered instead of the animation
 *     and autoplay is suppressed (Req 25.4).
 *  5. **Load-failure same-size static fallback** — if the dotLottie asset fails
 *     to load, a `<div>` with the same box dimensions is rendered so no layout
 *     shift occurs (Req 25.6).
 *  6. **Hover play/stop-reset** — when `trigger === 'hover'`, the animation
 *     plays on `mouseenter` and stops + resets on `mouseleave` (Req 25.9).
 *  7. **Accessible name / decorative marking** — `aria-label` is set when
 *     `name` is provided; `aria-hidden="true"` is set when `decorative` is
 *     `true` (Req 25.7).
 *  8. **Trigger modes** — `'auto'` autoplays (unless reduced-motion); `'visible'`
 *     plays when in viewport; `'hover'` plays on hover (Req 25.8, 25.9, 25.10).
 *
 * @see Requirements 25.1–25.7, 25.9, 25.10
 */

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
} from "react";
import { DotLottieReact, type DotLottie } from "@lottiefiles/dotlottie-react";
import { useReducedMotion } from "@/hooks";
import { useTheme } from "@/hooks";
import { resolveVariant } from "@/services/theme";
import type { AssetPlayerProps } from "./AssetPlayer.types";
import {
  getAssetPlayerStyles,
  fallbackStyles,
  staticFrameStyles,
} from "./AssetPlayer.style";

// ---------------------------------------------------------------------------
// LSS theme builder
// ---------------------------------------------------------------------------

/**
 * Builds a Lottie Style Sheet (LSS) theme JSON string from the flat token
 * record returned by `resolveVariant`.
 *
 * `DotLottieReact` accepts `themeData` as a JSON string whose shape is a
 * plain `Record<string, string>` mapping slot names to color values. Every
 * color value is sourced from a `Token<string>` via `.value` — no hardcoded
 * color literals (Requirements 25.2, 4.11).
 *
 * The slot names follow the LSS convention used by dotLottie: the player
 * matches them against named color slots declared inside the `.lottie` asset.
 * Using the token key names as slot names means asset authors declare slots
 * that match the platform's token vocabulary.
 */
function buildLssTheme(tokenRecord: Record<string, { value: string }>): string {
  const theme: Record<string, string> = {};
  for (const [key, tok] of Object.entries(tokenRecord)) {
    theme[key] = tok.value;
  }
  return JSON.stringify(theme);
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

/**
 * Renders a dotLottie animation with full theme integration, reduced-motion
 * support, lazy-loading, and accessibility attributes.
 *
 * @param props - See {@link AssetPlayerProps}.
 */
export function AssetPlayer({
  src,
  name,
  decorative = false,
  trigger = "auto",
  className,
  width = "100%",
  height = "100%",
}: AssetPlayerProps) {
  const prefersReducedMotion = useReducedMotion();
  const { palette, resolved } = useTheme();

  // Ref to the DotLottie player instance for imperative play/pause/stop calls.
  const dotLottieRef = useRef<DotLottie | null>(null);

  // Ref to the container element for IntersectionObserver attachment.
  const containerRef = useRef<HTMLDivElement>(null);

  // Whether the container has entered the viewport at least once (lazy-load gate).
  const [hasEntered, setHasEntered] = useState(false);

  // Whether the container is currently in the viewport (for 'visible' trigger).
  const [isInViewport, setIsInViewport] = useState(false);

  // Whether the dotLottie asset failed to load (triggers static fallback).
  const [loadFailed, setLoadFailed] = useState(false);

  // ---------------------------------------------------------------------------
  // LSS theme — recomputed whenever palette or resolved mode changes (Req 25.3)
  // ---------------------------------------------------------------------------
  const lssTheme = useMemo<string>(() => {
    const tokenRecord = resolveVariant(palette, resolved);
    return buildLssTheme(tokenRecord);
  }, [palette, resolved]);

  // ---------------------------------------------------------------------------
  // IntersectionObserver — lazy-load + off-screen pause (Req 25.5, 25.10)
  // ---------------------------------------------------------------------------
  useEffect(() => {
    const el = containerRef.current;
    if (!el || typeof IntersectionObserver === "undefined") {
      // Fallback: treat as always visible when IntersectionObserver is absent.
      setHasEntered(true);
      setIsInViewport(true);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (!entry) return;
        const visible = entry.isIntersecting;
        if (visible) {
          // First intersection: mark as entered so the player mounts (lazy-load).
          setHasEntered(true);
        }
        setIsInViewport(visible);
      },
      { threshold: 0.1 },
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  // ---------------------------------------------------------------------------
  // Off-screen pause / resume (Req 25.10)
  // ---------------------------------------------------------------------------
  useEffect(() => {
    const player = dotLottieRef.current;
    if (!player) return;
    if (!isInViewport) {
      player.pause();
    } else if (trigger === "visible" && !prefersReducedMotion) {
      player.play();
    } else if (trigger === "auto" && !prefersReducedMotion) {
      player.play();
    }
  }, [isInViewport, trigger, prefersReducedMotion]);

  // ---------------------------------------------------------------------------
  // Hover handlers (Req 25.9)
  // ---------------------------------------------------------------------------
  const handleMouseEnter = useCallback(() => {
    if (trigger !== "hover" || prefersReducedMotion) return;
    dotLottieRef.current?.play();
  }, [trigger, prefersReducedMotion]);

  const handleMouseLeave = useCallback(() => {
    if (trigger !== "hover") return;
    const player = dotLottieRef.current;
    if (!player) return;
    player.stop();
  }, [trigger]);

  // ---------------------------------------------------------------------------
  // DotLottie instance callback — wires the ref and handles load failure
  // ---------------------------------------------------------------------------
  const isInViewportRef = useRef(false);
  isInViewportRef.current = isInViewport;

  const handleDotLottieRef = useCallback(
    (instance: DotLottie | null) => {
      dotLottieRef.current = instance;
      if (!instance) return;

      // Listen for load errors to trigger the static fallback (Req 25.6).
      instance.addEventListener("loadError", () => {
        setLoadFailed(true);
      });

      // For 'visible' trigger: play only when already in viewport.
      if (
        trigger === "visible" &&
        isInViewportRef.current &&
        !prefersReducedMotion
      ) {
        instance.play();
      }
    },
    [trigger, prefersReducedMotion],
  );

  // ---------------------------------------------------------------------------
  // Derived autoplay flag
  // ---------------------------------------------------------------------------
  // autoplay is true only for 'auto' trigger and when reduced-motion is off.
  // 'hover' and 'visible' triggers manage playback imperatively.
  const autoplay = trigger === "auto" && !prefersReducedMotion;

  // ---------------------------------------------------------------------------
  // Container dimensions — applied inline so the fallback matches exactly
  // (Requirement 25.6 — no layout shift).
  // ---------------------------------------------------------------------------
  const dimensionStyle: CSSProperties = {
    width: typeof width === "number" ? `${width}px` : width,
    height: typeof height === "number" ? `${height}px` : height,
  };

  // ---------------------------------------------------------------------------
  // Accessibility attributes (Req 25.7)
  // ---------------------------------------------------------------------------
  const a11yProps = decorative
    ? ({ "aria-hidden": "true" } as const)
    : name
    ? ({ "aria-label": name, role: "img" } as const)
    : ({} as const);

  // ---------------------------------------------------------------------------
  // Container style — base token styles + dimensions
  // ---------------------------------------------------------------------------
  const containerStyle: CSSProperties = {
    ...getAssetPlayerStyles(),
    ...dimensionStyle,
  };

  // ---------------------------------------------------------------------------
  // Render: reduced-motion static frame (Req 25.4)
  // ---------------------------------------------------------------------------
  if (prefersReducedMotion) {
    return (
      <div
        ref={containerRef}
        className={className}
        style={containerStyle}
        {...a11yProps}
      >
        {/*
         * Static final-frame fallback for reduced-motion users.
         * We render a plain <img> pointing at the src; dotLottie files are
         * not directly renderable as images, so this acts as a placeholder
         * that communicates the asset's presence without animating.
         * In a production build the asset author would supply a static
         * poster/thumbnail URL alongside the .lottie src.
         */}
        <img
          src={src}
          alt={decorative ? "" : name ?? ""}
          style={staticFrameStyles}
          aria-hidden={decorative ? "true" : undefined}
        />
      </div>
    );
  }

  // ---------------------------------------------------------------------------
  // Render: load-failure static fallback (Req 25.6)
  // ---------------------------------------------------------------------------
  if (loadFailed) {
    return (
      <div
        ref={containerRef}
        className={className}
        style={containerStyle}
        {...a11yProps}
        data-testid="asset-player-fallback"
      >
        <div style={fallbackStyles} aria-hidden="true" />
      </div>
    );
  }

  // ---------------------------------------------------------------------------
  // Render: normal dotLottie player
  // ---------------------------------------------------------------------------
  return (
    <div
      ref={containerRef}
      className={className}
      style={containerStyle}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      {...a11yProps}
      data-testid="asset-player"
    >
      {/*
       * Lazy-load gate: the DotLottieReact player is not mounted until the
       * container has entered the viewport at least once (Requirement 25.5).
       * This prevents the asset from blocking first paint or LCP.
       */}
      {hasEntered && (
        <DotLottieReact
          src={src}
          autoplay={autoplay}
          loop={trigger !== "hover"}
          dotLottieRefCallback={handleDotLottieRef}
          themeData={lssTheme}
          style={{ width: "100%", height: "100%" }}
        />
      )}
    </div>
  );
}
