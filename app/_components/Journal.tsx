import Image from "next/image";
import type { CSSProperties } from "react";
import { journal, journalHref } from "@/lib/journal";
import { ArrowPill } from "./ArrowPill";
import { JournalIndex } from "./JournalIndex";

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

/**
 * The journal: one featured piece, then the next three as a ruled index.
 *
 * The featured card is a plate and a leaf, the same construction as the
 * process cards, so it reads as part of the same system. The index below it
 * is a client island: its rows carry a hover preview that follows the cursor.
 */
export function Journal() {
  const { featured } = journal;

  return (
    <section
      aria-labelledby="journal-heading"
      className="relative z-10 bg-surface-page px-5 pt-20 pb-56 sm:px-8 lg:px-12 lg:pt-32 lg:pb-80"
    >
      <div className="border-t border-edge-subtle pt-10 lg:pt-14">
        <p className="font-label text-[0.75rem] leading-none tracking-[0.06em] text-ink-950 uppercase">
          {journal.eyebrow}
        </p>
        <h2
          id="journal-heading"
          className="mt-6 text-ink-950"
          style={HEADING_STYLE}
        >
          {journal.heading}
        </h2>
      </div>

      <article className="mt-14 grid overflow-hidden rounded-[0.75rem] bg-[#f0efed] text-ink-950 lg:mt-16 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.08fr)]">
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
            <span className="rounded-pill bg-ink-200/70 px-2.5 py-1.5 font-label text-[0.625rem] leading-none tracking-[0.04em] uppercase">
              {featured.category}
            </span>
            <span className="font-label text-[0.625rem] leading-none tracking-[0.04em] text-ink-500 uppercase">
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

      <JournalIndex />
    </section>
  );
}
