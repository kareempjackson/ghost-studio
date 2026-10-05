import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import type { CSSProperties } from "react";
import { getAudiencePage, getAudienceSlugs } from "@/sanity/content";
import { ChatLauncher } from "../../_components/ChatLauncher";
import { ContactBand } from "../../_components/ContactBand";
import { PageCover } from "../../_components/PageCover";
import { Practice } from "../../_components/Practice";
import { MONO, SectionHead } from "../../_components/SectionHead";
import { SiteFooter } from "../../_components/SiteFooter";
import { SiteHeader } from "../../_components/SiteHeader";
import { Network } from "../../services/_components/Network";

/** Cache Components needs one param to prerender against; `_` is never an audience. */
export async function generateStaticParams() {
  const slugs = await getAudienceSlugs();
  return slugs.length ? slugs.map((slug) => ({ slug })) : [{ slug: "_" }];
}

export async function generateMetadata({
  params,
}: PageProps<"/who-we-serve/[slug]">): Promise<Metadata> {
  const page = await getAudiencePage((await params).slug);
  return page ? { title: page.title, description: page.description } : {};
}

/** 24px at 390 to 32px at 1440, held there. The outputs' own heading, set small. */
const OUTPUTS_HEADING_STYLE: CSSProperties = {
  fontSize: "clamp(1.5rem, 1.3143rem + 0.762vw, 2rem)",
  fontWeight: 500,
  letterSpacing: "-0.04em",
  lineHeight: 1.15,
};

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

/**
 * `/who-we-serve/[slug]` — one kind of client, and what the work is for them.
 *
 * The cover says where they are and what they need next. Then the challenge
 * they are facing, what the team does about it, and the mix of disciplines
 * that brings. The network closes the page, as it closes /who-we-serve.
 */
export default async function AudienceRoute({
  params,
}: PageProps<"/who-we-serve/[slug]">) {
  const page = await getAudiencePage((await params).slug);
  if (!page) notFound();
  const { plate, challenge, practice, outputs } = page;

  return (
    <>
      <SiteHeader />
      {/* One layer above the footer, with its own ground: the page is the
          sheet that slides up off the footer lying underneath it. */}
      <main className="relative z-[1] flex flex-1 flex-col bg-surface-page">
        <PageCover
          id="audience-heading"
          eyebrow={page.eyebrow}
          heading={page.heading}
          lead={page.name.join(" ")}
          summary={page.summary}
          action={page.action ?? undefined}
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
          aria-labelledby="challenge-heading"
          className="px-5 py-24 sm:px-8 lg:px-12 lg:py-36"
        >
          <SectionHead
            id="challenge-heading"
            label={challenge.label}
            heading={challenge.heading}
            deck={challenge.deck ?? undefined}
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
            className="grid gap-y-10 px-5 pt-24 sm:px-8 lg:grid-cols-[minmax(0,3fr)_minmax(0,5fr)] lg:gap-x-8 lg:px-12 lg:pt-36"
          >
            {/* The label and a short heading in the margin column; the
                list, which is the point, at full size beside them. */}
            <div>
              <p className={`${MONO} text-ink-500`}>{outputs.label}</p>
              <h2
                id="outputs-heading"
                className="mt-6 text-primary lg:mt-8"
                style={OUTPUTS_HEADING_STYLE}
              >
                {outputs.heading.map((line) => (
                  <span key={line} className="block">
                    {line}
                  </span>
                ))}
              </h2>
            </div>
            <ul className="space-y-4 lg:space-y-6">
              {outputs.items.map((item) => (
                <li key={item} className="text-primary" style={OUTPUT_STYLE}>
                  {item}
                </li>
              ))}
            </ul>
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
