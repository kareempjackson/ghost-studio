import { engagePage } from "@/lib/engage";
import { TrackPage, trackMetadata } from "../_components/TrackPage";

/** `/engage` — the scoped project; see lib/engage.ts. */
export const metadata = trackMetadata(engagePage);

export default function Engage() {
  return <TrackPage page={engagePage} />;
}
