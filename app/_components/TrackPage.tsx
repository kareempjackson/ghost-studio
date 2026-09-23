import type { Metadata } from "next";
import Image from "next/image";
import type { CSSProperties } from "react";
import { engagement } from "@/lib/engagement";
import type { TrackPageData } from "@/lib/track-page";
import { ChatLauncher } from "./ChatLauncher";
import { ContactBand } from "./ContactBand";
import { PageCover } from "./PageCover";
import { BAND_STYLE, MONO, SectionHead } from "./SectionHead";
import { SiteFooter } from "./SiteFooter";
import { SiteHeader } from "./SiteHeader";
import { LABEL } from "./StudioStrip";
import { Questions } from "../build/_components/Questions";
import { Network } from "../services/_components/Network";

/** Metadata for a track page, from its entry in lib/<track>.ts. */
export function trackMetadata(page: TrackPageData): Metadata {
  return { title: page.title, description: page.description };
}

/** 30px at 390 to 44px at 1440, held there. What comes with the team. */
const SHAPE_STYLE: CSSProperties = {
  fontSize: "clamp(1.875rem, 1.55rem + 1.333vw, 2.75rem)",
  fontWeight: 500,
  letterSpacing: "-0.04em",
  lineHeight: 1.05,
};

/** 48px at 390 to 64px at 1440, held there. A step's number, set as a figure. */
const FIGURE_STYLE: CSSProperties = {
  fontSize: "clamp(3rem, 2.6286rem + 1.524vw, 4rem)",
  fontWeight: 500,
  letterSpacing: "-0.05em",
  lineHeight: 1,
};

/** 44px at 390 to 64px at 1440, held there. Another track, in capitals. */
const TRACK_STYLE: CSSProperties = {
  fontSize: "clamp(2.75rem, 2.2857rem + 1.905vw, 4rem)",
  fontWeight: 400,
  letterSpacing: "-0.05em",
  lineHeight: 1,
};

/** The ground of the network plate: the one /services closes on. */
const FOREST = "#132a28";

const BAND = "px-5 py-24 sm:px-8 lg:px-12 lg:py-36";

const pad = (n: number) => String(n).padStart(2, "0");

/**
 * A track page: `/engage`, and the shape `/build` is set in.
 *
 * The cover and the plate under it say what the track is; the terms say
 * what it costs, straight after, so no one reads the rest wondering. Then
 * who it is for, what comes with it, how it runs, the questions left over,
 * and the other two ways in for anyone it does not fit.
 */
export function TrackPage({ page }: { page: TrackPageData }) {
  const { plate, terms, who, shape, process, questions, others } = page;
  const tracks = engagement.models.filter((model) => model.slug !== page.slug);

  return (
    <>
      <SiteHeader />
      {/* One layer above the footer, with its own ground: the page is the
          sheet that slides up off the footer lying underneath it. */}
      <main className="relative z-[1] flex flex-1 flex-col bg-surface-page">
        <PageCover
          id="track-heading"
          eyebrow={page.eyebrow}
          heading={page.heading}
          summary={page.summary}
          action={page.action}
          size="md"
        />

        {/* Edge to edge, the wordmark across it. */}
        <div
          data-ground="dark"
          style={{ backgroundColor: plate.ground }}
          className="relative aspect-[4/3] overflow-hidden sm:aspect-[16/9] lg:aspect-[1512/760]"
          {...(plate.src ? {} : { role: "img", "aria-label": plate.alt })}
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
          <Image
            src="/logos/wordmark-flat.svg"
            alt=""
            width={923}
            height={204}
            className="absolute top-1/2 left-1/2 w-[62%] -translate-x-1/2 -translate-y-1/2 lg:w-[54%]"
          />
        </div>

        {/* The terms, straight after the picture: what it costs, how long. */}
        <div className="flex flex-col gap-4 px-5 pt-14 sm:flex-row sm:items-center sm:justify-between sm:px-8 lg:px-12 lg:pt-20">
          <p className="text-[0.9375rem] leading-none tracking-[-0.01em] text-primary">
            {terms.price}
          </p>
          <p className="text-[0.9375rem] leading-none tracking-[-0.01em] text-primary">
            {terms.minimum}
          </p>
          <a
            href={terms.compare.href}
            className="text-[0.9375rem] leading-none tracking-[-0.01em] text-secondary underline underline-offset-4 transition-colors duration-200 hover:text-accent"
          >
            {terms.compare.label}
          </a>
        </div>

        <section aria-labelledby="who-heading" className={BAND}>
          <SectionHead
            id="who-heading"
            label={who.label}
            heading={who.heading}
            deck={who.deck}
          />
        </section>

        <section aria-labelledby="shape-heading" className={`${BAND} pt-0 lg:pt-0`}>
          <SectionHead
            id="shape-heading"
            label={shape.label}
            heading={shape.heading}
          />

          <ol className="mt-14 grid gap-y-12 sm:grid-cols-3 sm:gap-x-5 lg:mt-20 lg:gap-x-8">
            {shape.items.map((item, index) => (
              <li key={item.title}>
                <p className={`${MONO} text-ink-500`}>{pad(index + 1)}</p>
                <h3 className="mt-6 max-w-[16rem] text-primary lg:mt-10" style={SHAPE_STYLE}>
                  {item.title}
                </h3>
                <p className="mt-4 max-w-[20rem] text-[1rem] leading-[1.6] tracking-[-0.01em] text-secondary lg:mt-5 lg:text-[1.0625rem]">
                  {item.body}
                </p>
              </li>
            ))}
          </ol>
        </section>

        <section
          aria-labelledby="process-heading"
          className="bg-surface-sunken px-5 py-24 sm:px-8 lg:px-12 lg:py-32"
        >
          <SectionHead
            id="process-heading"
            label={process.label}
            heading={process.heading}
          />

          <ol className="mt-16 grid gap-y-12 sm:grid-cols-3 sm:gap-x-5 lg:mt-28 lg:gap-x-8">
            {process.items.map((item, index) => (
              <li key={item.title}>
                <p aria-hidden className="text-primary" style={FIGURE_STYLE}>
                  {pad(index + 1)}
                </p>
                <h3 className="mt-6 text-[1.5rem] leading-none font-medium tracking-[-0.04em] text-primary uppercase lg:mt-8 lg:text-[1.75rem]">
                  {item.title}
                </h3>
                <p className="mt-4 max-w-[15rem] text-[0.9375rem] leading-[1.6] tracking-[-0.01em] text-secondary lg:mt-5">
                  {item.body}
                </p>
              </li>
            ))}
          </ol>
        </section>

        <section
          aria-labelledby="questions-heading"
          className={`${BAND} grid gap-y-10 lg:grid-cols-2 lg:gap-x-8`}
        >
          <div>
            <p className={`${MONO} text-ink-500`}>{questions.label}</p>
            <h2
              id="questions-heading"
              className="mt-4 text-primary"
              style={BAND_STYLE}
            >
              {questions.heading}
            </h2>
          </div>
          <Questions items={questions.items} />
        </section>

        <section
          aria-label={others.label}
          className="px-5 pb-24 sm:px-8 lg:px-12 lg:pb-36"
        >
          <p className={`${LABEL} text-ink-950`}>{others.label}</p>
          <ul className="mt-10 grid gap-y-8 sm:grid-cols-2 sm:gap-x-8 lg:mt-16">
            {tracks.map((track) => (
              <li key={track.slug}>
                <a
                  href={`/${track.slug}`}
                  className="group inline-flex items-center gap-6 text-primary uppercase transition-colors duration-200 hover:text-accent lg:gap-10"
                  style={TRACK_STYLE}
                >
                  {track.name}
                  <svg
                    aria-hidden
                    viewBox="0 0 16 16"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.4"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="size-6 transition-transform duration-300 ease-out group-hover:translate-x-1 group-hover:-translate-y-1 lg:size-8"
                  >
                    <path d="M4.5 11.5l7-7M5.5 4.5h6v6" />
                  </svg>
                </a>
              </li>
            ))}
          </ul>

          <div data-ground="dark" className="mt-20 overflow-hidden lg:mt-36">
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
