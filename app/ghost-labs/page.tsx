import { labsPage } from "@/lib/family-pages";
import { FamilyPage, familyMetadata } from "../_components/FamilyPage";

/** `/ghost-labs` — where the studio experiments; see lib/family-pages.ts. */
export const metadata = familyMetadata(labsPage);

export default function GhostLabs() {
  return <FamilyPage page={labsPage} />;
}
