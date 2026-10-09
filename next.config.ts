import type { NextConfig } from "next";
import { sanity } from "next-sanity/live/cache-life";

const nextConfig: NextConfig = {
  cacheComponents: true,
  /* Content is cached until Sanity Live or the webhook says it changed. */
  cacheLife: { default: sanity },
  images: {
    remotePatterns: [{ protocol: "https", hostname: "cdn.sanity.io" }],
  },
  /* The share cards read their fonts and the brand card from disk
     (lib/og.tsx): ship them with every route, so a card for a page
     published after the build still renders. */
  outputFileTracingIncludes: {
    "/**": [
      "./lib/og/card.png",
      "./public/fonts/DMSans-Medium.ttf",
      "./public/fonts/Arial-Regular.ttf",
    ],
  },
  /* Each insight used to live at /journal/[slug]; links already out there
     still land on it. */
  redirects: async () => [
    { source: "/journal", destination: "/insights", permanent: true },
    { source: "/journal/:slug", destination: "/insights/:slug", permanent: true },
  ],
};

export default nextConfig;
