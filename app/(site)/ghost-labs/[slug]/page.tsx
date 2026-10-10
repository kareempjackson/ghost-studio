import type { Metadata } from "next";
import { StoryPage, storyMetadata, storyParams } from "../../_components/StoryPage";

export function generateStaticParams() {
  return storyParams("ghost-labs");
}

export async function generateMetadata({
  params,
}: PageProps<"/ghost-labs/[slug]">): Promise<Metadata> {
  return storyMetadata("ghost-labs", (await params).slug);
}

/** `/ghost-labs/[slug]` — an experiment from Ghost Labs, as a story. */
export default async function GhostLabsStory({ params }: PageProps<"/ghost-labs/[slug]">) {
  return <StoryPage family="ghost-labs" slug={(await params).slug} />;
}
