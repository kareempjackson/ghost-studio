import { givesPage } from "@/lib/family-pages";
import { FamilyPage, familyMetadata } from "../_components/FamilyPage";

/** `/ghost-gives` — where the studio gives the work away; see lib/family-pages.ts. */
export const metadata = familyMetadata(givesPage);

export default function GhostGives() {
  return <FamilyPage page={givesPage} />;
}
