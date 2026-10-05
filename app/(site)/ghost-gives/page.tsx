import type { Metadata } from "next";
import { getFamilyPage } from "@/sanity/content";
import { FamilyPage, familyMetadata } from "../_components/FamilyPage";

export async function generateMetadata(): Promise<Metadata> {
  return familyMetadata(await getFamilyPage("ghost-gives"));
}

/** `/ghost-gives` — where the studio gives the work away. */
export default async function GhostGives() {
  return <FamilyPage data={await getFamilyPage("ghost-gives")} />;
}
