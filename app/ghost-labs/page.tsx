import { scaffoldPages } from "@/lib/scaffold";
import { ScaffoldPage, scaffoldMetadata } from "../_components/ScaffoldPage";

/** `/ghost-labs` — scaffold with test content; see lib/scaffold.ts. */
const page = scaffoldPages["ghost-labs"];

export const metadata = scaffoldMetadata(page);

export default function GhostLabs() {
  return <ScaffoldPage page={page} />;
}
