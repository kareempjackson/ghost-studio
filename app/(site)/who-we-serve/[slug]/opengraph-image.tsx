import { shareImage } from "@/lib/og";
import { getAudienceShare } from "@/sanity/content";

export const alt = "Who Ghost Savvy Studios works with";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

/** The audience's share card: its picture, or the brand card with its heading. See lib/og.tsx. */
export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  return shareImage(await getAudienceShare((await params).slug));
}
