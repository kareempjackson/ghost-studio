import { shareImage } from "@/lib/og";
import { getStoryShare } from "@/sanity/content";

export const alt = "A Ghost Labs story from Ghost Savvy Studios";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

/** The story's share card: its featured image, or the brand card with its name. See lib/og.tsx and getStoryShare. */
export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  return shareImage(await getStoryShare("ghost-labs", (await params).slug));
}
