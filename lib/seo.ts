import "server-only";

import type { Metadata } from "next";
import { stegaClean } from "next-sanity";
import { getSettings } from "@/sanity/content";
import { markdownHref } from "./links";

/**
 * A page's metadata, from its SEO fields in the Studio: its search title,
 * description and whether it is hidden from search engines; the address
 * search engines should treat as its own; and the same words for share
 * cards. The share image is the route's opengraph-image (lib/og.tsx), which
 * Next adds itself.
 *
 * The search title is the whole title, as written. Without one, the page's
 * name is the title and the layout's template adds the site's name.
 *
 * Clean of edit marks: in draft mode Sanity's strings carry invisible ones,
 * and these leave the page.
 */
export async function pageMetadata({
  title,
  metaTitle,
  description,
  path,
  markdown = false,
  noindex = false,
}: {
  /** The page's name. */
  title: string;
  /** The search title an editor set, used as written. */
  metaTitle?: string | null;
  description?: string | null;
  /** Where the page lives, e.g. /about. */
  path: string;
  /** Whether it has a Markdown copy for agents, linked from its head (lib/markdown.ts). */
  markdown?: boolean;
  /** Kept out of search results: hidden in the Studio, or live but not yet on show. */
  noindex?: boolean;
}): Promise<Metadata> {
  const { title: site } = await getSettings();
  const name = stegaClean(title);
  const whole = metaTitle ? stegaClean(metaTitle) : null;
  const summary = description ? stegaClean(description) : undefined;
  return {
    title: whole ? { absolute: whole } : name,
    description: summary,
    ...(noindex ? { robots: { index: false, follow: true } } : {}),
    alternates: {
      canonical: path,
      ...(markdown ? { types: { "text/markdown": markdownHref(path) } } : {}),
    },
    openGraph: {
      type: "website",
      siteName: stegaClean(site),
      title: whole ?? name,
      description: summary,
      url: path,
    },
    twitter: { card: "summary_large_image", title: whole ?? name, description: summary },
  };
}
