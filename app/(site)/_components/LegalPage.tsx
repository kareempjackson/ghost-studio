import type { Metadata } from "next";
import { stegaClean } from "next-sanity";
import { pageMetadata } from "@/lib/seo";
import type { CSSProperties } from "react";
import type { LegalDocument } from "@/sanity/types";
import { ChatLauncher } from "./ChatLauncher";
import { ContactBand } from "./ContactBand";
import { SiteFooter } from "./SiteFooter";
import { SiteHeader } from "./SiteHeader";
import { Rich, richKey } from "./Rich";

/** 44px at 390 to 72px at 1440, held there. */
const HEADING_STYLE: CSSProperties = {
  fontSize: "clamp(2.75rem, 2.0071rem + 3.048vw, 4.5rem)",
  fontWeight: 400,
  letterSpacing: "-0.05em",
  lineHeight: 1,
};

const MONO =
  "font-label text-[0.6875rem] leading-none tracking-[0.06em] uppercase";

const pad = (n: number) => String(n).padStart(2, "0");

/** Metadata for a legal route, from its document in Sanity. */
export function legalMetadata(doc: LegalDocument): Promise<Metadata> {
  return pageMetadata({ title: doc.title, description: doc.description, path: `/${stegaClean(doc.slug)}` });
}

/**
 * A legal document, set to be read: the title and the date it last changed,
 * an introduction, then numbered sections at a reading measure with their
 * contents list held beside them on wide screens.
 *
 * Every section has an anchor, so a clause can be linked to directly, and
 * the contents list is those links.
 */
export function LegalPage({ data: doc }: { data: LegalDocument }) {
  return (
    <>
      <SiteHeader />
      <main className="relative z-[1] flex flex-1 flex-col bg-surface-page">
        <header className="px-5 pt-[calc(var(--gs-header-h)+4rem)] pb-14 sm:px-8 lg:px-12 lg:pt-[calc(var(--gs-header-h)+6rem)] lg:pb-20">
          <p className={`${MONO} gs-reveal text-ink-950`}>{doc.eyebrow}</p>
          <h1 className="mt-8 text-ink-950 lg:mt-10" style={HEADING_STYLE}>
            {doc.title}
          </h1>
          <p className={`${MONO} gs-reveal mt-8 text-ink-500 [--reveal:2]`}>
            {doc.updatedLabel} · {doc.updated}
          </p>
        </header>

        <div className="grid gap-12 border-t border-edge-subtle px-5 pt-10 pb-24 sm:px-8 lg:grid-cols-12 lg:gap-6 lg:px-12 lg:pt-14 lg:pb-36">
          {/* The contents, held in view beside the text on wide screens. */}
          <nav aria-label={`${doc.title} contents`} className="lg:col-span-3">
            <div className="lg:sticky lg:top-[calc(var(--gs-header-h)+2rem)]">
              <p className={`${MONO} text-ink-500`}>{doc.contentsLabel}</p>
              <ol className="mt-5 space-y-2.5">
                {doc.sections.map((section, index) => (
                  <li key={section.id}>
                    <a
                      href={`#${section.id}`}
                      className="group flex gap-3 text-[0.9375rem] leading-[1.35] tracking-[-0.01em] text-ink-600 transition-colors duration-200 hover:text-ink-950"
                    >
                      <span className="font-label text-[0.6875rem] leading-[1.9] text-ink-400">
                        {pad(index + 1)}
                      </span>
                      {section.title}
                    </a>
                  </li>
                ))}
              </ol>
            </div>
          </nav>

          <article className="max-w-[42rem] lg:col-span-7 lg:col-start-5">
            <div className="text-[1.1875rem] leading-[1.55] tracking-[-0.015em] text-ink-950 lg:text-[1.3125rem]">
              <Rich value={doc.intro} />
            </div>

            {doc.sections.map((section, index) => (
              <section
                key={section.id}
                id={section.id}
                aria-labelledby={`${section.id}-heading`}
                className="mt-14 scroll-mt-[calc(var(--gs-header-h)+2rem)] lg:mt-16"
              >
                <p className={`${MONO} text-ink-400`}>{pad(index + 1)}</p>
                <h2
                  id={`${section.id}-heading`}
                  className="mt-3 text-[1.5rem] leading-[1.2] tracking-[-0.03em] text-ink-950 lg:text-[1.75rem]"
                >
                  {section.title}
                </h2>
                <div className="mt-4 text-[1rem] leading-[1.7] tracking-[-0.005em] text-ink-600 [--rich-gap:1rem] lg:text-[1.0625rem]">
                  <Rich value={section.paragraphs} />
                </div>
                {section.list && (
                  <ul className="mt-4 space-y-2.5">
                    {section.list.map((item, index) => (
                      <li
                        key={richKey(item, index)}
                        className="flex gap-3 text-[1rem] leading-[1.6] tracking-[-0.005em] text-ink-600 lg:text-[1.0625rem]"
                      >
                        <span
                          aria-hidden
                          className="mt-[0.7em] size-1.5 shrink-0 rounded-full bg-ink-400"
                        />
                        <span>
                          <Rich value={item} inline />
                        </span>
                      </li>
                    ))}
                  </ul>
                )}
              </section>
            ))}
          </article>
        </div>
      </main>
      <ContactBand />
      <SiteFooter />
      <ChatLauncher />
    </>
  );
}
