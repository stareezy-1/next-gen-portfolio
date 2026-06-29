/**
 * Star Field (hero galaxy) tuning constants.
 *
 * The hero background renders a procedurally generated spiral galaxy in WebGL
 * (three.js) — a literal nod to "Bintang" (Indonesian for "star"). Every magic
 * number the generator and animation loop need lives here so no literals are
 * inlined at the use site (Requirements 26.4, 26.5).
 *
 * Colors are deliberately NOT defined here: they are read at runtime from the
 * active palette's CSS custom properties (`--color-brand`, `--color-accent`,
 * `--color-text-primary`) so the galaxy recolors with the theme and no
 * hardcoded color literal ever enters the source (Requirement 3.3).
 */

/** Total number of star points in the galaxy disc. */
export const STARFIELD_STAR_COUNT = 6500 as const;

/** Outer radius of the galaxy disc, in world units. */
export const STARFIELD_GALAXY_RADIUS = 10 as const;

/**
 * Number of spiral arms. Four arms encode a true fact, not decoration: four
 * years deep in the React ecosystem (mirrors the hero copy).
 */
export const STARFIELD_ARMS = 4 as const;

/** How tightly each arm curls — radians of spin accrued at the outer radius. */
export const STARFIELD_SPIN = 0.95 as const;

/** Lateral scatter applied to each star, as a fraction of its radius. */
export const STARFIELD_RANDOMNESS = 0.34 as const;

/** Exponent pulling scatter toward the arm centre (higher = crisper arms). */
export const STARFIELD_RANDOMNESS_POWER = 2.6 as const;

/** Out-of-plane flattening of the disc (vertical scatter multiplier). */
export const STARFIELD_THICKNESS = 0.4 as const;

/** Rendered size of each star point, in world units. */
export const STARFIELD_STAR_SIZE = 0.09 as const;

/** Base auto-rotation speed of the galaxy, in radians per second. */
export const STARFIELD_ROTATION_SPEED = 0.05 as const;

/** Maximum camera offset driven by pointer parallax, in world units. */
export const STARFIELD_PARALLAX_STRENGTH = 0.7 as const;

/** Per-frame easing factor for the pointer parallax (smaller = lazier drift). */
export const STARFIELD_PARALLAX_EASE = 0.045 as const;

/** Core star ("Bintang") pulse period, in seconds. */
export const STARFIELD_CORE_PULSE_PERIOD = 3.6 as const;

/** Core star pulse scale envelope (min/max multiplier). */
export const STARFIELD_CORE_SCALE_MIN = 0.85 as const;
export const STARFIELD_CORE_SCALE_MAX = 1.3 as const;

/** Base world size of the bright core star sprite. */
export const STARFIELD_CORE_SIZE = 0.9 as const;

/** Halo-to-core size ratio for the soft glow behind the core star. */
export const STARFIELD_HALO_RATIO = 3.4 as const;

/** Opacity of the soft halo behind the core star. */
export const STARFIELD_HALO_OPACITY = 0.35 as const;

/** Camera framing. */
export const STARFIELD_CAMERA_FOV = 62 as const;
export const STARFIELD_CAMERA_Z = 9 as const;
export const STARFIELD_CAMERA_Y = 2.4 as const;

/** Device-pixel-ratio cap (perf: never render at 3x on dense mobile screens). */
export const STARFIELD_MAX_PIXEL_RATIO = 2 as const;

/** Fraction of stars promoted to the bright "highlight" (star-white) colour. */
export const STARFIELD_HIGHLIGHT_RATIO = 0.18 as const;

/** Soft star sprite texture resolution, in pixels (square). */
export const STARFIELD_SPRITE_SIZE = 64 as const;

/** Glow falloff exponent for the generated star sprite (higher = tighter). */
export const STARFIELD_SPRITE_GLOW_POWER = 2.4 as const;

/** Max 8-bit channel value used when authoring the luminance-mask sprite. */
export const STARFIELD_SPRITE_MAX_CHANNEL = 255 as const;

/** Material opacity per resolved mode (additive glow on dark, gentler on light). */
export const STARFIELD_OPACITY_DARK = 0.95 as const;
export const STARFIELD_OPACITY_LIGHT = 0.8 as const;

/** Radial density exponent — values > 1 pack more stars toward the core. */
export const STARFIELD_CORE_DENSITY_POWER = 1.5 as const;

/** How far a highlighted star is lerped toward the star-white colour (0–1). */
export const STARFIELD_HIGHLIGHT_LERP = 0.62 as const;
