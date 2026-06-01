import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,

  // Consume the zero-dependency token package through Next's compiler
  transpilePackages: ["@stareezy-ui/tokens"],

  // ── Image optimization ────────────────────────────────────────────────────
  images: {
    formats: ["image/avif", "image/webp"],
    remotePatterns: [
      { protocol: "https", hostname: "res.cloudinary.com" },
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "https", hostname: "picsum.photos" },
      { protocol: "https", hostname: "placehold.co" },
      { protocol: "https", hostname: "example.com" },
    ],
    // Aggressive caching for production
    minimumCacheTTL: 60 * 60 * 24 * 30, // 30 days
  },

  // ── Compression ───────────────────────────────────────────────────────────
  compress: true,

  // ── Power-user: strip X-Powered-By header ────────────────────────────────
  poweredByHeader: false,

  // ── Security & performance headers ───────────────────────────────────────
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "DENY" },
          { key: "X-XSS-Protection", value: "1; mode=block" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=()",
          },
          {
            key: "Strict-Transport-Security",
            value: "max-age=63072000; includeSubDomains; preload",
          },
        ],
      },
      // Long-lived cache for static assets
      {
        source: "/_next/static/(.*)",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
      },
      // Cache public assets (icons, manifest, etc.)
      {
        source:
          "/(favicon\\.svg|favicon\\.png|icon-192\\.svg|icon-512\\.svg|og-image\\.svg|manifest\\.webmanifest)",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=86400, stale-while-revalidate=604800",
          },
        ],
      },
    ];
  },

  // ── Redirects ─────────────────────────────────────────────────────────────
  async redirects() {
    return [
      // Redirect legacy portfolio URLs to new paths
      {
        source: "/resume",
        destination: "/about",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
