/**
 * Animation data models for the Animation_System.
 *
 * Both `durationMs` and `easing` originate from Token_System motion tokens.
 *
 * @see Requirements 20.1
 */

/** A motion configuration derived from motion tokens. */
export interface MotionConfig {
  durationMs: number;
  easing: string;
}
