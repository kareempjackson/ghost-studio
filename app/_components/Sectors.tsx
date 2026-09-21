"use client";

import { motion, useMotionValueEvent, useScroll } from "motion/react";
import Image from "next/image";
import type { CSSProperties, ReactNode } from "react";
import { useRef, useState } from "react";
import { sectors, type Sector } from "@/lib/sectors";
import { usePrefersReducedMotion } from "./usePrefersReducedMotion";

const COUNT = sectors.items.length;
/** Scroll distance for the band, in svh: the pin plus about 60svh a sector. */
const TRACK_SVH = 100 + COUNT * 60;
/** Quick out, long settle. */
const EASE = [0.16, 1, 0.3, 1] as const;

/** 20px at 390 to 26px at 1440, held there. */
const LINE_STYLE: CSSProperties = {
  fontSize: "clamp(1.25rem, 1.1107rem + 0.571vw, 1.625rem)",
  letterSpacing: "-0.025em",
  lineHeight: 1.2,
};

const pad = (n: number) => String(n).padStart(2, "0");

/**
 * One slot of the row, holding every sector's version of it in one grid
 * cell. The one on stage is lit; the rest wait just below (still to come) or
 * just above (already passed), so the roll always runs with the scroll. All
 * four stay in the DOM for find-in-page and screen readers.
 */
function Swap({
  active,
  reduced,
  delay = 0,
  className = "",
  render,
}: {
  active: number;
  reduced: boolean;
  delay?: number;
  className?: string;
  render: (sector: Sector, index: number) => ReactNode;
}) {
  return (
    <div className={`grid overflow-hidden ${className}`}>
      {sectors.items.map((sector, index) => {
        const offset = index - active;
        const on = offset === 0;
        return (
          <motion.div
            key={sector.slug}
            aria-hidden={!on || undefined}
            className="[grid-area:1/1]"
            initial={false}
            animate={{
              opacity: on ? 1 : 0,
              y: reduced || on ? "0%" : offset > 0 ? "70%" : "-70%",
            }}
            transition={
              reduced
                ? { duration: 0.2 }
                : { duration: 0.6, ease: EASE, delay: on ? delay : 0 }
            }
          >
            {render(sector, index)}
          </motion.div>
        );
      })}
    </div>
  );
}

/**
 * Who the studio is hired by, one ruled row at a time.
 *
 * The band pins on a single row: a rule running to both edges of the page,
 * the number riding above it, the sector under it on the left, what the
 * studio builds for them on the right, and the plate centred across the line.
 * Scrolling hands the row from one sector to the next — the words roll over
 * in place and the next plate wipes up over the last. The rule never moves.
 * Reduced motion gets no pin, and only cross-fades.
 */
export function Sectors() {
  const trackRef = useRef<HTMLElement>(null);
  const reduced = usePrefersReducedMotion();
  const [active, setActive] = useState(0);

  const { scrollYProgress } = useScroll({
    target: trackRef,
    offset: ["start start", "end end"],
  });

  useMotionValueEvent(scrollYProgress, "change", (p) => {
    if (reduced) return;
    const next = Math.min(COUNT - 1, Math.max(0, Math.floor(p * COUNT)));
    setActive((current) => (current === next ? current : next));
  });

  return (
    <section
      ref={trackRef}
      aria-labelledby="sectors-heading"
      className="relative z-10 bg-surface-page"
      style={{ height: reduced ? "auto" : `${TRACK_SVH}svh` }}
    >
      <div
        className={`flex flex-col overflow-hidden pt-16 pb-12 lg:pt-24 ${
          reduced ? "relative min-h-svh" : "sticky top-0 h-svh"
        }`}
      >
        <div className="px-5 sm:px-8 lg:px-12">
          <h2
            id="sectors-heading"
            className="font-mono text-[0.75rem] leading-none tracking-[0.06em] text-ink-500 uppercase lg:text-[0.8125rem]"
          >
            {sectors.eyebrow}
          </h2>
        </div>

        {/*
          The stage. Below lg it is a column: number, name, plate, systems.
          From lg the rule sits at the stage's middle, the plate is centred
          across it, and the words take the corners either side of the line.
        */}
        <div className="relative mt-10 flex flex-1 flex-col px-5 sm:px-8 lg:mt-0 lg:block lg:px-0">
          <div
            aria-hidden
            className="absolute inset-x-0 top-1/2 hidden border-t border-edge-subtle lg:block"
          />

          <Swap
            active={active}
            reduced={reduced}
            className="font-mono text-[0.875rem] leading-none text-ink-950 lg:absolute lg:bottom-[calc(50%+1.75rem)] lg:left-[4.25rem]"
            render={(_, index) => <span>{pad(index + 1)}</span>}
          />

          <Swap
            active={active}
            reduced={reduced}
            delay={0.04}
            className="mt-4 lg:absolute lg:top-[calc(50%+1.5rem)] lg:left-[4.25rem] lg:mt-0 lg:w-[min(22rem,26vw)]"
            render={(sector) => (
              <h3 className="font-medium" style={LINE_STYLE}>
                {sector.name}
              </h3>
            )}
          />

          {/* Each later plate wipes up over the one before it; scrolling
              back lowers it again. */}
          <div
            aria-hidden
            className="relative mt-6 aspect-[12/7] w-full overflow-hidden rounded-[0.625rem] bg-ink-100 lg:absolute lg:top-1/2 lg:left-1/2 lg:mt-0 lg:w-[min(40vw,46rem)] lg:-translate-x-1/2 lg:-translate-y-[55%]"
          >
            {sectors.items.map((sector, index) => {
              const shown = index <= active;
              return (
                <motion.div
                  key={sector.slug}
                  className="absolute inset-0 overflow-hidden"
                  style={{ zIndex: index }}
                  initial={false}
                  animate={
                    reduced
                      ? { opacity: index === active ? 1 : 0 }
                      : {
                          clipPath: shown
                            ? "inset(0% 0% 0% 0%)"
                            : "inset(100% 0% 0% 0%)",
                        }
                  }
                  transition={
                    reduced ? { duration: 0.2 } : { duration: 0.8, ease: EASE }
                  }
                >
                  <motion.div
                    className="absolute inset-0"
                    initial={false}
                    animate={reduced ? undefined : { scale: shown ? 1 : 1.12 }}
                    transition={{ duration: 1, ease: EASE }}
                  >
                    <Image
                      src={sector.image}
                      alt=""
                      fill
                      sizes="(min-width: 1024px) 46rem, 100vw"
                      className="object-cover"
                    />
                  </motion.div>
                </motion.div>
              );
            })}
          </div>

          <Swap
            active={active}
            reduced={reduced}
            delay={0.08}
            className="mt-5 lg:absolute lg:top-[calc(50%+1.5rem)] lg:right-12 lg:mt-0 lg:w-[min(26rem,23vw)]"
            render={(sector) => <p style={LINE_STYLE}>{sector.work}</p>}
          />
        </div>
      </div>
    </section>
  );
}
