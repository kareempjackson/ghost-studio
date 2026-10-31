import { insightHref } from "@/lib/links";
import { pageMetadata } from "@/lib/seo";
import type { Metadata } from "next";
import { getInsightsPage } from "@/sanity/content";
import { ChatLauncher } from "../_components/ChatLauncher";
import { ContactBand } from "../_components/ContactBand";
import { PageCover } from "../_components/PageCover";
import { SiteFooter } from "../_components/SiteFooter";
import { SiteHeader } from "../_components/SiteHeader";
import { StructuredData, breadcrumbs, collectionPage } from "../_components/StructuredData";
import { ArticleGrid } from "./_components/ArticleGrid";

export async function generateMetadata(): Promise<Metadata> {
  const { title, metaTitle, description, noindex } = await getInsightsPage();
  return pageMetadata({ title, metaTitle, description, noindex, path: "/insights" });
}

/**
 * `/insights` — every insight, newest first.
 *
 * The cover says what the pieces are about; the grid under it is every
 * piece, filtered by topic. Each one opens at /insights/[slug]. No action on
 * the cover: the grid is the way on.
 */
export default async function Insights() {
  const insightsPage = await getInsightsPage();

  /* The index, as search engines read it: the page, every insight on it,
     newest first, and where it sits. */
  const structured = {
    "@context": "https://schema.org",
    "@graph": [
      collectionPage({
        name: insightsPage.title,
        description: insightsPage.description,
        path: "/insights",
        items: insightsPage.articles.map((a) => ({ name: a.title.join(" "), path: insightHref(a.slug) })),
      }),
      breadcrumbs([{ name: insightsPage.title, path: "/insights" }]),
    ],
  };

  return (
    <>
      <SiteHeader />
      <StructuredData data={structured} />
      {/* One layer above the footer, with its own ground: the page is the
          sheet that slides up off the footer lying underneath it. */}
      <main className="relative z-[1] flex flex-1 flex-col bg-surface-page">
        <PageCover
          id="insights-heading"
          eyebrow={insightsPage.eyebrow}
          heading={insightsPage.heading}
          summary={insightsPage.summary}
          size="md"
        />
        <ArticleGrid
          articles={insightsPage.articles}
          topics={insightsPage.topics}
          status={insightsPage.status}
          all={insightsPage.all}
          filterLabel={insightsPage.filterLabel}
          empty={insightsPage.empty}
        />
      </main>
      {/* The close sits over the footer, not inside the page, so its rounded
          corners open onto the footer beneath it. */}
      <ContactBand />
      <SiteFooter />
      <ChatLauncher />
    </>
  );
}
