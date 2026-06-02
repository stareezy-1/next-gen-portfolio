"use client";

/**
 * ScrollReveal — IntersectionObserver scroll animation wrapper.
 *
 * Uses React state + className toggling (not data attributes) to trigger
 * CSS animations. This approach is SSR-safe and works reliably with React 19.
 *
 * Elements start with className "sr-hidden sr-{variant}" and get
 * "sr-visible" added when they enter the viewport.
 *
 * @see Requirements 20.4, 20.7, 23.5
 */

import {
  useEffect,
  useRef,
  useState,
  type ElementType,
  type ReactNode,
  type CSSProperties,
} from "react";

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
  /** Stagger delay step (1–8). Each step = 80ms. */
  delay?: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8;
  threshold?: number;
  as?: ElementType;
  className?: string;
  style?: CSSProperties;
}

const DELAY_MS: Record<number, number> = {
  1: 80,
  2: 160,
  3: 240,
  4: 320,
  5: 400,
  6: 480,
  7: 560,
  8: 640,
};

export function ScrollReveal({
  children,
  variant = "fade-up",
  delay,
  threshold = 0.08,
  as: Tag = "div",
  className,
  style,
}: ScrollRevealProps) {
  const ref = useRef<HTMLElement>(null);
  // Start as hidden=true (invisible). Will flip to false when in viewport.
  const [hidden, setHidden] = useState(true);

  useEffect(() => {
    const el = ref.current;
    if (!el) {
      setHidden(false);
      return;
    }

    if (typeof IntersectionObserver === "undefined") {
      setHidden(false);
      return;
    }

    const delayMs = delay ? DELAY_MS[delay] ?? 0 : 0;

    // Apply will-change only while waiting to animate — improves perf vs always-on
    el.style.willChange = "opacity, transform";

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (entry?.isIntersecting) {
          if (delayMs > 0) {
            setTimeout(() => {
              setHidden(false);
              // Remove will-change after transition completes to free GPU layer
              setTimeout(() => {
                el.style.willChange = "auto";
              }, 300);
            }, delayMs);
          } else {
            setHidden(false);
            setTimeout(() => {
              el.style.willChange = "auto";
            }, 300);
          }
          observer.disconnect();
        }
      },
      { threshold, rootMargin: "0px" },
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [threshold, delay]);

  const hiddenStyles = getHiddenStyles(variant);
  const transitionStyle: CSSProperties = {
    transition: getTransition(variant),
    ...(hidden ? hiddenStyles : getVisibleStyles()),
    ...style,
  };

  return (
    <Tag
      ref={ref as React.RefObject<never>}
      className={className}
      style={transitionStyle}
    >
      {children}
    </Tag>
  );
}

function getHiddenStyles(variant: RevealVariant): CSSProperties {
  switch (variant) {
    case "fade-up":
      return { opacity: 0, transform: "translateY(52px)" };
    case "fade-down":
      return { opacity: 0, transform: "translateY(-40px)" };
    case "fade-left":
      return { opacity: 0, transform: "translateX(-52px)" };
    case "fade-right":
      return { opacity: 0, transform: "translateX(52px)" };
    case "zoom":
      return { opacity: 0, transform: "scale(0.82)" };
    case "flip":
      return {
        opacity: 0,
        transform: "perspective(700px) rotateX(-24deg) translateY(28px)",
      };
    case "tilt":
      return {
        opacity: 0,
        transform: "perspective(900px) rotateY(-22deg) translateX(-24px)",
      };
    case "fade":
      return { opacity: 0 };
  }
}

function getVisibleStyles(): CSSProperties {
  return { opacity: 1, transform: "none" };
}

function getTransition(variant: RevealVariant): string {
  const spring = "cubic-bezier(0.16, 1, 0.3, 1)";
  const bounce = "cubic-bezier(0.34, 1.56, 0.64, 1)";
  const easing = variant === "zoom" ? bounce : spring;
  const dur = variant === "fade" ? "0.85s" : "0.7s";
  if (variant === "fade") {
    return `opacity ${dur} ease`;
  }
  return `opacity ${dur} ${easing}, transform ${dur} ${easing}`;
}
