import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { ImageResponse } from "next/og";
import { AUTHOR_NAME } from "@/constants/seo";
import brand from "@/constants/brand.json";

export const runtime = "nodejs";
export const alt = `${AUTHOR_NAME} — Front-End & AI-Native Engineer`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function OgImage() {
  const font = await readFile(
    join(process.cwd(), "public/fonts/SpaceGrotesk-Bold.ttf"),
  );
  return new ImageResponse(
    <div
      style={{
        display: "flex",
        position: "relative",
        width: "100%",
        height: "100%",
        overflow: "hidden",
        background: brand.background,
        color: brand.foreground,
        fontFamily: "sans-serif",
      }}
    >
      <svg
        width="1200"
        height="630"
        viewBox="0 0 1200 630"
        style={{ position: "absolute", top: 0, left: 0 }}
      >
        <g fill="none" stroke={brand.border} strokeWidth="1">
          <ellipse
            cx="600"
            cy="315"
            rx="590"
            ry="195"
            transform="rotate(-23 600 315)"
          />
          <ellipse
            cx="600"
            cy="315"
            rx="380"
            ry="365"
            transform="rotate(28 600 315)"
          />
          <path d="M40 78H1160M40 550H1160" />
        </g>
        <path
          d="M820 60Q1050 140 1100 310"
          fill="none"
          stroke={brand.accent}
          opacity=".6"
        />
      </svg>
      <div
        style={{
          display: "flex",
          position: "absolute",
          top: 30,
          left: 52,
          right: 52,
          justifyContent: "space-between",
          fontSize: 13,
          letterSpacing: 2,
          color: brand.secondary,
        }}
      >
        <span>FRONT-END &amp; AI-NATIVE ENGINEER</span>
        <span>JAKARTA, INDONESIA</span>
      </div>
      <div
        style={{
          display: "flex",
          position: "absolute",
          top: 175,
          left: 80,
          right: 80,
          alignItems: "center",
          justifyContent: "center",
          fontSize: 158,
          fontFamily: "Space Grotesk",
          fontWeight: 700,
          letterSpacing: -10,
          lineHeight: 1,
        }}
      >
        <span>BINTANG</span>
        <svg
          width="95"
          height="95"
          viewBox="0 0 100 100"
          style={{ marginLeft: 24, marginTop: 18 }}
        >
          <path
            d="M50 5V95M5 50H95M18 18L82 82M18 82L82 18"
            fill="none"
            stroke={brand.foreground}
            strokeWidth="5"
          />
        </svg>
      </div>
      <div
        style={{
          display: "flex",
          position: "absolute",
          top: 370,
          left: 60,
          right: 60,
          justifyContent: "center",
          fontSize: 32,
          letterSpacing: -1,
        }}
      >
        I build complete products, front-end to the edge.
      </div>
      <div
        style={{
          display: "flex",
          position: "absolute",
          top: 432,
          left: 60,
          right: 60,
          justifyContent: "center",
          fontSize: 20,
          color: brand.muted,
        }}
      >
        {AUTHOR_NAME}
      </div>
      <div
        style={{
          display: "flex",
          position: "absolute",
          bottom: 30,
          left: 52,
          right: 52,
          justifyContent: "space-between",
          fontSize: 13,
          letterSpacing: 2,
          color: brand.secondary,
        }}
      >
        <span>WSA GLOBAL WINNER · 2025</span>
        <span>STAREEZY.TECH</span>
      </div>
    </div>,
    {
      ...size,
      fonts: [
        { name: "Space Grotesk", data: font, weight: 700, style: "normal" },
      ],
    },
  );
}
