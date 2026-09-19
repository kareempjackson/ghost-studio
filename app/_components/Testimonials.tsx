"use client";

import { AnimatePresence, motion } from "motion/react";
import type { CSSProperties } from "react";
import { useState } from "react";
import { pointOfView } from "@/lib/point-of-view";
import { testimonials } from "@/lib/testimonials";
import { ArrowPill } from "./ArrowPill";
import { usePrefersReducedMotion } from "./usePrefersReducedMotion";

/** 36px at 390 to 56px at 1440, held there. */
const HEADING_STYLE: CSSProperties = {
  fontSize: "clamp(2.25rem, 1.7857rem + 1.905vw, 3.5rem)",
  fontWeight: 500,
  letterSpacing: "-0.05em",
  lineHeight: 1,
};

/** 21px at 390 to 28px at 1440, held there. */
const QUOTE_STYLE: CSSProperties = {
  fontSize: "clamp(1.3125rem, 1.15rem + 0.667vw, 1.75rem)",
  fontWeight: 500,
  letterSpacing: "-0.035em",
  lineHeight: 1.25,
};

const ITEMS = testimonials.items;
const pad = (n: number) => String(n).padStart(2, "0");
const initials = (name: string) =>
  name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2);

function Arrow({ flip = false }: { flip?: boolean }) {
  return (
    <span
      aria-hidden
      className="gs-pill-disc grid size-8 shrink-0 place-items-center rounded-pill"
    >
      <svg
        viewBox="0 0 16 16"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.25"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={`size-3.5 transition-transform duration-300 ease-out ${
          flip
            ? "rotate-180 group-hover:-translate-x-0.5"
            : "group-hover:translate-x-0.5"
        }`}
      >
        <path d="M3 8h10M9 4l4 4-4 4" />
      </svg>
    </span>
  );
}

/** The pill, as a button: same ink, same disc, arrow at whichever end leads. */
const STEP_CLASS =
  "gs-pill group inline-flex h-10 items-center gap-4 rounded-pill font-mono text-[0.75rem] leading-none tracking-[0.08em] uppercase transition-colors duration-200";

/**
 * What clients say, one quote at a time.
 *
 * The claim on the left, the quotes on a leaf on the right. Prev and next
 * step through them; the quote slides in the direction of travel and the
 * change is announced politely. The leaf holds its height to the longest
 * quote so the controls never move under the pointer.
 */
export function Testimonials() {
  const [[index, direction], setState] = useState<[number, 1 | -1]>([0, 1]);
  const reduced = usePrefersReducedMotion();
  const item = ITEMS[index];

  const step = (by: 1 | -1) =>
    setState(([i]) => [(i + by + ITEMS.length) % ITEMS.length, by]);

  const travel = reduced ? 0 : 24;

  return (
    <section
      aria-labelledby="testimonials-heading"
      className="relative z-10 bg-surface-page px-5 pt-16 pb-20 sm:px-8 lg:px-12 lg:pt-24 lg:pb-24"
    >
      <div className="grid gap-12 border-t border-ink-200 pt-8 lg:grid-cols-12 lg:gap-6 lg:pt-12">
        <div className="lg:col-span-5">
          <p className="font-mono text-[0.75rem] leading-none tracking-[0.06em] text-ink-950 uppercase">
            {testimonials.eyebrow}
          </p>
          <h2
            id="testimonials-heading"
            className="mt-5 text-ink-950"
            style={HEADING_STYLE}
          >
            {testimonials.heading}
          </h2>
          <p className="mt-5 text-[1rem] leading-[1.55] text-ink-600">
            {testimonials.deck.map((line) => (
              <span key={line} className="block">
                {line}
              </span>
            ))}
          </p>
          <ArrowPill
            href={pointOfView.action.href}
            className="mt-8 inline-flex lg:mt-10"
          >
            {pointOfView.action.label}
          </ArrowPill>
        </div>

        <div
          role="group"
          aria-roledescription="carousel"
          aria-label={testimonials.label}
          className="flex flex-col rounded-[1rem] bg-[#f2f2ef] p-6 text-ink-950 sm:p-7 lg:col-span-7 lg:p-8"
        >
          <p className="font-mono text-[0.75rem] leading-none tracking-[0.06em] uppercase">
            {testimonials.label}
          </p>

          <span
            aria-hidden
            className="mt-8 block h-9 font-[Georgia,_'Times_New_Roman',_serif] text-[4.5rem] leading-[0.95] font-bold text-[#eb5b32] lg:mt-10"
          >
            &ldquo;
          </span>

          {/* Held to the longest quote so the controls never jump. */}
          <div
            aria-live="polite"
            className="mt-6 grid min-h-[12rem] content-between sm:min-h-[10rem] lg:mt-8 lg:min-h-[10.5rem]"
          >
            <AnimatePresence mode="wait" initial={false} custom={direction}>
              <motion.div
                key={index}
                custom={direction}
                initial={{ opacity: 0, x: direction * travel }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: direction * -travel }}
                transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
                className="flex flex-col justify-between gap-7"
              >
                <blockquote style={QUOTE_STYLE}>{item.quote}</blockquote>
                <div className="flex items-center gap-4">
                  <span
                    aria-hidden
                    className="grid size-10 shrink-0 place-items-center rounded-full bg-ink-200 font-mono text-[0.6875rem] leading-none"
                  >
                    {initials(item.name)}
                  </span>
                  <span>
                    <span className="block text-[0.9375rem] leading-[1.3] font-medium tracking-[-0.01em]">
                      {item.name}
                    </span>
                    <span className="block text-[0.8125rem] leading-[1.4] text-ink-600">
                      {item.role} · {item.company}
                    </span>
                  </span>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>

          <div className="mt-6 flex items-center justify-between gap-4 border-t border-ink-200 pt-5">
            <p className="font-mono text-[0.6875rem] leading-none tracking-[0.04em] whitespace-nowrap">
              <span className="sr-only">Quote </span>
              {pad(index + 1)} / {pad(ITEMS.length)}
            </p>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => step(-1)}
                aria-label="Previous quote"
                className={`${STEP_CLASS} pr-5 pl-1`}
              >
                <Arrow flip />
                Prev
              </button>
              <button
                type="button"
                onClick={() => step(1)}
                aria-label="Next quote"
                className={`${STEP_CLASS} pr-1 pl-5`}
              >
                Next
                <Arrow />
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
