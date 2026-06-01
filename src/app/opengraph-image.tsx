import { ImageResponse } from "next/og";
import { SITE_URL, AUTHOR_NAME } from "@/constants/seo";

export const runtime = "edge";
export const alt = `${AUTHOR_NAME} — Senior Front-End & Mobile Engineer`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OgImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "flex-start",
          justifyContent: "center",
          background:
            "linear-gradient(135deg, #050505 0%, #0a0a1a 50%, #050505 100%)",
          padding: "80px",
          fontFamily: "system-ui, -apple-system, sans-serif",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Grid pattern */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            backgroundImage:
              "linear-gradient(rgba(0,255,136,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(0,255,136,0.04) 1px, transparent 1px)",
            backgroundSize: "60px 60px",
            display: "flex",
          }}
        />

        {/* Top accent bar */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            height: "4px",
            background: "linear-gradient(90deg, #00ff88, #7c3aed)",
            display: "flex",
          }}
        />

        {/* Glow orb */}
        <div
          style={{
            position: "absolute",
            top: "-100px",
            right: "-100px",
            width: "500px",
            height: "500px",
            borderRadius: "50%",
            background:
              "radial-gradient(circle, rgba(0,255,136,0.12) 0%, transparent 70%)",
            display: "flex",
          }}
        />

        {/* Available badge */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
            padding: "8px 20px",
            border: "1px solid rgba(0,255,136,0.4)",
            borderRadius: "9999px",
            backgroundColor: "rgba(0,255,136,0.08)",
            marginBottom: "32px",
          }}
        >
          <div
            style={{
              width: "8px",
              height: "8px",
              borderRadius: "50%",
              backgroundColor: "#00ff88",
              display: "flex",
            }}
          />
          <span style={{ color: "#00ff88", fontSize: "16px", fontWeight: 600 }}>
            Available for new projects
          </span>
        </div>

        {/* Name */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "8px",
            marginBottom: "24px",
          }}
        >
          <span
            style={{
              fontSize: "72px",
              fontWeight: 900,
              color: "#ffffff",
              letterSpacing: "-2px",
              lineHeight: 1,
            }}
          >
            Muhammad Bintang
          </span>
          <span
            style={{
              fontSize: "72px",
              fontWeight: 900,
              background: "linear-gradient(90deg, #00ff88, #00cc6a)",
              backgroundClip: "text",
              color: "transparent",
              letterSpacing: "-2px",
              lineHeight: 1,
            }}
          >
            Al Akbar
          </span>
        </div>

        {/* Role */}
        <span
          style={{
            fontSize: "28px",
            color: "#aaaaaa",
            marginBottom: "48px",
            fontWeight: 500,
          }}
        >
          Senior Front-End &amp; Mobile Engineer · WSA Global Winner
        </span>

        {/* Tech pills */}
        <div
          style={{
            display: "flex",
            gap: "12px",
            flexWrap: "wrap",
            marginBottom: "48px",
          }}
        >
          {[
            "React",
            "React Native",
            "TypeScript",
            "Next.js",
            "Expo",
            "AWS Amplify",
          ].map((tech) => (
            <div
              key={tech}
              style={{
                padding: "8px 20px",
                backgroundColor: "rgba(255,255,255,0.06)",
                border: "1px solid rgba(255,255,255,0.12)",
                borderRadius: "9999px",
                color: "#aaaaaa",
                fontSize: "18px",
                display: "flex",
              }}
            >
              {tech}
            </div>
          ))}
        </div>

        {/* Stats */}
        <div style={{ display: "flex", gap: "48px" }}>
          {[
            { value: "3+", label: "Years Experience" },
            { value: "9+", label: "Projects Shipped" },
            { value: "WSA", label: "Global Winner" },
          ].map((stat) => (
            <div
              key={stat.label}
              style={{ display: "flex", flexDirection: "column", gap: "4px" }}
            >
              <span
                style={{
                  fontSize: "40px",
                  fontWeight: 800,
                  color: "#00ff88",
                  lineHeight: 1,
                }}
              >
                {stat.value}
              </span>
              <span style={{ fontSize: "16px", color: "#666666" }}>
                {stat.label}
              </span>
            </div>
          ))}
        </div>

        {/* URL bottom right */}
        <div
          style={{
            position: "absolute",
            bottom: "48px",
            right: "80px",
            color: "#444444",
            fontSize: "20px",
            display: "flex",
          }}
        >
          stareezy.tech
        </div>
      </div>
    ),
    { ...size },
  );
}
