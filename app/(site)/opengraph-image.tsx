import { shareImage, shareImageMetadata } from "@/lib/og";
import { getHomeShare } from "@/sanity/content";

/** The card, described: the alt text set with the home page's social image, or what the brand card says. See lib/og.tsx. */
export async function generateImageMetadata() {
  return shareImageMetadata(await getHomeShare(), (name) => name);
}

/** The home page's share card: the social image set in the Studio, or the brand card as it is. */
export default async function Image() {
  return shareImage(await getHomeShare());
}
