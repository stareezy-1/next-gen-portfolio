/**
 * CosmicDrift (404 scene) tuning constants.
 *
 * The 404 page renders a small, self-contained WebGL vignette: a slowly
 * rotating wireframe world with a moon in orbit, a faint drifting star field,
 * and a comet that periodically streaks across on an orchestrated, keyframe-
 * driven arc (three.js AnimationMixer). It reads as "you have drifted off the
 * map" — on theme with Bintang ("star").
 *
 * Every tuning number lives here so none is inlined at the use site
 * (Requirements 26.4, 26.5). Colours are NOT defined here: the scene samples
 * the active palette's CSS variables at runtime (Requirement 3.3).
 */

/** Background drifting star count (kept low — this is a small vignette). */
export const COSMIC_STAR_COUNT = 700 as const;

/** Radius of the spherical shell the background stars are scattered on. */
export const COSMIC_STAR_SHELL = 14 as const;

/** Rendered size of each background star point. */
export const COSMIC_STAR_SIZE = 0.12 as const;

/** Wireframe "world" radius and geometry detail. */
export const COSMIC_WORLD_RADIUS = 2.1 as const;
export const COSMIC_WORLD_DETAIL = 1 as const;

/** World self-rotation speed, in radians per second (x and y). */
export const COSMIC_WORLD_SPIN_X = 0.12 as const;
export const COSMIC_WORLD_SPIN_Y = 0.2 as const;

/** Inner solid core opacity behind the wireframe shell. */
export const COSMIC_CORE_OPACITY = 0.16 as const;

/** Moon: orbit radius, orbital period (s), tilt (rad), and sprite size. */
export const COSMIC_MOON_ORBIT_RADIUS = 3.4 as const;
export const COSMIC_MOON_PERIOD = 7 as const;
export const COSMIC_MOON_TILT = 0.5 as const;
export const COSMIC_MOON_SIZE = 0.55 as const;

/** Comet keyframe arc: full clip duration and the active streak window (s). */
export const COSMIC_COMET_DURATION = 9 as const;
export const COSMIC_COMET_TRAVEL = 2.4 as const;

/** Comet arc endpoints + apex (world units), and head/tail sizes. */
export const COSMIC_COMET_START_X = -9 as const;
export const COSMIC_COMET_END_X = 9 as const;
export const COSMIC_COMET_START_Y = 4.5 as const;
export const COSMIC_COMET_END_Y = -3.5 as const;
export const COSMIC_COMET_APEX_Y = 5.5 as const;
export const COSMIC_COMET_Z = -2 as const;
export const COSMIC_COMET_HEAD_SIZE = 0.7 as const;
export const COSMIC_COMET_TAIL_SIZE = 2.6 as const;
export const COSMIC_COMET_TAIL_OPACITY = 0.45 as const;

/** Eased pointer parallax: max camera offset and per-frame easing factor. */
export const COSMIC_PARALLAX_STRENGTH = 0.5 as const;
export const COSMIC_PARALLAX_EASE = 0.05 as const;

/** Camera framing. */
export const COSMIC_CAMERA_FOV = 55 as const;
export const COSMIC_CAMERA_Z = 9 as const;

/** Soft star sprite resolution for this scene (px, square). */
export const COSMIC_SPRITE_SIZE = 64 as const;

/** Device-pixel-ratio cap (perf). */
export const COSMIC_MAX_PIXEL_RATIO = 2 as const;

/** Material opacity per resolved mode (gentler on a light background). */
export const COSMIC_OPACITY_DARK = 0.9 as const;
export const COSMIC_OPACITY_LIGHT = 0.7 as const;
