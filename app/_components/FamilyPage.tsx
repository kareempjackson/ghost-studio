import type { Metadata } from "next";
import Image from "next/image";
import type { CSSProperties } from "react";
import { aboutPage } from "@/lib/about";
import type { FamilyPageData } from "@/lib/family-pages";
import { ArrowPill } from "./ArrowPill";
import { ChatLauncher } from "./ChatLauncher";
import { ContactBand } from "./ContactBand";
import { MONO, SectionHead } from "./SectionHead";
import { SiteFooter } from "./SiteFooter";
import { SiteHeader } from "./SiteHeader";
import { LABEL } from "./StudioStrip";
import { UpRight } from "./UpRight";

/** Metadata for a family page, from its entry in lib/family-pages.ts. */
export function familyMetadata(page: FamilyPageData): Metadata {
  return { title: page.title, description: page.description };
}

/** 56px at 390 to 136px at 1440, held there. The claim, set solid. */
const COVER_STYLE: CSSProperties = {
  fontSize: "clamp(3.5rem, 0.5286rem + 12.19vw, 8.5rem)",
  fontWeight: 600,
  letterSpacing: "-0.06em",
  lineHeight: 0.94,
};

/** 44px at 390 to 80px at 1440, held there. The ask, in the close's voice. */
const ASK_STYLE: CSSProperties = {
  fontSize: "clamp(2.75rem, 1.9143rem + 3.429vw, 5rem)",
  fontWeight: 400,
  letterSpacing: "-0.05em",
  lineHeight: 1,
};

/** 26px at 390 to 32px at 1440, held there. One experiment's name. */
const EXPERIMENT_STYLE: CSSProperties = {
  fontSize: "clamp(1.5rem, 1.3571rem + 0.571vw, 1.875rem)",
  fontWeight: 400,
  letterSpacing: "-0.04em",
  lineHeight: 1.1,
};

/** 26px at 390 to 32px at 1440, held there. What a family member is for. */
const FAMILY_STYLE: CSSProperties = {
  fontSize: "clamp(1.625rem, 1.4857rem + 0.571vw, 2rem)",
  fontWeight: 400,
  letterSpacing: "-0.04em",
  lineHeight: 1.12,
};

const BAND = "px-5 py-24 sm:px-8 lg:px-12 lg:py-36";

/** A note stuck to the wall beside the claim: square, a little off true. */
const NOTE =
  "grid place-items-center text-ink-950 text-[1.125rem] font-medium tracking-[-0.03em] shadow-raised lg:text-[1.375rem]";

/**
 * A Ghost family page: `/ghost-labs`, `/ghost-u`.
 *
 * The claim is centred and set solid, with the working wall around it: two
 * notes and a poster, pinned at angles, so the cover reads as a bench and not
 * a brochure. Then the archive, staggered in two columns, the ask, and the
 * rest of the family.
 */
export function FamilyPage({ page }: { page: FamilyPageData }) {
  const { cover, archive, ask } = page;
  const [high, low] = cover.notes;
  /** The rest of the family: everyone on /about but the page you are on. */
  const family = aboutPage.family.members.filter(
    (member) => member.href !== page.href,
  );

  return (
    <>
      <SiteHeader />
      {/* One layer above the footer, with its own ground: the page is the
          sheet that slides up off the footer lying underneath it. */}
      <main className="relative z-[1] flex flex-1 flex-col overflow-x-clip bg-surface-page">
        <section
          aria-labelledby="family-page-heading"
          className="relative px-5 pt-[calc(var(--gs-header-h)+5rem)] pb-24 sm:px-8 lg:px-12 lg:pt-[calc(var(--gs-header-h)+10rem)] lg:pb-40"
        >
          {/* The wall. Pinned around the claim from lg up; below that they
              would sit on the words, so they line up under it instead. */}
          <div aria-hidden className="hidden lg:block">
            <span
              style={{ backgroundColor: high.ground }}
              className={`${NOTE} absolute top-[36%] left-[5%] h-[5.5rem] w-[7.5rem] -rotate-[12deg]`}
            >
              {high.text}
            </span>
            <span
              style={{ backgroundColor: low.ground }}
              className={`${NOTE} absolute top-[62%] left-[16%] h-[5.25rem] min-w-[5.25rem] rotate-[5deg] px-5`}
            >
              {low.text}
            </span>
          </div>

          <div className="mx-auto flex max-w-[64rem] flex-col items-center text-center">
            <h1
              id="family-page-heading"
              className="text-primary uppercase"
              style={COVER_STYLE}
            >
              {cover.heading.map((line) => (
                <span key={line} className="block">
                  {line}
                </span>
              ))}
            </h1>
            <p className="mt-12 max-w-[23rem] text-[1rem] leading-[1.45] tracking-[-0.01em] text-primary lg:mt-24">
              {cover.summary}
            </p>
            <ArrowPill href={cover.action.href} className="mt-6 inline-flex">
              {cover.action.label}
            </ArrowPill>
          </div>

          <div
            className="relative mx-auto mt-16 aspect-[4/3.6] w-[min(16rem,70%)] rotate-[7deg] overflow-hidden border-t-2 border-[#eb5b32] bg-[#5a4a26] shadow-overlay lg:absolute lg:top-[58%] lg:right-[7%] lg:mt-0 lg:w-[16.5vw] lg:max-w-[16rem]"
            {...(cover.card.src ? {} : { role: "img", "aria-label": cover.card.alt })}
          >
            {cover.card.src ? (
              <Image
                src={cover.card.src}
                alt={cover.card.alt}
                fill
                sizes="(min-width: 1024px) 17vw, 70vw"
                className="object-cover"
              />
            ) : (
              // PLACEHOLDER — the comp sets the basketball poster here.
              <Image
                src="/logos/wordmark-flat.svg"
                alt=""
                width={923}
                height={204}
                className="absolute top-[30%] left-1/2 w-[78%] -translate-x-1/2"
              />
            )}
          </div>

          <div aria-hidden className="mt-12 flex justify-center gap-6 lg:hidden">
            <span
              style={{ backgroundColor: high.ground }}
              className={`${NOTE} h-20 w-28 -rotate-[10deg]`}
            >
              {high.text}
            </span>
            <span
              style={{ backgroundColor: low.ground }}
              className={`${NOTE} h-20 min-w-20 rotate-[5deg] px-4`}
            >
              {low.text}
            </span>
          </div>
        </section>

        <section aria-labelledby="archive-heading" className={BAND}>
          <SectionHead
            id="archive-heading"
            label={archive.label}
            heading={archive.heading}
            deck={archive.deck}
          />

          {/* Two columns, the right one dropped, so the plates step down
              the page rather than line up as a grid of products. */}
          <ul className="mt-16 grid gap-y-14 sm:grid-cols-2 sm:gap-x-5 lg:mt-28 lg:gap-x-8 lg:gap-y-24">
            {archive.items.map((item, index) => (
              <li
                key={item.title}
                className={index % 2 ? "sm:mt-24 lg:mt-36" : undefined}
              >
                <div
                  aria-hidden
                  style={{ backgroundColor: item.ground }}
                  className={index % 2 ? "aspect-square" : "aspect-[11/10]"}
                />
                <h3 className="mt-6 text-primary lg:mt-8" style={EXPERIMENT_STYLE}>
                  {item.title}
                </h3>
                <p className="mt-3 text-[0.875rem] leading-[1.5] tracking-[-0.01em] text-secondary lg:mt-4">
                  {item.body}
                </p>
              </li>
            ))}
          </ul>
        </section>

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
          <p className="mt-8 text-[1.0625rem] leading-[1.5] tracking-[-0.01em] text-secondary lg:text-[1.1875rem]">
            {ask.summary}
          </p>
          <ArrowPill href={ask.action.href} className="mt-10 inline-flex">
            {ask.action.label}
          </ArrowPill>
        </section>

        <section aria-labelledby="family-heading" className={BAND}>
          <SectionHead
            id="family-heading"
            label={page.family.label}
            heading={page.family.heading}
          >
            <ul className="mt-14 grid gap-y-14 sm:grid-cols-2 sm:gap-x-8 lg:mt-24">
              {family.map((member) => (
                <li key={member.name}>
                  <a
                    href={member.href}
                    className="group flex flex-col text-primary"
                  >
                    <span className={`${LABEL} text-ink-950`}>
                      {member.name}
                    </span>
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
      </main>
      {/* The close sits over the footer, not inside the page, so its rounded
          corners open onto the footer beneath it. */}
      <ContactBand />
      <SiteFooter />
      <ChatLauncher />
    </>
  );
}
