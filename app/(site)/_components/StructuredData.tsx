import { stegaClean } from "next-sanity";
import { SITE_URL, absoluteUrl } from "@/lib/site";
import { getSettings } from "@/sanity/content";
import { toPlain } from "@/sanity/lib/rich";
import type { Question } from "@/sanity/types";

/** The studio's node. The home page describes it in full; every other page points to it by this. */
export const ORGANIZATION_ID = `${SITE_URL}/#organization`;

/** The studio, as another page's structured data names it: by its @id, with its name and address. */
export async function studio() {
  const { title } = await getSettings();
  return { "@type": "Organization", "@id": ORGANIZATION_ID, name: title, url: absoluteUrl("/") };
}

/** Questions and their answers, as schema.org reads an FAQ: the words an agent can quote back. */
export const faqPage = (items: readonly Question[]) => ({
  "@type": "FAQPage",
  mainEntity: items.map((item) => ({
    "@type": "Question",
    name: item.question,
    acceptedAnswer: { "@type": "Answer", text: toPlain(item.answer) },
  })),
});

/**
 * What a page is, for search engines and agents: schema.org, as JSON-LD.
 * Clean of edit marks, and every < escaped, so no copy can close the script.
 */
export function StructuredData({ data }: { data: object }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(stegaClean(data)).replace(/</g, "\\u003c") }}
    />
  );
}
