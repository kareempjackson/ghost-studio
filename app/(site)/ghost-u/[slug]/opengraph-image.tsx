import { shareImage, shareImageMetadata } from "@/lib/og";
import { getStoryShare } from "@/sanity/content";

/**
 * The card, described: its alt text from the page's SEO fields or its name.
 * See lib/og.tsx. Next also asks for the card's id before any page is
 * known, to list the card's address; then there is no slug to look up, and
 * the id is the same either way.
 */
export async function generateImageMetadata({ params }: { params?: { slug?: string } }) {
  const slug = params?.slug;
  return shareImageMetadata(slug ? await getStoryShare("ghost-u", slug) : null, (name, site) => `${name}, a Ghost U story from ${site}`);
}

/** The story's share card: its social image, its featured image, or the brand card with its name. See lib/og.tsx and getStoryShare. */
export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  return shareImage(await getStoryShare("ghost-u", slug));
}
