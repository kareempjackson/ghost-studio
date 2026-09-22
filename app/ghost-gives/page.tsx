import { scaffoldPages } from "@/lib/scaffold";
import { ScaffoldPage, scaffoldMetadata } from "../_components/ScaffoldPage";

/** `/ghost-gives` — scaffold with test content; see lib/scaffold.ts. */
const page = scaffoldPages["ghost-gives"];

export const metadata = scaffoldMetadata(page);

export default function GhostGives() {
  return <ScaffoldPage page={page} />;
}
