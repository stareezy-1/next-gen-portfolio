import React from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  cleanup,
  fireEvent,
  render,
  screen,
  within,
} from "@testing-library/react";
import { renderToStaticMarkup } from "react-dom/server";
import { Nav } from "@/components/shared/Nav/Nav";
import { ScrollReveal } from "@/components/shared/ScrollReveal";

vi.mock("next/navigation", () => ({ usePathname: () => "/" }));
vi.mock("next/link", () => ({
  default: ({ children, ...props }: React.ComponentProps<"a">) => (
    <a {...props}>{children}</a>
  ),
}));
vi.mock("@/components/shared/ThemeControl", () => ({
  ThemeControl: () => <button type="button">Theme</button>,
}));

beforeEach(() => {
  vi.stubGlobal(
    "matchMedia",
    vi.fn(() => ({
      matches: false,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    })),
  );
});
afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
  document.body.style.overflow = "";
});

describe("Studio navigation", () => {
  it("contains keyboard focus and restores it when Escape dismisses the menu", () => {
    render(<Nav />);
    const toggle = screen.getByRole("button", { name: "Open menu" });
    fireEvent.click(toggle);
    const dialog = screen.getByRole("dialog", { name: "Navigation menu" });
    const close = within(dialog).getByRole("button", { name: "Close ×" });
    const last = within(dialog).getByRole("button", { name: "Theme" });
    expect(close).toHaveFocus();
    expect(document.body.style.overflow).toBe("hidden");
    fireEvent.keyDown(close, { key: "Tab", shiftKey: true });
    expect(last).toHaveFocus();
    fireEvent.keyDown(last, { key: "Tab" });
    expect(close).toHaveFocus();
    fireEvent.keyDown(close, { key: "Escape" });
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    expect(toggle).toHaveFocus();
    expect(toggle).toHaveAttribute("aria-expanded", "false");
    expect(document.body.style.overflow).toBe("");
  });

  it("closes the drawer even when choosing the current route", () => {
    render(<Nav />);
    fireEvent.click(screen.getByRole("button", { name: "Open menu" }));
    fireEvent.click(
      within(screen.getByRole("dialog")).getByRole("link", { name: /Home/ }),
    );
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    expect(document.body.style.overflow).toBe("");
  });

  it("restores the previous scroll setting on unmount", () => {
    document.body.style.overflow = "auto";
    const result = render(<Nav />);
    fireEvent.click(screen.getByRole("button", { name: "Open menu" }));
    result.unmount();
    expect(document.body.style.overflow).toBe("auto");
  });
});

it("server renders reveal content without a hidden inline state", () => {
  const html = renderToStaticMarkup(
    <ScrollReveal as="section">
      <h2>Preserved content</h2>
    </ScrollReveal>,
  );
  expect(html).toContain("Preserved content");
  expect(html).toContain('data-studio-reveal="fade-up"');
  expect(html).not.toMatch(/opacity:\s*0|visibility:\s*hidden|display:\s*none/);
});
