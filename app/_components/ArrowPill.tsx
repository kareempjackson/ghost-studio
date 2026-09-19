import type { ReactNode } from "react";

/**
 * The primary control: an ink pill, the label at one end and the arrow at the
 * other on a disc of the label's own ink at 13% — present, never loud.
 *
 * The pill quotes the aperture, so it is the one filled shape in any row it
 * sits in. Colours live in globals.css under `.gs-pill`, which is what lets
 * the header turn it over while the reel is behind it.
 *
 * Two tones: ink for light grounds, and signal for the one call to action on
 * a dark band — vermilion with ink type, the arrow on an ink disc.
 */
const TONE = {
  ink: "gs-pill",
  signal: "gs-pill gs-pill-signal",
} as const;

const SIZE = {
  sm: {
    pill: "h-10 gap-4 pr-1 pl-5 text-[0.75rem] tracking-[0.08em]",
    disc: "size-8",
  },
  md: {
    pill: "h-11 gap-6 pr-1 pl-5 text-[0.8125rem] tracking-[0.08em]",
    disc: "size-9",
  },
} as const;

export function ArrowPill({
  href,
  children,
  size = "md",
  tone = "ink",
  className = "",
  ariaLabel,
}: {
  href: string;
  children: ReactNode;
  size?: keyof typeof SIZE;
  tone?: keyof typeof TONE;
  /** When the visible label repeats across the page, name the destination. */
  ariaLabel?: string;
  className?: string;
}) {
  return (
    <a
      href={href}
      aria-label={ariaLabel}
      className={`${TONE[tone]} group items-center rounded-pill font-mono leading-none uppercase transition-colors duration-200 ${SIZE[size].pill} ${className || "inline-flex"}`}
    >
      {children}
      <span
        aria-hidden
        className={`gs-pill-disc grid shrink-0 place-items-center overflow-hidden rounded-pill ${SIZE[size].disc}`}
      >
        <svg
          viewBox="0 0 16 16"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.25"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="size-3.5 transition-transform duration-300 ease-out group-hover:translate-x-0.5"
        >
          <path d="M3 8h10M9 4l4 4-4 4" />
        </svg>
      </span>
    </a>
  );
}
