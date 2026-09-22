import { scaffoldPages } from "@/lib/scaffold";
import { ScaffoldPage, scaffoldMetadata } from "../_components/ScaffoldPage";

/** `/ghost-u` — scaffold with test content; see lib/scaffold.ts. */
const page = scaffoldPages["ghost-u"];

export const metadata = scaffoldMetadata(page);

export default function GhostU() {
  return <ScaffoldPage page={page} />;
}
