import type { Metadata } from "next";
import { getTrackPage } from "@/sanity/content";
import { TrackPage, trackMetadata } from "../_components/TrackPage";

export async function generateMetadata(): Promise<Metadata> {
  return trackMetadata(await getTrackPage("integrate"));
}

/** `/integrate` — the operational layer. */
export default async function Integrate() {
  return <TrackPage data={await getTrackPage("integrate")} />;
}
