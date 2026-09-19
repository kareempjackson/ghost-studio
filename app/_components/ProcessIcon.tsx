"use client";

import { motion, type Variants } from "motion/react";
import type { ReactNode } from "react";
import type { ProcessIcon as IconName } from "@/lib/process";
import { usePrefersReducedMotion } from "./usePrefersReducedMotion";

const SIGNAL = "#eb5b32";
const EASE = [0.65, 0, 0.35, 1] as const;

/** One full cycle, in seconds: draw, hold, sweep out, rest. */
const CYCLE = 2.8;
/**
 * The beats of every cycle, as fractions of it. Every moving part keys off
 * these, so the four marks share one rhythm and the stagger holds on every
 * repeat.
 */
const T = { drawn: 0.32, leave: 0.62, gone: 0.88 } as const;

const loop = (times: number[], delay = 0) => ({
  duration: CYCLE,
  times,
  ease: EASE,
  repeat: Infinity,
  delay,
});

/**
 * Lines draw in from their start, hold, then sweep out forwards — the offset
 * runs the stroke off its own end rather than rewinding it — so the mark is
 * redrawn from nothing on every pass. Each stroke is a beat behind the last.
 */
const STROKE: Variants = {
  hidden: { pathLength: 0, pathOffset: 0, opacity: 0 },
  shown: (i: number = 0) => ({
    pathLength: [0, 1, 1, 0, 0],
    pathOffset: [0, 0, 0, 1, 1],
    opacity: [0, 1, 1, 0, 0],
    transition: {
      pathLength: loop([0, T.drawn, T.leave, T.gone, 1], i * 0.07),
      pathOffset: loop([0, T.drawn, T.leave, T.gone, 1], i * 0.07),
      opacity: loop([0, 0.02, T.gone - 0.02, T.gone, 1], i * 0.07),
    },
  }),
  still: {
    pathLength: 1,
    pathOffset: 0,
    opacity: 1,
    transition: { duration: 0 },
  },
};

/** The signal lands once its drawing is there, with a little overshoot. */
const ACCENT: Variants = {
  hidden: { scale: 0, opacity: 0 },
  shown: (i: number = 0) => ({
    scale: [0, 0, 1.3, 1, 1, 0, 0],
    opacity: [0, 0, 1, 1, 1, 0, 0],
    transition: loop(
      [
        0,
        T.drawn - 0.06,
        T.drawn + 0.04,
        T.drawn + 0.1,
        T.leave,
        T.leave + 0.1,
        1,
      ],
      i * 0.07,
    ),
  }),
  still: { scale: 1, opacity: 1, transition: { duration: 0 } },
};

/** A ring that leaves the target's centre the moment the dot lands. */
const RIPPLE: Variants = {
  hidden: { scale: 1, opacity: 0 },
  shown: {
    scale: [1, 1, 5, 5],
    opacity: [0, 0.9, 0, 0],
    transition: loop([0, T.drawn + 0.02, T.leave, 1]),
  },
  still: { opacity: 0, transition: { duration: 0 } },
};

/** Transform an SVG element about its own centre, not the canvas corner. */
const CENTRED = {
  transformBox: "fill-box",
  transformOrigin: "center",
} as const;

/**
 * A group that moves through five `frames` — start, drawn, held, gone, rest —
 * on the same beats as the strokes inside it.
 */
function Move({
  frames,
  children,
}: {
  frames: Record<string, number[]>;
  children: ReactNode;
}) {
  const keys = Object.keys(frames);
  const variants: Variants = {
    hidden: Object.fromEntries(keys.map((k) => [k, frames[k][0]])),
    shown: {
      ...frames,
      transition: loop([0, T.drawn, T.leave, T.gone, 1]),
    },
    still: {
      ...Object.fromEntries(keys.map((k) => [k, frames[k][1]])),
      transition: { duration: 0 },
    },
  };
  return (
    <motion.g variants={variants} style={CENTRED}>
      {children}
    </motion.g>
  );
}

const LINE = {
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 2,
  strokeLinecap: "round",
  strokeLinejoin: "round",
  variants: STROKE,
} as const;

function Dot({ cx, cy, i = 0 }: { cx: number; cy: number; i?: number }) {
  return (
    <motion.circle
      cx={cx}
      cy={cy}
      r={6}
      fill={SIGNAL}
      custom={i}
      variants={ACCENT}
      style={CENTRED}
    />
  );
}

/**
 * The four process marks: white line on the black plate, one vermilion
 * accent each, drawn on a 160 grid so the strokes share one weight.
 *
 * Each mark is redrawn from nothing on a loop while its plate is on screen,
 * and each moves in its own way as it does — the target turns into place and
 * pings, the paths merge and the arrow pushes on, the layers slide together,
 * the cycle spins round. Reduced motion gets the finished mark, still.
 * Decorative: the step's title says what the mark shows.
 */
export function ProcessIcon({ name }: { name: IconName }) {
  const reduced = usePrefersReducedMotion();
  return (
    <motion.svg
      viewBox="0 0 160 160"
      aria-hidden
      initial={reduced ? "still" : "hidden"}
      animate={reduced ? "still" : undefined}
      whileInView={reduced ? undefined : "shown"}
      viewport={{ amount: 0.4 }}
      className="size-24 overflow-visible text-white xl:size-28"
    >
      {name === "target" && (
        <>
          <Move frames={{ rotate: [-90, 0, 0, 90, 90] }}>
            <motion.circle cx={80} cy={80} r={32} {...LINE} custom={0} />
            <motion.path
              d="M80 48V18M80 112v30M48 80H18M112 80h30"
              {...LINE}
              custom={1}
            />
          </Move>
          <motion.circle
            cx={80}
            cy={80}
            r={6}
            fill="none"
            stroke={SIGNAL}
            strokeWidth={1.5}
            variants={RIPPLE}
            style={CENTRED}
          />
          <Dot cx={80} cy={80} i={2} />
        </>
      )}

      {name === "merge" && (
        <>
          <Dot cx={20} cy={40} />
          <Dot cx={20} cy={120} i={1} />
          <motion.path d="M20 40h28l40 40" {...LINE} custom={0} />
          <motion.path d="M20 120h28l40-40" {...LINE} custom={1} />
          <motion.path d="M20 80h128" {...LINE} custom={2} />
          <Move frames={{ x: [-18, 0, 0, 18, 18] }}>
            <motion.path d="M126 58l22 22-22 22" {...LINE} custom={4} />
          </Move>
        </>
      )}

      {name === "layers" && (
        <>
          <motion.path
            d="M24 24h72v72H24zM52 24v72M24 44h72"
            {...LINE}
            custom={0}
          />
          <Move frames={{ x: [-24, 0, 0, 24, 24], y: [-24, 0, 0, 24, 24] }}>
            <motion.path
              d="M64 64h72v72H64zM108 64v72M64 116h72"
              {...LINE}
              custom={2}
            />
          </Move>
          <Move frames={{ rotate: [-90, 0, 0, 90, 90] }}>
            <motion.rect
              x={64}
              y={64}
              width={32}
              height={32}
              fill={SIGNAL}
              custom={3}
              variants={ACCENT}
              style={CENTRED}
            />
          </Move>
        </>
      )}

      {name === "cycle" && (
        <>
          <Move frames={{ rotate: [-240, 0, 0, 120, 120] }}>
            <motion.path
              d="M121.6 109A48 48 0 1 1 110.9 48.2"
              {...LINE}
              custom={0}
            />
            <motion.path d="M98 48.2h22V26" {...LINE} custom={2} />
            <Dot cx={121.6} cy={109} i={3} />
          </Move>
          <motion.path d="M62 84l14 14 24-26" {...LINE} custom={4} />
        </>
      )}
    </motion.svg>
  );
}
