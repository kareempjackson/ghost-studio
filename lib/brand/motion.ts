/**
 * Ghost Savvy Studios — motion.
 *
 * Motion explains state changes. It does not decorate, and it never delays a
 * citizen who is trying to file something. If a transition can be removed
 * without losing meaning, remove it.
 */

export const duration = {
  /** State flips that must feel instant: checkbox, toggle, hover. */
  instant: 90,
  fast: 150,
  /** The default for anything that moves or fades. */
  base: 240,
  /** Panels, drawers, disclosure. */
  slow: 400,
  /** Full-bleed section reveals. The upper bound; nothing is slower. */
  deliberate: 640,
} as const;

export type DurationToken = keyof typeof duration;

export const easing = {
  /** Symmetric. Colour, opacity, anything that does not travel. */
  standard: "cubic-bezier(0.4, 0, 0.2, 1)",
  /** Things arriving. Decelerate into place. */
  entrance: "cubic-bezier(0, 0, 0.2, 1)",
  /** Things leaving. Accelerate out; nobody watches an exit. */
  exit: "cubic-bezier(0.4, 0, 1, 1)",
  /** The studio curve: a long, flat settle. Reserved for hero reveals. */
  signature: "cubic-bezier(0.16, 1, 0.3, 1)",
} as const;

export type EasingToken = keyof typeof easing;

/** Distances things travel. Motion is short; the eye should not have to track. */
export const travel = {
  nudge: "2px",
  sm: "8px",
  md: "16px",
  lg: "32px",
} as const;

export function transition(
  properties: readonly string[],
  token: DurationToken = "base",
  curve: EasingToken = "standard"
): string {
  return properties
    .map((p) => `${p} ${duration[token]}ms ${easing[curve]}`)
    .join(", ");
}

export const motionRules = [
  {
    rule: "Honour prefers-reduced-motion by removing travel, not by removing feedback.",
    why: "A user who cannot tolerate movement still needs to know the state changed. Cross-fade instead of slide; never drop to nothing.",
  },
  {
    rule: "Nothing auto-plays, auto-advances or loops for more than five seconds.",
    why: "WCAG 2.2.2. A carousel that moves on its own is a failure, not a feature.",
  },
  {
    rule: "Parallax and scroll-jacking are not used.",
    why: "They break find-in-page, keyboard paging and screen-reader order — the three things institutional users rely on most.",
  },
  {
    rule: "Nothing blocks input while animating.",
    why: "The animation is a description of what already happened, not a queue the user waits in.",
  },
] as const;

/** Drop-in guard for every animated surface. */
export const reducedMotionCss = `@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }
}`;
