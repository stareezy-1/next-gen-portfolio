/**
 * StarField styles.
 *
 * Only layout/positioning lives here — the canvas is a decorative,
 * non-interactive fill layer. No color literals (Requirement 3.3): the WebGL
 * scene sources every colour from the active palette's CSS variables at
 * runtime, and the consuming surface owns any masking/fade via `className`.
 */

import type { CSSProperties } from "react";

/** Absolutely-positioned, click-through fill layer that hosts the canvas. */
export const starFieldContainer: CSSProperties = {
  position: "absolute",
  inset: 0,
  width: "100%",
  height: "100%",
  display: "block",
  overflow: "hidden",
  pointerEvents: "none",
};
