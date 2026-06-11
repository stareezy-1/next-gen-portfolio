"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { PRIMARY_NAV_ITEMS } from "@/constants/routes";
import { ContentWidth } from "@/components/layouts";
import { ThemeControl } from "@/components/shared/ThemeControl";
import "./Nav.style.css";

export function Nav() {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (typeof document !== "undefined") {
      document.body.style.overflow = menuOpen ? "hidden" : "";
    }
    return () => {
      if (typeof document !== "undefined") {
        document.body.style.overflow = "";
      }
    };
  }, [menuOpen]);

  const navLinks = PRIMARY_NAV_ITEMS.filter((item) => item.path !== "/");

  return (
    <>
      <nav className="nav-root" aria-label="Primary navigation">
        <ContentWidth>
          <div className="nav-inner">
            {/* Logo */}
            <Link href="/" aria-label="Go to home page" className="nav-logo">
              Bintang
            </Link>

            {/* Desktop links */}
            <ol role="list" className="nav-links-list nav-desktop-links">
              {navLinks.map((item) => {
                const isActive =
                  pathname === item.path ||
                  pathname.startsWith(item.path + "/");
                return (
                  <li key={item.key}>
                    <Link
                      href={item.path}
                      aria-current={isActive ? "page" : undefined}
                      className={`nav-link ${
                        isActive ? "nav-link--active" : ""
                      }`}
                    >
                      {item.label}
                      {isActive && (
                        <span
                          className="nav-link-underline"
                          aria-hidden="true"
                        />
                      )}
                    </Link>
                  </li>
                );
              })}
            </ol>

            {/* Right controls */}
            <div className="nav-controls">
              <div className="nav-desktop-links">
                <ThemeControl />
              </div>

              {/* Hamburger — mobile only */}
              <button
                type="button"
                className="nav-hamburger"
                onClick={() => setMenuOpen((o) => !o)}
                aria-label={menuOpen ? "Close menu" : "Open menu"}
                aria-expanded={menuOpen}
              >
                <span
                  className="nav-hamburger-bar"
                  style={{
                    transform: menuOpen
                      ? "translateY(5.5px) rotate(45deg)"
                      : "none",
                  }}
                />
                <span
                  className="nav-hamburger-bar"
                  style={{ opacity: menuOpen ? 0 : 1 }}
                />
                <span
                  className="nav-hamburger-bar"
                  style={{
                    transform: menuOpen
                      ? "translateY(-5.5px) rotate(-45deg)"
                      : "none",
                  }}
                />
              </button>
            </div>
          </div>
        </ContentWidth>
      </nav>

      {/* Mobile drawer */}
      {menuOpen && (
        <>
          <div
            aria-hidden="true"
            onClick={() => setMenuOpen(false)}
            className="nav-mobile-backdrop"
          />
          <div
            role="dialog"
            aria-label="Navigation menu"
            className="nav-mobile-drawer"
          >
            {navLinks.map((item) => {
              const isActive =
                pathname === item.path || pathname.startsWith(item.path + "/");
              return (
                <Link
                  key={item.key}
                  href={item.path}
                  aria-current={isActive ? "page" : undefined}
                  className={`nav-mobile-link ${
                    isActive ? "nav-mobile-link--active" : ""
                  }`}
                >
                  {item.label}
                  {isActive && (
                    <span className="nav-mobile-dot" aria-hidden="true" />
                  )}
                </Link>
              );
            })}
            <div className="nav-mobile-theme">
              <ThemeControl />
            </div>
          </div>
        </>
      )}
    </>
  );
}
