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

/** Quick out, long settle — the curve every pill on the site opens on. */
const SWING = "duration-400 ease-[cubic-bezier(0.22,1,0.36,1)]";

/**
 * Prev and next, as the site's own pill: same ink, same disc, and the same
 * gesture on hover as every `ArrowPill` — the pill turns over and the disc
 * travels the length of it to the other end, the label making room as it
 * goes. The disc starts at whichever end leads, so Prev's runs left to right
 * and Next's right to left, and the two mirror each other.
 *
 * Sizes are `ArrowPill`'s small ones: a 32px disc a 4px gap in from the end,
 * so the far position is the full width less the disc and both gaps.
 */
function StepButton({
  direction,
  label,
  onClick,
  children,
}: {
  direction: "prev" | "next";
  label: string;
  onClick: () => void;
  children: string;
}) {
  const prev = direction === "prev";
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      className="gs-pill group relative inline-flex h-10 items-center rounded-pill font-mono text-[0.75rem] leading-none tracking-[0.08em] uppercase transition-colors duration-300"
    >
      <span
        className={`block transition-[padding] ${SWING} ${
          prev
            ? "pr-5 pl-11 group-hover:pr-11 group-hover:pl-5"
            : "pr-11 pl-5 group-hover:pr-5 group-hover:pl-11"
        }`}
      >
        {children}
      </span>
      <span
        aria-hidden
        className={`gs-pill-disc absolute top-1/2 grid size-8 -translate-y-1/2 place-items-center rounded-pill ${SWING} ${
          prev
            ? "left-1 transition-[left,background-color] group-hover:left-[calc(100%-2.25rem)]"
            : "right-1 transition-[right,background-color] group-hover:right-[calc(100%-2.25rem)]"
        }`}
      >
        <svg
          viewBox="0 0 16 16"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.25"
          strokeLinecap="round"
          strokeLinejoin="round"
          className={`size-3.5 ${prev ? "rotate-180" : ""}`}
        >
          <path d="M3 8h10M9 4l4 4-4 4" />
        </svg>
      </span>
    </button>
  );
}

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
      <div className="grid gap-12 border-t border-edge-subtle pt-8 lg:grid-cols-12 lg:gap-6 lg:pt-12">
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

          <div className="mt-6 flex items-center justify-between gap-4 border-t border-edge-subtle pt-5">
            <p className="font-mono text-[0.6875rem] leading-none tracking-[0.04em] whitespace-nowrap">
              <span className="sr-only">Quote </span>
              {pad(index + 1)} / {pad(ITEMS.length)}
            </p>
            <div className="flex gap-2">
              <StepButton
                direction="prev"
                label="Previous quote"
                onClick={() => step(-1)}
              >
                Prev
              </StepButton>
              <StepButton
                direction="next"
                label="Next quote"
                onClick={() => step(1)}
              >
                Next
              </StepButton>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
