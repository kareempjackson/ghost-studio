import { shareImage } from "@/lib/og";
import { getProjectShare } from "@/sanity/content";

export const alt = "A project by Ghost Savvy Studios";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

/** The project's share card: its featured image, or the brand card with its name. See lib/og.tsx and getProjectShare. */
export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  return shareImage(await getProjectShare((await params).slug));
}
