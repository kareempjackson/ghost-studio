import { scaffoldPages } from "@/lib/scaffold";
import { ScaffoldPage, scaffoldMetadata } from "../_components/ScaffoldPage";

/** `/integrate` — scaffold with test content; see lib/scaffold.ts. */
const page = scaffoldPages.integrate;

export const metadata = scaffoldMetadata(page);

export default function Integrate() {
  return <ScaffoldPage page={page} />;
}
