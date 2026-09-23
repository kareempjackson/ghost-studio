import type { CSSProperties } from "react";
import { positioning } from "@/lib/brand";
import { Type } from "./Type";

/**
 * Sentence case, medium weight, tight — the claim's voice. A step under
 * display-l, and not in capitals: the wordmark already is, so the claim
 * speaks rather than repeats it.
 */
const CLAIM_STYLE: CSSProperties = {
  /* 30px at 390 to 60px at 1440, held there: a step under display-l. */
  fontSize: "clamp(1.875rem, 1.1786rem + 2.857vw, 3.75rem)",
  textTransform: "none",
  fontWeight: 500,
  letterSpacing: "-0.045em",
  lineHeight: 1.02,
};

/**
 * The claim and its sign-off, as one row: the sentence hung off the left
 * margin, the motto right-set opposite it and sitting on its last line.
 *
 * Set twice on the home page — under the reel, and again at the head of the
 * work that slides over it. Only the first is the page's heading; the repeat
 * is hidden from assistive tech so the line is not read out twice.
 */
export function Claim({
  headingId,
  repeat = false,
}: {
  /** Set on the instance that is the page's h1. */
  headingId?: string;
  /** A visual repeat: rendered as plain text and hidden from assistive tech. */
  repeat?: boolean;
}) {
  return (
    <div
      aria-hidden={repeat || undefined}
      className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between lg:gap-12"
    >
      <Type
        id={headingId}
        role="display-l"
        as={repeat ? "p" : "h1"}
        className="text-primary"
        style={CLAIM_STYLE}
      >
        {positioning.cover.map((line) => (
          <span key={line} className="block">
            {line}
          </span>
        ))}
      </Type>

      <p className="shrink-0 font-label text-[0.8125rem] leading-[1.6] tracking-[0.04em] text-primary uppercase sm:text-[0.9375rem] lg:pb-[0.35em] lg:text-right">
        {positioning.motto.map((line) => (
          <span key={line} className="block">
            {line}
          </span>
        ))}
      </p>
    </div>
  );
}
