import { scaffoldPages } from "@/lib/scaffold";
import { ScaffoldPage, scaffoldMetadata } from "../_components/ScaffoldPage";

/** `/our-approach` — scaffold with test content; see lib/scaffold.ts. */
const page = scaffoldPages["our-approach"];

export const metadata = scaffoldMetadata(page);

export default function OurApproach() {
  return <ScaffoldPage page={page} />;
}
