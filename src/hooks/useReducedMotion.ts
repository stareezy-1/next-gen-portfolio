"use client";

/**
 * useReducedMotion — reflects the user's `prefers-reduced-motion` preference.
 *
 * Returns `true` when the user/system has requested reduced motion
 * (`prefers-reduced-motion: reduce`) and updates reactively when the
 * preference changes. The Animation_System and Asset_Player gate non-essential
 * motion on this value, presenting content in its final state when reduced
 * (Requirements 20.7, 23.5, 25.4).
 *
 * SSR-safe: the initial value is `false` (no reduced motion assumed) so the
 * server render is deterministic; the real preference is read on mount. When
 * `matchMedia` is unavailable the hook stays `false` and attaches no listener.
 *
 * @see Requirement 23.5
 */

import { useEffect, useState } from "react";

/** Media query that signals the reduced-motion preference. */
const REDUCED_MOTION_QUERY = "(prefers-reduced-motion: reduce)";

/**
 * @returns Whether the user prefers reduced motion, updated on change.
 */
export function useReducedMotion(): boolean {
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    if (
      typeof window === "undefined" ||
      typeof window.matchMedia !== "function"
    ) {
      return;
    }
    const mql = window.matchMedia(REDUCED_MOTION_QUERY);

    // Sync immediately in case the preference differs from the SSR default.
    setReduced(mql.matches);

    const handleChange = (event: MediaQueryListEvent) => {
      setReduced(event.matches);
    };

    mql.addEventListener("change", handleChange);
    return () => mql.removeEventListener("change", handleChange);
  }, []);

  return reduced;
}
