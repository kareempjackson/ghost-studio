import type { Metadata } from "next";
import { getTrackPage } from "@/sanity/content";
import { TrackPage, trackMetadata } from "../_components/TrackPage";

export async function generateMetadata(): Promise<Metadata> {
  return trackMetadata(await getTrackPage("build"));
}

/**
 * `/build` — the standing team, set in the track template like the other
 * two. Its claim keeps the larger cover it was comped at.
 */
export default async function Build() {
  return <TrackPage data={await getTrackPage("build")} size="lg" />;
}
