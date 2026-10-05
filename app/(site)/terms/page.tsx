import type { Metadata } from "next";
import { getLegalPage } from "@/sanity/content";
import { LegalPage, legalMetadata } from "../_components/LegalPage";

export async function generateMetadata(): Promise<Metadata> {
  return legalMetadata(await getLegalPage("terms"));
}

/** `/terms` — placeholder legal text, until counsel has written it. */
export default async function Terms() {
  return <LegalPage data={await getLegalPage("terms")} />;
}
