"use client";

import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import { serviceEnquiryHref, services, servicesPage } from "@/lib/services";
import { usePrefersReducedMotion } from "../../_components/usePrefersReducedMotion";

/** Quick out, long settle — the same curve the rest of the site opens on. */
const EASE_OUT = [0.22, 1, 0.36, 1] as const;

/** 32px at 390 to 56px at 1440, held there. */
const NAME_STYLE = {
  fontSize: "clamp(2rem, 1.4429rem + 2.286vw, 3.5rem)",
  fontWeight: 400,
  letterSpacing: "-0.04em",
  lineHeight: 1,
} as const;

const MONO =
  "font-mono text-[0.6875rem] leading-none tracking-[0.06em] uppercase";

const pad = (n: number) => String(n).padStart(2, "0");

/**
 * The plus that turns into a cross: two rules, and the pair of them turned
 * 45 degrees. Drawn rather than swapped, so the two states are the same mark
 * at two angles and nothing jumps.
 */
function Toggle({ open }: { open: boolean }) {
  return (
    <span
      aria-hidden
      className={`relative block size-4 shrink-0 transition-[transform,color] duration-300 ease-out ${
        open ? "rotate-45 text-accent" : "rotate-0 text-ink-950"
      }`}
    >
      <span className="absolute top-1/2 left-0 block h-px w-full -translate-y-1/2 bg-current" />
      <span className="absolute top-0 left-1/2 block h-full w-px -translate-x-1/2 bg-current" />
    </span>
  );
}

/**
 * The six disciplines, one open at a time.
 *
 * Closed, a row is its number, its name and what it is for — enough to scan
 * the whole list without opening anything. Open, it adds the line items on
 * the left and the way into a conversation on the right, which is the only
 * thing the row was holding back.
 *
 * One at a time rather than many: the rows are tall, and a list where every
 * row is open is a page nobody can see the shape of. The first is open on
 * arrival so the pattern is shown rather than described.
 */
export function Disciplines() {
  const [open, setOpen] = useState<string | null>(services.items[0].slug);
  const reduced = usePrefersReducedMotion();

  return (
    <section
      aria-labelledby="disciplines-heading"
      className="px-5 pb-24 sm:px-8 lg:px-12 lg:pb-32"
    >
      <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-3 border-t border-edge-subtle pt-8 lg:pt-10">
        <h2
          id="disciplines-heading"
          className="text-[1.5rem] leading-[1.15] font-normal tracking-[-0.035em] text-primary lg:text-[1.875rem]"
        >
          {servicesPage.disciplines.heading}
        </h2>
        <p className={`${MONO} text-ink-500`}>
          {servicesPage.disciplines.label}
        </p>
      </div>

      <ul className="mt-8 border-t border-edge-subtle lg:mt-10">
        {services.items.map((service, index) => {
          const isOpen = open === service.slug;
          return (
            <li
              key={service.slug}
              id={service.slug}
              className="scroll-mt-[var(--gs-header-h)] border-b border-edge-subtle"
            >
              <h3>
                <button
                  type="button"
                  onClick={() => setOpen(isOpen ? null : service.slug)}
                  aria-expanded={isOpen}
                  aria-controls={`${service.slug}-panel`}
                  className="group grid w-full grid-cols-[2.5rem_minmax(0,1fr)_1.5rem] items-start gap-x-4 py-7 text-left sm:grid-cols-[3.5rem_minmax(0,1fr)_1.5rem] lg:grid-cols-[4rem_minmax(0,1.1fr)_minmax(0,1fr)_1.5rem] lg:gap-x-8 lg:py-9"
                >
                  <span className={`${MONO} pt-3 text-ink-500 lg:pt-4`}>
                    {pad(index + 1)}
                  </span>
                  <span
                    className="text-primary transition-colors duration-200 group-hover:text-accent"
                    style={NAME_STYLE}
                  >
                    {service.name}
                  </span>
                  <span className="col-start-2 mt-3 text-[0.9375rem] leading-[1.5] text-secondary lg:col-start-3 lg:mt-4 lg:text-[1rem]">
                    {service.promise}
                  </span>
                  <span className="col-start-3 row-start-1 justify-self-end pt-4 lg:col-start-4">
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
                    <div className="grid gap-y-8 pb-9 sm:grid-cols-[3.5rem_minmax(0,1fr)] sm:gap-x-4 lg:grid-cols-[4rem_minmax(0,1.1fr)_minmax(0,1fr)_1.5rem] lg:gap-x-8 lg:pb-12">
                      <ul className="space-y-2 sm:col-start-2 lg:col-start-2">
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
                        className="group inline-flex h-fit items-center gap-2 self-end border-b border-ink-950 pb-1.5 text-[0.9375rem] leading-none tracking-[-0.01em] text-primary transition-colors duration-200 hover:border-accent hover:text-accent sm:col-start-2 sm:justify-self-start lg:col-start-3"
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
