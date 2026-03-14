import type { NextConfig } from "next";
import withBundleAnalyzer from "@next/bundle-analyzer";

const nextConfig: NextConfig = {
  allowedDevOrigins: ["http://192.168.0.100:3000"],
  compress: true,
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "lqlobokdwcebvoitwxkt.supabase.co",
        port: "",
        pathname: "/storage/v1/object/public/**",
      },
    ],
  },
  async rewrites() {
    return [];
  },
  async headers() {
    const headers = [
      {
        // Security headers for ALL routes (no caching override here)
        source: "/(.*)",
        headers: [
          {
            key: "Content-Security-Policy",
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-eval' 'unsafe-inline'",
              "style-src 'self' 'unsafe-inline'",
              "img-src 'self' blob: data: https://lqlobokdwcebvoitwxkt.supabase.co",
              "connect-src 'self' https://lqlobokdwcebvoitwxkt.supabase.co wss://lqlobokdwcebvoitwxkt.supabase.co https://*.supabase.co wss://*.supabase.co https://app.posthog.com https://eu.posthog.com https://eu.i.posthog.com",
              "font-src 'self'",
              "object-src 'none'",
              "base-uri 'self'",
              "form-action 'self'",
              "frame-ancestors 'none'",
              "upgrade-insecure-requests",
            ].join("; "),
          },
          {
            key: "X-Frame-Options",
            value: "DENY",
          },
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          {
            key: "Referrer-Policy",
            value: "strict-origin-when-cross-origin",
          },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=()",
          },
          {
            key: "X-XSS-Protection",
            value: "1; mode=block",
          },
        ],
      },
    ];

    if (process.env.NODE_ENV === "production") {
      headers.push(
        {
          // Next.js static JS/CSS bundles — immutable in production
          source: "/_next/static/(.*)",
          headers: [
            {
              key: "Cache-Control",
              value: "public, max-age=31536000, immutable",
            },
          ],
        },
        {
          // Next.js optimized images
          source: "/_next/image(.*)",
          headers: [
            {
              key: "Cache-Control",
              value: "public, max-age=86400, stale-while-revalidate=604800",
            },
          ],
        },
        {
          // Public static files (fonts, images, webp, etc.)
          source: "/webp%20file/(.*)",
          headers: [
            {
              key: "Cache-Control",
              value: "public, max-age=2592000, stale-while-revalidate=86400",
            },
          ],
        },
        {
          // Fonts
          source: "/fonts/(.*)",
          headers: [
            {
              key: "Cache-Control",
              value: "public, max-age=31536000, immutable",
            },
          ],
        }
      );
    }

    return headers;
  },
};

const analyzer = withBundleAnalyzer({
  enabled: process.env.ANALYZE === 'true',
});

export default analyzer(nextConfig);
