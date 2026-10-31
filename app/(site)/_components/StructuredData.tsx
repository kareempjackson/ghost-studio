import { stegaClean } from "next-sanity";
import { SITE_URL, absoluteUrl } from "@/lib/site";
import { getSettings } from "@/sanity/content";
import { toPlain } from "@/sanity/lib/rich";
import type { Question } from "@/sanity/types";

/** The studio's node. The home page describes it in full; every other page points to it by this. */
export const ORGANIZATION_ID = `${SITE_URL}/#organization`;

/** The site's node, which every page is part of. The home page describes it too. */
export const WEBSITE_ID = `${SITE_URL}/#website`;

/** A page as another page's structured data names it: its name and where it is. */
export interface PageRef {
  readonly name: string;
  readonly path: string;
}

/**
 * Where a page sits, from the home page down to the page itself: search
 * results show the trail in place of the bare address.
 */
export const breadcrumbs = (trail: readonly PageRef[]) => ({
  "@type": "BreadcrumbList",
  itemListElement: [{ name: "Home", path: "/" }, ...trail].map((crumb, i) => ({
    "@type": "ListItem",
    position: i + 1,
    name: crumb.name,
    item: absoluteUrl(crumb.path),
  })),
});

/** A page of the site, as schema.org reads one: its name, its words, and the site it is part of. */
export const webPage = ({ name, description, path }: PageRef & { description: string }) => ({
  "@type": "WebPage",
  name,
  description,
  url: absoluteUrl(path),
  isPartOf: { "@id": WEBSITE_ID },
});

/** An index: the page, and the pages it lists, in the order it lists them. */
export const collectionPage = ({
  items,
  ...page
}: PageRef & { description: string; items: readonly PageRef[] }) => ({
  ...webPage(page),
  "@type": "CollectionPage",
  mainEntity: {
    "@type": "ItemList",
    itemListElement: items.map((item, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: item.name,
      url: absoluteUrl(item.path),
    })),
  },
});

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
