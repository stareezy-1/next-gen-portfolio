"use client";

/**
 * StarField — the hero's signature WebGL background: a procedurally generated
 * spiral galaxy with a bright pulsing core star.
 *
 * Why a galaxy, and why here: the owner's name is "Bintang" (Indonesian for
 * "star"), and the portfolio's Aurora palette is already a deep-space identity
 * (midnight-blue ground, luminous teal brand, violet accent). The hero copy is
 * a thesis — "I build the systems that products stand on" — so the background
 * is a *system*, not decoration: four spiral arms (four years in the React
 * ecosystem) wound around a single bright star at the centre.
 *
 * Design + engineering constraints honoured:
 *  - **Theme-true colours.** Every colour is read from the live palette CSS
 *    variables (`--color-brand` core → `--color-accent` rim, `--color-text-
 *    primary` highlights) and recomputed when the palette/mode changes, so the
 *    galaxy belongs to whichever of the four palettes is active. No hardcoded
 *    color literals enter the source (Requirement 3.3).
 *  - **One orchestrated motion moment.** A slow auto-rotation plus eased
 *    pointer parallax — no scattered effects.
 *  - **Reduced motion.** With `prefers-reduced-motion`, a single static frame
 *    is rendered and the animation loop never starts (Requirement 23.5).
 *  - **Performance.** Dynamic-imported three.js (kept off the SSR/LCP path),
 *    capped pixel ratio, render paused while off-screen or on a hidden tab,
 *    and full GPU resource disposal on unmount.
 *  - **Accessibility.** Purely decorative: the container is click-through and
 *    `aria-hidden`, so it never reaches the accessibility tree or steals focus.
 */

import { useEffect, useRef } from "react";
import { useReducedMotion, useTheme } from "@/hooks";
import {
  STARFIELD_STAR_COUNT,
  STARFIELD_GALAXY_RADIUS,
  STARFIELD_ARMS,
  STARFIELD_SPIN,
  STARFIELD_RANDOMNESS,
  STARFIELD_RANDOMNESS_POWER,
  STARFIELD_THICKNESS,
  STARFIELD_STAR_SIZE,
  STARFIELD_ROTATION_SPEED,
  STARFIELD_PARALLAX_STRENGTH,
  STARFIELD_PARALLAX_EASE,
  STARFIELD_CORE_PULSE_PERIOD,
  STARFIELD_CORE_SCALE_MIN,
  STARFIELD_CORE_SCALE_MAX,
  STARFIELD_CORE_SIZE,
  STARFIELD_HALO_RATIO,
  STARFIELD_HALO_OPACITY,
  STARFIELD_CAMERA_FOV,
  STARFIELD_CAMERA_Z,
  STARFIELD_CAMERA_Y,
  STARFIELD_MAX_PIXEL_RATIO,
  STARFIELD_HIGHLIGHT_RATIO,
  STARFIELD_SPRITE_SIZE,
  STARFIELD_OPACITY_DARK,
  STARFIELD_OPACITY_LIGHT,
  STARFIELD_CORE_DENSITY_POWER,
  STARFIELD_HIGHLIGHT_LERP,
} from "@/constants";
import type { StarFieldProps } from "./StarField.types";
import { starFieldContainer } from "./StarField.style";
import { createStarTexture } from "@/lib/three/star-texture";

type ThreeModule = typeof import("three");

/** CSS custom properties the galaxy samples for its palette. */
const VAR_CORE = "--color-brand";
const VAR_RIM = "--color-accent";
const VAR_HIGHLIGHT = "--color-text-primary";

const TAU = Math.PI * 2;
const HALF = 0.5;
const XYZ = 3;

/**
 * Reads a palette CSS variable and resolves it to a three.js Color. Falls back
 * to white if the variable is missing or unparseable so the scene is never
 * blank. The string only ever comes from the runtime DOM — never a literal.
 */
function readPaletteColor(THREE: ThreeModule, varName: string) {
  const color = new THREE.Color();
  const raw = getComputedStyle(document.documentElement)
    .getPropertyValue(varName)
    .trim();
  if (raw) {
    try {
      color.set(raw);
    } catch {
      color.setRGB(1, 1, 1);
    }
  } else {
    color.setRGB(1, 1, 1);
  }
  return color;
}

export function StarField({ className }: StarFieldProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const prefersReducedMotion = useReducedMotion();
  const { palette, resolved } = useTheme();

  // The latest applyTheme fn is stashed here by the async setup so the
  // palette/mode effect can recolour the live scene without a full rebuild.
  const applyThemeRef = useRef<(() => void) | null>(null);
  // Mirror the resolved mode so the imperative recolour reads the current one.
  const resolvedRef = useRef(resolved);
  resolvedRef.current = resolved;

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    let disposed = false;
    let rafId = 0;
    let cleanupScene: () => void = () => {};

    void (async () => {
      let THREE: ThreeModule;
      try {
        THREE = await import("three");
      } catch {
        return; // three failed to load — the CSS background stands in.
      }
      if (disposed || !containerRef.current) return;

      const width = container.clientWidth || 1;
      const height = container.clientHeight || 1;

      // ── Renderer (transparent so the palette background shows through) ──
      let renderer: import("three").WebGLRenderer;
      try {
        renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
      } catch {
        return; // No WebGL context available — fail silent, keep CSS bg.
      }
      renderer.setPixelRatio(
        Math.min(window.devicePixelRatio || 1, STARFIELD_MAX_PIXEL_RATIO),
      );
      renderer.setSize(width, height);
      renderer.setClearColor(0x000000, 0);
      const canvas = renderer.domElement;
      canvas.style.width = "100%";
      canvas.style.height = "100%";
      canvas.style.display = "block";
      container.appendChild(canvas);

      const scene = new THREE.Scene();
      const camera = new THREE.PerspectiveCamera(
        STARFIELD_CAMERA_FOV,
        width / height,
        0.1,
        100,
      );
      camera.position.set(0, STARFIELD_CAMERA_Y, STARFIELD_CAMERA_Z);
      camera.lookAt(0, 0, 0);

      // ── Galaxy group (rotates as one) ──────────────────────────────────
      const galaxy = new THREE.Group();
      scene.add(galaxy);

      // Positions + per-star metadata are generated once; only colours are
      // recomputed on theme change (so highlight stars never reshuffle).
      const count = STARFIELD_STAR_COUNT;
      const positions = new Float32Array(count * XYZ);
      const radiusNorm = new Float32Array(count);
      const highlightMask = new Uint8Array(count);

      for (let i = 0; i < count; i++) {
        const i3 = i * XYZ;
        const radius =
          Math.pow(Math.random(), STARFIELD_CORE_DENSITY_POWER) *
          STARFIELD_GALAXY_RADIUS;
        const branchAngle = ((i % STARFIELD_ARMS) / STARFIELD_ARMS) * TAU;
        const spinAngle = radius * STARFIELD_SPIN;
        const angle = branchAngle + spinAngle;

        const scatter = () =>
          Math.pow(Math.random(), STARFIELD_RANDOMNESS_POWER) *
          (Math.random() < HALF ? 1 : -1) *
          STARFIELD_RANDOMNESS *
          radius;

        positions[i3] = Math.cos(angle) * radius + scatter();
        positions[i3 + 1] = scatter() * STARFIELD_THICKNESS;
        positions[i3 + 2] = Math.sin(angle) * radius + scatter();

        radiusNorm[i] = radius / STARFIELD_GALAXY_RADIUS;
        highlightMask[i] = Math.random() < STARFIELD_HIGHLIGHT_RATIO ? 1 : 0;
      }

      const geometry = new THREE.BufferGeometry();
      geometry.setAttribute(
        "position",
        new THREE.BufferAttribute(positions, XYZ),
      );
      const colorArray = new Float32Array(count * XYZ);
      geometry.setAttribute(
        "color",
        new THREE.BufferAttribute(colorArray, XYZ),
      );

      const starTexture = createStarTexture(THREE, STARFIELD_SPRITE_SIZE);
      const material = new THREE.PointsMaterial({
        size: STARFIELD_STAR_SIZE,
        sizeAttenuation: true,
        depthWrite: false,
        transparent: true,
        vertexColors: true,
        map: starTexture,
        blending: THREE.AdditiveBlending,
      });

      const points = new THREE.Points(geometry, material);
      galaxy.add(points);

      // ── Core star "Bintang" + soft halo ───────────────────────────────
      const haloMaterial = new THREE.SpriteMaterial({
        map: starTexture,
        transparent: true,
        depthWrite: false,
        opacity: STARFIELD_HALO_OPACITY,
        blending: THREE.AdditiveBlending,
      });
      const coreMaterial = new THREE.SpriteMaterial({
        map: starTexture,
        transparent: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
      });
      const halo = new THREE.Sprite(haloMaterial);
      halo.scale.setScalar(STARFIELD_CORE_SIZE * STARFIELD_HALO_RATIO);
      const core = new THREE.Sprite(coreMaterial);
      core.scale.setScalar(STARFIELD_CORE_SIZE);
      galaxy.add(halo);
      galaxy.add(core);

      // ── Theme application (run once now, and on palette/mode change) ────
      const colorAttr = geometry.getAttribute(
        "color",
      ) as import("three").BufferAttribute;

      const applyTheme = () => {
        const coreColor = readPaletteColor(THREE, VAR_CORE);
        const rimColor = readPaletteColor(THREE, VAR_RIM);
        const highlightColor = readPaletteColor(THREE, VAR_HIGHLIGHT);
        const mixed = new THREE.Color();

        for (let i = 0; i < count; i++) {
          mixed.copy(coreColor).lerp(rimColor, radiusNorm[i] ?? 0);
          if (highlightMask[i]) {
            mixed.lerp(highlightColor, STARFIELD_HIGHLIGHT_LERP);
          }
          const i3 = i * XYZ;
          colorArray[i3] = mixed.r;
          colorArray[i3 + 1] = mixed.g;
          colorArray[i3 + 2] = mixed.b;
        }
        colorAttr.needsUpdate = true;

        coreMaterial.color.copy(highlightColor);
        haloMaterial.color.copy(coreColor);

        // Additive glow reads beautifully on the dark palettes but blows out a
        // light background, so fall back to normal blending + gentler opacity.
        const isLight = resolvedRef.current === "light";
        const blend = isLight ? THREE.NormalBlending : THREE.AdditiveBlending;
        const opacity = isLight
          ? STARFIELD_OPACITY_LIGHT
          : STARFIELD_OPACITY_DARK;
        material.blending = blend;
        material.opacity = opacity;
        material.needsUpdate = true;
        haloMaterial.blending = blend;
        coreMaterial.blending = blend;
        haloMaterial.needsUpdate = true;
        coreMaterial.needsUpdate = true;
      };

      applyTheme();
      applyThemeRef.current = applyTheme;

      // ── Pointer parallax (eased) ───────────────────────────────────────
      const pointer = { x: 0, y: 0 };
      const targetPointer = { x: 0, y: 0 };
      const handlePointer = (event: PointerEvent) => {
        targetPointer.x = (event.clientX / window.innerWidth) * 2 - 1;
        targetPointer.y = (event.clientY / window.innerHeight) * 2 - 1;
      };

      // ── Visibility gating (off-screen + hidden-tab pause) ──────────────
      let onScreen = true;
      const observer =
        typeof IntersectionObserver !== "undefined"
          ? new IntersectionObserver(
              (entries) => {
                const entry = entries[0];
                if (entry) onScreen = entry.isIntersecting;
              },
              { threshold: 0 },
            )
          : null;
      observer?.observe(container);

      // ── Resize ─────────────────────────────────────────────────────────
      const handleResize = () => {
        const w = container.clientWidth || 1;
        const h = container.clientHeight || 1;
        camera.aspect = w / h;
        camera.updateProjectionMatrix();
        renderer.setSize(w, h);
      };
      const resizeObserver =
        typeof ResizeObserver !== "undefined"
          ? new ResizeObserver(handleResize)
          : null;
      resizeObserver?.observe(container);

      const clock = new THREE.Clock();

      const renderFrame = () => {
        const elapsed = clock.getElapsedTime();
        // Core pulse: smooth in/out between the scale envelope.
        const pulse =
          STARFIELD_CORE_SCALE_MIN +
          (STARFIELD_CORE_SCALE_MAX - STARFIELD_CORE_SCALE_MIN) *
            (HALF +
              HALF * Math.sin((elapsed / STARFIELD_CORE_PULSE_PERIOD) * TAU));
        core.scale.setScalar(STARFIELD_CORE_SIZE * pulse);
        halo.scale.setScalar(
          STARFIELD_CORE_SIZE * STARFIELD_HALO_RATIO * pulse,
        );
        renderer.render(scene, camera);
      };

      // Reduced motion: one static frame, no loop, no listeners.
      if (prefersReducedMotion) {
        renderFrame();
        cleanupScene = () => {
          observer?.disconnect();
          resizeObserver?.disconnect();
          geometry.dispose();
          material.dispose();
          haloMaterial.dispose();
          coreMaterial.dispose();
          starTexture.dispose();
          renderer.dispose();
          if (canvas.parentNode === container) container.removeChild(canvas);
        };
        return;
      }

      window.addEventListener("pointermove", handlePointer, { passive: true });

      const tick = () => {
        rafId = requestAnimationFrame(tick);
        if (!onScreen || document.hidden) return;

        const delta = clock.getDelta();
        galaxy.rotation.y += STARFIELD_ROTATION_SPEED * delta;

        // Ease the camera toward the pointer for a parallax drift.
        pointer.x += (targetPointer.x - pointer.x) * STARFIELD_PARALLAX_EASE;
        pointer.y += (targetPointer.y - pointer.y) * STARFIELD_PARALLAX_EASE;
        camera.position.x = pointer.x * STARFIELD_PARALLAX_STRENGTH;
        camera.position.y =
          STARFIELD_CAMERA_Y - pointer.y * STARFIELD_PARALLAX_STRENGTH;
        camera.lookAt(0, 0, 0);

        const elapsed = clock.getElapsedTime();
        const pulse =
          STARFIELD_CORE_SCALE_MIN +
          (STARFIELD_CORE_SCALE_MAX - STARFIELD_CORE_SCALE_MIN) *
            (HALF +
              HALF * Math.sin((elapsed / STARFIELD_CORE_PULSE_PERIOD) * TAU));
        core.scale.setScalar(STARFIELD_CORE_SIZE * pulse);
        halo.scale.setScalar(
          STARFIELD_CORE_SIZE * STARFIELD_HALO_RATIO * pulse,
        );

        renderer.render(scene, camera);
      };
      rafId = requestAnimationFrame(tick);

      cleanupScene = () => {
        window.removeEventListener("pointermove", handlePointer);
        observer?.disconnect();
        resizeObserver?.disconnect();
        geometry.dispose();
        material.dispose();
        haloMaterial.dispose();
        coreMaterial.dispose();
        starTexture.dispose();
        renderer.dispose();
        if (canvas.parentNode === container) container.removeChild(canvas);
      };
    })();

    return () => {
      disposed = true;
      applyThemeRef.current = null;
      if (rafId) cancelAnimationFrame(rafId);
      cleanupScene();
    };
  }, [prefersReducedMotion]);

  // Recolour the live scene when the palette or resolved mode changes, without
  // tearing down the WebGL context.
  useEffect(() => {
    applyThemeRef.current?.();
  }, [palette, resolved]);

  return (
    <div
      ref={containerRef}
      className={className}
      style={starFieldContainer}
      aria-hidden="true"
    />
  );
}
