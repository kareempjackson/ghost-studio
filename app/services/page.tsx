import type { Metadata } from "next";
import type { CSSProperties } from "react";
import { engagement } from "@/lib/engagement";
import { process } from "@/lib/process";
import { servicesPage } from "@/lib/services";
import { ArrowPill } from "../_components/ArrowPill";
import { ChatLauncher } from "../_components/ChatLauncher";
import { ContactBand } from "../_components/ContactBand";
import { SiteFooter } from "../_components/SiteFooter";
import { SiteHeader } from "../_components/SiteHeader";
import { Disciplines } from "./_components/Disciplines";

export const metadata: Metadata = {
  title: servicesPage.title,
  description: servicesPage.description,
};

/** 48px at 390 to 88px at 1440, held there. The claim on the cover. */
const HEADING_STYLE: CSSProperties = {
  fontSize: "clamp(3rem, 2.1643rem + 3.429vw, 5.5rem)",
  fontWeight: 400,
  letterSpacing: "-0.05em",
  lineHeight: 0.98,
};

/** 30px at 390 to 52px at 1440, held there. Used by both band headings. */
const BAND_STYLE: CSSProperties = {
  fontSize: "clamp(1.875rem, 1.3643rem + 2.095vw, 3.25rem)",
  fontWeight: 400,
  letterSpacing: "-0.045em",
  lineHeight: 1.02,
};

/** The ground of the proof band, off the comp: ink with the green kept in. */
const FOREST = "#123128";

const MONO =
  "font-mono text-[0.6875rem] leading-none tracking-[0.06em] uppercase";

const pad = (n: number) => String(n).padStart(2, "0");

function UpRight() {
  return (
    <svg
      aria-hidden
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.4"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="size-3 transition-transform duration-300 ease-out group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
    >
      <path d="M4.5 11.5l7-7M5.5 4.5h6v6" />
    </svg>
  );
}

/**
 * `/services` — what the studio does, and what it is like to buy.
 *
 * Four answers in order: the six disciplines, one piece of work where all of
 * them were in the room, the three shapes an engagement takes, and the method
 * underneath every one of them. The claim on the cover is that the six
 * connect, so the page is built to show them connecting rather than to list
 * them twice.
 */
export default function Services() {
  return (
    <>
      <SiteHeader />
      {/* One layer above the footer, with its own ground: the page is the
          sheet that slides up off the footer lying underneath it. */}
      <main className="relative z-[1] flex flex-1 flex-col bg-surface-page">
        <section
          aria-labelledby="services-heading"
          className="px-5 pt-[calc(var(--gs-header-h)+4rem)] pb-20 sm:px-8 lg:px-12 lg:pt-[calc(var(--gs-header-h)+7rem)] lg:pb-28"
        >
          <p className={`${MONO} text-ink-950`}>{servicesPage.eyebrow}</p>
          <h1
            id="services-heading"
            className="mt-10 text-primary lg:mt-14"
            style={HEADING_STYLE}
          >
            {servicesPage.heading.map((line) => (
              <span key={line} className="block">
                {line}
              </span>
            ))}
          </h1>

          <div className="mt-10 flex flex-col items-start gap-8 lg:mt-12 lg:flex-row lg:items-end lg:justify-between lg:gap-12">
            <p className="text-[1.0625rem] leading-[1.5] tracking-[-0.01em] text-secondary lg:text-[1.25rem]">
              {servicesPage.summary.map((line) => (
                <span key={line} className="block">
                  {line}
                </span>
              ))}
            </p>
            <ArrowPill
              href={servicesPage.action.href}
              tone="signal"
              className="inline-flex shrink-0"
            >
              {servicesPage.action.label}
            </ArrowPill>
          </div>
        </section>

        <Disciplines />

        {/*
          The proof: the plate on the left is the work, the panel on the right
          says what it was. One band, two halves, so the claim and the thing
          it is claiming about cannot be read apart.
        */}
        <section
          aria-labelledby="showcase-heading"
          data-ground="dark"
          className="px-5 pb-24 sm:px-8 lg:px-12 lg:pb-36"
        >
          <div
            style={{ backgroundColor: FOREST }}
            className="grid overflow-hidden rounded-[1rem] text-white lg:grid-cols-2"
          >
            {/* PLACEHOLDER — the comp sets the BPI collage here. */}
            <div className="flex min-h-[18rem] flex-col justify-end bg-white/5 p-6 sm:p-8 lg:min-h-[32rem]">
              <span className={`${MONO} text-white/50`}>
                {servicesPage.showcase.previewLabel}
              </span>
            </div>

            <div className="flex flex-col justify-center p-6 sm:p-8 lg:p-14">
              <p className={`${MONO} text-white/60`}>
                {servicesPage.showcase.label}
              </p>
              <h2
                id="showcase-heading"
                className="mt-8 lg:mt-10"
                style={BAND_STYLE}
              >
                {servicesPage.showcase.heading.map((line) => (
                  <span key={line} className="block">
                    {line}
                  </span>
                ))}
              </h2>
              <p className="mt-6 max-w-[32rem] text-[0.9375rem] leading-[1.6] tracking-[-0.01em] text-white/70 lg:mt-8 lg:text-[1.0625rem]">
                {servicesPage.showcase.copy}
              </p>
              <ArrowPill
                href={servicesPage.showcase.action.href}
                tone="signal"
                className="mt-8 inline-flex self-start lg:mt-10"
              >
                {servicesPage.showcase.action.label}
              </ArrowPill>
            </div>
          </div>
        </section>

        {/* The three shapes an engagement takes, as three plates. */}
        <section
          aria-labelledby="models-heading"
          className="px-5 pb-24 sm:px-8 lg:px-12 lg:pb-36"
        >
          <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-3 border-t border-edge-subtle pt-8 lg:pt-10">
            <h2
              id="models-heading"
              className="text-[1.5rem] leading-[1.15] font-normal tracking-[-0.035em] text-primary lg:text-[1.875rem]"
            >
              {servicesPage.models.heading}
            </h2>
            <p className={`${MONO} text-ink-500`}>
              {servicesPage.models.label}
            </p>
          </div>

          <ul className="mt-10 grid gap-5 lg:mt-12 lg:grid-cols-3">
            {engagement.models.map((model, index) => (
              <li
                key={model.slug}
                className="flex flex-col rounded-[0.75rem] bg-surface-subtle p-6 sm:p-8"
              >
                <p className={`${MONO} text-ink-500`}>
                  {pad(index + 1)} / {model.name}
                </p>
                <h3 className="mt-8 text-[1.5rem] leading-[1.15] font-normal tracking-[-0.035em] text-primary lg:mt-10 lg:text-[1.75rem]">
                  {model.headline.map((line) => (
                    <span key={line} className="block">
                      {line}
                    </span>
                  ))}
                </h3>
                <p className="mt-5 flex-1 text-[0.9375rem] leading-[1.6] tracking-[-0.01em] text-secondary">
                  {model.copy}
                </p>
                <a
                  href={model.action.href}
                  className="group mt-8 inline-flex items-center gap-2 self-start border-t border-edge-subtle pt-5 text-[0.9375rem] leading-none tracking-[-0.01em] text-primary transition-colors duration-200 hover:text-accent lg:mt-10"
                >
                  {model.action.label}
                  <UpRight />
                </a>
              </li>
            ))}
          </ul>
        </section>

        {/*
          The method, on black: the same four steps the home page sets as
          cards, here as the thread running under all six disciplines.
        */}
        <section
          aria-labelledby="method-heading"
          data-ground="dark"
          className="bg-[#0b0b0b] px-5 py-24 text-white sm:px-8 lg:px-12 lg:py-36"
        >
          <p className={`${MONO} text-white/60`}>{servicesPage.method.label}</p>
          <h2 id="method-heading" className="mt-12 lg:mt-16" style={BAND_STYLE}>
            {servicesPage.method.heading.map((line) => (
              <span key={line} className="block">
                {line}
              </span>
            ))}
          </h2>

          <ol className="mt-16 grid gap-x-6 gap-y-12 sm:grid-cols-2 lg:mt-24 lg:grid-cols-4">
            {process.steps.map((step, index) => (
              <li key={step.title} className="border-t border-white/15 pt-6">
                <p className={`${MONO} text-accent`}>{pad(index + 1)}</p>
                <h3 className="mt-6 text-[1.375rem] leading-[1.2] font-normal tracking-[-0.03em] lg:text-[1.5rem]">
                  {step.short}
                </h3>
                <p className="mt-4 text-[0.9375rem] leading-[1.55] tracking-[-0.01em] text-white/70">
                  {step.question}
                </p>
              </li>
            ))}
          </ol>
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
