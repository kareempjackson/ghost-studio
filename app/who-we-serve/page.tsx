import type { Metadata } from "next";
import type { CSSProperties } from "react";
import { whoWeServePage } from "@/lib/who-we-serve";
import { ChatLauncher } from "../_components/ChatLauncher";
import { ContactBand } from "../_components/ContactBand";
import { PageCover } from "../_components/PageCover";
import { MONO, SectionHead } from "../_components/SectionHead";
import { SiteFooter } from "../_components/SiteFooter";
import { SiteHeader } from "../_components/SiteHeader";
import { Network } from "../services/_components/Network";

export const metadata: Metadata = {
  title: whoWeServePage.title,
  description: whoWeServePage.description,
};

/** 28px at 390 to 38px at 1440, held there. Who the client is. */
const AUDIENCE_STYLE: CSSProperties = {
  fontSize: "clamp(1.75rem, 1.5179rem + 0.952vw, 2.375rem)",
  fontWeight: 400,
  letterSpacing: "-0.04em",
  lineHeight: 1.1,
};

/** The ground of the network plate: the one /services closes on. */
const FOREST = "#132a28";

const pad = (n: number) => String(n).padStart(2, "0");

/**
 * `/who-we-serve` — who is on the other side of the table.
 *
 * The cover says the needs differ and the start does not; the band under it
 * names the six kinds of client and what the work is for each. The network
 * closes the page: the people in the room, whoever hired them.
 */
export default function WhoWeServe() {
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
            {audiences.items.map((item, index) => (
              <li key={item.name.join(" ")}>
                <p className={`${MONO} text-ink-500`}>{pad(index + 1)}</p>
                <h3 className="mt-6 text-primary lg:mt-9" style={AUDIENCE_STYLE}>
                  {item.name.map((line) => (
                    <span key={line} className="block">
                      {line}
                    </span>
                  ))}
                </h3>
                <p className="mt-4 max-w-[20rem] text-[1rem] leading-[1.6] tracking-[-0.01em] text-secondary lg:mt-6 lg:text-[1.0625rem]">
                  {item.body}
                </p>
              </li>
            ))}
          </ol>
        </section>

        <div className="px-5 py-20 sm:px-8 lg:px-12 lg:py-28">
          <div
            data-ground="dark"
            className="overflow-hidden rounded-[0.5rem]"
          >
            <Network ground={FOREST} />
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
