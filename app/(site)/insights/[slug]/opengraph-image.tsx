import { shareImage } from "@/lib/og";
import { getInsightShare } from "@/sanity/content";

export const alt = "An insight from Ghost Savvy Studios";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

/** The insight's share card: its social image, its cover, or the brand card with its title. See lib/og.tsx. */
export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  return shareImage(await getInsightShare((await params).slug));
}
