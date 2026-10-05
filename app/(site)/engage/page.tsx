import type { Metadata } from "next";
import { getTrackPage } from "@/sanity/content";
import { TrackPage, trackMetadata } from "../_components/TrackPage";

export async function generateMetadata(): Promise<Metadata> {
  return trackMetadata(await getTrackPage("engage"));
}

/** `/engage` — the scoped project. */
export default async function Engage() {
  return <TrackPage data={await getTrackPage("engage")} />;
}
