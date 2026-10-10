import type { Metadata } from "next";
import { StoryPage, storyMetadata, storyParams } from "../../_components/StoryPage";

export function generateStaticParams() {
  return storyParams("ghost-u");
}

export async function generateMetadata({
  params,
}: PageProps<"/ghost-u/[slug]">): Promise<Metadata> {
  return storyMetadata("ghost-u", (await params).slug);
}

/** `/ghost-u/[slug]` — a cohort of Ghost U, as a story. */
export default async function GhostUStory({ params }: PageProps<"/ghost-u/[slug]">) {
  return <StoryPage family="ghost-u" slug={(await params).slug} />;
}
