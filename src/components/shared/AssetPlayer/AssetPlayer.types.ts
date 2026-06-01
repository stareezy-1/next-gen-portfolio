/**
 * Types and enums for the {@link AssetPlayer} component.
 *
 * Kept in a separate file to avoid circular imports between the component
 * logic (`.tsx`) and the style module (`.style.ts`), following the
 * stareezy-ui three-file component convention.
 *
 * @see Requirements 25.1, 25.7, 25.9
 */

/**
 * Props for the {@link AssetPlayer} component.
 *
 * @see Requirement 25.1
 */
export interface AssetPlayerProps {
  /** dotLottie asset URL to load and render. */
  src: string;
  /**
   * Accessible name for the animation container.
   * When provided, sets `aria-label` on the container (Requirement 25.7).
   */
  name?: string;
  /**
   * When `true`, marks the asset as decorative via `aria-hidden="true"`.
   * Mutually exclusive with `name` — decorative assets need no accessible name
   * (Requirement 25.7).
   */
  decorative?: boolean;
  /**
   * Controls when playback starts:
   * - `'auto'`    — autoplay on load (unless reduced-motion is active).
   * - `'hover'`   — play on mouseenter, stop + reset on mouseleave (Req 25.9).
   * - `'visible'` — play when the element enters the viewport, pause when it
   *                 leaves (Req 25.10).
   *
   * Defaults to `'auto'`.
   */
  trigger?: "auto" | "hover" | "visible";
  /** Additional CSS class name(s) applied to the container element. */
  className?: string;
  /** Container width. Accepts a pixel number or any valid CSS width string. */
  width?: number | string;
  /** Container height. Accepts a pixel number or any valid CSS height string. */
  height?: number | string;
}
