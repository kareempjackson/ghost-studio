import "server-only";

import type { Metadata } from "next";
import { stegaClean } from "next-sanity";
import { getSettings } from "@/sanity/content";

/**
 * A page's metadata: its title and description, the address search engines
 * should treat as its own, and the same words for share cards. The share
 * image is the route's opengraph-image (lib/og.tsx), which Next adds itself.
 *
 * Clean of edit marks: in draft mode Sanity's strings carry invisible ones,
 * and these leave the page.
 */
export async function pageMetadata({
  title,
  description,
  path,
}: {
  title: string;
  description?: string | null;
  /** Where the page lives, e.g. /about. */
  path: string;
}): Promise<Metadata> {
  const { title: site } = await getSettings();
  const name = stegaClean(title);
  const summary = description ? stegaClean(description) : undefined;
  return {
    title: name,
    description: summary,
    alternates: { canonical: path },
    openGraph: {
      type: "website",
      siteName: stegaClean(site),
      title: name,
      description: summary,
      url: path,
    },
    twitter: { card: "summary_large_image", title: name, description: summary },
  };
}
