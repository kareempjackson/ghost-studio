import type { Metadata } from "next";
import type { CSSProperties } from "react";
import { workPage } from "@/lib/work";
import { ArrowPill } from "../_components/ArrowPill";
import { ChatLauncher } from "../_components/ChatLauncher";
import { ContactBand } from "../_components/ContactBand";
import { SiteFooter } from "../_components/SiteFooter";
import { SiteHeader } from "../_components/SiteHeader";
import { WorkGallery } from "./_components/WorkGallery";

export const metadata: Metadata = {
  title: workPage.title,
  description: workPage.description,
};

/** 44px at 390 to 88px at 1440, held there. The cover of the page. */
const COVER_STYLE: CSSProperties = {
  fontSize: "clamp(2.75rem, 1.7286rem + 4.19vw, 5.5rem)",
  fontWeight: 500,
  letterSpacing: "-0.05em",
  lineHeight: 0.98,
};

/** 36px at 390 to 64px at 1440, held there. The line that closes the page. */
const CLOSE_STYLE: CSSProperties = {
  fontSize: "clamp(2.25rem, 1.6857rem + 2.667vw, 4rem)",
  fontWeight: 500,
  letterSpacing: "-0.05em",
  lineHeight: 1,
};

/**
 * `/work` — the studio's record, as an index.
 *
 * The cover states the claim, the filter sits on a rule under it, and the
 * work follows: one piece across the page, then the rest two up. The close
 * hands the reader to the process, because the question a good index leaves
 * is how the work got made. The contact band and the footer are the site's,
 * unchanged, so the page ends the way every other page does.
 */
export default function Work() {
  return (
    <>
      <SiteHeader />
      {/* One layer above the footer, with its own ground: the page is the
          sheet that slides up off the footer lying underneath it. */}
      <main className="relative z-[1] flex flex-1 flex-col bg-surface-page">
        <section
          aria-labelledby="work-heading"
          className="px-5 pt-[calc(var(--gs-header-h)+5rem)] pb-20 sm:px-8 lg:px-12 lg:pt-[calc(var(--gs-header-h)+9rem)] lg:pb-28"
        >
          <h1 id="work-heading" className="text-primary" style={COVER_STYLE}>
            {workPage.heading.map((line) => (
              <span key={line} className="block">
                {line}
              </span>
            ))}
          </h1>
          <p className="mt-8 max-w-[34rem] text-[1.0625rem] leading-[1.5] tracking-[-0.01em] text-secondary lg:mt-10 lg:text-[1.25rem]">
            {workPage.summary.map((line) => (
              <span key={line} className="block">
                {line}
              </span>
            ))}
          </p>
        </section>

        <WorkGallery />

        <section
          aria-labelledby="work-close-heading"
          className="border-t border-edge-subtle px-5 pt-20 pb-28 sm:px-8 lg:px-12 lg:pt-28 lg:pb-40"
        >
          <p className="font-mono text-[0.6875rem] leading-none tracking-[0.06em] text-ink-500 uppercase">
            {workPage.close.eyebrow}
          </p>
          <h2
            id="work-close-heading"
            className="mt-8 text-primary lg:mt-10"
            style={CLOSE_STYLE}
          >
            {workPage.close.heading.map((line) => (
              <span key={line} className="block">
                {line}
              </span>
            ))}
          </h2>
          <ArrowPill
            href={workPage.close.action.href}
            className="mt-10 inline-flex lg:mt-12"
          >
            {workPage.close.action.label}
          </ArrowPill>
        </section>
      </main>
      {/* The close sits over the footer, not inside the page, so its rounded
          corners open onto the footer beneath it. */}
      <ContactBand />
      <SiteFooter />
      <ChatLauncher />
    </>
  );
}
