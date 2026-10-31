import { shareImage, shareImageMetadata } from "@/lib/og";
import { getPageShare } from "@/sanity/content";

/** Until the Studio has the page's document: its name, as it always was. */
const FALLBACK = { label: "Brand", title: "Brand system" };

/** The card, described: its alt text from the page's SEO fields or its name. See lib/og.tsx. */
export async function generateImageMetadata() {
  return shareImageMetadata((await getPageShare("brandPage")) ?? FALLBACK);
}

/** The brand system's share card: its social image from the Studio, or the brand card with its name. */
export default async function Image() {
  return shareImage((await getPageShare("brandPage")) ?? FALLBACK);
}
