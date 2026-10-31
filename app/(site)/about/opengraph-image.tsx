import { shareImage, shareImageMetadata } from "@/lib/og";
import { getPageShare } from "@/sanity/content";

/** The card, described: its alt text from the page's SEO fields or its name. See lib/og.tsx. */
export async function generateImageMetadata() {
  return shareImageMetadata(await getPageShare("aboutPage"));
}

/** The page's share card, from its heading or its own social image: see lib/og.tsx. */
export default async function Image() {
  return shareImage(await getPageShare("aboutPage"));
}
