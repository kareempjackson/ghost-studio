import { shareImage } from "@/lib/og";
import { getPhaseShare } from "@/sanity/content";

export const alt = "A phase of the Ghost Savvy Studios approach";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

/** The phase's share card: its picture, or the brand card with its heading. See lib/og.tsx. */
export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  return shareImage(await getPhaseShare((await params).slug));
}
