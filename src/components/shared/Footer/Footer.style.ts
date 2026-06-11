import type { CSSProperties } from "react";

export const footerStyles: CSSProperties = {
  borderTop: "1px solid var(--color-border)",
  backgroundColor: "var(--color-surface)",
  marginTop: "auto",
};

export const footerInnerStyles: CSSProperties = {
  display: "flex",
  flexDirection: "column",
  paddingTop: "3rem",
  paddingBottom: "2rem",
  gap: "2rem",
};

export const footerTopStyles: CSSProperties = {
  display: "flex",
  flexWrap: "wrap",
  gap: "3rem",
  justifyContent: "space-between",
};

export const footerBrandStyles: CSSProperties = {
  display: "flex",
  flexDirection: "column",
  gap: "0.75rem",
  maxWidth: "320px",
};

export const footerBrandNameStyles: CSSProperties = {
  fontSize: "1.0625rem",
  fontWeight: 800,
  color: "var(--color-text-primary)",
  letterSpacing: "-0.025em",
};

export const footerBrandTaglineStyles: CSSProperties = {
  fontSize: "0.9375rem",
  color: "var(--color-text-secondary)",
  lineHeight: 1.6,
  margin: 0,
};

export const footerNavStyles: CSSProperties = {
  display: "flex",
  flexDirection: "column",
  gap: "0.75rem",
};

export const footerNavTitleStyles: CSSProperties = {
  fontSize: "0.6875rem",
  fontWeight: 700,
  textTransform: "uppercase",
  letterSpacing: "0.12em",
  color: "var(--color-text-muted)",
  margin: 0,
  fontFamily: "var(--font-mono), monospace",
  paddingBottom: "0.5rem",
  borderBottom: "1px solid var(--color-border)",
};

export const footerNavListStyles: CSSProperties = {
  display: "flex",
  flexDirection: "column",
  gap: "0.5rem",
  listStyle: "none",
  margin: 0,
  padding: 0,
};

export const footerNavLinkStyles: CSSProperties = {
  fontSize: "0.9375rem",
  color: "var(--color-text-secondary)",
  textDecoration: "none",
  transition: "color 0.2s ease",
};

export const footerSocialStyles: CSSProperties = {
  display: "flex",
  gap: "0.75rem",
  marginTop: "0.5rem",
};

export const footerSocialLinkStyles: CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  width: "2.25rem",
  height: "2.25rem",
  borderRadius: "0.5rem",
  border: "1px solid var(--color-border)",
  backgroundColor: "var(--color-surface-elevated)",
  color: "var(--color-text-secondary)",
  fontSize: "0.875rem",
  fontWeight: 700,
  textDecoration: "none",
  transition: "border-color 0.2s ease, color 0.2s ease",
};

export const footerDividerStyles: CSSProperties = {
  height: "1px",
  backgroundColor: "var(--color-border)",
};

export const footerBottomStyles: CSSProperties = {
  display: "flex",
  flexWrap: "wrap",
  justifyContent: "space-between",
  gap: "0.5rem",
};

export const footerCopyrightStyles: CSSProperties = {
  fontSize: "0.8125rem",
  color: "var(--color-text-muted)",
  margin: 0,
};
