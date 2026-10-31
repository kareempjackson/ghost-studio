import type { CSSProperties } from "react";
import type { Metadata } from "next";
import { pageMetadata } from "@/lib/seo";
import { absoluteUrl } from "@/lib/site";
import { getManagedServicesPage } from "@/sanity/content";
import { toPlain } from "@/sanity/lib/rich";
import { Questions } from "../../build/_components/Questions";
import { ChatLauncher } from "../../_components/ChatLauncher";
import { ContactBand } from "../../_components/ContactBand";
import { PageCover } from "../../_components/PageCover";
import { Rich } from "../../_components/Rich";
import { BAND_STYLE, MONO } from "../../_components/SectionHead";
import { SiteFooter } from "../../_components/SiteFooter";
import { SiteHeader } from "../../_components/SiteHeader";
import { StructuredData, faqPage, studio } from "../../_components/StructuredData";
import { WordmarkPlate } from "../../_components/WordmarkPlate";

export async function generateMetadata(): Promise<Metadata> {
  const { title, description } = await getManagedServicesPage();
  return pageMetadata({ title, description, path: "/integrate/managed-services" });
}

/** The band headings, at the site's band size, in the cover's regular weight, as the comp sets them. */
const HEADING: CSSProperties = { ...BAND_STYLE, fontWeight: 400 };

/** 28px at 390 to 40px at 1440, held there. Who it's for, and each service's name and the line under it. */
const TITLE: CSSProperties = {
  fontSize: "clamp(1.75rem, 1.4714rem + 1.143vw, 2.5rem)",
  fontWeight: 400,
  letterSpacing: "-0.04em",
  lineHeight: 1.1,
};

/** The plate's colour until its photograph is in: the comp's blue. */
const PLATE = "#2b4a9e";

const GUTTER = "px-5 sm:px-8 lg:px-12";
const BAND = `${GUTTER} py-24 lg:py-36`;
/** The site's margin grid: a narrow column for the name, a wide one for what it says. */
const SPLIT = "grid gap-y-8 lg:grid-cols-[minmax(0,3fr)_minmax(0,5fr)] lg:gap-x-8";
const COPY = "text-[1rem] leading-[1.6] tracking-[-0.01em] lg:text-[1.0625rem]";

const pad = (n: number) => String(n).padStart(2, "0");

/**
 * `/integrate/managed-services` — IT support as a monthly service, the
 * ongoing side of Integrate.
 *
 * The cover says what it is and the plate carries the wordmark, as on the
 * track pages. Then who it's for, in three situations a reader will
 * recognise; the four things it covers, each opened by the sentence a client
 * would actually say; why it runs best on systems the studio set up; how it's
 * priced; and the questions left over. The contact band closes it.
 */
export default async function ManagedServices() {
  const [data, provider] = await Promise.all([getManagedServicesPage(), studio()]);
  const { who, included, setup, pricing, questions } = data;

  /* The service, what it covers and how it is priced, and the questions
     under it as an FAQ: what an agent quotes back. */
  const structured = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Service",
        name: data.title,
        description: data.description,
        url: absoluteUrl("/integrate/managed-services"),
        provider,
        hasOfferCatalog: {
          "@type": "OfferCatalog",
          name: included.heading.join(" "),
          itemListElement: included.services.map((service) => ({
            "@type": "Offer",
            itemOffered: {
              "@type": "Service",
              name: service.title.join(" "),
              description: toPlain(service.body),
            },
          })),
        },
        offers: { "@type": "Offer", description: toPlain(pricing.body) },
      },
      ...(questions.items.length > 0 ? [faqPage(questions.items)] : []),
    ],
  };

  return (
    <>
      <SiteHeader />
      <StructuredData data={structured} />
      <main className="relative z-[1] flex flex-1 flex-col bg-surface-page">
        <PageCover
          id="managed-heading"
          eyebrow={data.eyebrow}
          heading={data.heading}
          summary={data.summary}
          action={data.action}
          size="md"
        />

        <WordmarkPlate plate={data.plate} ground={PLATE} />

        {/* Who it's for ------------------------------------------------------ */}
        <section aria-labelledby="who-heading" className={BAND}>
          <h2 id="who-heading" className="text-primary" style={HEADING}>
            {who.heading}
          </h2>
          <ol className="mt-14 grid gap-y-14 sm:grid-cols-3 sm:gap-x-5 lg:mt-24 lg:gap-x-8">
            {who.items.map((item, index) => (
              <li key={item.title.join(" ")}>
                <p className={`${MONO} text-ink-500`}>{pad(index + 1)}</p>
                <h3 className="mt-6 text-primary lg:mt-8" style={TITLE}>
                  {item.title.map((line) => (
                    <span key={line} className="block">
                      {line}
                    </span>
                  ))}
                </h3>
                <div className={`mt-5 max-w-[26rem] text-secondary lg:mt-6 ${COPY}`}>
                  <Rich value={item.body} />
                </div>
              </li>
            ))}
          </ol>
        </section>

        {/* What's included --------------------------------------------------- */}
        <section aria-labelledby="included-heading" className={`${BAND} pt-0 lg:pt-0`}>
          <p className={`${MONO} text-ink-500`}>{included.label}</p>
          <h2 id="included-heading" className="mt-6 text-primary lg:mt-8" style={HEADING}>
            {included.heading.map((line) => (
              <span key={line} className="block">
                {line}
              </span>
            ))}
          </h2>

          <ol className="mt-20 grid gap-y-24 lg:mt-32 lg:gap-y-40">
            {included.services.map((service, index) => {
              const id = `service-${index + 1}`;
              return (
                <li key={service.title.join(" ")} aria-labelledby={id} className={SPLIT}>
                  <div>
                    <p className={`${MONO} text-ink-500`}>{pad(index + 1)}</p>
                    <h3 id={id} className="mt-6 text-primary lg:mt-8" style={TITLE}>
                      {service.title.map((line) => (
                        <span key={line} className="block">
                          {line}
                        </span>
                      ))}
                    </h3>
                    <p className="mt-8 max-w-[18ch] text-primary lg:mt-10" style={TITLE}>
                      &ldquo;{service.quote}&rdquo;
                    </p>
                  </div>
                  <div className="lg:pt-1">
                    <div className={`grid max-w-[44rem] gap-5 text-ink-800 ${COPY}`}>
                      <Rich value={service.body} />
                    </div>
                    <p className={`mt-10 ${MONO} text-ink-500 lg:mt-12`}>{included.coveredLabel}</p>
                    <ul className={`mt-5 grid gap-2.5 text-ink-800 ${COPY}`}>
                      {service.covered.map((item) => (
                        <li key={item} className="flex gap-3">
                          <span aria-hidden className="text-ink-400">
                            &bull;
                          </span>
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                </li>
              );
            })}
          </ol>
        </section>

        {/* Why it runs best on systems we set up ------------------------------- */}
        <section
          aria-labelledby="setup-heading"
          data-ground="dark"
          className={`bg-ink-950 ${GUTTER} py-20 text-white lg:py-28`}
        >
          <h2 id="setup-heading" style={HEADING}>
            {setup.heading.map((line) => (
              <span key={line} className="block">
                {line}
              </span>
            ))}
          </h2>
          <div className="mt-10 grid gap-y-6 lg:mt-14 lg:grid-cols-[minmax(0,5fr)_minmax(0,3fr)] lg:gap-x-24">
            <div className={`max-w-[40rem] text-white/80 ${COPY}`}>
              <Rich value={setup.body} />
            </div>
            <div className={`max-w-[26rem] text-white/80 ${COPY}`}>
              <Rich value={setup.aside} />
            </div>
          </div>
        </section>

        {/* Pricing ------------------------------------------------------------ */}
        <section aria-labelledby="pricing-heading" className={`${GUTTER} py-24 lg:py-32 ${SPLIT}`}>
          <h2 id="pricing-heading" className="text-primary" style={HEADING}>
            {pricing.heading}
          </h2>
          <div className={`max-w-[42rem] text-primary lg:pt-3 ${COPY}`}>
            <Rich value={pricing.body} />
          </div>
        </section>

        {/* Questions ---------------------------------------------------------- */}
        <section aria-labelledby="questions-heading" className={`bg-surface-sunken ${BAND} ${SPLIT}`}>
          <h2 id="questions-heading" className="text-primary" style={HEADING}>
            {questions.heading.map((line) => (
              <span key={line} className="block">
                {line}
              </span>
            ))}
          </h2>
          <Questions items={questions.items} />
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
