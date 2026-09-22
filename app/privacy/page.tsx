import { legalDocuments } from "@/lib/legal";
import { LegalPage, legalMetadata } from "../_components/LegalPage";

/** `/privacy` — placeholder legal text; see lib/legal.ts. */
const doc = legalDocuments.privacy;

export const metadata = legalMetadata(doc);

export default function Privacy() {
  return <LegalPage doc={doc} />;
}
