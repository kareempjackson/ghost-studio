import type { MetadataRoute } from "next";
import { absoluteUrl } from "@/lib/site";
import { getSitemapEntries } from "@/sanity/content";

/**
 * /sitemap.xml: every published page, from Sanity, with when it last
 * changed. A new insight or project is listed as soon as it is published.
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const entries = await getSitemapEntries();
  return entries
    .sort((a, b) => a.path.localeCompare(b.path))
    .map(({ path, updatedAt }) => ({
      url: absoluteUrl(path),
      lastModified: updatedAt,
      ...(path === "/" ? { priority: 1 } : {}),
    }));
}
