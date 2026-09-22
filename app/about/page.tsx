import { scaffoldPages } from "@/lib/scaffold";
import { ScaffoldPage, scaffoldMetadata } from "../_components/ScaffoldPage";

/** `/about` — scaffold with test content; see lib/scaffold.ts. */
const page = scaffoldPages.about;

export const metadata = scaffoldMetadata(page);

export default function About() {
  return <ScaffoldPage page={page} />;
}
