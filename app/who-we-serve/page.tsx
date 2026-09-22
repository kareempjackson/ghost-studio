import { scaffoldPages } from "@/lib/scaffold";
import { ScaffoldPage, scaffoldMetadata } from "../_components/ScaffoldPage";

/** `/who-we-serve` — scaffold with test content; see lib/scaffold.ts. */
const page = scaffoldPages["who-we-serve"];

export const metadata = scaffoldMetadata(page);

export default function WhoWeServe() {
  return <ScaffoldPage page={page} />;
}
