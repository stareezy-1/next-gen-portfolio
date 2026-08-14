import { ImageResponse } from "next/og";

import { AUTHOR_NAME } from "@/constants/seo";

export const runtime = "edge";
export const alt = `${AUTHOR_NAME} — Front-End & AI-Native Engineer`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const COLORS = {
  background: "#071016",
  border: "#1B3041",
  brand: "#2DD4A7",
  primary: "#E9F2F1",
  secondary: "#93A8AD",
  muted: "#8497A0",
} as const;

const MONO = "ui-monospace, SFMono-Regular, Menlo, Consolas, monospace";
const DISPLAY = "Arial, Helvetica, sans-serif";

export default function OgImage() {
  return new ImageResponse(
    (
      <div
        style={{
          position: "relative",
          display: "flex",
          width: "100%",
          height: "100%",
          overflow: "hidden",
          backgroundColor: COLORS.background,
          color: COLORS.primary,
          fontFamily: DISPLAY,
        }}
      >
        <div
          style={{
            position: "absolute",
            top: "56px",
            left: "72px",
            right: "72px",
            height: "1px",
            display: "flex",
            backgroundColor: COLORS.border,
          }}
        />
        <div
          style={{
            position: "absolute",
            bottom: "56px",
            left: "72px",
            right: "72px",
            height: "1px",
            display: "flex",
            backgroundColor: COLORS.border,
          }}
        />
        <div
          style={{
            position: "absolute",
            top: "96px",
            bottom: "96px",
            left: "72px",
            width: "4px",
            display: "flex",
            backgroundColor: COLORS.brand,
          }}
        />
        <div
          style={{
            position: "absolute",
            top: "56px",
            bottom: "56px",
            left: "824px",
            width: "1px",
            display: "flex",
            backgroundColor: COLORS.border,
          }}
        />

        <div
          style={{
            position: "absolute",
            top: "92px",
            left: "104px",
            display: "flex",
            color: COLORS.brand,
            fontFamily: MONO,
            fontSize: "16px",
            fontWeight: 600,
            letterSpacing: "4px",
          }}
        >
          PORTFOLIO / 01
        </div>

        <div
          style={{
            position: "absolute",
            top: "196px",
            left: "104px",
            display: "flex",
            color: COLORS.muted,
            fontFamily: MONO,
            fontSize: "15px",
            fontWeight: 600,
            letterSpacing: "3px",
          }}
        >
          FRONT-END · FULL-STACK · OPEN SOURCE
        </div>

        <div
          style={{
            position: "absolute",
            top: "244px",
            left: "104px",
            display: "flex",
            flexDirection: "column",
            fontSize: "72px",
            fontWeight: 700,
            letterSpacing: "-3px",
            lineHeight: 1.08,
          }}
        >
          <span>Muhammad Bintang</span>
          <div style={{ display: "flex", alignItems: "flex-end" }}>
            <span>Al Akbar</span>
            <span
              style={{
                width: "16px",
                height: "16px",
                marginBottom: "11px",
                marginLeft: "8px",
                display: "flex",
                borderRadius: "50%",
                backgroundColor: COLORS.brand,
              }}
            />
          </div>
        </div>

        <div
          style={{
            position: "absolute",
            top: "425px",
            left: "104px",
            display: "flex",
            color: COLORS.secondary,
            fontSize: "23px",
          }}
        >
          I build complete products, front end to the edge.
        </div>

        <div
          style={{
            position: "absolute",
            bottom: "77px",
            left: "104px",
            display: "flex",
            color: COLORS.muted,
            fontFamily: MONO,
            fontSize: "14px",
            letterSpacing: "2px",
          }}
        >
          JAKARTA, INDONESIA
        </div>
        <div
          style={{
            position: "absolute",
            right: "606px",
            bottom: "77px",
            display: "flex",
            color: COLORS.brand,
            fontFamily: MONO,
            fontSize: "14px",
            letterSpacing: "2px",
          }}
        >
          STAREEZY.TECH
        </div>

        <div
          style={{
            position: "absolute",
            top: "92px",
            left: "862px",
            display: "flex",
            color: COLORS.muted,
            fontFamily: MONO,
            fontSize: "16px",
            fontWeight: 600,
            letterSpacing: "4px",
          }}
        >
          MB / ENGINEER
        </div>
        <div
          style={{
            position: "absolute",
            top: "168px",
            left: "850px",
            display: "flex",
            alignItems: "flex-end",
            fontSize: "244px",
            fontWeight: 700,
            letterSpacing: "-18px",
            lineHeight: 1,
          }}
        >
          <span>B</span>
          <span
            style={{
              width: "36px",
              height: "36px",
              marginBottom: "27px",
              marginLeft: "8px",
              display: "flex",
              borderRadius: "50%",
              backgroundColor: COLORS.brand,
            }}
          />
        </div>
        <div
          style={{
            position: "absolute",
            bottom: "77px",
            left: "862px",
            display: "flex",
            color: COLORS.muted,
            fontFamily: MONO,
            fontSize: "14px",
            letterSpacing: "2px",
          }}
        >
          BUILD / SHIP / CONTRIBUTE
        </div>
      </div>
    ),
    { ...size },
  );
}
