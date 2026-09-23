import type { Metadata } from "next";
import type { CSSProperties } from "react";
import type { LegalDocument } from "@/lib/legal";
import { ChatLauncher } from "./ChatLauncher";
import { ContactBand } from "./ContactBand";
import { SiteFooter } from "./SiteFooter";
import { SiteHeader } from "./SiteHeader";

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

/** Metadata for a legal route, from its entry in lib/legal.ts. */
export function legalMetadata(doc: LegalDocument): Metadata {
  return { title: doc.title, description: doc.description };
}

/**
 * A legal document, set to be read: the title and the date it last changed,
 * an introduction, then numbered sections at a reading measure with their
 * contents list held beside them on wide screens.
 *
 * Every section has an anchor, so a clause can be linked to directly, and
 * the contents list is those links. It says it is placeholder content, under
 * the eyebrow, until counsel has written the real thing.
 */
export function LegalPage({ doc }: { doc: LegalDocument }) {
  return (
    <>
      <SiteHeader />
      <main className="relative z-[1] flex flex-1 flex-col bg-surface-page">
        <header className="px-5 pt-[calc(var(--gs-header-h)+4rem)] pb-14 sm:px-8 lg:px-12 lg:pt-[calc(var(--gs-header-h)+6rem)] lg:pb-20">
          <div className="flex flex-wrap items-center gap-3">
            <p className={`${MONO} text-ink-950`}>Legal</p>
            <span
              className={`${MONO} rounded-pill border border-dashed border-ink-400 px-2.5 py-1.5 text-[0.625rem] text-ink-500`}
            >
              Placeholder · not legal advice
            </span>
          </div>
          <h1 className="mt-8 text-ink-950 lg:mt-10" style={HEADING_STYLE}>
            {doc.title}
          </h1>
          <p className={`${MONO} mt-8 text-ink-500`}>
            Last updated · {doc.updated}
          </p>
        </header>

        <div className="grid gap-12 border-t border-edge-subtle px-5 pt-10 pb-24 sm:px-8 lg:grid-cols-12 lg:gap-6 lg:px-12 lg:pt-14 lg:pb-36">
          {/* The contents, held in view beside the text on wide screens. */}
          <nav aria-label={`${doc.title} contents`} className="lg:col-span-3">
            <div className="lg:sticky lg:top-[calc(var(--gs-header-h)+2rem)]">
              <p className={`${MONO} text-ink-500`}>Contents</p>
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
            <p className="text-[1.1875rem] leading-[1.55] tracking-[-0.015em] text-ink-950 lg:text-[1.3125rem]">
              {doc.intro}
            </p>

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
                {section.paragraphs.map((paragraph) => (
                  <p
                    key={paragraph}
                    className="mt-4 text-[1rem] leading-[1.7] tracking-[-0.005em] text-ink-600 lg:text-[1.0625rem]"
                  >
                    {paragraph}
                  </p>
                ))}
                {section.list && (
                  <ul className="mt-4 space-y-2.5">
                    {section.list.map((item) => (
                      <li
                        key={item}
                        className="flex gap-3 text-[1rem] leading-[1.6] tracking-[-0.005em] text-ink-600 lg:text-[1.0625rem]"
                      >
                        <span
                          aria-hidden
                          className="mt-[0.7em] size-1.5 shrink-0 rounded-full bg-ink-400"
                        />
                        {item}
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
