import { legalDocuments } from "@/lib/legal";
import { LegalPage, legalMetadata } from "../_components/LegalPage";

/** `/cookies` — placeholder legal text; see lib/legal.ts. */
const doc = legalDocuments.cookies;

export const metadata = legalMetadata(doc);

export default function Cookies() {
  return <LegalPage doc={doc} />;
}
