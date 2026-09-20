"use client";

import { MotionConfig, motion, type Variants } from "motion/react";
import type { CSSProperties } from "react";
import { pointOfView } from "@/lib/point-of-view";
import { ArrowPill } from "./ArrowPill";

/** 40px at 390 to 64px at 1440, held there. */
const HEADING_STYLE: CSSProperties = {
  fontSize: "clamp(2.5rem, 1.9429rem + 2.286vw, 4rem)",
  fontWeight: 500,
  letterSpacing: "-0.045em",
  lineHeight: 1.02,
};

/** 26px at 390 to 28px at 1440 — big enough to read as the card's face. */
const STATEMENT_STYLE: CSSProperties = {
  fontSize: "clamp(1.625rem, 1.5786rem + 0.19vw, 1.75rem)",
  fontWeight: 500,
  letterSpacing: "-0.04em",
  lineHeight: 1.08,
};

/** Quick, with a short settle: the cards are dealt, not floated. */
const SPRING = {
  type: "spring",
  stiffness: 170,
  damping: 20,
  mass: 0.9,
} as const;

/**
 * Each card is dealt up from below at its tilt, one after the next, and
 * squares up when it is pointed at. The tilt is the card's own, read from
 * `custom`, so the three never line up into a grid.
 */
const CARD: Variants = {
  hidden: { opacity: 0, y: 96, rotate: 0 },
  shown: (card: { tilt: number; index: number }) => ({
    opacity: 1,
    y: 0,
    rotate: card.tilt,
    transition: { ...SPRING, delay: card.index * 0.09 },
  }),
  lift: { y: -10, rotate: 0, transition: SPRING },
};

/**
 * The band that says what the studio thinks.
 *
 * A dark ground, so it declares `data-ground="dark"` and the header turns
 * white while it is under the row. The claim sits on the left; the three
 * things it asks for sit on the right, one card each, in reading order.
 */
export function PointOfView() {
  return (
    <section
      aria-labelledby="point-of-view-heading"
      data-ground="dark"
      className="relative z-10 bg-black px-5 pt-16 pb-28 text-white sm:px-8 lg:px-12 lg:pt-24 lg:pb-40"
    >
      <div className="flex items-center justify-between gap-6 border-t border-white/8 pt-8 lg:pt-10">
        <p className="font-mono text-[0.75rem] leading-none tracking-[0.06em] text-ink-300 uppercase sm:text-[0.8125rem]">
          {pointOfView.eyebrow}
        </p>
        <ArrowPill href={pointOfView.action.href} tone="signal">
          {pointOfView.action.label}
        </ArrowPill>
      </div>

      <div className="mt-20 grid items-center gap-16 lg:mt-32 xl:grid-cols-[minmax(0,1.1fr)_minmax(0,2fr)] xl:gap-10">
        <div>
          <h2 id="point-of-view-heading" style={HEADING_STYLE}>
            {pointOfView.heading.map((line) => (
              <span key={line} className="block xl:whitespace-nowrap">
                {line}
              </span>
            ))}
          </h2>
          <p className="mt-8 text-[1.0625rem] leading-[1.6] text-ink-300 lg:mt-12 lg:text-[1.1875rem]">
            {pointOfView.deck.map((line) => (
              <span key={line} className="block">
                {line}
              </span>
            ))}
          </p>
        </div>

        <MotionConfig reducedMotion="user">
          <ol className="grid gap-6 px-2 sm:grid-cols-3 sm:gap-4 lg:gap-5 lg:px-0">
            {pointOfView.cards.map((card, index) => (
              <motion.li
                key={card.label}
                custom={{ tilt: card.tilt, index }}
                variants={CARD}
                initial="hidden"
                whileInView="shown"
                whileHover="lift"
                viewport={{ once: true, amount: 0.3 }}
                style={{ backgroundColor: card.ground }}
                className="flex aspect-[0.88] flex-col rounded-[0.625rem] p-6 text-ink-950"
              >
                <div className="flex items-baseline justify-between border-b border-ink-950/25 pb-3 font-mono text-[0.6875rem] leading-none tracking-[0.04em] uppercase">
                  <span className="text-ink-950/55">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <span>{card.label}</span>
                </div>

                <p
                  className="mt-8 whitespace-pre-line lg:mt-10"
                  style={STATEMENT_STYLE}
                >
                  {card.statement}
                </p>

                <div className="mt-auto border-t border-ink-950/25 pt-4">
                  <p className="max-w-[15rem] text-[0.875rem] leading-[1.4]">
                    {card.action}
                  </p>
                </div>
              </motion.li>
            ))}
          </ol>
        </MotionConfig>
      </div>
    </section>
  );
}
