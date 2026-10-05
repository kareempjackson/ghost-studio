import type { Metadata } from "next";
import { getFamilyPage } from "@/sanity/content";
import { FamilyPage, familyMetadata } from "../_components/FamilyPage";

export async function generateMetadata(): Promise<Metadata> {
  return familyMetadata(await getFamilyPage("ghost-labs"));
}

/** `/ghost-labs` — where the studio experiments. */
export default async function GhostLabs() {
  return <FamilyPage data={await getFamilyPage("ghost-labs")} />;
}
