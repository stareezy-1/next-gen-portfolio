"use client";

/**
 * ReadingProgress — a thin top progress bar that tracks how far the reader has
 * scrolled through the article. Motivated motion: it communicates reading
 * progress (feedback), not decoration.
 *
 * Uses motion/react `useScroll` (no scroll event listeners, no per-frame React
 * state). Respects reduced motion by rendering nothing.
 */

import { motion, useScroll, useReducedMotion } from "motion/react";
import "./ReadingProgress.style.css";

export function ReadingProgress() {
  const { scrollYProgress } = useScroll();
  const prefersReducedMotion = useReducedMotion();

  if (prefersReducedMotion) return null;

  return (
    <motion.div
      className="reading-progress"
      style={{ scaleX: scrollYProgress }}
      aria-hidden="true"
    />
  );
}
