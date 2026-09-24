import type { Metadata } from "next";
import { insightsPage } from "@/lib/insights";
import { ChatLauncher } from "../_components/ChatLauncher";
import { ContactBand } from "../_components/ContactBand";
import { PageCover } from "../_components/PageCover";
import { SiteFooter } from "../_components/SiteFooter";
import { SiteHeader } from "../_components/SiteHeader";
import { ArticleGrid } from "./_components/ArticleGrid";

export const metadata: Metadata = {
  title: insightsPage.title,
  description: insightsPage.description,
};

/**
 * `/insights` — the journal's index.
 *
 * The cover says what the pieces are about; the grid under it is every
 * piece, filtered by topic. No action on the cover: the grid is the way on.
 */
export default function Insights() {
  return (
    <>
      <SiteHeader />
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
        <ArticleGrid />
      </main>
      {/* The close sits over the footer, not inside the page, so its rounded
          corners open onto the footer beneath it. */}
      <ContactBand />
      <SiteFooter />
      <ChatLauncher />
    </>
  );
}
