import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import type { CSSProperties } from "react";
import { getApproachPage } from "@/sanity/content";
import { ChatLauncher } from "../_components/ChatLauncher";
import { ContactBand } from "../_components/ContactBand";
import { PageCover } from "../_components/PageCover";
import { MONO, SectionHead } from "../_components/SectionHead";
import { SiteFooter } from "../_components/SiteFooter";
import { SiteHeader } from "../_components/SiteHeader";
import { Network } from "../services/_components/Network";

export async function generateMetadata(): Promise<Metadata> {
  const { title, description } = await getApproachPage();
  return { title, description };
}

/** 28px at 390 to 40px at 1440, held there. A phase's name. */
const PHASE_STYLE: CSSProperties = {
  fontSize: "clamp(1.75rem, 1.3036rem + 1.143vw, 2.5rem)",
  fontWeight: 400,
  letterSpacing: "-0.05em",
  lineHeight: 1.1,
};

/** The ground the phases and the network are set on: the one /services closes on. */
const FOREST = "#132a28";

/** The plate under the cover, until its picture is in. */
const PAPER = "#f0f0f0";

const pad = (n: number) => String(n).padStart(2, "0");

/**
 * `/our-approach` — Clarity Engineering, in the order it is done.
 *
 * The cover makes the claim and the plate under it carries the picture. The
 * first band says where the work starts: not with the brief, but with what
 * the brief is a response to. The second sets the four phases as a staggered
 * pair of columns, each phase the question it exists to answer. The network
 * closes the page: the people one understanding connects.
 */
export default async function OurApproach() {
  const page = await getApproachPage();
  const { plate, start, phases } = page;

  return (
    <>
      <SiteHeader />
      {/* One layer above the footer, with its own ground: the page is the
          sheet that slides up off the footer lying underneath it. */}
      <main className="relative z-[1] flex flex-1 flex-col bg-surface-page">
        <PageCover
          id="approach-heading"
          eyebrow={page.eyebrow}
          heading={page.heading}
          summary={page.summary}
          action={page.action}
          size="md"
        />

        <div
          role={plate.src ? undefined : "presentation"}
          className="relative aspect-[4/3] overflow-hidden sm:aspect-[16/9] lg:aspect-[5/2]"
          style={{ backgroundColor: plate.ground || PAPER }}
        >
          {plate.src && (
            <Image
              src={plate.src}
              alt={plate.alt}
              fill
              sizes="100vw"
              className="object-cover"
            />
          )}
        </div>

        <section
          aria-labelledby="start-heading"
          className="px-5 py-24 sm:px-8 lg:px-12 lg:py-36"
        >
          <SectionHead
            id="start-heading"
            label={start.label}
            heading={start.heading}
            deck={start.deck}
          >
            <p className="mt-10 max-w-[34rem] text-[1.0625rem] leading-[1.6] tracking-[-0.01em] text-primary lg:mt-14 lg:text-[1.1875rem]">
              {start.body}
            </p>
          </SectionHead>
        </section>

        <section
          id="process"
          aria-labelledby="phases-heading"
          className="scroll-mt-[var(--gs-header-h)] px-5 pb-24 sm:px-8 lg:px-12 lg:pb-36"
        >
          <SectionHead
            id="phases-heading"
            label={phases.label}
            heading={phases.heading}
          />

          {/* Two columns, the right one set lower: the phases read as a
              thread running down the page rather than a grid of four. */}
          <ol className="mt-12 grid gap-y-14 sm:grid-cols-2 sm:gap-x-5 sm:gap-y-16 lg:mt-16 lg:gap-x-6">
            {phases.items.map((phase, index) => {
              const card = (
                <>
                  <div
                    className="relative aspect-[4/3] overflow-hidden rounded-[0.5rem]"
                    style={{ backgroundColor: FOREST }}
                  >
                    {phase.image.src && (
                      <Image
                        src={phase.image.src}
                        alt={phase.image.alt}
                        fill
                        sizes="(min-width: 640px) 50vw, 100vw"
                        className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.03]"
                      />
                    )}
                  </div>
                  <p className={`${MONO} mt-5 text-ink-500 lg:mt-6`}>
                    {phases.itemLabel} {pad(index + 1)}
                  </p>
                  <h3
                    className="mt-3 text-primary transition-colors duration-200 group-hover:text-accent lg:mt-4"
                    style={PHASE_STYLE}
                  >
                    {phase.title}
                  </h3>
                  <p className="mt-3 text-[1rem] leading-[1.5] tracking-[-0.01em] text-secondary">
                    {phase.question}
                  </p>
                </>
              );
              return (
                <li key={phase.slug} className="sm:even:mt-24">
                  {/* A phase links through once it has a page of its own. */}
                  {phase.hasPage ? (
                    <Link href={`/our-approach/${phase.slug}`} className="group block">
                      {card}
                    </Link>
                  ) : (
                    card
                  )}
                </li>
              );
            })}
          </ol>
        </section>

        <div className="px-5 pb-20 sm:px-8 lg:px-12 lg:pb-28">
          <div data-ground="dark" className="overflow-hidden rounded-[0.5rem]">
            <Network ground={FOREST} network={page.network} />
          </div>
        </div>
      </main>
      {/* The close sits over the footer, not inside the page, so its rounded
          corners open onto the footer beneath it. */}
      <ContactBand />
      <SiteFooter />
      <ChatLauncher />
    </>
  );
}
