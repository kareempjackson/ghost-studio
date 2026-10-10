import { pageMetadata } from "@/lib/seo";
import type { Metadata } from "next";
import Link from "next/link";
import type { CSSProperties } from "react";
import { getWhoWeServePage } from "@/sanity/content";
import { ChatLauncher } from "../_components/ChatLauncher";
import { ContactBand } from "../_components/ContactBand";
import { PageCover } from "../_components/PageCover";
import { FeaturedProject } from "../_components/ProjectCard";
import { MONO, SectionHead } from "../_components/SectionHead";
import { SiteFooter } from "../_components/SiteFooter";
import { SiteHeader } from "../_components/SiteHeader";
import { Rich } from "../_components/Rich";

export async function generateMetadata(): Promise<Metadata> {
  const { title, description } = await getWhoWeServePage();
  return pageMetadata({ title, description, path: "/who-we-serve" });
}

/** 28px at 390 to 38px at 1440, held there. Who the client is. */
const AUDIENCE_STYLE: CSSProperties = {
  fontSize: "clamp(1.75rem, 1.5179rem + 0.952vw, 2.375rem)",
  fontWeight: 400,
  letterSpacing: "-0.04em",
  lineHeight: 1.1,
};

const pad = (n: number) => String(n).padStart(2, "0");

/**
 * `/who-we-serve` — who is on the other side of the table.
 *
 * The cover says the needs differ and the start does not; the band under it
 * names the six kinds of client and what the work is for each. A project
 * closes the page.
 */
export default async function WhoWeServe() {
  const whoWeServePage = await getWhoWeServePage();
  const { audiences } = whoWeServePage;

  return (
    <>
      <SiteHeader />
      {/* One layer above the footer, with its own ground: the page is the
          sheet that slides up off the footer lying underneath it. */}
      <main className="relative z-[1] flex flex-1 flex-col bg-surface-page">
        <PageCover
          id="who-we-serve-heading"
          eyebrow={whoWeServePage.eyebrow}
          heading={whoWeServePage.heading}
          summary={whoWeServePage.summary}
          action={whoWeServePage.action}
          size="md"
        />

        <section
          aria-labelledby="audiences-heading"
          className="bg-surface-sunken px-5 py-24 sm:px-8 lg:px-12 lg:py-32"
        >
          <SectionHead
            id="audiences-heading"
            label={audiences.label}
            heading={audiences.heading}
            deck={audiences.deck}
          />

          <ol className="mt-16 grid gap-y-14 sm:grid-cols-2 sm:gap-x-5 lg:mt-28 lg:grid-cols-3 lg:gap-x-8 lg:gap-y-20">
            {audiences.items.map((item, index) => {
              const name = (
                <h3
                  className="mt-6 text-primary transition-colors duration-200 group-hover:text-accent lg:mt-9"
                  style={AUDIENCE_STYLE}
                >
                  {item.name.map((line) => (
                    <span key={line} className="block">
                      {line}
                    </span>
                  ))}
                </h3>
              );
              return (
                <li
                  key={item.slug}
                  id={item.slug}
                  className="scroll-mt-[calc(var(--gs-header-h)+2rem)]"
                >
                  <p className={`${MONO} text-ink-500`}>{pad(index + 1)}</p>
                  {/* An audience links through once it has a page of its own. */}
                  {item.hasPage ? (
                    <Link href={`/who-we-serve/${item.slug}`} className="group block">
                      {name}
                    </Link>
                  ) : (
                    name
                  )}
                  <div className="mt-4 max-w-[20rem] text-[1rem] leading-[1.6] tracking-[-0.01em] text-secondary lg:mt-6 lg:text-[1.0625rem]">
                    <Rich value={item.body} />
                  </div>
                </li>
              );
            })}
          </ol>
        </section>

        {whoWeServePage.featured && (
          <div className="px-5 py-20 sm:px-8 lg:px-12 lg:py-28">
            <FeaturedProject project={whoWeServePage.featured} />
          </div>
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
