"use client";

import {
  motion,
  useScroll,
  useSpring,
  useTransform,
  useVelocity,
} from "motion/react";
import type { CSSProperties } from "react";
import { contactBand, email } from "@/lib/footer";
import { usePrefersReducedMotion } from "./usePrefersReducedMotion";

/** 44px at 390 to 80px at 1440, held there. */
const HEADING_STYLE: CSSProperties = {
  fontSize: "clamp(2.75rem, 1.9143rem + 3.429vw, 5rem)",
  fontWeight: 400,
  letterSpacing: "-0.06em",
  lineHeight: 0.98,
};

/**
 * The colours that trail out from under the band, nearest first: a lighter
 * vermilion, then the yellow and teal from the point-of-view cards.
 */
const TRAILS = ["#f2875f", "#eedf4e", "#63cdab"] as const;
/** How far each trail can hang below the one in front of it, in px. */
const TRAIL_MAX = 22;
/** Px of trail per px/s of scroll speed. */
const TRAIL_GAIN = 0.012;

/**
 * One colour hanging under the band. Its drop follows the scroll speed, so
 * a flick leaves a longer trail than a slow drag, and it tucks back under the
 * band as the scroll settles.
 */
function Trail({
  color,
  depth,
  speed,
}: {
  color: string;
  depth: number;
  speed: ReturnType<typeof useSpring>;
}) {
  const y = useTransform(speed, (v) =>
    Math.min(Math.max(v, 0) * TRAIL_GAIN * depth, TRAIL_MAX * depth),
  );
  return (
    <motion.div
      aria-hidden
      style={{ y, backgroundColor: color, zIndex: -depth }}
      className="absolute inset-0 rounded-b-[32px]"
    />
  );
}

/**
 * The close: one question on vermilion, and one way to answer it.
 *
 * It sits after `main`, directly over the footer lying underneath, so its
 * rounded bottom corners open onto the footer rather than onto the page. It
 * is the sheet that slides up off the footer, and while it moves, colour
 * trails out from under its bottom edge.
 */
export function ContactBand() {
  const reduced = usePrefersReducedMotion();
  const { scrollY } = useScroll();
  const velocity = useVelocity(scrollY);
  /* Smoothed, so the trail stretches and settles rather than jitters. */
  const speed = useSpring(velocity, { stiffness: 260, damping: 38, mass: 0.6 });

  return (
    <div className="relative z-[1] isolate">
      {!reduced &&
        TRAILS.map((color, index) => (
          <Trail key={color} color={color} depth={index + 1} speed={speed} />
        ))}
      <section
        aria-labelledby="contact-heading"
        className="relative rounded-b-[32px] bg-[#eb5b32] px-5 pt-14 pb-14 text-ink-950 sm:px-8 lg:px-12 lg:pt-16 lg:pb-16"
      >
        <p className="font-mono text-[0.75rem] leading-none tracking-[0.06em] uppercase">
          {contactBand.eyebrow}
        </p>

        <div className="mt-8 flex flex-col gap-10 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h2 id="contact-heading" style={HEADING_STYLE}>
              {contactBand.heading.map((line) => (
                <span key={line} className="block">
                  {line}
                </span>
              ))}
            </h2>
            <a
              href={`mailto:${email}`}
              className="mt-8 inline-block border-b border-ink-950 pb-1 text-[1.125rem] leading-none tracking-[-0.02em] transition-opacity duration-200 hover:opacity-70 lg:text-[1.25rem]"
            >
              {email}
            </a>
          </div>

          {/* The one control: a black disc, the arrow leaning into the hover. */}
          <a
            href={contactBand.action.href}
            className="group grid size-36 shrink-0 place-content-center justify-items-center gap-4 self-end rounded-full bg-[#111] text-white transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] hover:scale-[1.04] lg:mb-2 lg:size-36"
          >
            <svg
              aria-hidden
              viewBox="0 0 48 32"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="h-7 w-10 transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:translate-x-1.5 group-hover:-translate-y-1"
            >
              <path d="M3 22 44 10M30 4l14 6-6 14" />
            </svg>
            <span className="font-mono text-[0.75rem] leading-none tracking-[0.08em] uppercase">
              {contactBand.action.label}
            </span>
          </a>
        </div>
      </section>
    </div>
  );
}
