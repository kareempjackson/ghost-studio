import { scaffoldPages } from "@/lib/scaffold";
import { ScaffoldPage, scaffoldMetadata } from "../_components/ScaffoldPage";

/** `/insights` — scaffold with test content; see lib/scaffold.ts. */
const page = scaffoldPages.insights;

export const metadata = scaffoldMetadata(page);

export default function Insights() {
  return <ScaffoldPage page={page} />;
}
