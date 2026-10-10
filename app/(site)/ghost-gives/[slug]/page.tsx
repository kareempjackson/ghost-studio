import type { Metadata } from "next";
import { StoryPage, storyMetadata, storyParams } from "../../_components/StoryPage";

export function generateStaticParams() {
  return storyParams("ghost-gives");
}

export async function generateMetadata({
  params,
}: PageProps<"/ghost-gives/[slug]">): Promise<Metadata> {
  return storyMetadata("ghost-gives", (await params).slug);
}

/** `/ghost-gives/[slug]` — a project Ghost Gives gave away, as a story. */
export default async function GhostGivesStory({ params }: PageProps<"/ghost-gives/[slug]">) {
  return <StoryPage family="ghost-gives" slug={(await params).slug} />;
}
