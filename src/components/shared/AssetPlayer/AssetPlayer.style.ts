/**
 * Token-driven styles for the {@link AssetPlayer} component.
 *
 * Every dimensional value originates from the Token_System — no hardcoded
 * color, spacing, or radius literals appear here (Requirements 26.2, 3.3).
 * Colors are never hardcoded; they are injected at render time from the active
 * palette via the LSS theme object built in the component logic.
 *
 * @see Requirements 25.6, 26.1, 26.2
 */

import type { CSSProperties } from "react";
import { spacing, radius } from "@stareezy-ui/tokens";

/**
 * Returns the base container styles for the AssetPlayer.
 *
 * The container:
 *  - Uses `display: 'flex'` (never `flex: 1`) per the web style convention.
 *  - Clips the animation to its bounding box via `overflow: 'hidden'`.
 *  - Establishes a stacking context with `position: 'relative'` so the
 *    fallback overlay can be absolutely positioned inside it.
 *  - Applies a token-derived border-radius for visual polish.
 *
 * Width and height are intentionally omitted here; they are applied inline
 * from the `width`/`height` props so the container matches the asset
 * dimensions exactly (Requirement 25.6 — no layout shift on load failure).
 *
 * @returns A `CSSProperties` object for the container `<div>`.
 */
export function getAssetPlayerStyles(): CSSProperties {
  return {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
    position: "relative",
    // Token-derived border-radius — no hardcoded literal (Requirement 26.2).
    // `radius.md` = 8px from the token scale.
    borderRadius: radius.md.value,
    // Token-derived padding reset — ensures the container hugs the asset.
    // `spacing.zero` = 0 from the token scale.
    padding: spacing.zero.value,
  };
}

/**
 * Styles for the static fallback element shown when the dotLottie asset fails
 * to load (Requirement 25.6). The fallback fills the container completely so
 * the box dimensions are preserved and no layout shift occurs.
 *
 * Background color is intentionally omitted here; it is applied at render time
 * from the active palette token values (never hardcoded).
 */
export const fallbackStyles: CSSProperties = {
  position: "absolute",
  inset: 0,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  borderRadius: radius.md.value,
};

/**
 * Styles for the static `<img>` shown when reduced-motion is active
 * (Requirement 25.4). The image fills the container to match the animation
 * dimensions.
 */
export const staticFrameStyles: CSSProperties = {
  width: "100%",
  height: "100%",
  objectFit: "contain",
  display: "block",
};
