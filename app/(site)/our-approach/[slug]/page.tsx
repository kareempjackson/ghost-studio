import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { CSSProperties } from "react";
import { getPhasePage, getPhaseSlugs } from "@/sanity/content";
import type { PhasePage } from "@/sanity/types";
import { ChatLauncher } from "../../_components/ChatLauncher";
import { ContactBand } from "../../_components/ContactBand";
import { PageCover } from "../../_components/PageCover";
import { Practice } from "../../_components/Practice";
import { SectionHead } from "../../_components/SectionHead";
import { SiteFooter } from "../../_components/SiteFooter";
import { SiteHeader } from "../../_components/SiteHeader";
import { Network } from "../../services/_components/Network";

/** Cache Components needs one param to prerender against; `_` is never a phase. */
export async function generateStaticParams() {
  const slugs = await getPhaseSlugs();
  return slugs.length ? slugs.map((slug) => ({ slug })) : [{ slug: "_" }];
}

export async function generateMetadata({
  params,
}: PageProps<"/our-approach/[slug]">): Promise<Metadata> {
  const page = await getPhasePage((await params).slug);
  return page ? { title: page.title, description: page.description } : {};
}

/** 22px at 390 to 30px at 1440, held there. One thing the team leaves with. */
const OUTPUT_STYLE: CSSProperties = {
  fontSize: "clamp(1.375rem, 1.1893rem + 0.762vw, 1.875rem)",
  fontWeight: 400,
  letterSpacing: "-0.035em",
  lineHeight: 1.2,
};

/** The ground the network is set on: the one /services closes on. */
const FOREST = "#132a28";

/** The plate under the cover, until its picture is in. */
const PAPER = "#edebe7";

const pad = (n: number) => String(n).padStart(2, "0");

/**
 * `/our-approach/[slug]` — one phase of Clarity Engineering.
 *
 * The cover names the phase and the question it answers, with every phase
 * in a row of pills under it so a reader can move along the thread without
 * going back. Then why the phase exists, what the team does in it, and what
 * the client is left holding. The network closes the page, as it closes
 * /our-approach: the people the understanding connects.
 */
export default async function PhaseRoute({
  params,
}: PageProps<"/our-approach/[slug]">) {
  const page = await getPhasePage((await params).slug);
  if (!page) notFound();
  const { plate, purpose, practice, outputs } = page;

  return (
    <>
      <SiteHeader />
      {/* One layer above the footer, with its own ground: the page is the
          sheet that slides up off the footer lying underneath it. */}
      <main className="relative z-[1] flex flex-1 flex-col bg-surface-page">
        <PageCover
          id="phase-heading"
          eyebrow={page.eyebrow}
          heading={page.heading}
          summary={page.question}
          action={page.action ?? undefined}
          size="md"
        >
          <PhasePills phases={page.phases} current={page.slug} />
        </PageCover>

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
          aria-labelledby="purpose-heading"
          className="px-5 py-24 sm:px-8 lg:px-12 lg:py-36"
        >
          <SectionHead
            id="purpose-heading"
            label={purpose.label}
            heading={purpose.heading}
            deck={purpose.deck ?? undefined}
          />
        </section>

        {practice && (
          <Practice
            id="practice-heading"
            label={practice.label}
            heading={practice.heading}
            items={practice.items}
          />
        )}

        {outputs && (
          <section
            aria-labelledby="outputs-heading"
            className="px-5 pt-24 sm:px-8 lg:px-12 lg:pt-36"
          >
            <SectionHead
              id="outputs-heading"
              label={outputs.label}
              heading={outputs.heading}
            >
              {outputs.deck && (
                <p className="mt-4 text-[0.875rem] leading-[1.5] tracking-[-0.005em] text-secondary">
                  {outputs.deck}
                </p>
              )}
              <ul className="mt-10 space-y-4 lg:mt-12 lg:space-y-5">
                {outputs.items.map((item) => (
                  <li key={item} className="text-primary" style={OUTPUT_STYLE}>
                    {item}
                  </li>
                ))}
              </ul>
            </SectionHead>
          </section>
        )}

        <div className="px-5 pt-20 pb-20 sm:px-8 lg:px-12 lg:pt-28 lg:pb-28">
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

/**
 * Every phase, in order, the current one set solid. A phase with no page
 * yet is shown in its place but is not a link, so the row always reads as
 * the whole thread.
 */
function PhasePills({
  phases,
  current,
}: {
  phases: PhasePage["phases"];
  current: string;
}) {
  return (
    <nav aria-label="Phases">
      <ol className="-mx-5 flex gap-2 overflow-x-auto px-5 pb-1 sm:mx-0 sm:px-0 lg:justify-between">
        {phases.map((phase, index) => {
          const on = phase.slug === current;
          const body = (
            <>
              <span
                className={
                  on ? "text-[var(--gs-accent-signal)]" : "text-ink-400"
                }
              >
                {pad(index + 1)}
              </span>
              {phase.title}
            </>
          );
          const pill = `inline-flex h-9 shrink-0 items-center gap-3 rounded-pill px-4 text-[0.75rem] leading-none tracking-[-0.005em] whitespace-nowrap transition-colors duration-200 ${
            on ? "bg-ink-950 text-white" : "bg-ink-100 text-ink-950"
          }`;
          return (
            <li key={phase.slug} className="shrink-0">
              {on || !phase.hasPage ? (
                <span aria-current={on ? "page" : undefined} className={pill}>
                  {body}
                </span>
              ) : (
                <Link
                  href={`/our-approach/${phase.slug}`}
                  className={`${pill} hover:bg-ink-200`}
                >
                  {body}
                </Link>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
