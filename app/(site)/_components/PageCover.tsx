import type { CSSProperties, ReactNode } from "react";
import { ArrowPill } from "./ArrowPill";
import { LABEL } from "./StudioStrip";
import type { Rich as RichValue } from "@/sanity/types";
import { Rich } from "./Rich";

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
 *
 * Anything passed as children runs full width under both, at the foot of the
 * cover — the phase pages set their pills there — and the cover closes up
 * under it so whatever follows sits close.
 */
export function PageCover({
  id,
  eyebrow,
  heading,
  lead,
  summary,
  action,
  size = "lg",
  children,
}: {
  id: string;
  eyebrow: string;
  heading: readonly string[];
  /** A line over the summary, at the same size: who the page is for. */
  lead?: string;
  summary: RichValue | string;
  /** The way on. Leave it off when the page itself is the way on. */
  action?: { readonly label: string; readonly href: string };
  size?: keyof typeof HEADING_STYLE;
  children?: ReactNode;
}) {
  return (
    <section
      aria-labelledby={id}
      className={`px-5 pt-[calc(var(--gs-header-h)+4rem)] sm:px-8 lg:px-12 lg:pt-[calc(var(--gs-header-h)+8rem)] ${
        children ? "pb-6 lg:pb-6" : "pb-16 lg:pb-36"
      }`}
    >
      <p className={`${LABEL} gs-reveal text-ink-950`}>{eyebrow}</p>

      <div className="mt-10 grid items-start gap-10 lg:mt-20 lg:grid-cols-[minmax(0,1fr)_22rem] lg:gap-12">
        <h1 id={id} className="text-primary" style={HEADING_STYLE[size]}>
          {heading.map((line) => (
            <span key={line} className="block">
              {line}
            </span>
          ))}
        </h1>

        <div className="lg:pt-2">
          {lead && (
            <p className="gs-reveal mb-5 max-w-[22rem] text-[1rem] leading-[1.45] tracking-[-0.01em] text-primary [--reveal:2] lg:text-[1.0625rem]">
              {lead}
            </p>
          )}
          <div className="gs-reveal max-w-[22rem] text-[1rem] leading-[1.45] tracking-[-0.01em] text-primary [--reveal:3] lg:text-[1.0625rem]">
            <Rich value={summary} />
          </div>
          {action && (
            <ArrowPill
              href={action.href}
              className="gs-reveal mt-8 inline-flex [--reveal:4]"
            >
              {action.label}
            </ArrowPill>
          )}
        </div>
      </div>
      {children && <div className="mt-14 lg:mt-20">{children}</div>}
    </section>
  );
}
