"use client";

import { useEffect, useId, useRef, useState } from "react";
import { ArrowPill } from "../../_components/ArrowPill";
import { MONO } from "../../_components/SectionHead";

/**
 * The opening of a case study. Folded, it shows the first four lines and
 * lets them fade out, so the page moves on to the work; Read more opens the
 * rest in place, the text growing to its full height as the fade lifts.
 * Visit site sits beside it when the client's site is live.
 *
 * Folded is a visual state only: the whole text is in the page, so a screen
 * reader and a search engine read all of it either way.
 */
/** Four lines at the text's 1.5 leading: what shows folded. */
const FOLD_EM = 6;

/**
 * The fade, drawn twice the text's height: solid above, fading below. Folded,
 * the text shows the lower half, so it fades out to the fold; opening slides
 * the mask up to the solid half as the text grows, so the fade lifts with
 * the reveal rather than switching off before it.
 */
const MASK = {
  maskImage: "linear-gradient(to bottom, #000 0%, #000 62%, transparent 100%)",
  WebkitMaskImage: "linear-gradient(to bottom, #000 0%, #000 62%, transparent 100%)",
  maskSize: "100% 200%",
  WebkitMaskSize: "100% 200%",
  maskRepeat: "no-repeat",
  WebkitMaskRepeat: "no-repeat",
} as const;

export function Overview({
  label,
  paragraphs,
  readMore,
  readLess,
  visit,
  website,
}: {
  label: string;
  paragraphs: readonly string[];
  readMore: string;
  readLess: string;
  visit: string;
  website: string | null;
}) {
  const [open, setOpen] = useState(false);
  const id = useId();
  const textRef = useRef<HTMLDivElement>(null);
  /* The text's full height, measured, so opening has a height to grow to;
     and whether there is more than the fold to show at all. Until measured
     it folds, so the first paint matches the folded page. */
  const [full, setFull] = useState<number | null>(null);
  const [folds, setFolds] = useState(true);

  useEffect(() => {
    const text = textRef.current;
    if (!text) return;
    const measure = () => {
      const fold = parseFloat(getComputedStyle(text).fontSize) * FOLD_EM;
      setFull(text.scrollHeight);
      setFolds(text.scrollHeight > fold + 8);
    };
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(text);
    return () => observer.disconnect();
  }, [paragraphs]);

  const folded = folds && !open;

  return (
    <div>
      <p className={`${MONO} text-ink-500`}>{label}</p>
      <div
        id={id}
        ref={textRef}
        style={{
          ...MASK,
          maxHeight: folded ? `${FOLD_EM}em` : open && full ? `${full}px` : undefined,
          maskPosition: folded ? "0 100%" : "0 0",
          WebkitMaskPosition: folded ? "0 100%" : "0 0",
        }}
        className="mt-6 max-w-[37rem] space-y-6 overflow-hidden text-[1.1875rem] leading-[1.5] tracking-[-0.015em] text-primary [transition:max-height_900ms_var(--gs-reveal-ease),mask-position_900ms_var(--gs-reveal-ease),-webkit-mask-position_900ms_var(--gs-reveal-ease)] [--gs-reveal-ease:cubic-bezier(0.32,0.72,0,1)] motion-reduce:transition-none lg:mt-8 lg:text-[1.3125rem]"
      >
        {paragraphs.map((paragraph, index) => (
          <p
            key={index}
            /* The paragraphs past the first rise into place as the text
               opens, one after another; folding, they go together. */
            style={
              index > 0 && folds
                ? {
                    opacity: open ? 1 : 0,
                    translate: open ? "0 0" : "0 0.5rem",
                    transitionDelay: open ? `${180 + index * 90}ms` : "0ms",
                  }
                : undefined
            }
            className="transition-[opacity,translate] duration-700 ease-[cubic-bezier(0.32,0.72,0,1)] motion-reduce:transition-none"
          >
            {paragraph}
          </p>
        ))}
      </div>

      {(folds || website) && (
        <div className="mt-10 flex flex-wrap gap-4 lg:mt-12">
          {folds && (
            <button
              type="button"
              aria-expanded={open}
              aria-controls={id}
              onClick={() => setOpen((value) => !value)}
              className="group inline-flex h-11 items-center gap-6 rounded-pill border border-ink-300 pr-1 pl-5 font-label text-[0.8125rem] leading-none tracking-[0.08em] text-ink-950 uppercase transition-colors duration-200 hover:border-ink-950"
            >
              {/* Both labels share one cell, so the pill keeps its width
                  and the words cross-fade rather than jump. */}
              <span className="grid">
                {[readMore, readLess].map((text, i) => (
                  <span
                    key={i}
                    aria-hidden={(i === 1) !== open}
                    className={`col-start-1 row-start-1 transition-[opacity,translate] duration-300 ease-out ${
                      (i === 1) === open ? "opacity-100" : "pointer-events-none -translate-y-1 opacity-0"
                    }`}
                  >
                    {text}
                  </span>
                ))}
              </span>
              <span
                aria-hidden
                className="grid size-9 place-items-center rounded-pill border border-ink-300 transition-colors duration-200 group-hover:border-ink-950"
              >
                <svg
                  viewBox="0 0 16 16"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.25"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className={`size-3.5 transition-transform duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] ${open ? "-rotate-90" : "rotate-90"}`}
                >
                  <path d="M3 8h10M9 4l4 4-4 4" />
                </svg>
              </span>
            </button>
          )}
          {website && (
            <ArrowPill href={website} external>
              {visit}
            </ArrowPill>
          )}
        </div>
      )}
    </div>
  );
}
