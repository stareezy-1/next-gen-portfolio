/**
 * Footer — site-wide footer with links and branding.
 * Server Component — no interactivity needed.
 */

import Link from "next/link";
import { PRIMARY_NAV_ITEMS } from "@/constants/routes";
import { ContentWidth } from "@/components/layouts";
import {
  footerStyles,
  footerInnerStyles,
  footerTopStyles,
  footerBrandStyles,
  footerBrandNameStyles,
  footerBrandTaglineStyles,
  footerNavStyles,
  footerNavTitleStyles,
  footerNavListStyles,
  footerNavLinkStyles,
  footerSocialStyles,
  footerSocialLinkStyles,
  footerBottomStyles,
  footerCopyrightStyles,
  footerDividerStyles,
} from "./Footer.style";

const SOCIAL_LINKS = [
  { label: "GitHub", href: "https://github.com/stareezy-1", icon: "⌥" },
  {
    label: "LinkedIn",
    href: "https://www.linkedin.com/in/muhammad-bintang-al-akbar-72302812a/",
    icon: "in",
  },
  { label: "WhatsApp", href: "https://wa.me/8282260820643", icon: "◈" },
  { label: "Email", href: "mailto:bintangmuhammad12@gmail.com", icon: "✉" },
];

export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer style={footerStyles} role="contentinfo">
      <ContentWidth>
        <div style={footerInnerStyles}>
          <div style={footerTopStyles}>
            {/* Brand */}
            <div style={footerBrandStyles}>
              <span style={footerBrandNameStyles}>Bintang</span>
              <p style={footerBrandTaglineStyles}>
                Full-Stack Engineer building premium digital experiences from
                first principles.
              </p>
              {/* Social links */}
              <div style={footerSocialStyles}>
                {SOCIAL_LINKS.map((s) => (
                  <a
                    key={s.label}
                    href={s.href}
                    style={footerSocialLinkStyles}
                    target={s.href.startsWith("http") ? "_blank" : undefined}
                    rel={
                      s.href.startsWith("http")
                        ? "noopener noreferrer"
                        : undefined
                    }
                    aria-label={s.label}
                  >
                    {s.icon}
                  </a>
                ))}
              </div>
            </div>

            {/* Nav links */}
            <nav style={footerNavStyles} aria-label="Footer navigation">
              <p style={footerNavTitleStyles}>Navigation</p>
              <ul style={footerNavListStyles} role="list">
                {PRIMARY_NAV_ITEMS.map((item) => (
                  <li key={item.key}>
                    <Link href={item.path} style={footerNavLinkStyles}>
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>

            {/* Open source */}
            <nav style={footerNavStyles} aria-label="Open source projects">
              <p style={footerNavTitleStyles}>Open Source</p>
              <ul style={footerNavListStyles} role="list">
                <li>
                  <a
                    href="https://ui.stareezy.tech"
                    target="_blank"
                    rel="noopener noreferrer"
                    style={footerNavLinkStyles}
                  >
                    @stareezy-ui ↗
                  </a>
                </li>
                <li>
                  <a
                    href="https://aurora.stareezy.tech"
                    target="_blank"
                    rel="noopener noreferrer"
                    style={footerNavLinkStyles}
                  >
                    Aurora PDF ↗
                  </a>
                </li>
              </ul>
            </nav>
          </div>

          <div style={footerDividerStyles} />

          {/* Bottom bar */}
          <div style={footerBottomStyles}>
            <p style={footerCopyrightStyles}>
              © {year} Built with Next.js 16 &amp; React 19.
            </p>
            <p style={footerCopyrightStyles}>
              UI powered by{" "}
              <a
                href="https://ui.stareezy.tech"
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  color: "var(--color-brand)",
                  textDecoration: "none",
                  fontWeight: 600,
                }}
              >
                @stareezy-ui
              </a>
            </p>
          </div>
        </div>
      </ContentWidth>
    </footer>
  );
}
