"use client";

/**
 * ScrollReveal — Framer Motion (motion/react) scroll animation wrapper.
 *
 * Uses `motion` + `useInView` from `motion/react` instead of manual
 * IntersectionObserver + useState. This eliminates the SSR/client hydration
 * mismatch (the old useState(true) pattern caused the "server text didn't
 * match client" error) and gives proper spring physics.
 *
 * Reduced-motion: `useReducedMotion()` from motion/react skips all animation
 * and renders children at their final state immediately.
 *
 * @see Requirements 20.4, 20.7, 23.5
 */

import { useRef } from "react";
import {
  motion,
  useInView,
  useReducedMotion,
  type Variants,
  type Transition,
} from "motion/react";
import type { ReactNode, CSSProperties, ElementType } from "react";

export type RevealVariant =
  | "fade-up"
  | "fade-down"
  | "fade-left"
  | "fade-right"
  | "zoom"
  | "flip"
  | "tilt"
  | "fade";

export interface ScrollRevealProps {
  children: ReactNode;
  variant?: RevealVariant;
  /** Stagger delay in steps (1–8), each step ≈ 80ms */
  delay?: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8;
  threshold?: number;
  as?: ElementType;
  className?: string;
  style?: CSSProperties;
}

const DELAY_STEP = 0.08; // seconds

const SPRING: Transition = {
  type: "spring",
  stiffness: 260,
  damping: 28,
  mass: 0.8,
};

const EASE_OUT: Transition = {
  type: "tween",
  ease: [0.16, 1, 0.3, 1],
  duration: 0.65,
};

function getVariants(variant: RevealVariant): Variants {
  switch (variant) {
    case "fade-up":
      return {
        hidden: { opacity: 0, y: 40 },
        visible: { opacity: 1, y: 0 },
      };
    case "fade-down":
      return {
        hidden: { opacity: 0, y: -32 },
        visible: { opacity: 1, y: 0 },
      };
    case "fade-left":
      return {
        hidden: { opacity: 0, x: -44 },
        visible: { opacity: 1, x: 0 },
      };
    case "fade-right":
      return {
        hidden: { opacity: 0, x: 44 },
        visible: { opacity: 1, x: 0 },
      };
    case "zoom":
      return {
        hidden: { opacity: 0, scale: 0.88 },
        visible: { opacity: 1, scale: 1 },
      };
    case "flip":
      return {
        hidden: { opacity: 0, rotateX: -18, y: 24 },
        visible: { opacity: 1, rotateX: 0, y: 0 },
      };
    case "tilt":
      return {
        hidden: { opacity: 0, rotateY: -16, x: -20 },
        visible: { opacity: 1, rotateY: 0, x: 0 },
      };
    case "fade":
      return {
        hidden: { opacity: 0 },
        visible: { opacity: 1 },
      };
  }
}

function getTransition(
  variant: RevealVariant,
  delaySeconds: number,
): Transition {
  const base = variant === "zoom" ? SPRING : EASE_OUT;
  return { ...base, delay: delaySeconds };
}

export function ScrollReveal({
  children,
  variant = "fade-up",
  delay,
  threshold = 0.08,
  as,
  className,
  style,
}: ScrollRevealProps) {
  const ref = useRef<HTMLDivElement>(null);
  const prefersReducedMotion = useReducedMotion();

  const isInView = useInView(ref, {
    once: true,
    amount: threshold,
  });

  const delaySeconds = delay ? delay * DELAY_STEP : 0;
  const variants = getVariants(variant);
  const transition = getTransition(variant, delaySeconds);

  // Reduced motion: render at final state, no animation
  if (prefersReducedMotion) {
    const Tag = (as ?? "div") as React.ElementType;
    return (
      <Tag className={className} style={style}>
        {children}
      </Tag>
    );
  }

  // motion/react ships typed polymorphic components — use motion.div as default
  // and cast for custom `as` elements
  const MotionTag = as
    ? (motion[as as keyof typeof motion] as typeof motion.div) ?? motion.div
    : motion.div;

  return (
    <MotionTag
      ref={ref}
      className={className}
      style={style}
      variants={variants}
      initial="hidden"
      animate={isInView ? "visible" : "hidden"}
      transition={transition}
    >
      {children}
    </MotionTag>
  );
}
