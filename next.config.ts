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
    /* A page's address has no trailing slash: /work/ is /work. Next would
       say so itself, but not to PostHog (below). */
    { source: "/:path((?!ingest/).+)/", destination: "/:path", permanent: true },
  ],
  /* PostHog's paths end in a slash (/e/, /flags/), and a redirect would
     lose what is posted to them: passed on as they are. */
  skipTrailingSlashRedirect: true,
  /* An insight or a case study as Markdown, for agents (lib/markdown.ts):
     at its address plus .md, or at the address itself for a request that
     accepts text/markdown. Before the files, so the page cannot answer first. */
  rewrites: async () => ({
    beforeFiles: ["insights", "work"].flatMap((section) => [
      { source: `/${section}/:slug\\.md`, destination: `/md/${section}/:slug` },
      {
        source: `/${section}/:slug`,
        has: [{ type: "header" as const, key: "accept", value: ".*text/markdown.*" }],
        destination: `/md/${section}/:slug`,
      },
    ]),
    /* PostHog, through the site's own address, so blockers of PostHog's own
       don't silence it (app/(site)/_components/Tracking.tsx): /ingest/us or
       /ingest/eu, for the cloud chosen in Site settings. */
    afterFiles: ["us", "eu"].flatMap((cloud) => [
      { source: `/ingest/${cloud}/static/:path*`, destination: `https://${cloud}-assets.i.posthog.com/static/:path*` },
      { source: `/ingest/${cloud}/array/:path*`, destination: `https://${cloud}-assets.i.posthog.com/array/:path*` },
      { source: `/ingest/${cloud}/:path*`, destination: `https://${cloud}.i.posthog.com/:path*` },
    ]),
  }),
};

export default nextConfig;
