import type { CSSProperties } from "react";
import type { Chapter } from "@/sanity/types";
import { MONO } from "../../_components/SectionHead";
import { Rich } from "../../_components/Rich";
import { PlateRows } from "./Plate";

/** 28px at 390 to 40px at 1440, held there. A part's heading, and its list's. */
const PART_STYLE: CSSProperties = {
  fontSize: "clamp(1.75rem, 1.4714rem + 1.143vw, 2.5rem)",
  fontWeight: 400,
  letterSpacing: "-0.04em",
  lineHeight: 1.12,
};

/** The text column every part sets its words in, beside its label. */
const PART_GRID =
  "grid gap-y-6 lg:grid-cols-[minmax(0,2.8fr)_minmax(0,7.2fr)] lg:gap-x-8";

const pad = (n: number) => String(n).padStart(2, "0");

/**
 * One part of the story: its label in the margin, then the heading, what
 * the situation was, and what the studio did about it. Its pictures follow,
 * before the next part begins.
 *
 * `number` sets the part's place before its label, for a story read in
 * order: a Ghost family story's chapters, where a case study's parts are
 * trades that can be read in any.
 */
export function Part({
  chapter,
  listHeading,
  number,
}: {
  chapter: Chapter;
  listHeading: string;
  number?: number;
}) {
  const headingId = `${chapter.id}-heading`;
  return (
    <section
      id={chapter.id}
      aria-labelledby={headingId}
      className="scroll-mt-20 pt-20 lg:pt-32"
    >
      <div className={`${PART_GRID} px-5 sm:px-8 lg:px-12`}>
        <p className={`${MONO} text-ink-500 lg:pt-4`}>
          {number !== undefined && (
            <span className="mr-3 text-ink-950">{pad(number)}</span>
          )}
          {chapter.label}
        </p>
        <div className="max-w-[45rem]">
          <h2 id={headingId} className="text-primary" style={PART_STYLE}>
            <Rich value={chapter.heading} inline />
          </h2>
          {chapter.body.length > 0 && (
            <div className="mt-8 text-[1.0625rem] leading-[2] tracking-[-0.01em] text-secondary [--rich-gap:2rem] lg:mt-10 lg:text-[1.125rem] lg:leading-[2.15]">
              <Rich value={chapter.body} />
            </div>
          )}
          {chapter.items.length > 0 && (
            <>
              <h3 className="mt-16 text-primary lg:mt-24" style={PART_STYLE}>
                {listHeading}
              </h3>
              <ul className="mt-8 list-disc pl-5 text-[1.0625rem] leading-[2] tracking-[-0.01em] text-secondary marker:text-ink-400 lg:mt-10 lg:text-[1.125rem] lg:leading-[2.35]">
                {chapter.items.map((item, index) => (
                  <li key={index} className="pl-1">
                    {item.lead && <strong className="font-semibold">{item.lead}</strong>}
                    {item.lead && ": "}
                    <Rich value={item.text} inline />
                  </li>
                ))}
              </ul>
            </>
          )}
        </div>
      </div>
      {chapter.media.length > 0 && (
        <div className="mt-20 lg:mt-32">
          <PlateRows rows={chapter.media} />
        </div>
      )}
    </section>
  );
}
