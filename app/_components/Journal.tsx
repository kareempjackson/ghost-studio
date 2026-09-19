import Image from "next/image";
import type { CSSProperties } from "react";
import { journal, journalHref } from "@/lib/journal";
import { ArrowPill } from "./ArrowPill";

/** 36px at 390 to 56px at 1440, held there. */
const HEADING_STYLE: CSSProperties = {
  fontSize: "clamp(2.25rem, 1.7857rem + 1.905vw, 3.5rem)",
  fontWeight: 500,
  letterSpacing: "-0.05em",
  lineHeight: 1,
};

/** 30px at 390 to 44px at 1440, held there. */
const FEATURED_STYLE: CSSProperties = {
  fontSize: "clamp(1.875rem, 1.55rem + 1.333vw, 2.75rem)",
  fontWeight: 500,
  letterSpacing: "-0.045em",
  lineHeight: 1.05,
};

/** 20px at 390 to 26px at 1440, held there. */
const ENTRY_STYLE: CSSProperties = {
  fontSize: "clamp(1.25rem, 1.1107rem + 0.571vw, 1.625rem)",
  letterSpacing: "-0.03em",
  lineHeight: 1.15,
};

const pad = (n: number) => String(n).padStart(2, "0");

/**
 * The journal: one featured piece, then the next three as a ruled index.
 *
 * The featured card is a plate and a leaf, the same construction as the
 * process cards, so it reads as part of the same system. Each row of the
 * index is one link; hovering it fills the arrow and nudges the title.
 */
export function Journal() {
  const { featured } = journal;

  return (
    <section
      aria-labelledby="journal-heading"
      className="relative z-10 bg-surface-page px-5 pt-16 pb-48 sm:px-8 lg:px-12 lg:pt-28 lg:pb-72"
    >
      <div className="border-t border-ink-200 pt-8 lg:pt-12">
        <p className="font-mono text-[0.75rem] leading-none tracking-[0.06em] text-ink-950 uppercase">
          {journal.eyebrow}
        </p>
        <h2
          id="journal-heading"
          className="mt-5 text-ink-950"
          style={HEADING_STYLE}
        >
          {journal.heading}
        </h2>
      </div>

      <article className="mt-10 grid overflow-hidden rounded-[0.75rem] bg-[#f0efed] text-ink-950 lg:mt-12 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.08fr)]">
        <div className="relative aspect-[16/11] bg-[#16151b] lg:aspect-auto lg:min-h-[26rem]">
          <Image
            src={featured.image.src}
            alt={featured.image.alt}
            fill
            sizes="(min-width: 1024px) 48vw, 100vw"
            className="object-cover"
          />
        </div>

        <div className="flex flex-col justify-center p-6 sm:p-8 lg:px-12 lg:py-12">
          <div className="flex items-center gap-4">
            <span className="rounded-pill bg-ink-200/70 px-2.5 py-1.5 font-mono text-[0.625rem] leading-none tracking-[0.04em] uppercase">
              {featured.category}
            </span>
            <span className="font-mono text-[0.625rem] leading-none tracking-[0.04em] text-ink-500 uppercase">
              {featured.label}
            </span>
          </div>
          <h3 className="mt-7 lg:mt-9" style={FEATURED_STYLE}>
            {featured.title.map((line) => (
              <span key={line} className="block">
                {line}
              </span>
            ))}
          </h3>
          <p className="mt-5 max-w-[28rem] text-[0.9375rem] leading-[1.6] tracking-[-0.01em] text-ink-600 lg:mt-6">
            {featured.summary}
          </p>
          <ArrowPill
            href={journalHref(featured.slug)}
            tone="signal"
            className="mt-7 inline-flex self-start lg:mt-8"
            ariaLabel={`${featured.action}: ${featured.title.join(" ")}`}
          >
            {featured.action}
          </ArrowPill>
        </div>
      </article>

      <ol className="mt-6 border-t border-ink-200 lg:mt-8">
        {journal.entries.map((entry, index) => (
          <li key={entry.slug} className="border-b border-ink-200">
            <a
              href={journalHref(entry.slug)}
              className="group grid grid-cols-[minmax(0,1fr)_auto] items-center gap-x-6 py-5 sm:grid-cols-[4rem_minmax(0,1fr)_auto] lg:grid-cols-[minmax(0,1fr)_minmax(0,6fr)_auto] lg:py-6"
            >
              <span className="hidden font-mono text-[0.6875rem] leading-none text-ink-500 sm:block">
                {pad(index + 1)}
              </span>
              <span className="min-w-0">
                <span className="block font-mono text-[0.625rem] leading-none tracking-[0.04em] text-ink-500 uppercase">
                  {entry.category}
                </span>
                <span
                  className="mt-2 block transition-transform duration-300 ease-out group-hover:translate-x-1.5"
                  style={ENTRY_STYLE}
                >
                  {entry.title}
                </span>
              </span>
              <span
                aria-hidden
                className="grid size-10 place-items-center rounded-full border border-ink-300 text-ink-950 transition-colors duration-200 group-hover:border-ink-950 group-hover:bg-ink-950 group-hover:text-white"
              >
                <svg
                  viewBox="0 0 16 16"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.4"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="size-3.5 transition-transform duration-300 ease-out group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                >
                  <path d="M4.5 11.5l7-7M5.5 4.5h6v6" />
                </svg>
              </span>
            </a>
          </li>
        ))}
      </ol>
    </section>
  );
}
