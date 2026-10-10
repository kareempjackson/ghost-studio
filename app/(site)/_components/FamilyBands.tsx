import { stegaClean } from "next-sanity";
import type { CSSProperties } from "react";
import { getAboutPage } from "@/sanity/content";
import type { FamilyAsk as FamilyAskData, FamilyBand, Note } from "@/sanity/types";
import { ArrowPill } from "./ArrowPill";
import { Rich } from "./Rich";
import { MONO, SectionHead } from "./SectionHead";
import { LABEL } from "./StudioStrip";
import { UpRight } from "./UpRight";

/**
 * The bands every Ghost family page shares, on the family's own page and on
 * each of its stories: the ask, the rest of the family, and the notes stuck
 * to the wall.
 */

/** 44px at 390 to 80px at 1440, held there. The ask, in the close's voice. */
const ASK_STYLE: CSSProperties = {
  fontSize: "clamp(2.75rem, 1.9143rem + 3.429vw, 5rem)",
  fontWeight: 400,
  letterSpacing: "-0.05em",
  lineHeight: 1,
};

/** 26px at 390 to 32px at 1440, held there. What a family member is for. */
const FAMILY_STYLE: CSSProperties = {
  fontSize: "clamp(1.625rem, 1.4857rem + 0.571vw, 2rem)",
  fontWeight: 400,
  letterSpacing: "-0.04em",
  lineHeight: 1.12,
};

export const BAND = "px-5 py-24 sm:px-8 lg:px-12 lg:py-36";

/** A note stuck to the wall: square, a little off true. Size and angle are the caller's. */
const NOTE =
  "grid place-items-center text-ink-950 text-[1.125rem] font-medium tracking-[-0.03em] shadow-raised lg:text-[1.375rem]";

/** One note, on its own colour. Decorative: what it says is said on the page too. */
export function StickyNote({ note, className }: { note: Note; className: string }) {
  return (
    <span aria-hidden style={{ backgroundColor: note.ground }} className={`${NOTE} ${className}`}>
      {note.text}
    </span>
  );
}

/** What the family asks of the reader, large, with one way to answer. */
export function FamilyAsk({ ask }: { ask: FamilyAskData }) {
  return (
    <section aria-labelledby="ask-heading" className={BAND}>
      <p className={`${MONO} text-ink-950`}>{ask.label}</p>
      <h2
        id="ask-heading"
        className="mt-8 text-primary uppercase lg:mt-10"
        style={ASK_STYLE}
      >
        {ask.heading.map((line) => (
          <span key={line} className="block">
            {line}
          </span>
        ))}
      </h2>
      <div className="mt-8 text-[1.0625rem] leading-[1.5] tracking-[-0.01em] text-secondary lg:text-[1.1875rem]">
        <Rich value={ask.summary} />
      </div>
      <ArrowPill href={ask.action.href} className="mt-10 inline-flex">
        {ask.action.label}
      </ArrowPill>
    </section>
  );
}

/**
 * The rest of the family: everyone on /about but the member `current`
 * names, each with what they are for and the way there.
 */
export async function FamilyMembers({
  band,
  current,
}: {
  band: FamilyBand;
  /** The family page being read, or the one a story belongs to: left out. */
  current: string;
}) {
  const aboutPage = await getAboutPage();
  const family = aboutPage.family.members.filter(
    (member) => stegaClean(member.href) !== stegaClean(current),
  );

  return (
    <section aria-labelledby="family-heading" className={BAND}>
      <SectionHead id="family-heading" label={band.label} heading={band.heading}>
        <ul className="mt-14 grid gap-y-14 sm:grid-cols-2 sm:gap-x-8 lg:mt-24">
          {family.map((member) => (
            <li key={member.name}>
              <a href={member.href} className="group flex flex-col text-primary">
                <span className={`${LABEL} text-ink-950`}>{member.name}</span>
                <span
                  className="mt-8 transition-colors duration-200 group-hover:text-accent lg:mt-12"
                  style={FAMILY_STYLE}
                >
                  {member.statement.map((line) => (
                    <span key={line} className="block">
                      {line}
                    </span>
                  ))}
                </span>
                <span className="mt-10 transition-colors duration-200 group-hover:text-accent lg:mt-16">
                  <UpRight />
                </span>
              </a>
            </li>
          ))}
        </ul>
      </SectionHead>
    </section>
  );
}
