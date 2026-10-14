"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { PRIMARY_NAV_ITEMS } from "@/constants/routes";
import { ThemeControl } from "@/components/shared/ThemeControl";
import "./Nav.style.css";
import { BrandMark } from "@/components/shared/BrandMark/BrandMark";

export function Nav() {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const toggleRef = useRef<HTMLButtonElement>(null);
  const drawerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!menuOpen) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const drawer = drawerRef.current;
    const controls = () =>
      Array.from(
        drawer?.querySelectorAll<HTMLElement>(
          "a[href], button:not([disabled])",
        ) ?? [],
      );
    controls()[0]?.focus();
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        event.preventDefault();
        setMenuOpen(false);
        toggleRef.current?.focus();
      }
      if (event.key !== "Tab") return;
      const items = controls();
      const first = items[0];
      const last = items[items.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last?.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first?.focus();
      }
    }
    const desktop = window.matchMedia("(min-width: 1001px)");
    const closeOnDesktop = () => {
      if (desktop.matches) setMenuOpen(false);
    };
    desktop.addEventListener("change", closeOnDesktop);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", onKeyDown);
      desktop.removeEventListener("change", closeOnDesktop);
    };
  }, [menuOpen]);

  function isActive(path: string) {
    return (
      pathname === path || (path !== "/" && pathname.startsWith(`${path}/`))
    );
  }
  function closeMenu() {
    setMenuOpen(false);
    toggleRef.current?.focus();
  }

  return (
    <>
      <nav className="nav-root" aria-label="Primary navigation">
        <Link href="/" aria-label="Go to home page" className="nav-logo">
          <BrandMark />
          <span className="nav-logo-name">Bintang</span>
        </Link>
        <ol className="nav-links-list nav-desktop-links">
          {PRIMARY_NAV_ITEMS.map((item) => (
            <li key={item.key}>
              <Link
                href={item.path}
                aria-current={isActive(item.path) ? "page" : undefined}
                className={`nav-link${isActive(item.path) ? " nav-link--active" : ""}`}
              >
                {item.label}
              </Link>
            </li>
          ))}
        </ol>
        <div className="nav-controls">
          <div className="nav-desktop-links">
            <ThemeControl />
          </div>
          <Link href="/contact" className="nav-contact">
            Let&apos;s talk <span aria-hidden="true">↗</span>
          </Link>
          <button
            ref={toggleRef}
            type="button"
            className="nav-hamburger"
            onClick={() => setMenuOpen((open) => !open)}
            aria-label={menuOpen ? "Close menu" : "Open menu"}
            aria-expanded={menuOpen}
            aria-controls="mobile-navigation"
          >
            <span className="nav-hamburger-bar" />
            <span className="nav-hamburger-bar" />
          </button>
        </div>
      </nav>
      {menuOpen && (
        <>
          <div
            aria-hidden="true"
            onClick={closeMenu}
            className="nav-mobile-backdrop"
          />
          <div
            id="mobile-navigation"
            ref={drawerRef}
            role="dialog"
            aria-modal="true"
            aria-label="Navigation menu"
            className="nav-mobile-drawer"
          >
            <div className="nav-mobile-heading">
              <span>Navigation</span>
              <button type="button" onClick={closeMenu}>
                Close ×
              </button>
            </div>
            {PRIMARY_NAV_ITEMS.map((item, index) => (
              <Link
                key={item.key}
                href={item.path}
                onClick={() => setMenuOpen(false)}
                aria-current={isActive(item.path) ? "page" : undefined}
                className={`nav-mobile-link${isActive(item.path) ? " nav-mobile-link--active" : ""}`}
              >
                <span className="nav-mobile-number">0{index + 1}</span>
                {item.label}
                <span aria-hidden="true">↗</span>
              </Link>
            ))}
            <div className="nav-mobile-theme">
              <ThemeControl />
            </div>
          </div>
        </>
      )}
    </>
  );
}
