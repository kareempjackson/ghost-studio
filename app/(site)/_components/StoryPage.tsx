import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { CSSProperties } from "react";
import { storyHref } from "@/lib/links";
import { pageMetadata } from "@/lib/seo";
import { getStoryPage, getStorySlugs } from "@/sanity/content";
import { toPlain } from "@/sanity/lib/rich";
import { ClientFeedback } from "../work/_components/ClientFeedback";
import { Overview } from "../work/_components/Overview";
import { Part } from "../work/_components/Part";
import { PartsBar } from "../work/_components/PartsBar";
import { Plate } from "../work/_components/Plate";
import { ChatLauncher } from "./ChatLauncher";
import { ContactBand } from "./ContactBand";
import { BAND, FamilyAsk, FamilyMembers, StickyNote } from "./FamilyBands";
import { Rich } from "./Rich";
import { MONO, SectionHead } from "./SectionHead";
import { SiteFooter } from "./SiteFooter";
import { SiteHeader } from "./SiteHeader";
import { StoryCard } from "./StoryCard";

/** Every story in a family, prerendered. Cache Components needs one param to prerender against; `_` is never a story. */
export async function storyParams(family: string) {
  const slugs = await getStorySlugs(family);
  return slugs.length ? slugs.map((slug) => ({ slug })) : [{ slug: "_" }];
}

/** Metadata for a story: its name, under its family's. */
export async function storyMetadata(family: string, slug: string): Promise<Metadata> {
  const page = await getStoryPage(family, slug);
  if (!page) return {};
  const { story } = page;
  return pageMetadata({
    title: `${story.title} · ${page.family.title}`,
    description: story.description || toPlain(story.summary),
    path: storyHref(family, slug),
  });
}

/** 40px at 390 to 68px at 1440, held there. What happened, in a sentence. */
const HEADLINE_STYLE: CSSProperties = {
  fontSize: "clamp(2.5rem, 1.85rem + 2.667vw, 4.25rem)",
  fontWeight: 400,
  letterSpacing: "-0.045em",
  lineHeight: 1.08,
};

/** 48px at 390 to 88px at 1440, held there. One figure from what changed. */
const FIGURE_STYLE: CSSProperties = {
  fontSize: "clamp(3rem, 2.0714rem + 3.81vw, 5.5rem)",
  fontWeight: 500,
  letterSpacing: "-0.055em",
  lineHeight: 0.95,
};

/** 32px at 390 to 42px at 1440, held there. The close's heading. */
const MORE_STYLE: CSSProperties = {
  fontSize: "clamp(2rem, 1.7679rem + 0.952vw, 2.625rem)",
  fontWeight: 400,
  letterSpacing: "-0.045em",
  lineHeight: 1.05,
};

/**
 * `/[family]/[slug]` — one story from the Ghost family: an experiment, a
 * cohort, a project given away.
 *
 * Told the way a case study is: a plate, with the family's notes stuck to
 * it, then the record and the claim — where it sits in the family and what
 * happened, in a sentence — and the opening. Then the story in numbered
 * parts, read in order, with the bar along the top of the screen to move
 * between them. It ends where a story should: what changed, in figures, and
 * someone it changed it for, in their words. The family's ask follows, then
 * the family's other stories, or the rest of the family until there are any.
 *
 * Every part is optional: a story reads as far as it is written.
 */
export async function StoryPage({ family: familySlug, slug }: { family: string; slug: string }) {
  const page = await getStoryPage(familySlug, slug);
  if (!page) notFound();
  const { story, family } = page;
  const { labels } = family;
  /* Up to two notes; the plate goes without one that is not set. */
  const [high, low] = story.notes;

  return (
    <>
      <SiteHeader />
      {/* One layer above the footer, with its own ground: the page is the
          sheet that slides up off the footer lying underneath it. */}
      <main className="relative z-[1] flex flex-1 flex-col overflow-x-clip bg-surface-page">
        {story.hero && (
          <div className="px-5 pt-[calc(var(--gs-header-h)+2rem)] sm:px-8 lg:px-12 lg:pt-[calc(var(--gs-header-h)+3rem)]">
            {/* The notes are stuck over the plate's edges, not inside it,
                so it does not crop them: one over the top, one at the foot. */}
            <div className="relative">
              <Plate
                media={{ ...story.hero, aspect: story.hero.aspect ?? "wide" }}
                sizes="100vw"
                priority
              />
              {high && (
                <StickyNote
                  note={high}
                  className="absolute -top-5 left-[6%] h-16 w-24 -rotate-[9deg] lg:-top-8 lg:h-[5.5rem] lg:w-[7.5rem]"
                />
              )}
              {low && (
                <StickyNote
                  note={low}
                  className="absolute right-[7%] -bottom-6 h-16 min-w-16 rotate-[6deg] px-4 lg:-bottom-10 lg:h-[5.25rem] lg:min-w-[5.25rem] lg:px-5"
                />
              )}
            </div>
          </div>
        )}

        <section
          aria-labelledby="story-heading"
          className={`grid gap-y-14 px-5 pb-24 sm:px-8 lg:grid-cols-[minmax(0,3fr)_minmax(0,5fr)] lg:gap-x-8 lg:px-12 lg:pb-32 ${
            story.hero
              ? "pt-20 lg:pt-28"
              : "pt-[calc(var(--gs-header-h)+4rem)] lg:pt-[calc(var(--gs-header-h)+8rem)]"
          }`}
        >
          {/* The record, in the margin, under the way back to the family. */}
          <div>
            <Link
              href={family.href}
              className={`${MONO} inline-flex items-center gap-2 text-ink-500 transition-colors duration-200 hover:text-ink-950`}
            >
              <span aria-hidden>←</span> {family.title}
            </Link>
            {story.facts.length > 0 && (
              <dl className="mt-12 max-w-[26rem] space-y-5 text-[0.9375rem] leading-[1.6] tracking-[-0.01em] text-primary lg:mt-20">
                {story.facts.map((fact) => (
                  <div key={fact.label}>
                    <dt className="inline font-semibold">{fact.label}:</dt>{" "}
                    <dd className="inline"><Rich value={fact.value} inline /></dd>
                  </div>
                ))}
              </dl>
            )}
          </div>

          {/* Which story this is, the claim, and the opening. */}
          <div>
            <p className={`${MONO} text-ink-500`}>
              <span className="text-ink-950">{story.eyebrow}</span> / {story.title}
            </p>
            <h1
              id="story-heading"
              className="mt-8 max-w-[46rem] text-primary lg:mt-10"
              style={HEADLINE_STYLE}
            >
              <Rich value={story.headline} inline />
            </h1>
            {story.tags.length > 0 && (
              <ul className="mt-10 flex flex-wrap gap-2 lg:mt-12">
                {story.tags.map((tag) => (
                  <li
                    key={tag}
                    className="inline-flex h-9 items-center rounded-pill bg-ink-100 px-4 text-[0.875rem] leading-none tracking-[-0.01em] text-ink-950 lg:h-10"
                  >
                    {tag}
                  </li>
                ))}
              </ul>
            )}
            {(story.overview.length > 0 || story.link) && (
              <div className="mt-20 lg:mt-28">
                <Overview
                  label={labels.overview}
                  paragraphs={story.overview}
                  readMore={labels.readMore}
                  readLess={labels.readLess}
                  visit={story.link?.label ?? ""}
                  website={story.link?.href ?? null}
                />
              </div>
            )}
          </div>
        </section>

        {story.feature && (
          <div className="px-5 sm:px-8 lg:px-12">
            <Plate media={story.feature} sizes="100vw" />
          </div>
        )}

        {story.chapters.length > 0 && (
          <div className="mt-20 lg:mt-28">
            <PartsBar
              label={labels.partsLabel}
              parts={story.chapters.map(({ id, label }) => ({ id, label }))}
            />
            {story.chapters.map((chapter, index) => (
              <Part
                key={chapter.id}
                chapter={chapter}
                listHeading={chapter.listHeading || labels.listHeading}
                number={index + 1}
              />
            ))}
          </div>
        )}

        {/* How it ended: what changed, in figures. */}
        {story.outcome && (
          <section
            aria-labelledby="outcome-heading"
            className="px-5 pt-24 sm:px-8 lg:px-12 lg:pt-36"
          >
            <SectionHead
              id="outcome-heading"
              label={story.outcome.label}
              heading={story.outcome.heading ?? story.outcome.label}
            >
              {/* Each figure over what it counts: the label comes first in
                  the markup, as a <dl> needs, and is set under it. */}
              <dl className="mt-14 grid gap-x-8 gap-y-12 sm:grid-cols-2 lg:mt-20 lg:gap-y-16">
                {story.outcome.items.map((item, index) => (
                  <div
                    key={index}
                    className="flex flex-col-reverse border-t border-ink-200 pt-6 lg:pt-8"
                  >
                    <dt className="mt-4 max-w-[18rem] text-[0.9375rem] leading-[1.45] tracking-[-0.01em] text-secondary lg:mt-5 lg:text-[1rem]">
                      {item.label}
                    </dt>
                    <dd className="text-primary" style={FIGURE_STYLE}>
                      {item.value}
                    </dd>
                  </div>
                ))}
              </dl>
            </SectionHead>
          </section>
        )}

        {/* And someone it was for, in their words. */}
        {story.voice && (
          <ClientFeedback
            testimonial={story.voice}
            label={labels.voiceLabel}
            heading={labels.voiceHeading}
          />
        )}

        <FamilyAsk ask={family.ask} />

        {story.more.length > 0 ? (
          <section aria-labelledby="more-heading" className={BAND}>
            <p className={`${MONO} text-ink-500`}>{labels.more.label}</p>
            <div className="mt-6 flex flex-wrap items-end justify-between gap-x-8 gap-y-4 lg:mt-8">
              <h2 id="more-heading" className="text-primary" style={MORE_STYLE}>
                {labels.more.heading}
              </h2>
              <Link
                href={labels.more.action.href}
                className="inline-flex items-center gap-1.5 text-[1rem] tracking-[-0.01em] text-ink-950 transition-colors duration-200 hover:text-accent"
              >
                {labels.more.action.label}
                <span aria-hidden>↗</span>
              </Link>
            </div>
            <ul className="mt-10 grid gap-x-6 gap-y-14 md:grid-cols-2 lg:mt-12">
              {story.more.map((other) => (
                <li key={other.slug}>
                  <StoryCard
                    story={other}
                    plate="aspect-[10/7] rounded-[0.75rem]"
                    sizes="(min-width: 768px) 50vw, 100vw"
                  />
                </li>
              ))}
            </ul>
          </section>
        ) : (
          <FamilyMembers band={family.band} current={family.href} />
        )}
      </main>
      {/* The close sits over the footer, not inside the page, so its rounded
          corners open onto the footer beneath it. */}
      <ContactBand />
      <SiteFooter />
      <ChatLauncher />
    </>
  );
}
