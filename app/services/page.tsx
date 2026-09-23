import type { Metadata } from "next";
import type { CSSProperties } from "react";
import { engagement } from "@/lib/engagement";
import { servicesPage } from "@/lib/services";
import { ArrowPill } from "../_components/ArrowPill";
import { ChatLauncher } from "../_components/ChatLauncher";
import { ContactBand } from "../_components/ContactBand";
import { PageCover } from "../_components/PageCover";
import { BAND_STYLE, MONO, SectionHead } from "../_components/SectionHead";
import { SiteFooter } from "../_components/SiteFooter";
import { SiteHeader } from "../_components/SiteHeader";
import { LABEL, StudioStrip } from "../_components/StudioStrip";
import { Disciplines } from "./_components/Disciplines";
import { Network } from "./_components/Network";

export const metadata: Metadata = {
  title: servicesPage.title,
  description: servicesPage.description,
};

/** 44px at 390 to 104px at 1440, held there. A model's name, in capitals. */
const MODEL_STYLE: CSSProperties = {
  fontSize: "clamp(2.75rem, 1.3571rem + 5.714vw, 6.5rem)",
  fontWeight: 400,
  letterSpacing: "-0.05em",
  lineHeight: 0.9,
};

/** The ground of the network plate, off the comp: ink with the green kept in. */
const FOREST = "#132a28";

const pad = (n: number) => String(n).padStart(2, "0");

/**
 * `/services` — what the studio does, and what it is like to buy.
 *
 * The cover makes the claim; the strip under it shows the studio's own
 * things with the working principle between them. Then two answers, in the
 * order a buyer asks them: how do we engage you, and what do you do. The
 * method closes the page, because it is the thing every model and every
 * discipline has in common.
 */
export default function Services() {
  const { method } = servicesPage;

  return (
    <>
      <SiteHeader />
      {/* One layer above the footer, with its own ground: the page is the
          sheet that slides up off the footer lying underneath it. */}
      <main className="relative z-[1] flex flex-1 flex-col bg-surface-page">
        <PageCover
          id="services-heading"
          eyebrow={servicesPage.eyebrow}
          heading={servicesPage.heading}
          summary={servicesPage.summary}
          action={servicesPage.action}
        />

        <StudioStrip />

        {/* How to buy it: three models, each named large enough to point at. */}
        <section
          id="ways-in"
          aria-labelledby="ways-heading"
          className="scroll-mt-[var(--gs-header-h)] px-5 py-24 sm:px-8 lg:px-12 lg:py-36"
        >
          <SectionHead
            id="ways-heading"
            label={servicesPage.ways.label}
            heading={servicesPage.ways.heading}
            deck={servicesPage.ways.deck}
          />

          <ol className="mt-16 space-y-14 lg:mt-24 lg:space-y-20">
            {engagement.models.map((model, index) => (
              <li
                key={model.slug}
                className="grid gap-y-5 lg:grid-cols-[minmax(0,9fr)_minmax(0,7fr)_minmax(0,4fr)] lg:gap-x-8"
              >
                <div>
                  <p className={`${MONO} text-ink-500`}>
                    {pad(index + 1)} / {model.name}
                  </p>
                  <h3 className="mt-6 lg:mt-10">
                    <a
                      href={`/${model.slug}`}
                      className="text-primary uppercase transition-colors duration-200 hover:text-accent"
                      style={MODEL_STYLE}
                    >
                      {model.name}
                    </a>
                  </h3>
                </div>
                <p className="max-w-[19rem] text-[1rem] leading-[1.45] tracking-[-0.01em] text-primary lg:mt-[4.25rem] lg:text-[1.0625rem]">
                  {model.audience}
                </p>
                <p className="max-w-[14rem] text-[0.8125rem] leading-[1.45] text-primary lg:mt-[4.5rem]">
                  {model.terms}
                </p>
              </li>
            ))}
          </ol>
        </section>

        <Disciplines />

        {/* The method: the one thing every model and discipline shares. */}
        <section
          aria-labelledby="method-heading"
          className="px-5 py-24 sm:px-8 lg:px-12 lg:py-36"
        >
          <p className={`${LABEL} text-ink-950`}>{method.label}</p>
          <h2
            id="method-heading"
            className="mt-8 text-primary uppercase lg:mt-10"
            style={BAND_STYLE}
          >
            {method.heading.map((line) => (
              <span key={line} className="block">
                {line}
              </span>
            ))}
          </h2>
          <div className="mt-10 max-w-[32rem] space-y-4 text-[1rem] leading-[1.65] tracking-[-0.01em] text-secondary lg:mt-14 lg:text-[1.0625rem]">
            {method.copy.map((paragraph) => (
              <p key={paragraph}>{paragraph}</p>
            ))}
          </div>
          <ArrowPill href={method.action.href} className="mt-10 inline-flex">
            {method.action.label}
          </ArrowPill>

          <div
            data-ground="dark"
            className="mt-20 overflow-hidden lg:mt-36"
          >
            <Network ground={FOREST} />
          </div>
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
