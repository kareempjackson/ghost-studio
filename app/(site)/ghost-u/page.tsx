import type { Metadata } from "next";
import { getFamilyPage } from "@/sanity/content";
import { FamilyPage, familyMetadata } from "../_components/FamilyPage";

export async function generateMetadata(): Promise<Metadata> {
  return familyMetadata(await getFamilyPage("ghost-u"));
}

/** `/ghost-u` — where the studio teaches. */
export default async function GhostU() {
  return <FamilyPage data={await getFamilyPage("ghost-u")} />;
}
