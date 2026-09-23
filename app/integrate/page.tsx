import { integratePage } from "@/lib/integrate";
import { TrackPage, trackMetadata } from "../_components/TrackPage";

/** `/integrate` — the operational layer; see lib/integrate.ts. */
export const metadata = trackMetadata(integratePage);

export default function Integrate() {
  return <TrackPage page={integratePage} />;
}
