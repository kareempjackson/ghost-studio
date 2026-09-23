import { ghostUPage } from "@/lib/family-pages";
import { FamilyPage, familyMetadata } from "../_components/FamilyPage";

/** `/ghost-u` — where the studio teaches; see lib/family-pages.ts. */
export const metadata = familyMetadata(ghostUPage);

export default function GhostU() {
  return <FamilyPage page={ghostUPage} />;
}
