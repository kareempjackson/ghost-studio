import { scaffoldPages } from "@/lib/scaffold";
import { ScaffoldPage, scaffoldMetadata } from "../_components/ScaffoldPage";

/** `/build` — scaffold with test content; see lib/scaffold.ts. */
const page = scaffoldPages.build;

export const metadata = scaffoldMetadata(page);

export default function Build() {
  return <ScaffoldPage page={page} />;
}
