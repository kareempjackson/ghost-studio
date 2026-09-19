"use client";

import {
  motion,
  useScroll,
  useTransform,
  type MotionValue,
} from "motion/react";
import type { CSSProperties } from "react";
import { useRef } from "react";
import { pointOfView } from "@/lib/point-of-view";
import { serviceHref, services, type Service } from "@/lib/services";
import { ArrowPill } from "./ArrowPill";
import { usePrefersReducedMotion } from "./usePrefersReducedMotion";

const COUNT = services.items.length;
/** Scroll per card change, in svh. The pin itself is one more screen. */
const STEP_SVH = 70;
/**
 * How high a leaving card lifts at the top of its arc, in % of its own
 * height — enough to clear the card behind before it tucks under the deck.
 */
const LIFT = 58;
/** How far a leaving card tips as it lifts, in degrees. */
const TILT = -2.5;
/** How far each card behind the front one sits below it, in px. */
const PEEK = 18;
/** How much narrower each card behind is, as a fraction. */
const SHRINK = 0.045;
/** Grounds for the front card and the two behind it; the rest are hidden. */
const GROUNDS = [
  [255, 255, 255],
  [217, 217, 217],
  [184, 184, 184],
] as const;

/** 56px at 390 to 104px at 1440, held there. */
const TITLE_STYLE: CSSProperties = {
  fontSize: "clamp(3.5rem, 2.3857rem + 4.571vw, 6.5rem)",
  fontWeight: 500,
  letterSpacing: "-0.055em",
  lineHeight: 0.95,
};

const pad = (n: number) => String(n).padStart(2, "0");
const clamp = (v: number, lo: number, hi: number) =>
  Math.min(hi, Math.max(lo, v));

function groundAt(depth: number) {
  const d = clamp(depth, 0, GROUNDS.length - 1);
  const i = Math.min(Math.floor(d), GROUNDS.length - 2);
  const t = d - i;
  const [a, b] = [GROUNDS[i], GROUNDS[i + 1]];
  const mix = (k: number) => Math.round(a[k] + (b[k] - a[k]) * t);
  return `rgb(${mix(0)} ${mix(1)} ${mix(2)})`;
}

function CardBody({ service, index }: { service: Service; index: number }) {
  return (
    <div className="flex h-full flex-col p-6 sm:p-8 lg:p-10">
      <div className="grid flex-1 content-start gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,26rem)] lg:gap-12">
        <div className="flex items-start gap-5 lg:gap-8">
          <span className="pt-2 font-mono text-[0.8125rem] leading-none text-ink-600">
            {pad(index + 1)}
          </span>
          <h3 style={TITLE_STYLE}>{service.name}</h3>
        </div>

        <ul className="space-y-3 text-[1.0625rem] leading-[1.35] tracking-[-0.01em] lg:space-y-3.5 lg:pt-4 lg:text-[1.25rem]">
          {service.capabilities.map((capability) => (
            <li key={capability} className="flex gap-4">
              <span aria-hidden className="text-[0.75em] leading-[1.8]">
                &bull;
              </span>
              {capability}
            </li>
          ))}
        </ul>
      </div>

      <div className="mt-8 flex justify-end">
        <ArrowPill
          href={serviceHref(service.slug)}
          ariaLabel={`${services.cta}: ${service.name}`}
        >
          {services.cta}
        </ArrowPill>
      </div>
    </div>
  );
}

/**
 * One card in the deck, placed by how far it is from the front.
 *
 * `depth` is this card's index less the scroll position, in cards. At 0 it
 * is the front card. Above 0 it waits behind, a step lower, narrower and
 * greyer for every card between it and the front, scaled from its bottom
 * edge so only a sliver shows under the one in front. Below 0 it is leaving:
 * it lifts in an arc, drops beneath the deck at the top of it, and settles
 * at the back — a shuffle, uncovering the next card as it goes.
 */
function DeckCard({
  service,
  index,
  position,
}: {
  service: Service;
  index: number;
  position: MotionValue<number>;
}) {
  const depth = useTransform(position, (p) => index - p);
  /* 0 while waiting or in front, 0 → 1 over the shuffle. */
  const shuffle = (d: number) => clamp(-d, 0, 1);
  /* Where the card reads as sitting in the deck, for size and colour. */
  const visual = (d: number) =>
    d >= 0 ? Math.min(d, GROUNDS.length) : shuffle(d) * GROUNDS.length;

  const y = useTransform(depth, (d) => {
    const t = shuffle(d);
    const rest = visual(d) * PEEK;
    return t > 0
      ? `calc(${-Math.sin(Math.PI * t) * LIFT}% + ${rest}px)`
      : `${rest}px`;
  });
  const rotate = useTransform(
    depth,
    (d) => Math.sin(Math.PI * shuffle(d)) * TILT,
  );
  const scale = useTransform(depth, (d) => 1 - visual(d) * SHRINK);
  const backgroundColor = useTransform(depth, (d) => groundAt(visual(d)));
  /* Cards more than two back are out of sight until they move up. */
  const opacity = useTransform(depth, (d) =>
    clamp(GROUNDS.length - visual(d), 0, 1),
  );
  /* On top for the first half of the shuffle, under everything after. */
  const zIndex = useTransform(depth, (d) =>
    d < -0.5 ? 0 : d < 0 ? COUNT + 1 : COUNT - index,
  );

  return (
    <motion.li
      style={{
        y,
        rotate,
        scale,
        backgroundColor,
        opacity,
        zIndex,
        transformOrigin: "50% 100%",
      }}
      className="absolute inset-x-0 top-0 bottom-[calc(var(--peek)*2)] overflow-hidden rounded-[0.75rem] text-ink-950 will-change-transform"
    >
      <CardBody service={service} index={index} />
    </motion.li>
  );
}

/**
 * The services, as a deck.
 *
 * The band pins and the scroll deals the cards: the front one shuffles to the
 * back and the one behind it steps forward into its place. Nothing is
 * scroll-jacked — the page moves at its own speed and the deck reads its position off it.
 * Reduced motion gets the cards laid out one under the next, no pin.
 */
export function Services() {
  const trackRef = useRef<HTMLDivElement>(null);
  const reduced = usePrefersReducedMotion();
  const { scrollYProgress } = useScroll({
    target: trackRef,
    offset: ["start start", "end end"],
  });
  const position = useTransform(scrollYProgress, (p) => p * (COUNT - 1));

  const header = (
    <div className="flex items-center justify-between gap-6 border-t border-white/15 pt-8 lg:pt-10">
      <h2
        id="services-heading"
        className="font-mono text-[0.75rem] leading-none tracking-[0.06em] text-ink-300 uppercase sm:text-[0.8125rem]"
      >
        {services.eyebrow}
      </h2>
      <ArrowPill href={pointOfView.action.href} tone="signal">
        {pointOfView.action.label}
      </ArrowPill>
    </div>
  );

  if (reduced) {
    return (
      <section
        aria-labelledby="services-heading"
        data-ground="dark"
        className="relative z-10 bg-black px-5 pt-16 pb-28 sm:px-8 lg:px-12 lg:pt-24 lg:pb-40"
      >
        {header}
        <ol className="mt-16 space-y-4">
          {services.items.map((service, index) => (
            <li
              key={service.slug}
              className="min-h-[28rem] overflow-hidden rounded-[0.75rem] bg-white text-ink-950"
            >
              <CardBody service={service} index={index} />
            </li>
          ))}
        </ol>
      </section>
    );
  }

  return (
    <section
      aria-labelledby="services-heading"
      data-ground="dark"
      className="relative z-10 bg-black"
    >
      <div
        ref={trackRef}
        style={{ height: `${100 + (COUNT - 1) * STEP_SVH}svh` }}
      >
        <div
          className="sticky top-0 flex h-svh flex-col px-5 pt-16 pb-10 sm:px-8 lg:px-12 lg:pt-24 lg:pb-12"
          style={{ "--peek": `${PEEK}px` } as CSSProperties}
        >
          {header}
          <ol className="relative mt-12 flex-1 lg:mt-20">
            {services.items.map((service, index) => (
              <DeckCard
                key={service.slug}
                service={service}
                index={index}
                position={position}
              />
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}
