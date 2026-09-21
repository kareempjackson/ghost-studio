"use client";

import {
  motion,
  useScroll,
  useSpring,
  useTransform,
  useVelocity,
} from "motion/react";
import { usePrefersReducedMotion } from "./usePrefersReducedMotion";

/**
 * The colours that trail out from under the sheet, nearest first: a lighter
 * vermilion, then the yellow and teal from the point-of-view cards.
 */
const TRAILS = ["#f2875f", "#eedf4e", "#63cdab"] as const;
/** How far each trail can hang below the one in front of it, in px. */
const TRAIL_MAX = 22;
/** Px of trail per px/s of scroll speed. */
const TRAIL_GAIN = 0.012;

/**
 * One colour hanging under the sheet. Its drop follows the scroll speed, so
 * a flick leaves a longer trail than a slow drag, and it tucks back under the
 * sheet as the scroll settles.
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
 * The colour that trails out from under the bottom edge of the last sheet
 * over the footer while the page moves. Place it first inside a `relative
 * isolate` box the same size as the sheet, with the sheet after it.
 */
export function SheetTrails() {
  const reduced = usePrefersReducedMotion();
  const { scrollY } = useScroll();
  const velocity = useVelocity(scrollY);
  /* Smoothed, so the trail stretches and settles rather than jitters. */
  const speed = useSpring(velocity, { stiffness: 260, damping: 38, mass: 0.6 });

  if (reduced) return null;
  return TRAILS.map((color, index) => (
    <Trail key={color} color={color} depth={index + 1} speed={speed} />
  ));
}
