"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import "./HomeMotion.css";

const SECTIONS = [
  { id: "top", label: "Bintang" },
  { id: "work", label: "Selected work" },
  { id: "open-source", label: "Open source" },
  { id: "experience", label: "Experience" },
  { id: "capabilities", label: "Toolkit" },
  { id: "writing", label: "Writing" },
  { id: "contact", label: "Let's talk" },
] as const;
const EASING = 0.14;
const SETTLED_DISTANCE = 0.08;
const clamp = (value: number) => Math.min(1, Math.max(0, value));

/** Small progressive motion island: content remains server rendered and native-scrollable. */
export function HomeMotion({ children }: { children: ReactNode }) {
  const rootRef = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState<string>("top");

  useEffect(() => {
    const root = rootRef.current;
    const hero = root?.querySelector<HTMLElement>(".studio-hero");
    if (!root || !hero) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
    const finePointer = window.matchMedia("(hover: hover) and (pointer: fine)");
    const sections = SECTIONS.map((section) => ({
      ...section,
      element: root.querySelector<HTMLElement>(`#${section.id}`),
      top: 0,
    })).filter((section) => section.element);
    let frame = 0;
    let currentY = window.scrollY;
    let targetY = currentY;
    let currentX = 0;
    let targetX = 0;
    let currentPointerY = 0;
    let targetPointerY = 0;
    let heroTop = 0;
    let heroHeight = hero.offsetHeight;
    let scrollEnd = 1;
    let previousActive = "top";

    function renderFrame() {
      frame = 0;
      if (!root || document.hidden) return;
      currentY = reduced.matches
        ? targetY
        : currentY + (targetY - currentY) * EASING;
      currentX += (targetX - currentX) * EASING;
      currentPointerY += (targetPointerY - currentPointerY) * EASING;
      const progress = reduced.matches
        ? 0
        : clamp((currentY - heroTop) / heroHeight);
      root.style.setProperty("--hero-progress", progress.toFixed(4));
      root.style.setProperty(
        "--pointer-x",
        reduced.matches ? "0" : currentX.toFixed(4),
      );
      root.style.setProperty(
        "--pointer-y",
        reduced.matches ? "0" : currentPointerY.toFixed(4),
      );
      root.style.setProperty(
        "--page-progress",
        clamp(targetY / scrollEnd).toFixed(4),
      );
      root.dataset.heroVisible = String(
        targetY < heroTop + heroHeight && !document.hidden,
      );
      let nextActive = "top";
      for (const section of sections)
        if (targetY + window.innerHeight * 0.3 >= section.top)
          nextActive = section.id;
      if (nextActive !== previousActive) {
        previousActive = nextActive;
        setActive(nextActive);
      }
      if (
        !reduced.matches &&
        (Math.abs(targetY - currentY) > SETTLED_DISTANCE ||
          Math.abs(targetX - currentX) > 0.001 ||
          Math.abs(targetPointerY - currentPointerY) > 0.001)
      )
        frame = requestAnimationFrame(renderFrame);
    }
    function schedule() {
      if (!frame && !document.hidden)
        frame = requestAnimationFrame(renderFrame);
    }
    function onScroll() {
      targetY = window.scrollY;
      schedule();
    }
    function measure() {
      heroTop = hero!.getBoundingClientRect().top + window.scrollY;
      heroHeight = Math.max(1, hero!.offsetHeight);
      scrollEnd = Math.max(
        1,
        document.documentElement.scrollHeight - window.innerHeight,
      );
      for (const section of sections)
        section.top =
          section.element!.getBoundingClientRect().top + window.scrollY;
      onScroll();
    }
    function pointer(event: PointerEvent) {
      if (
        reduced.matches ||
        !finePointer.matches ||
        targetY >= heroTop + heroHeight
      )
        return;
      targetX = (event.clientX / window.innerWidth - 0.5) * 2;
      targetPointerY = (event.clientY / window.innerHeight - 0.5) * 2;
      schedule();
    }
    function resetPointer() {
      targetX = 0;
      targetPointerY = 0;
      schedule();
    }
    function visibility() {
      if (document.hidden) {
        cancelAnimationFrame(frame);
        frame = 0;
        root!.dataset.heroVisible = "false";
      } else measure();
    }
    const observer =
      typeof ResizeObserver !== "undefined"
        ? new ResizeObserver(measure)
        : null;
    observer?.observe(root);
    root.dataset.motionReady = "true";
    measure();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", measure);
    hero.addEventListener("pointermove", pointer, { passive: true });
    hero.addEventListener("pointerleave", resetPointer);
    reduced.addEventListener("change", measure);
    document.addEventListener("visibilitychange", visibility);
    return () => {
      cancelAnimationFrame(frame);
      observer?.disconnect();
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", measure);
      hero.removeEventListener("pointermove", pointer);
      hero.removeEventListener("pointerleave", resetPointer);
      reduced.removeEventListener("change", measure);
      document.removeEventListener("visibilitychange", visibility);
      delete root.dataset.motionReady;
    };
  }, []);

  return (
    <div ref={rootRef} className="home-motion" data-active-section={active}>
      {children}
      <nav className="section-navigator" aria-label="Homepage sections">
        <div className="section-nav-current" aria-hidden="true" key={active}>
          <span>
            {String(
              SECTIONS.findIndex((section) => section.id === active),
            ).padStart(2, "0")}
          </span>
          <strong>
            {SECTIONS.find((section) => section.id === active)?.label}
          </strong>
        </div>
        <ol>
          {SECTIONS.map((section, index) => (
            <li key={section.id}>
              <a
                href={`#${section.id}`}
                aria-label={`Jump to ${section.label}`}
                aria-current={active === section.id ? "location" : undefined}
              >
                <span className="section-nav-number">
                  {String(index).padStart(2, "0")}
                </span>
                <span>{section.label}</span>
              </a>
            </li>
          ))}
        </ol>
        <div className="section-ruler" aria-hidden="true">
          <span />
        </div>
      </nav>
      <div className="mobile-scroll-progress" aria-hidden="true" />
    </div>
  );
}
