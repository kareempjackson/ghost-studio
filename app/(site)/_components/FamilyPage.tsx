import type { Metadata } from "next";
import { stegaClean } from "next-sanity";
import { pageMetadata } from "@/lib/seo";
import Image from "next/image";
import type { CSSProperties } from "react";
import type { FamilyPageData } from "@/sanity/types";
import { ArrowPill } from "./ArrowPill";
import { ChatLauncher } from "./ChatLauncher";
import { ContactBand } from "./ContactBand";
import { BAND, FamilyAsk, FamilyMembers, StickyNote } from "./FamilyBands";
import { SectionHead } from "./SectionHead";
import { SiteFooter } from "./SiteFooter";
import { SiteHeader } from "./SiteHeader";
import { STORY_TITLE_STYLE, StoryCard } from "./StoryCard";
import { Visual } from "./Visual";
import { Rich } from "./Rich";

/** Metadata for a family page, from its document in Sanity. */
export function familyMetadata(data: FamilyPageData): Promise<Metadata> {
  return pageMetadata({ title: data.title, description: data.description, path: stegaClean(data.href) });
}

/** 56px at 390 to 136px at 1440, held there. The claim, set solid. */
const COVER_STYLE: CSSProperties = {
  fontSize: "clamp(3.5rem, 0.5286rem + 12.19vw, 8.5rem)",
  fontWeight: 600,
  letterSpacing: "-0.06em",
  lineHeight: 0.94,
};

/**
 * The archive's plates step down the page in two columns: the left one a
 * little wider than tall, the right one square and dropped.
 */
const plateFor = (index: number) => (index % 2 ? "aspect-square" : "aspect-[11/10]");
const dropFor = (index: number) => (index % 2 ? "sm:mt-24 lg:mt-36" : undefined);

/**
 * A Ghost family page: `/ghost-labs`, `/ghost-u`, `/ghost-gives`.
 *
 * The claim is centred and set solid, with the working wall around it: two
 * notes and a poster, pinned at angles, so the cover reads as a bench and not
 * a brochure. Then the archive, staggered in two columns — the family's
 * stories first, each a way into its own page, then what is still on the
 * bench — the ask, and the rest of the family.
 */
export async function FamilyPage({ data }: { data: FamilyPageData }) {
  const { cover, archive, ask, stories } = data;
  /* Two notes, if both are set; the wall goes without one that is not. */
  const [high, low] = cover.notes;

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
            {high && (
              <StickyNote
                note={high}
                className="absolute top-[36%] left-[5%] h-[5.5rem] w-[7.5rem] -rotate-[12deg]"
              />
            )}
            {low && (
              <StickyNote
                note={low}
                className="absolute top-[62%] left-[16%] h-[5.25rem] min-w-[5.25rem] rotate-[5deg] px-5"
              />
            )}
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
            <div className="gs-reveal mt-12 max-w-[23rem] [--reveal:4] text-[1rem] leading-[1.45] tracking-[-0.01em] text-primary lg:mt-24">
              <Rich value={cover.summary} />
            </div>
            <ArrowPill
              href={cover.action.href}
              className="gs-reveal mt-6 inline-flex [--reveal:5]"
            >
              {cover.action.label}
            </ArrowPill>
          </div>

          <div
            className="relative mx-auto mt-16 aspect-[4/3.6] w-[min(16rem,70%)] rotate-[7deg] overflow-hidden border-t-2 border-[#eb5b32] bg-[#5a4a26] shadow-overlay lg:absolute lg:top-[58%] lg:right-[7%] lg:mt-0 lg:w-[16.5vw] lg:max-w-[16rem]"
            {...(cover.card.src
              ? {}
              : { role: "img", "aria-label": cover.card.alt })}
          >
            {(cover.card.src || cover.card.video) ? (
              <Visual
                src={cover.card.src}
                video={cover.card.video}
                alt={cover.card.alt}
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

          <div
            aria-hidden
            className="mt-12 flex justify-center gap-6 lg:hidden"
          >
            {high && <StickyNote note={high} className="h-20 w-28 -rotate-[10deg]" />}
            {low && <StickyNote note={low} className="h-20 min-w-20 rotate-[5deg] px-4" />}
          </div>
        </section>

        <section id="archive" aria-labelledby="archive-heading" className={`${BAND} scroll-mt-8`}>
          <SectionHead
            id="archive-heading"
            label={archive.label}
            heading={archive.heading}
            deck={archive.deck}
          />

          {/* Two columns, the right one dropped, so the plates step down
              the page rather than line up as a grid of products. The
              stories lead; what has no story yet follows, as a plate. */}
          <ul className="mt-16 grid gap-y-14 sm:grid-cols-2 sm:gap-x-5 lg:mt-28 lg:gap-x-8 lg:gap-y-24">
            {stories.map((story, index) => (
              <li key={story.slug} className={dropFor(index)}>
                <StoryCard
                  story={story}
                  plate={plateFor(index)}
                  sizes="(min-width: 640px) 50vw, 100vw"
                />
              </li>
            ))}
            {archive.items.map((item, i) => {
              const index = stories.length + i;
              return (
                <li key={item.title} className={dropFor(index)}>
                  <div
                    aria-hidden
                    style={{ backgroundColor: item.ground }}
                    className={plateFor(index)}
                  />
                  <h3
                    className="mt-6 text-primary lg:mt-8"
                    style={STORY_TITLE_STYLE}
                  >
                    {item.title}
                  </h3>
                  <div className="mt-3 text-[0.875rem] leading-[1.5] tracking-[-0.01em] text-secondary lg:mt-4">
                    <Rich value={item.body} />
                  </div>
                </li>
              );
            })}
          </ul>
        </section>

        <FamilyAsk ask={ask} />

        <FamilyMembers band={data.family} current={data.href} />
      </main>
      {/* The close sits over the footer, not inside the page, so its rounded
          corners open onto the footer beneath it. */}
      <ContactBand />
      <SiteFooter />
      <ChatLauncher />
    </>
  );
}
