"use client";

import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import { serviceEnquiryHref, services, servicesPage } from "@/lib/services";
import { usePrefersReducedMotion } from "../../_components/usePrefersReducedMotion";
import { MONO, SectionHead } from "../../_components/SectionHead";
import { Toggle } from "../../_components/Toggle";

/** Quick out, long settle — the same curve the rest of the site opens on. */
const EASE_OUT = [0.22, 1, 0.36, 1] as const;

/** 28px at 390 to 56px at 1440, held there. Set in capitals. */
const NAME_STYLE = {
  fontSize: "clamp(1.75rem, 1.0071rem + 3.048vw, 3.5rem)",
  fontWeight: 500,
  letterSpacing: "-0.035em",
  lineHeight: 1,
} as const;

/** Number, name, promise, toggle — shared by the row and its panel. */
const COLUMNS =
  "grid-cols-[2.5rem_minmax(0,1fr)_1.5rem] sm:grid-cols-[3.5rem_minmax(0,1fr)_1.5rem] lg:grid-cols-[4.5rem_minmax(0,1.15fr)_minmax(0,1fr)_1.5rem]";

const pad = (n: number) => String(n).padStart(2, "0");

/**
 * The six disciplines, one open at a time.
 *
 * Closed, a row is its number, its name and what it is for — enough to scan
 * the whole list without opening anything. Open, it adds the line items on
 * the left and the way into a conversation on the right, which is the only
 * thing the row was holding back.
 *
 * One at a time rather than many: the rows are tall, and a list where every
 * row is open is a page nobody can see the shape of. All six arrive closed,
 * so the first read is the whole practice at once; the deck says to open one.
 */
export function Disciplines() {
  const [open, setOpen] = useState<string | null>(null);
  const reduced = usePrefersReducedMotion();

  return (
    <section
      aria-labelledby="disciplines-heading"
      className="bg-surface-sunken px-5 py-24 sm:px-8 lg:px-12 lg:py-32"
    >
      <SectionHead
        id="disciplines-heading"
        label={servicesPage.disciplines.label}
        heading={servicesPage.disciplines.heading}
        deck={servicesPage.disciplines.deck}
      />

      <ul className="mt-14 lg:mt-20">
        {services.items.map((service, index) => {
          const isOpen = open === service.slug;
          return (
            <li
              key={service.slug}
              id={service.slug}
              className="scroll-mt-[var(--gs-header-h)]"
            >
              <h3>
                <button
                  type="button"
                  onClick={() => setOpen(isOpen ? null : service.slug)}
                  aria-expanded={isOpen}
                  aria-controls={`${service.slug}-panel`}
                  className={`group grid w-full ${COLUMNS} items-start gap-x-4 py-5 text-left lg:items-center lg:gap-x-8 lg:py-6`}
                >
                  <span className={`${MONO} pt-2.5 text-ink-500 lg:pt-0`}>
                    {pad(index + 1)}
                  </span>
                  <span
                    className="text-primary uppercase transition-colors duration-200 group-hover:text-accent"
                    style={NAME_STYLE}
                  >
                    {service.name}
                  </span>
                  <span className="col-start-2 mt-3 text-[0.9375rem] leading-[1.5] tracking-[-0.01em] text-secondary lg:col-start-3 lg:row-start-1 lg:mt-0 lg:text-[1rem]">
                    {service.promise}
                  </span>
                  <span className="col-start-3 row-start-1 justify-self-end pt-2.5 lg:col-start-4 lg:pt-0">
                    <Toggle open={isOpen} />
                  </span>
                </button>
              </h3>

              <AnimatePresence initial={false}>
                {isOpen && (
                  <motion.div
                    key="panel"
                    id={`${service.slug}-panel`}
                    initial={reduced ? false : { height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={reduced ? undefined : { height: 0, opacity: 0 }}
                    transition={{ duration: 0.45, ease: EASE_OUT }}
                    className="overflow-hidden"
                  >
                    <div className={`grid ${COLUMNS} gap-x-4 gap-y-8 pt-2 pb-10 lg:gap-x-8 lg:pb-14`}>
                      <ul className="col-start-2 space-y-2">
                        {service.capabilities.map((capability) => (
                          <li
                            key={capability}
                            className="text-[0.9375rem] leading-[1.6] tracking-[-0.01em] text-primary"
                          >
                            {capability}
                          </li>
                        ))}
                      </ul>

                      <a
                        href={serviceEnquiryHref(service.slug)}
                        className="group inline-flex h-fit items-center gap-2 self-end border-b border-ink-950 pb-1.5 text-[0.9375rem] leading-none tracking-[-0.01em] text-primary transition-colors duration-200 hover:border-accent hover:text-accent col-start-2 justify-self-start lg:col-start-3"
                      >
                        {service.action}
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
                      </a>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
