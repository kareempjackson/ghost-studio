import type { CSSProperties } from "react";
import { ArrowPill } from "./ArrowPill";
import { LABEL } from "./StudioStrip";

/**
 * The claim on the cover. `lg`: 52px at 390 to 128px at 1440, held there.
 * `md`: 48px at 390 to 116px at 1440, held there — the track pages' comps,
 * whose two-line claims run longer.
 */
const HEADING_STYLE = {
  lg: {
    fontSize: "clamp(3.25rem, 1.4857rem + 7.238vw, 8rem)",
    fontWeight: 400,
    letterSpacing: "-0.055em",
    lineHeight: 0.95,
  },
  md: {
    fontSize: "clamp(3rem, 1.4214rem + 6.476vw, 7.25rem)",
    fontWeight: 400,
    letterSpacing: "-0.055em",
    lineHeight: 0.95,
  },
} as const satisfies Record<string, CSSProperties>;

/**
 * An inner page's cover: the claim, very large, on the left; one sentence
 * and the way on, small, on the right. The claim does the work; the column
 * only says where to go from it.
 */
export function PageCover({
  id,
  eyebrow,
  heading,
  summary,
  action,
  size = "lg",
}: {
  id: string;
  eyebrow: string;
  heading: readonly string[];
  summary: string;
  /** The way on. Leave it off when the page itself is the way on. */
  action?: { readonly label: string; readonly href: string };
  size?: keyof typeof HEADING_STYLE;
}) {
  return (
    <section
      aria-labelledby={id}
      className="px-5 pt-[calc(var(--gs-header-h)+4rem)] pb-16 sm:px-8 lg:px-12 lg:pt-[calc(var(--gs-header-h)+8rem)] lg:pb-36"
    >
      <p className={`${LABEL} text-ink-950`}>{eyebrow}</p>

      <div className="mt-10 grid items-start gap-10 lg:mt-20 lg:grid-cols-[minmax(0,1fr)_22rem] lg:gap-12">
        <h1 id={id} className="text-primary" style={HEADING_STYLE[size]}>
          {heading.map((line) => (
            <span key={line} className="block">
              {line}
            </span>
          ))}
        </h1>

        <div className="lg:pt-2">
          <p className="max-w-[22rem] text-[1rem] leading-[1.45] tracking-[-0.01em] text-primary lg:text-[1.0625rem]">
            {summary}
          </p>
          {action && (
            <ArrowPill href={action.href} className="mt-8 inline-flex">
              {action.label}
            </ArrowPill>
          )}
        </div>
      </div>
    </section>
  );
}
