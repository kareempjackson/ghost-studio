/**
 * The site guide's panel, in the chat window's own terms: the warm grey
 * sheet, white cards on it, pills for choices and Arial capitals for labels.
 */

/** A label over a group: the questions, the shortlist. */
export const KICKER = "font-label text-[0.625rem] leading-none tracking-[0.06em] text-ink-500 uppercase";

/** A choice. Sentence case, as the visitor would say it: these are answers, not buttons. */
export const CHOICE =
  "rounded-pill border border-ink-300 bg-white/60 px-3.5 py-2.5 text-left text-[0.875rem] leading-[1.15] tracking-[-0.01em] text-ink-950 transition-colors duration-200 hover:border-ink-950 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink-950";
export const CHOICE_ON = "border-ink-950 bg-ink-950 text-white hover:border-ink-950";

/** A quiet way on, set as a link: skip, start again, back. */
export const QUIET =
  "text-[0.875rem] text-ink-600 underline underline-offset-4 transition-colors duration-200 hover:text-ink-950";

export const FIELD =
  "w-full rounded-[0.625rem] bg-white px-4 py-3 text-[0.9375rem] leading-[1.4] tracking-[-0.01em] text-ink-950 placeholder:text-ink-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink-950";
export const LABEL = "block text-[0.875rem] leading-none text-ink-950";

/** The arrow on the round end of a dark pill: send, ask. */
export const ARROW = "M3 8h10M9 4l4 4-4 4";
