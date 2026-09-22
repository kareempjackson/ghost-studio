import { scaffoldPages } from "@/lib/scaffold";
import { ScaffoldPage, scaffoldMetadata } from "../_components/ScaffoldPage";

/** `/engage` — scaffold with test content; see lib/scaffold.ts. */
const page = scaffoldPages.engage;

export const metadata = scaffoldMetadata(page);

export default function Engage() {
  return <ScaffoldPage page={page} />;
}
