import type { MetadataRoute } from "next";
import { SITE_URL, absoluteUrl } from "@/lib/site";

/**
 * /robots.txt: the whole site, but not the Studio, the client portal or the
 * API, and where the sitemap is. Nor /md/, where the Markdown copies are
 * served from: they are read at their pages' addresses plus .md. Nor
 * /ingest/, PostHog's way in, or /book and /deck, which only lead elsewhere.
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: "*", allow: "/", disallow: ["/studio", "/portal", "/api/", "/md/", "/ingest/", "/book", "/deck"] },
    sitemap: absoluteUrl("/sitemap.xml"),
    host: SITE_URL,
  };
}
