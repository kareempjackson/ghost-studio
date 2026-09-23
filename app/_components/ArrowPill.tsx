import type { ReactNode } from "react";

/**
 * The primary control: a pill with the label at one end and the arrow at the
 * other, on a disc of the ground's opposite ink.
 *
 * Hovered, the pill turns over — ink becomes vermilion, vermilion becomes ink
 * — and the disc travels the length of the pill to the other end, the label
 * making room for it as it goes. One gesture, read as the control opening.
 *
 * The pill quotes the aperture, so it is the one filled shape in any row it
 * sits in. Colours live in globals.css under `.gs-pill`, which is what lets
 * the header turn it over while the reel is behind it.
 */
const TONE = {
  ink: "gs-pill",
  signal: "gs-pill gs-pill-signal",
} as const;

/**
 * The disc sits an edge-gap in from one end; hovered, it sits the same gap in
 * from the other, so `right` runs the full width less the disc and both gaps.
 * The label's padding is the disc's width plus both gaps, and swaps with it.
 */
const SIZE = {
  sm: {
    pill: "h-10 text-[0.75rem] tracking-[0.08em]",
    disc: "size-8 right-1 group-hover:right-[calc(100%-2.25rem)]",
    label: "pr-11 pl-5 group-hover:pr-5 group-hover:pl-11",
  },
  md: {
    pill: "h-11 text-[0.8125rem] tracking-[0.08em]",
    disc: "size-9 right-1 group-hover:right-[calc(100%-2.5rem)]",
    label: "pr-12 pl-5 group-hover:pr-5 group-hover:pl-12",
  },
} as const;

const SWING = "duration-400 ease-[cubic-bezier(0.22,1,0.36,1)]";

export function ArrowPill({
  href,
  submit = false,
  children,
  size = "md",
  tone = "ink",
  className = "",
  ariaLabel,
}: {
  /** Where it goes. Leave it off and set `submit` to send a form instead. */
  href?: string;
  /** Renders a submit button, for the one control that ends a form. */
  submit?: boolean;
  children: ReactNode;
  size?: keyof typeof SIZE;
  tone?: keyof typeof TONE;
  /** When the visible label repeats across the page, name the destination. */
  ariaLabel?: string;
  className?: string;
}) {
  const spec = SIZE[size];
  const classes = `${TONE[tone]} group relative items-center rounded-pill font-label leading-none uppercase transition-colors duration-300 ${spec.pill} ${className || "inline-flex"}`;
  const inner = (
    <>
      <span className={`block transition-[padding] ${SWING} ${spec.label}`}>
        {children}
      </span>
      <span
        aria-hidden
        className={`gs-pill-disc absolute top-1/2 grid -translate-y-1/2 place-items-center rounded-pill transition-[right,background-color] ${SWING} ${spec.disc}`}
      >
        <svg
          viewBox="0 0 16 16"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.25"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="size-3.5"
        >
          <path d="M3 8h10M9 4l4 4-4 4" />
        </svg>
      </span>
    </>
  );

  return submit ? (
    <button type="submit" aria-label={ariaLabel} className={classes}>
      {inner}
    </button>
  ) : (
    <a href={href} aria-label={ariaLabel} className={classes}>
      {inner}
    </a>
  );
}
