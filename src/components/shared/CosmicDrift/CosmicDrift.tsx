"use client";

/**
 * CosmicDrift — the 404 page's WebGL vignette.
 *
 * A small, self-contained scene that says "you have drifted off the map":
 *  - a slowly rotating wireframe "world" with a faint solid core,
 *  - a moon held in a tilted orbit (procedural circular motion),
 *  - a faint field of drifting background stars,
 *  - and a comet that periodically streaks across on an orchestrated, keyframe-
 *    driven arc.
 *
 * The comet is driven by the three.js animation system (AnimationMixer +
 * AnimationClip) rather than ad-hoc math: a VectorKeyframeTrack arcs its
 * position through an apex with smooth interpolation, and two NumberKeyframe-
 * Tracks fade the head and tail in and out — one orchestrated moment per the
 * design-taste brief, not scattered effects. The moon's orbit stays procedural
 * (sin/cos) since it never rests.
 *
 * Same rigor as the hero galaxy: palette colours read from CSS variables (no
 * hardcoded literals — Requirement 3.3), reduced-motion static frame, dynamic-
 * imported three.js, capped pixel ratio, off-screen/hidden-tab pause, and full
 * GPU disposal on unmount. Purely decorative: click-through and aria-hidden.
 */

import { useEffect, useRef } from "react";
import { useReducedMotion, useTheme } from "@/hooks";
import {
  COSMIC_STAR_COUNT,
  COSMIC_STAR_SHELL,
  COSMIC_STAR_SIZE,
  COSMIC_WORLD_RADIUS,
  COSMIC_WORLD_DETAIL,
  COSMIC_WORLD_SPIN_X,
  COSMIC_WORLD_SPIN_Y,
  COSMIC_CORE_OPACITY,
  COSMIC_MOON_ORBIT_RADIUS,
  COSMIC_MOON_PERIOD,
  COSMIC_MOON_TILT,
  COSMIC_MOON_SIZE,
  COSMIC_COMET_DURATION,
  COSMIC_COMET_TRAVEL,
  COSMIC_COMET_START_X,
  COSMIC_COMET_END_X,
  COSMIC_COMET_START_Y,
  COSMIC_COMET_END_Y,
  COSMIC_COMET_APEX_Y,
  COSMIC_COMET_Z,
  COSMIC_COMET_HEAD_SIZE,
  COSMIC_COMET_TAIL_SIZE,
  COSMIC_COMET_TAIL_OPACITY,
  COSMIC_PARALLAX_STRENGTH,
  COSMIC_PARALLAX_EASE,
  COSMIC_CAMERA_FOV,
  COSMIC_CAMERA_Z,
  COSMIC_SPRITE_SIZE,
  COSMIC_MAX_PIXEL_RATIO,
  COSMIC_OPACITY_DARK,
  COSMIC_OPACITY_LIGHT,
} from "@/constants";
import { createStarTexture } from "@/lib/three/star-texture";
import type { CosmicDriftProps } from "./CosmicDrift.types";
import { cosmicDriftContainer } from "./CosmicDrift.style";

type ThreeModule = typeof import("three");

const VAR_WORLD = "--color-brand";
const VAR_MOON = "--color-text-primary";
const VAR_COMET = "--color-text-primary";
const VAR_TAIL = "--color-accent";
const VAR_STAR = "--color-text-secondary";

const TAU = Math.PI * 2;
const HALF = 0.5;
const XYZ = 3;

/** Reads a palette CSS variable into a three.js Color (white fallback). */
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

export function CosmicDrift({ className }: CosmicDriftProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const prefersReducedMotion = useReducedMotion();
  const { palette, resolved } = useTheme();

  const applyThemeRef = useRef<(() => void) | null>(null);
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
        return;
      }
      if (disposed || !containerRef.current) return;

      const width = container.clientWidth || 1;
      const height = container.clientHeight || 1;

      let renderer: import("three").WebGLRenderer;
      try {
        renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
      } catch {
        return;
      }
      renderer.setPixelRatio(
        Math.min(window.devicePixelRatio || 1, COSMIC_MAX_PIXEL_RATIO),
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
        COSMIC_CAMERA_FOV,
        width / height,
        0.1,
        100,
      );
      camera.position.set(0, 0, COSMIC_CAMERA_Z);
      camera.lookAt(0, 0, 0);

      const starTexture = createStarTexture(THREE, COSMIC_SPRITE_SIZE);

      // ── Wireframe world + faint solid core ─────────────────────────────
      const worldGeometry = new THREE.IcosahedronGeometry(
        COSMIC_WORLD_RADIUS,
        COSMIC_WORLD_DETAIL,
      );
      const worldMaterial = new THREE.MeshBasicMaterial({ wireframe: true });
      const world = new THREE.Mesh(worldGeometry, worldMaterial);
      const coreMaterial = new THREE.MeshBasicMaterial({
        transparent: true,
        opacity: COSMIC_CORE_OPACITY,
      });
      const core = new THREE.Mesh(worldGeometry, coreMaterial);
      core.scale.setScalar(0.92);
      const worldGroup = new THREE.Group();
      worldGroup.add(world);
      worldGroup.add(core);
      scene.add(worldGroup);

      // ── Moon in a tilted orbit (procedural) ────────────────────────────
      const moonMaterial = new THREE.SpriteMaterial({
        map: starTexture,
        transparent: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
      });
      const moon = new THREE.Sprite(moonMaterial);
      moon.scale.setScalar(COSMIC_MOON_SIZE);
      scene.add(moon);

      // ── Background drifting stars ──────────────────────────────────────
      const starCount = COSMIC_STAR_COUNT;
      const starPositions = new Float32Array(starCount * XYZ);
      for (let i = 0; i < starCount; i++) {
        // Scatter on a spherical shell so depth reads in parallax.
        const u = Math.random();
        const v = Math.random();
        const theta = u * TAU;
        const phi = Math.acos(2 * v - 1);
        const r = COSMIC_STAR_SHELL * (0.6 + Math.random() * 0.4);
        const i3 = i * XYZ;
        starPositions[i3] = r * Math.sin(phi) * Math.cos(theta);
        starPositions[i3 + 1] = r * Math.sin(phi) * Math.sin(theta);
        starPositions[i3 + 2] = r * Math.cos(phi);
      }
      const starsGeometry = new THREE.BufferGeometry();
      starsGeometry.setAttribute(
        "position",
        new THREE.BufferAttribute(starPositions, XYZ),
      );
      const starsMaterial = new THREE.PointsMaterial({
        size: COSMIC_STAR_SIZE,
        sizeAttenuation: true,
        transparent: true,
        depthWrite: false,
        map: starTexture,
        blending: THREE.AdditiveBlending,
      });
      const stars = new THREE.Points(starsGeometry, starsMaterial);
      scene.add(stars);

      // ── Comet (head + elongated tail), driven by an AnimationMixer ─────
      const cometGroup = new THREE.Group();
      const cometHeadMaterial = new THREE.SpriteMaterial({
        map: starTexture,
        transparent: true,
        depthWrite: false,
        opacity: 0,
        blending: THREE.AdditiveBlending,
      });
      const cometHead = new THREE.Sprite(cometHeadMaterial);
      cometHead.name = "head";
      cometHead.scale.setScalar(COSMIC_COMET_HEAD_SIZE);

      const cometTailMaterial = new THREE.SpriteMaterial({
        map: starTexture,
        transparent: true,
        depthWrite: false,
        opacity: 0,
        blending: THREE.AdditiveBlending,
      });
      const cometTail = new THREE.Sprite(cometTailMaterial);
      cometTail.name = "tail";
      // Elongate the tail and point it along the arc's travel direction.
      cometTail.scale.set(
        COSMIC_COMET_TAIL_SIZE,
        COSMIC_COMET_TAIL_SIZE * 0.28,
        1,
      );
      cometTailMaterial.rotation = Math.atan2(
        COSMIC_COMET_END_Y - COSMIC_COMET_START_Y,
        COSMIC_COMET_END_X - COSMIC_COMET_START_X,
      );
      cometGroup.add(cometTail);
      cometGroup.add(cometHead);
      scene.add(cometGroup);

      // AnimationClip: arc the group through an apex, fade head + tail in/out.
      const apexX = (COSMIC_COMET_START_X + COSMIC_COMET_END_X) * HALF;
      const arcTrack = new THREE.VectorKeyframeTrack(
        ".position",
        [0, COSMIC_COMET_TRAVEL * HALF, COSMIC_COMET_TRAVEL],
        [
          COSMIC_COMET_START_X,
          COSMIC_COMET_START_Y,
          COSMIC_COMET_Z,
          apexX,
          COSMIC_COMET_APEX_Y,
          COSMIC_COMET_Z,
          COSMIC_COMET_END_X,
          COSMIC_COMET_END_Y,
          COSMIC_COMET_Z,
        ],
      );
      arcTrack.setInterpolation(THREE.InterpolateSmooth);

      const fadeTimes = [
        0,
        COSMIC_COMET_TRAVEL * 0.25,
        COSMIC_COMET_TRAVEL * 0.8,
        COSMIC_COMET_TRAVEL,
      ];
      const headFadeTrack = new THREE.NumberKeyframeTrack(
        "head.material.opacity",
        fadeTimes,
        [0, 1, 1, 0],
      );
      const tailFadeTrack = new THREE.NumberKeyframeTrack(
        "tail.material.opacity",
        fadeTimes,
        [0, COSMIC_COMET_TAIL_OPACITY, COSMIC_COMET_TAIL_OPACITY, 0],
      );

      // Clip runs longer than the streak, so the comet rests off-screen
      // between passes, then the loop restarts the arc.
      const cometClip = new THREE.AnimationClip(
        "comet",
        COSMIC_COMET_DURATION,
        [arcTrack, headFadeTrack, tailFadeTrack],
      );
      const mixer = new THREE.AnimationMixer(cometGroup);
      const cometAction = mixer.clipAction(cometClip);
      cometAction.play();

      // ── Theme application (run now + on palette/mode change) ───────────
      const applyTheme = () => {
        worldMaterial.color.copy(readPaletteColor(THREE, VAR_WORLD));
        coreMaterial.color.copy(readPaletteColor(THREE, VAR_WORLD));
        moonMaterial.color.copy(readPaletteColor(THREE, VAR_MOON));
        cometHeadMaterial.color.copy(readPaletteColor(THREE, VAR_COMET));
        cometTailMaterial.color.copy(readPaletteColor(THREE, VAR_TAIL));
        starsMaterial.color.copy(readPaletteColor(THREE, VAR_STAR));

        const isLight = resolvedRef.current === "light";
        const blend = isLight ? THREE.NormalBlending : THREE.AdditiveBlending;
        const opacity = isLight ? COSMIC_OPACITY_LIGHT : COSMIC_OPACITY_DARK;

        for (const mat of [
          moonMaterial,
          starsMaterial,
          cometHeadMaterial,
          cometTailMaterial,
        ]) {
          mat.blending = blend;
          mat.needsUpdate = true;
        }
        starsMaterial.opacity = opacity;
        worldMaterial.opacity = opacity;
        worldMaterial.transparent = true;
        worldMaterial.needsUpdate = true;
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

      // ── Visibility gating ──────────────────────────────────────────────
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

      const placeMoon = (elapsed: number) => {
        const angle = (elapsed / COSMIC_MOON_PERIOD) * TAU;
        const x = Math.cos(angle) * COSMIC_MOON_ORBIT_RADIUS;
        const z = Math.sin(angle) * COSMIC_MOON_ORBIT_RADIUS;
        moon.position.set(
          x,
          Math.sin(angle) *
            COSMIC_MOON_ORBIT_RADIUS *
            Math.sin(COSMIC_MOON_TILT),
          z * Math.cos(COSMIC_MOON_TILT),
        );
      };

      // Reduced motion: a single composed still frame, no loop, no listeners.
      if (prefersReducedMotion) {
        placeMoon(0);
        renderer.render(scene, camera);
        cleanupScene = () => {
          observer?.disconnect();
          resizeObserver?.disconnect();
          worldGeometry.dispose();
          worldMaterial.dispose();
          coreMaterial.dispose();
          moonMaterial.dispose();
          starsGeometry.dispose();
          starsMaterial.dispose();
          cometHeadMaterial.dispose();
          cometTailMaterial.dispose();
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
        const elapsed = clock.getElapsedTime();

        mixer.update(delta);

        worldGroup.rotation.x += COSMIC_WORLD_SPIN_X * delta;
        worldGroup.rotation.y += COSMIC_WORLD_SPIN_Y * delta;
        stars.rotation.y += COSMIC_WORLD_SPIN_X * delta * HALF;

        placeMoon(elapsed);

        pointer.x += (targetPointer.x - pointer.x) * COSMIC_PARALLAX_EASE;
        pointer.y += (targetPointer.y - pointer.y) * COSMIC_PARALLAX_EASE;
        camera.position.x = pointer.x * COSMIC_PARALLAX_STRENGTH;
        camera.position.y = -pointer.y * COSMIC_PARALLAX_STRENGTH;
        camera.lookAt(0, 0, 0);

        renderer.render(scene, camera);
      };
      rafId = requestAnimationFrame(tick);

      cleanupScene = () => {
        window.removeEventListener("pointermove", handlePointer);
        observer?.disconnect();
        resizeObserver?.disconnect();
        mixer.stopAllAction();
        worldGeometry.dispose();
        worldMaterial.dispose();
        coreMaterial.dispose();
        moonMaterial.dispose();
        starsGeometry.dispose();
        starsMaterial.dispose();
        cometHeadMaterial.dispose();
        cometTailMaterial.dispose();
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

  useEffect(() => {
    applyThemeRef.current?.();
  }, [palette, resolved]);

  return (
    <div
      ref={containerRef}
      className={className}
      style={cosmicDriftContainer}
      aria-hidden="true"
    />
  );
}
