"use client";

import { AnimatePresence, motion, useInView } from "motion/react";
import Image from "next/image";
import type { CSSProperties, KeyboardEvent } from "react";
import { useRef, useState } from "react";
import { engagement } from "@/lib/engagement";
import { usePrefersReducedMotion } from "./usePrefersReducedMotion";

/** 22px at 390 to 30px at 1440, held there. */
const COPY_STYLE: CSSProperties = {
  fontSize: "clamp(1.375rem, 1.1893rem + 0.762vw, 1.875rem)",
  letterSpacing: "-0.025em",
  lineHeight: 1.3,
};

const MODELS = engagement.models;

/**
 * How the studio is bought: three models on one card, read one at a time.
 *
 * The tabs advance on their own while nobody is reading — the vermilion rule
 * over the open tab is its timer — and hold still the moment the pointer or
 * focus is inside the card, or the card is off screen. Reduced motion gets no timer and no advance; the
 * rule simply marks the open tab.
 */
export function Engagement() {
  const [active, setActive] = useState(MODELS.length - 1);
  const [held, setHeld] = useState(false);
  const reduced = usePrefersReducedMotion();
  const tabsRef = useRef<(HTMLButtonElement | null)[]>([]);
  const cardRef = useRef<HTMLDivElement>(null);
  /* Nobody is reading a card that is off screen, so its timer waits. */
  const inView = useInView(cardRef, { amount: 0.4 });
  const paused = held || !inView;
  const model = MODELS[active];

  const advance = () => setActive((i) => (i + 1) % MODELS.length);

  function onKeyDown(event: KeyboardEvent<HTMLButtonElement>) {
    const step =
      event.key === "ArrowRight" ? 1 : event.key === "ArrowLeft" ? -1 : 0;
    if (!step) return;
    event.preventDefault();
    const next = (active + step + MODELS.length) % MODELS.length;
    setActive(next);
    tabsRef.current[next]?.focus();
  }

  return (
    <section
      aria-labelledby="engagement-heading"
      data-ground="dark"
      className="relative z-10 bg-black px-5 py-24 sm:px-8 lg:px-12 lg:py-40"
    >
      <div className="mx-auto grid max-w-[80rem] gap-4 lg:grid-cols-[minmax(0,0.42fr)_minmax(0,1fr)] lg:gap-5">
        {/* The plate: the studio's own merch, and the lockup under it. */}
        <div className="flex flex-col rounded-[1rem] border border-white/10 bg-black p-5 sm:p-6">
          <span className="self-start rounded-pill bg-white px-3 py-1.5 font-mono text-[0.6875rem] leading-none tracking-[0.04em] text-ink-950 uppercase">
            {engagement.chip}
          </span>
          <div className="relative mt-4 aspect-[326/347] overflow-hidden rounded-[0.25rem] bg-ink-100 lg:aspect-auto lg:min-h-[24rem] lg:flex-1">
            <Image
              src={engagement.image.src}
              alt={engagement.image.alt}
              fill
              sizes="(min-width: 1024px) 30vw, 100vw"
              className="object-cover"
            />
          </div>
          {/*
            The lockup is drawn on its own black square; the content sits in
            the middle band of it, so the box is cropped to that band.
          */}
          <div className="relative mt-5 aspect-[472/92] overflow-hidden">
            <Image
              src="/logos/logo-black-pill.svg"
              alt="Ghost Savvy"
              width={500}
              height={500}
              className="absolute top-1/2 left-1/2 w-[105.9%] max-w-none -translate-x-1/2 -translate-y-1/2"
            />
          </div>
        </div>

        <div
          ref={cardRef}
          className="flex flex-col rounded-[1rem] bg-[#f0efed] p-6 text-ink-950 sm:p-8 lg:p-10"
          onPointerEnter={() => setHeld(true)}
          onPointerLeave={() => setHeld(false)}
          onFocus={() => setHeld(true)}
          onBlur={(event) => {
            if (!event.currentTarget.contains(event.relatedTarget))
              setHeld(false);
          }}
        >
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-4">
              <span
                aria-hidden
                className="grid size-12 shrink-0 place-items-center rounded-full bg-ink-950 text-[1.375rem] font-bold text-white lg:size-14"
              >
                G
              </span>
              <div>
                <h2
                  id="engagement-heading"
                  className="text-[1.125rem] leading-[1.3] tracking-[-0.02em] lg:text-[1.25rem]"
                >
                  {engagement.title}
                </h2>
                <p className="text-[0.9375rem] leading-[1.4] tracking-[-0.01em] text-ink-500 lg:text-[1.0625rem]">
                  {engagement.subtitle}
                </p>
              </div>
            </div>
            <span className="hidden rounded-pill bg-ink-200/70 px-3 py-2 font-mono text-[0.75rem] leading-none tracking-[0.04em] uppercase sm:inline-block">
              {model.name}
            </span>
          </div>

          {/* Held to the tallest paragraph, so switching never moves the tabs. */}
          <div
            id="engagement-panel"
            role="tabpanel"
            aria-labelledby={`engagement-tab-${model.slug}`}
            className="mt-16 grid min-h-[13rem] content-end lg:mt-24 lg:min-h-[14rem]"
          >
            <AnimatePresence mode="wait" initial={false}>
              <motion.div
                key={model.slug}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
              >
                <p style={COPY_STYLE}>{model.copy}</p>
                <a
                  href={model.action.href}
                  className="group mt-7 inline-flex items-center gap-4 border-b border-ink-950 pb-1.5 text-[1rem] leading-none tracking-[-0.01em] lg:text-[1.0625rem]"
                >
                  {model.action.label}
                  <svg
                    aria-hidden
                    viewBox="0 0 16 16"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.4"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="size-3.5 transition-transform duration-300 ease-out group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                  >
                    <path d="M4.5 11.5l7-7M5.5 4.5h6v6" />
                  </svg>
                </a>
              </motion.div>
            </AnimatePresence>
          </div>

          <div
            role="tablist"
            aria-label={engagement.subtitle}
            className="mt-10 grid grid-cols-3 gap-4 border-t border-edge-subtle"
          >
            {MODELS.map((m, index) => {
              const selected = index === active;
              return (
                <button
                  key={m.slug}
                  ref={(el) => {
                    tabsRef.current[index] = el;
                  }}
                  id={`engagement-tab-${m.slug}`}
                  type="button"
                  role="tab"
                  aria-selected={selected}
                  aria-controls="engagement-panel"
                  tabIndex={selected ? 0 : -1}
                  onClick={() => setActive(index)}
                  onKeyDown={onKeyDown}
                  className="relative pt-6 text-left"
                >
                  {selected && (
                    <span
                      aria-hidden
                      key={`${m.slug}-${active}`}
                      className={`absolute -top-px left-0 h-[3px] w-full origin-left bg-[#eb5b32] ${
                        reduced ? "" : "gs-tab-timer"
                      }`}
                      style={{
                        animationPlayState: paused ? "paused" : "running",
                      }}
                      onAnimationEnd={reduced ? undefined : advance}
                    />
                  )}
                  <span
                    className={`block text-[1.375rem] leading-[1.1] tracking-[-0.03em] transition-colors duration-200 lg:text-[1.75rem] ${
                      selected
                        ? "text-ink-950"
                        : "text-ink-500 hover:text-ink-800"
                    }`}
                  >
                    {m.name}
                  </span>
                  <span
                    className={`mt-2 block text-[0.8125rem] leading-[1.35] transition-colors duration-200 lg:text-[0.9375rem] ${
                      selected ? "text-ink-950" : "text-ink-500"
                    }`}
                  >
                    {m.kind}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
