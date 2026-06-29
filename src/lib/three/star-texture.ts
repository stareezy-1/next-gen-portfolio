/**
 * Shared soft-star sprite texture builder for the WebGL scenes.
 *
 * Both the hero galaxy ({@link StarField}) and the 404 scene ({@link CosmicDrift})
 * render points/sprites as round, glowing stars. A square point is turned into
 * a soft disc by mapping a luminance-mask texture: white RGB with a radial
 * alpha falloff. Authoring it channel-by-channel means no CSS color string is
 * needed (Requirement 3.3) — the per-point/per-sprite vertex colours tint the
 * white mask at draw time.
 *
 * three.js is dynamic-imported by the callers, so the module is passed in
 * rather than imported here (keeps three off the SSR/LCP path).
 */

import {
  STARFIELD_SPRITE_GLOW_POWER,
  STARFIELD_SPRITE_MAX_CHANNEL,
} from "@/constants";

type ThreeModule = typeof import("three");

const HALF = 0.5;
/** RGBA stride per pixel in an ImageData buffer. */
const RGBA = 4;

/**
 * Builds a soft, round star sprite as a {@link CanvasTexture}.
 *
 * @param THREE - the dynamically imported three.js module
 * @param size  - texture resolution in pixels (square)
 */
export function createStarTexture(THREE: ThreeModule, size: number) {
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d");
  const texture = new THREE.CanvasTexture(canvas);

  if (!ctx) return texture;

  const image = ctx.createImageData(size, size);
  const data = image.data;
  const centre = (size - 1) * HALF;
  const maxDist = centre;
  const channel = STARFIELD_SPRITE_MAX_CHANNEL;

  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const dx = x - centre;
      const dy = y - centre;
      const dist = Math.sqrt(dx * dx + dy * dy) / maxDist;
      const falloff = Math.max(0, 1 - dist);
      const alpha = Math.pow(falloff, STARFIELD_SPRITE_GLOW_POWER);
      const i = (y * size + x) * RGBA;
      data[i] = channel;
      data[i + 1] = channel;
      data[i + 2] = channel;
      data[i + 3] = Math.round(alpha * channel);
    }
  }

  ctx.putImageData(image, 0, 0);
  texture.needsUpdate = true;
  return texture;
}
