"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { PRIMARY_NAV_ITEMS } from "@/constants/routes";
import { ContentWidth } from "@/components/layouts";
import { ThemeControl } from "@/components/shared/ThemeControl";

export function Nav() {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);

  // Close menu on route change
  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  // Prevent body scroll when menu is open
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
      <nav
        style={{
          display: "flex",
          alignItems: "center",
          padding: "0 1.5rem",
          height: "68px",
          backgroundColor:
            "color-mix(in srgb, var(--color-surface) 85%, transparent)",
          borderBottom: "1px solid var(--color-border)",
          position: "sticky",
          top: 0,
          zIndex: 200,
          backdropFilter: "blur(16px)",
          WebkitBackdropFilter: "blur(16px)",
        }}
        aria-label="Primary navigation"
      >
        <ContentWidth>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              width: "100%",
            }}
          >
            {/* Logo */}
            <Link
              href="/"
              aria-label="Go to home page"
              style={{
                fontSize: "1.125rem",
                fontWeight: 800,
                color: "var(--color-brand)",
                textDecoration: "none",
                letterSpacing: "-0.02em",
                flexShrink: 0,
              }}
            >
              Bintang
            </Link>

            {/* Desktop links */}
            <ol
              role="list"
              className="nav-desktop-links"
              style={{
                display: "flex",
                listStyle: "none",
                margin: 0,
                padding: 0,
                gap: "2rem",
                alignItems: "center",
              }}
            >
              {navLinks.map((item) => {
                const isActive =
                  pathname === item.path ||
                  pathname.startsWith(item.path + "/");
                return (
                  <li key={item.key}>
                    <Link
                      href={item.path}
                      aria-current={isActive ? "page" : undefined}
                      style={{
                        color: isActive
                          ? "var(--color-brand)"
                          : "var(--color-text-secondary)",
                        textDecoration: "none",
                        fontSize: "0.9375rem",
                        fontWeight: isActive ? 600 : 500,
                        position: "relative",
                      }}
                    >
                      {item.label}
                      {isActive && (
                        <span
                          style={{
                            position: "absolute",
                            bottom: "-4px",
                            left: 0,
                            right: 0,
                            height: "2px",
                            backgroundColor: "var(--color-brand)",
                            borderRadius: "1px",
                          }}
                        />
                      )}
                    </Link>
                  </li>
                );
              })}
            </ol>

            {/* Right controls */}
            <div
              style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}
            >
              <div className="nav-desktop-links">
                <ThemeControl />
              </div>

              {/* Hamburger button — mobile only */}
              <button
                type="button"
                className="nav-hamburger"
                onClick={() => setMenuOpen((o) => !o)}
                aria-label={menuOpen ? "Close menu" : "Open menu"}
                aria-expanded={menuOpen}
                style={{
                  display: "none",
                  flexDirection: "column",
                  justifyContent: "center",
                  alignItems: "center",
                  gap: "5px",
                  width: "40px",
                  height: "40px",
                  background: "none",
                  border: "1px solid var(--color-border)",
                  borderRadius: "0.5rem",
                  cursor: "pointer",
                  padding: "0.5rem",
                  color: "var(--color-text-primary)",
                }}
              >
                <span
                  style={{
                    display: "block",
                    width: "18px",
                    height: "2px",
                    backgroundColor: "currentColor",
                    borderRadius: "1px",
                    transition: "transform 0.2s ease, opacity 0.2s ease",
                    transform: menuOpen
                      ? "translateY(7px) rotate(45deg)"
                      : "none",
                  }}
                />
                <span
                  style={{
                    display: "block",
                    width: "18px",
                    height: "2px",
                    backgroundColor: "currentColor",
                    borderRadius: "1px",
                    transition: "opacity 0.2s ease",
                    opacity: menuOpen ? 0 : 1,
                  }}
                />
                <span
                  style={{
                    display: "block",
                    width: "18px",
                    height: "2px",
                    backgroundColor: "currentColor",
                    borderRadius: "1px",
                    transition: "transform 0.2s ease, opacity 0.2s ease",
                    transform: menuOpen
                      ? "translateY(-7px) rotate(-45deg)"
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
          {/* Backdrop */}
          <div
            aria-hidden="true"
            onClick={() => setMenuOpen(false)}
            style={{
              position: "fixed",
              inset: 0,
              zIndex: 190,
              backgroundColor:
                "color-mix(in srgb, var(--color-background) 60%, transparent)",
              backdropFilter: "blur(4px)",
            }}
          />
          {/* Drawer panel */}
          <div
            role="dialog"
            aria-label="Navigation menu"
            style={{
              position: "fixed",
              top: "68px",
              left: 0,
              right: 0,
              zIndex: 195,
              backgroundColor: "var(--color-surface)",
              borderBottom: "1px solid var(--color-border)",
              padding: "1.5rem",
              display: "flex",
              flexDirection: "column",
              gap: "0.25rem",
            }}
          >
            {navLinks.map((item) => {
              const isActive =
                pathname === item.path || pathname.startsWith(item.path + "/");
              return (
                <Link
                  key={item.key}
                  href={item.path}
                  aria-current={isActive ? "page" : undefined}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    padding: "0.875rem 1rem",
                    borderRadius: "0.625rem",
                    textDecoration: "none",
                    fontSize: "1rem",
                    fontWeight: isActive ? 700 : 500,
                    color: isActive
                      ? "var(--color-brand)"
                      : "var(--color-text-primary)",
                    backgroundColor: isActive
                      ? "color-mix(in srgb, var(--color-brand) 10%, transparent)"
                      : "transparent",
                  }}
                >
                  {item.label}
                  {isActive && (
                    <span
                      style={{
                        fontSize: "0.75rem",
                        color: "var(--color-brand)",
                      }}
                    >
                      ●
                    </span>
                  )}
                </Link>
              );
            })}

            {/* Theme control in drawer */}
            <div
              style={{
                marginTop: "1rem",
                paddingTop: "1rem",
                borderTop: "1px solid var(--color-border)",
              }}
            >
              <ThemeControl />
            </div>
          </div>
        </>
      )}
    </>
  );
}
