"use client";

import {
  cubicBezier,
  motion,
  useMotionValueEvent,
  useScroll,
  useTransform,
  type MotionValue,
} from "motion/react";
import Image from "next/image";
import type { CSSProperties, ReactNode } from "react";
import { useRef, useState } from "react";
import { sectors, type Sector } from "@/lib/sectors";
import { usePrefersReducedMotion } from "./usePrefersReducedMotion";

const COUNT = sectors.items.length;
/** Scroll distance for the band, in svh: the pin plus about 80svh a sector. */
const TRACK_SVH = 100 + COUNT * 80;

/**
 * Everything here is scrubbed: it is a function of how far the band has been
 * scrolled, measured in sectors (0 at the top, COUNT at the bottom), and it
 * moves only while the page does.
 *
 * The hand-over from one sector to the next takes HANDOVER of a sector's
 * scroll, centred on the boundary. The outgoing words leave in its first
 * half, the incoming words arrive in its second, and the plate wipes across
 * the whole of it. The rest of each sector's scroll is a hold, so every
 * sector sits still long enough to be read.
 */
const HANDOVER = 0.5;
const HALF = HANDOVER / 2;
/** How far behind the number the name and then the systems line start. */
const STAGGER = 0.04;

/** Held at both ends, so a scrubbed move eases in and settles. */
const EASE_IN_OUT = cubicBezier(0.65, 0, 0.35, 1);

/** 20px at 390 to 26px at 1440, held there. */
const LINE_STYLE: CSSProperties = {
  fontSize: "clamp(1.25rem, 1.1107rem + 0.571vw, 1.625rem)",
  letterSpacing: "-0.025em",
  lineHeight: 1.2,
};

const pad = (n: number) => String(n).padStart(2, "0");

/**
 * One sector's version of a slot. It rises into the slot in the second half
 * of its own hand-over and leaves upward in the first half of the next one.
 * The first sector is already in place when the band arrives, and the last
 * never leaves.
 */
function Line({
  index,
  at,
  lag,
  children,
}: {
  index: number;
  at: MotionValue<number>;
  lag: number;
  children: ReactNode;
}) {
  const inStart = index === 0 ? -2 : index + lag;
  const outStart = index === COUNT - 1 ? COUNT + 2 : index + 1 - HALF + lag;
  const input = [inStart, inStart + HALF, outStart, outStart + HALF];
  const options = { ease: EASE_IN_OUT };

  const y = useTransform(at, input, ["105%", "0%", "0%", "-105%"], options);
  const opacity = useTransform(at, input, [0, 1, 1, 0], options);

  return (
    <motion.div className="[grid-area:1/1]" style={{ y, opacity }}>
      {children}
    </motion.div>
  );
}

/**
 * One slot of the row, holding every sector's version of it in one grid
 * cell, so the cell is as tall as the longest and nothing below it jumps.
 * All four stay in the DOM for find-in-page and screen readers; only the one
 * on stage is exposed to them.
 */
function Swap({
  at,
  active,
  reduced,
  lag = 0,
  className = "",
  render,
}: {
  at: MotionValue<number>;
  active: number;
  reduced: boolean;
  lag?: number;
  className?: string;
  render: (sector: Sector, index: number) => ReactNode;
}) {
  return (
    <div className={`grid overflow-hidden ${className}`}>
      {sectors.items.map((sector, index) =>
        reduced ? (
          <div
            key={sector.slug}
            aria-hidden={index !== active || undefined}
            className={`[grid-area:1/1] ${index === active ? "" : "invisible"}`}
          >
            {render(sector, index)}
          </div>
        ) : (
          <div
            key={sector.slug}
            aria-hidden={index !== active || undefined}
            className="grid [grid-area:1/1]"
          >
            <Line index={index} at={at} lag={lag}>
              {render(sector, index)}
            </Line>
          </div>
        ),
      )}
    </div>
  );
}

/**
 * One plate. It wipes up over the one before it across its hand-over,
 * settling from a slight zoom as it goes, and dims as the next one is laid
 * over it. Scrolling back runs all of it in reverse.
 */
function Plate({
  sector,
  index,
  at,
}: {
  sector: Sector;
  index: number;
  at: MotionValue<number>;
}) {
  const options = { ease: EASE_IN_OUT };
  const wipe = [index - HALF, index + HALF];
  const top = useTransform(at, wipe, index === 0 ? [0, 0] : [100, 0], options);
  const clipPath = useTransform(top, (t) => `inset(${t}% 0% 0% 0%)`);
  const scale = useTransform(
    at,
    wipe,
    index === 0 ? [1, 1] : [1.15, 1],
    options,
  );
  const shade = useTransform(
    at,
    [index + 1 - HALF, index + 1 + HALF],
    index === COUNT - 1 ? [0, 0] : [0, 0.45],
    options,
  );

  return (
    <motion.div
      className="absolute inset-0 overflow-hidden"
      style={{ zIndex: index, clipPath }}
    >
      <motion.div className="absolute inset-0" style={{ scale }}>
        <Image
          src={sector.image}
          alt=""
          fill
          sizes="(min-width: 1024px) 46rem, 100vw"
          className="object-cover"
        />
      </motion.div>
      <motion.div
        className="absolute inset-0 bg-ink-950"
        style={{ opacity: shade }}
      />
    </motion.div>
  );
}

/**
 * Who the studio is hired by, one ruled row at a time.
 *
 * The band pins on a single row: a rule running to both edges of the page,
 * the number riding above it, the sector under it on the left, what the
 * studio builds for them on the right, and the plate centred across the line.
 * Scrolling hands the row from one sector to the next: the words roll over
 * in place and the next plate wipes up over the last, all of it tied to the
 * scroll, so it runs as fast as the reader does and stops when they stop.
 * The rule never moves. Reduced motion gets no pin, and the first sector.
 */
export function Sectors() {
  const trackRef = useRef<HTMLElement>(null);
  const reduced = usePrefersReducedMotion();
  const [active, setActive] = useState(0);

  const { scrollYProgress } = useScroll({
    target: trackRef,
    offset: ["start start", "end end"],
  });
  /** Scroll through the band, in sectors. */
  const at = useTransform(scrollYProgress, (p) => p * COUNT);

  /* Which sector is on stage, for the screen reader: the hand-over is won
     at the boundary, where the old words have left and the new ones start. */
  useMotionValueEvent(at, "change", (value) => {
    if (reduced) return;
    const next = Math.min(COUNT - 1, Math.max(0, Math.floor(value)));
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
            className="font-label text-[0.75rem] leading-none tracking-[0.06em] text-ink-500 uppercase lg:text-[0.8125rem]"
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
            at={at}
            active={active}
            reduced={reduced}
            className="font-label text-[0.875rem] leading-none text-ink-950 lg:absolute lg:bottom-[calc(50%+1.75rem)] lg:left-[4.25rem]"
            render={(_, index) => <span>{pad(index + 1)}</span>}
          />

          <Swap
            at={at}
            active={active}
            reduced={reduced}
            lag={STAGGER}
            className="mt-4 lg:absolute lg:top-[calc(50%+1.5rem)] lg:left-[4.25rem] lg:mt-0 lg:w-[min(22rem,26vw)]"
            render={(sector) => (
              <h3 className="font-medium" style={LINE_STYLE}>
                {sector.name}
              </h3>
            )}
          />

          <div
            aria-hidden
            className="relative mt-6 aspect-[12/7] w-full overflow-hidden rounded-[0.625rem] bg-ink-100 lg:absolute lg:top-1/2 lg:left-1/2 lg:mt-0 lg:w-[min(40vw,46rem)] lg:-translate-x-1/2 lg:-translate-y-[55%]"
          >
            {reduced ? (
              <Image
                src={sectors.items[active].image}
                alt=""
                fill
                sizes="(min-width: 1024px) 46rem, 100vw"
                className="object-cover"
              />
            ) : (
              sectors.items.map((sector, index) => (
                <Plate
                  key={sector.slug}
                  sector={sector}
                  index={index}
                  at={at}
                />
              ))
            )}
          </div>

          <Swap
            at={at}
            active={active}
            reduced={reduced}
            lag={STAGGER * 2}
            className="mt-5 lg:absolute lg:top-[calc(50%+1.5rem)] lg:right-12 lg:mt-0 lg:w-[min(26rem,23vw)]"
            render={(sector) => <p style={LINE_STYLE}>{sector.work}</p>}
          />
        </div>
      </div>
    </section>
  );
}
