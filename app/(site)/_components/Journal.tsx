import type { CSSProperties } from "react";
import { insightHref } from "@/lib/links";
import type { JournalSection } from "@/sanity/types";
import { ArrowPill } from "./ArrowPill";
import { Visual } from "./Visual";
import { Rich } from "./Rich";

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

/** 22px at 390 to 28px at 1440, held there. A card's title. */
const ENTRY_STYLE: CSSProperties = {
  fontSize: "clamp(1.375rem, 1.2357rem + 0.571vw, 1.75rem)",
  fontWeight: 400,
  letterSpacing: "-0.035em",
  lineHeight: 1.12,
};

/**
 * The journal: one featured piece, then two more as cards side by side.
 *
 * The featured card is a plate and a leaf, the same construction as the
 * process cards, so it reads as part of the same system. The two under it
 * are the same idea at a smaller size: a picture with the way in on its
 * corner, and the words beside it.
 */
export function Journal({ journal }: { journal: JournalSection }) {
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
          {(featured.image.src || featured.image.video) && (
            <Visual
              src={featured.image.src}
              video={featured.image.video}
              alt={featured.image.alt}
              sizes="(min-width: 1024px) 48vw, 100vw"
              className="object-cover"
            />
          )}
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
          <div className="mt-5 max-w-[28rem] text-[0.9375rem] leading-[1.6] tracking-[-0.01em] text-ink-600 lg:mt-6">
            <Rich value={featured.summary} />
          </div>
          <ArrowPill
            href={insightHref(featured.slug)}
            tone="signal"
            className="mt-7 inline-flex self-start lg:mt-8"
            ariaLabel={`${featured.action}: ${featured.title.join(" ")}`}
          >
            {featured.action}
          </ArrowPill>
        </div>
      </article>

      <ul className="mt-12 grid gap-y-10 lg:mt-16 lg:grid-cols-2 lg:gap-x-12">
        {journal.entries.map((entry) => (
          <li key={entry.slug}>
            <a
              href={insightHref(entry.slug)}
              className="group grid grid-cols-[minmax(0,8.5rem)_minmax(0,1fr)] items-start gap-4 sm:grid-cols-[minmax(0,11.5rem)_minmax(0,1fr)] lg:gap-5"
            >
              {/* A square plate, the column's width, so every entry's is the
                  same size whatever its text runs to. */}
              <div
                style={{ backgroundColor: entry.cover.ground }}
                className="relative aspect-square overflow-hidden rounded-[0.5rem]"
              >
                {(entry.cover.src || entry.cover.video) && (
                  <Visual
                    src={entry.cover.src}
                    video={entry.cover.video}
                    alt={entry.cover.alt}
                    sizes="(min-width: 640px) 11.5rem, 8.5rem"
                    className="object-cover transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.04]"
                  />
                )}
                {/* The way in: a white disc on the picture's corner, which
                    fills on hover. Decorative — the whole card is the link. */}
                <span
                  aria-hidden
                  className="absolute right-2.5 bottom-2.5 grid size-7 place-items-center rounded-full bg-white text-ink-950 transition-colors duration-200 group-hover:bg-ink-950 group-hover:text-white sm:size-8"
                >
                  <svg
                    viewBox="0 0 16 16"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="size-3.5 transition-transform duration-300 ease-out group-hover:translate-x-px group-hover:-translate-y-px"
                  >
                    <path d="M4.5 11.5l7-7M5.5 4.5h6v6" />
                  </svg>
                </span>
              </div>

              {/* The text is the square's height, never more: it is laid out
                  over the cell rather than in it, so only the square sets the
                  row. The title holds two lines and the excerpt, at the
                  square's foot, two or three; longer ones end in an ellipsis. */}
              <div className="relative self-stretch">
                <div className="absolute inset-0 flex flex-col overflow-hidden pt-1">
                  <p className="font-label text-[0.5625rem] leading-none tracking-[0.06em] text-ink-500 uppercase">
                    {entry.category}
                  </p>
                  <h3
                    className="mt-3 line-clamp-2 text-ink-950 transition-colors duration-200 group-hover:text-accent lg:mt-4"
                    style={ENTRY_STYLE}
                  >
                    {entry.title.join(" ")}
                  </h3>
                  <p className="mt-auto line-clamp-2 max-w-[17rem] pt-3 text-[0.8125rem] leading-[1.55] tracking-[-0.01em] text-ink-600 sm:line-clamp-3 lg:pt-4">
                    <Rich value={entry.excerpt} inline linkless />
                  </p>
                </div>
              </div>
            </a>
          </li>
        ))}
      </ul>
    </section>
  );
}
