import type { Metadata } from "next";
import type { CSSProperties } from "react";
import type { ScaffoldPageData } from "@/lib/scaffold";
import { ArrowPill } from "./ArrowPill";
import { ChatLauncher } from "./ChatLauncher";
import { ContactBand } from "./ContactBand";
import { SiteFooter } from "./SiteFooter";
import { SiteHeader } from "./SiteHeader";

/** 48px at 390 to 88px at 1440, held there — the same cover as /services. */
const HEADING_STYLE: CSSProperties = {
  fontSize: "clamp(3rem, 2.1643rem + 3.429vw, 5.5rem)",
  fontWeight: 400,
  letterSpacing: "-0.05em",
  lineHeight: 0.98,
};

/** 28px at 390 to 44px at 1440, held there. */
const SECTION_STYLE: CSSProperties = {
  fontSize: "clamp(1.75rem, 1.3786rem + 1.524vw, 2.75rem)",
  fontWeight: 400,
  letterSpacing: "-0.04em",
  lineHeight: 1.05,
};

const MONO =
  "font-mono text-[0.6875rem] leading-none tracking-[0.06em] uppercase";

const pad = (n: number) => String(n).padStart(2, "0");

/** Metadata for a scaffold route, from its entry in lib/scaffold.ts. */
export function scaffoldMetadata(page: ScaffoldPageData): Metadata {
  return { title: page.title, description: page.description };
}

/**
 * A placeholder page, built from the site's own parts so it already sits in
 * the system: the header, a cover in the /services style, ruled sections of
 * cards, and the orange close sliding off the footer.
 *
 * It says it is a scaffold, in a tag under the eyebrow, so no one mistakes
 * test content for the real thing. When a page is designed, its route stops
 * using this and its entry comes off lib/scaffold.ts.
 */
export function ScaffoldPage({ page }: { page: ScaffoldPageData }) {
  return (
    <>
      <SiteHeader />
      <main className="relative z-[1] flex flex-1 flex-col bg-surface-page">
        <section
          aria-labelledby="scaffold-heading"
          className="px-5 pt-[calc(var(--gs-header-h)+4rem)] pb-20 sm:px-8 lg:px-12 lg:pt-[calc(var(--gs-header-h)+7rem)] lg:pb-28"
        >
          <div className="flex flex-wrap items-center gap-3">
            <p className={`${MONO} text-ink-950`}>{page.eyebrow}</p>
            <span
              className={`${MONO} rounded-pill border border-dashed border-ink-400 px-2.5 py-1.5 text-[0.625rem] text-ink-500`}
            >
              Scaffold · test content
            </span>
          </div>
          <h1
            id="scaffold-heading"
            className="mt-8 text-ink-950 lg:mt-10"
            style={HEADING_STYLE}
          >
            {page.heading.map((line) => (
              <span key={line} className="block">
                {line}
              </span>
            ))}
          </h1>
          <div className="mt-10 flex flex-col gap-8 lg:mt-14 lg:flex-row lg:items-end lg:justify-between">
            <p className="max-w-[34rem] text-[1.0625rem] leading-[1.55] tracking-[-0.01em] text-ink-600 lg:text-[1.1875rem]">
              {page.summary}
            </p>
            <ArrowPill
              href={page.action.href}
              className="inline-flex self-start lg:self-auto"
            >
              {page.action.label}
            </ArrowPill>
          </div>
        </section>

        {page.sections.map((section, index) => (
          <section
            key={section.title}
            aria-labelledby={`scaffold-section-${index}`}
            className="px-5 pb-20 sm:px-8 lg:px-12 lg:pb-28"
          >
            <div className="grid gap-8 border-t border-edge-subtle pt-8 lg:grid-cols-12 lg:gap-6 lg:pt-10">
              <p className={`${MONO} text-ink-500 lg:col-span-3`}>
                {pad(index + 1)} — {section.label}
              </p>
              <div className="lg:col-span-9">
                <h2
                  id={`scaffold-section-${index}`}
                  className="text-ink-950"
                  style={SECTION_STYLE}
                >
                  {section.title}
                </h2>
                {section.body && (
                  <p className="mt-6 max-w-[40rem] text-[1rem] leading-[1.6] tracking-[-0.01em] text-ink-600 lg:text-[1.0625rem]">
                    {section.body}
                  </p>
                )}
              </div>
            </div>

            {section.items && (
              <ul className="mt-10 grid gap-4 sm:grid-cols-2 lg:mt-14 lg:grid-cols-3 xl:grid-cols-4">
                {section.items.map((item) => {
                  const inner = (
                    <>
                      {/* The picture slot, left for the real imagery. */}
                      <div
                        aria-hidden
                        className="grid aspect-[4/3] place-items-center rounded-[0.5rem] bg-ink-200/60"
                      >
                        <span
                          className={`${MONO} text-[0.625rem] text-ink-400`}
                        >
                          Image
                        </span>
                      </div>
                      {item.meta && (
                        <p
                          className={`${MONO} mt-5 text-[0.625rem] text-ink-500`}
                        >
                          {item.meta}
                        </p>
                      )}
                      <h3 className="mt-3 text-[1.25rem] leading-[1.2] tracking-[-0.03em] text-ink-950">
                        {item.title}
                      </h3>
                      <p className="mt-2 text-[0.9375rem] leading-[1.5] tracking-[-0.01em] text-ink-600">
                        {item.body}
                      </p>
                    </>
                  );
                  return (
                    <li
                      key={item.title}
                      className="rounded-[0.75rem] bg-[#f3f2f0] p-4 sm:p-5"
                    >
                      {item.href ? (
                        <a href={item.href} className="block">
                          {inner}
                        </a>
                      ) : (
                        inner
                      )}
                    </li>
                  );
                })}
              </ul>
            )}
          </section>
        ))}
      </main>
      <ContactBand />
      <SiteFooter />
      <ChatLauncher />
    </>
  );
}
