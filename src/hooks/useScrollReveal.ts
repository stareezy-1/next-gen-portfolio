"use client";

/**
 * useScrollReveal — triggers an animation when an element enters the viewport.
 *
 * Uses IntersectionObserver to detect when the observed element crosses
 * the threshold, then sets `revealed` to true (one-shot by default).
 * Respects `prefers-reduced-motion` — returns `revealed: true` immediately
 * so no animation runs.
 *
 * @see Requirements 20.4, 20.7, 23.5
 */

import { useEffect, useRef, useState } from "react";
import { useReducedMotion } from "@/hooks/useReducedMotion";

export interface UseScrollRevealOptions {
  /** 0–1 fraction visible before triggering. @defaultValue 0.1 */
  threshold?: number;
  /** Root margin passed to IntersectionObserver. @defaultValue "-40px" */
  rootMargin?: string;
  /** Once revealed, stays revealed. @defaultValue true */
  once?: boolean;
  /** Delay before the CSS class is applied (ms). @defaultValue 0 */
  delay?: number;
}

export interface UseScrollRevealReturn {
  ref: React.RefObject<HTMLElement | null>;
  revealed: boolean;
}

export function useScrollReveal({
  threshold = 0.1,
  rootMargin = "-40px",
  once = true,
  delay = 0,
}: UseScrollRevealOptions = {}): UseScrollRevealReturn {
  const ref = useRef<HTMLElement>(null);
  const prefersReduced = useReducedMotion();
  const [revealed, setRevealed] = useState(prefersReduced);

  useEffect(() => {
    // Reduced motion: skip the observer entirely — content is already visible.
    if (prefersReduced) {
      setRevealed(true);
      return;
    }

    const el = ref.current;
    if (!el || typeof IntersectionObserver === "undefined") {
      setRevealed(true);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (entry?.isIntersecting) {
          if (delay > 0) {
            const timer = setTimeout(() => setRevealed(true), delay);
            if (once) observer.disconnect();
            return () => clearTimeout(timer);
          }
          setRevealed(true);
          if (once) observer.disconnect();
        } else if (!once) {
          setRevealed(false);
        }
      },
      { threshold, rootMargin },
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [prefersReduced, threshold, rootMargin, once, delay]);

  return { ref, revealed };
}
