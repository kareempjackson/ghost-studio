import type { CSSProperties } from "react";
import type { HomePage, Link } from "@/sanity/types";
import { ArrowPill } from "./ArrowPill";
import { Rich } from "./Rich";

/** 24px at 390 to 30px at 1440, held there: a paragraph set as a statement. */
const STATEMENT_STYLE: CSSProperties = {
  fontSize: "clamp(1.5rem, 1.3607rem + 0.571vw, 1.875rem)",
  fontWeight: 400,
  letterSpacing: "-0.035em",
  lineHeight: 1.22,
};

/**
 * The band that says how the studio works, in one paragraph.
 *
 * Three columns off one rule: the label on the left margin, the paragraph in
 * the middle, the way through on the right. The paragraph is the studio's
 * difference line, so it is read from the home page rather than restated.
 */
export function Methodology({
  methodology,
  action,
}: {
  methodology: HomePage["methodology"];
  /** The way through to the studio's point of view. */
  action: Link;
}) {
  return (
    <section
      aria-labelledby="methodology-heading"
      className="relative z-10 bg-surface-page px-5 pt-28 pb-20 sm:px-8 lg:px-12 lg:pt-44 lg:pb-32"
    >
      <div className="grid gap-8 lg:grid-cols-12 lg:gap-6">
        <h2
          id="methodology-heading"
          className="font-label text-[0.75rem] leading-none tracking-[0.06em] text-ink-500 uppercase lg:col-span-3 lg:pt-3 lg:text-[0.8125rem]"
        >
          {methodology.heading}
        </h2>

        <div
          className="max-w-[40ch] text-primary lg:col-span-6"
          style={STATEMENT_STYLE}
        >
          <Rich value={methodology.difference} />
        </div>

        <div className="lg:col-span-3 lg:justify-self-end">
          <ArrowPill href={action.href}>
            {action.label}
          </ArrowPill>
        </div>
      </div>
    </section>
  );
}
