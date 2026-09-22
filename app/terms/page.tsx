import { legalDocuments } from "@/lib/legal";
import { LegalPage, legalMetadata } from "../_components/LegalPage";

/** `/terms` — placeholder legal text; see lib/legal.ts. */
const doc = legalDocuments.terms;

export const metadata = legalMetadata(doc);

export default function Terms() {
  return <LegalPage doc={doc} />;
}
