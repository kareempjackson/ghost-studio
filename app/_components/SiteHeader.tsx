"use client";

import Link from "next/link";
import type { RefObject } from "react";
import { useCallback, useEffect, useRef, useState } from "react";
import { headerNavigation } from "@/lib/navigation";
import { ArrowPill } from "./ArrowPill";
import { Mark } from "./Mark";
import { SiteMenu } from "./SiteMenu";

/**
 * Below this the row is always shown: the top of the page is not a scroll
 * direction, and a header that hides on the first flick of a short page has
 * nothing to hide for.
 */
const REVEAL_AT = 96;

/**
 * Movement under this is noise — a trackpad settling, a phone in a hand — and
 * a row that answers noise flickers. The reader has to mean it.
 */
const DEADZONE = 8;

/**
 * True while the reader is heading down the page past the first screen.
 *
 * Read off a rAF-throttled passive listener: scroll fires far faster than the
 * screen paints, and the only question being asked of it is which way the last
 * meaningful movement went. Nothing here reads layout, so it never forces a
 * synchronous reflow on a scroll frame.
 */
function useHidingHeader(disabled: boolean) {
  const [hidden, setHidden] = useState(false);
  const lastY = useRef(0);

  useEffect(() => {
    if (disabled) return;

    lastY.current = window.scrollY;
    let queued = false;

    const read = () => {
      queued = false;
      const y = window.scrollY;
      const delta = y - lastY.current;
      if (Math.abs(delta) < DEADZONE) return;
      lastY.current = y;
      setHidden(y > REVEAL_AT && delta > 0);
    };

    const onScroll = () => {
      if (queued) return;
      queued = true;
      requestAnimationFrame(read);
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [disabled]);

  return hidden && !disabled;
}

/**
 * Which ground the row is standing on.
 *
 * The header is fixed and the page scrolls under it, so the ink it needs is a
 * property of whatever happens to be behind the row at the time, not of the
 * page. Any band that needs light ink says so with `data-ground="dark"`, and
 * this watches a strip of the viewport exactly as tall as the row: the moment
 * such a band overlaps that strip the header goes transparent and turns white,
 * which lets it take the colour of the band rather than sit on it as a plate.
 *
 * Two notes on the build:
 *
 * 1. It is an IntersectionObserver with the root squeezed down to the header's
 *    own height, not a scroll handler measuring offsets. The browser answers
 *    "is this band under the row" off the compositor; asking it ourselves on
 *    every scroll frame would mean reading layout on every scroll frame.
 * 2. The answer is written straight to the element as a data attribute rather
 *    than held in state. Nothing in the tree reads it — it is a cue for the
 *    stylesheet — and routing it through React would buy a render per crossing
 *    for no one. The same reason `SiteMenu` writes `data-shown` itself.
 *
 * The hero keeps its own flag. Its reel is a moving rectangle rather than a
 * band, so it is measured off the artwork's own edge; both end up asking the
 * stylesheet for the same thing.
 */
function useGroundInk(ref: RefObject<HTMLElement | null>) {
  useEffect(() => {
    const header = ref.current;
    if (!header) return;

    const over = new Set<Element>();
    let observer: IntersectionObserver | null = null;

    const build = () => {
      observer?.disconnect();
      over.clear();

      /* Shrink the root up from the bottom until only the row's own strip of
         the viewport is left. Negative, because the margin is an inset. */
      const row = header.offsetHeight;
      observer = new IntersectionObserver(
        (entries) => {
          for (const entry of entries) {
            if (entry.isIntersecting) over.add(entry.target);
            else over.delete(entry.target);
          }
          /* A band inside the lying-under footer does not count. It is
             sticky to the bottom of the screen, so its box spans the
             viewport — and on a short window reaches up into the row's
             strip — while the page covers every pixel of it. Only a band
             the reader can actually see decides the ink. */
          const seen = [...over].some(
            (band) => !band.closest("[data-reveal='true']"),
          );
          header.dataset.overDark = seen ? "true" : "false";
        },
        {
          rootMargin: `0px 0px ${row - window.innerHeight}px 0px`,
          threshold: 0,
        },
      );

      document
        .querySelectorAll("[data-ground='dark']")
        .forEach((band) => observer?.observe(band));
      header.dataset.overDark = "false";
    };

    build();
    /* The strip is measured in pixels, so both of its inputs can change. */
    window.addEventListener("resize", build);
    return () => {
      window.removeEventListener("resize", build);
      observer?.disconnect();
      delete header.dataset.overDark;
    };
  }, [ref]);
}

/**
 * Nav links are set in mono: 12px, upper case, 8% tracking, at full ink. Small
 * and open rather than large and loud — the row is chrome, and the links read
 * as an index. The pill beside them is the one thing that asks for anything.
 */
const NAV_LINK_CLASS =
  "gs-nav-link block font-mono text-[0.75rem] leading-none tracking-[0.08em] uppercase transition-colors duration-150";

/** Where the call to action goes. */
const CTA = { label: "Let’s talk", href: "/contact" } as const;

const MENU_ID = "site-menu";

export function SiteHeader() {
  const [open, setOpen] = useState(false);
  /* The dialog's own close event calls this, so it has to be stable. */
  const close = useCallback(() => setOpen(false), []);
  /* The row holds still while the menu is up — the button is in it. */
  const hidden = useHidingHeader(open);
  const headerRef = useRef<HTMLElement>(null);
  useGroundInk(headerRef);

  return (
    <>
      <header
        ref={headerRef}
        data-hidden={hidden}
        className="gs-header fixed inset-x-0 top-0 z-50"
      >
        <div className="flex h-[var(--gs-header-h)] w-full items-center justify-between gap-8 px-5 sm:px-8 lg:px-12">
          {/*
            The anchor is pinned to the row while the artwork is free to be
            larger than it. The mark is drawn inside a square box that is
            mostly empty — the wordmark occupies about a fifth of its height —
            so the box has to overrun the row for the letters to read at size.
            Holding the link at the row's own height keeps that overrun to
            pixels: the hit area stops at the header, and does not reach down
            over the page behind it.
          */}
          <Link
            href="/"
            className="flex h-[var(--gs-header-h)] shrink-0 items-center"
            aria-label="Ghost Savvy Studios — home"
          >
            {/*
              Masked rather than placed, so the mark can turn white on its own
              while the reel is behind the header and back to ink afterwards.
            */}
            <Mark
              className="gs-nav-ink size-24 shrink-0 lg:size-28"
              decorative
            />
          </Link>

          <div className="flex items-center gap-4 lg:gap-10 xl:gap-12">
            <nav aria-label="Primary" className="hidden lg:block">
              <ul className="flex items-center gap-8 xl:gap-12">
                {headerNavigation.map((item) => (
                  <li key={item.href}>
                    <a href={item.href} className={NAV_LINK_CLASS}>
                      {item.label}
                    </a>
                  </li>
                ))}
              </ul>
            </nav>

            <ArrowPill href={CTA.href} size="sm" className="hidden lg:flex">
              {CTA.label}
            </ArrowPill>

            <button
              type="button"
              onClick={() => setOpen(true)}
              aria-expanded={open}
              aria-controls={MENU_ID}
              className="grid size-11 shrink-0 place-items-center"
            >
              <span className="sr-only">Open menu</span>
              <span
                aria-hidden
                className="gs-nav-ink flex size-6 flex-col justify-between py-1 text-ink-950"
              >
                <span className="h-[2.5px] w-full rounded-full bg-current" />
                <span className="h-[2.5px] w-full rounded-full bg-current" />
                <span className="h-[2.5px] w-full rounded-full bg-current" />
              </span>
            </button>
          </div>
        </div>
      </header>

      {/*
        Outside the header, because a modal dialog is lifted into the top layer
        and stacks above the fixed row regardless of where it is written. The
        header keeps the button; the plate keeps its own way out.
      */}
      <SiteMenu id={MENU_ID} open={open} onClose={close} />
    </>
  );
}
