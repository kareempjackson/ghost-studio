import { shareImage } from "@/lib/og";
import { getPageShare } from "@/sanity/content";

export const alt = "Contact — Ghost Savvy Studios";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

/** The page's share card, from its heading or its own social image: see lib/og.tsx. */
export default async function Image() {
  return shareImage(await getPageShare("contactPage"));
}
