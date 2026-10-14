"use client";

import {
  useEffect,
  useRef,
  type ReactNode,
  type CSSProperties,
  type ElementType,
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
  delay?: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8;
  threshold?: number;
  as?: ElementType;
  className?: string;
  style?: CSSProperties;
}

/** Progressive entrance animation: server content is visible; only off-screen elements are armed. */
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
  useEffect(() => {
    const element = ref.current;
    if (!element || typeof IntersectionObserver === "undefined") return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
    let observer: IntersectionObserver | null = null;
    function configure() {
      observer?.disconnect();
      if (!element) return;
      const bounds = element.getBoundingClientRect();
      if (reduced.matches || bounds.top < window.innerHeight * 0.94) {
        element.dataset.inview = "true";
        return;
      }
      element.dataset.revealReady = "true";
      element.dataset.inview = "false";
      observer = new IntersectionObserver(
        (entries) => {
          if (entries.some((entry) => entry.isIntersecting)) {
            element.dataset.inview = "true";
            observer?.disconnect();
          }
        },
        { threshold, rootMargin: "0px 0px -4% 0px" },
      );
      observer.observe(element);
    }
    configure();
    reduced.addEventListener("change", configure);
    return () => {
      observer?.disconnect();
      reduced.removeEventListener("change", configure);
      delete element.dataset.revealReady;
    };
  }, [threshold]);
  return (
    <Tag
      ref={ref}
      className={className}
      style={style}
      data-studio-reveal={variant}
      data-reveal-delay={delay}
    >
      {children}
    </Tag>
  );
}
