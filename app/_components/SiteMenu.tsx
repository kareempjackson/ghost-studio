"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useRef, type CSSProperties } from "react";
import { social } from "@/lib/footer";
import { siteNavigation } from "@/lib/navigation";
import { projectHref, projects } from "@/lib/work";
import { Mark } from "./Mark";

/**
 * The menu, as a white sheet dropped over the top of the page.
 *
 * It does not take the whole screen: it comes down from the top edge as far
 * as it needs to, with the same rounded bottom corners as the orange close,
 * and the page stays dimmed beneath it. On the way down the colours trail
 * out from under its bottom edge, the teal first and the white last, and
 * they fold back under the sheet as it settles. The routes are set small and
 * plain, and one piece of work sits beside them so the menu shows the studio
 * as well as the site.
 *
 * Three notes on the build:
 *
 * 1. It is a native `<dialog>` opened with `showModal()`. Focus containment,
 *    Escape, the inert page behind it, top-layer stacking over the fixed
 *    header, and the return of focus to the button that opened it are all the
 *    platform's job. Nothing here re-implements any of them.
 * 2. The dialog itself is the whole screen and has no ground. The sheet is a
 *    child of it, so a click that lands on the dialog has landed on the
 *    dimmed page, and closes the menu.
 * 3. The mark is drawn at the header's own size and coordinates, so opening
 *    the menu does not move the logo. The sheet arrives behind it.
 */

/** Lead-in before the first row rises, and the gap between rows, in ms. */
const LEAD_IN = 280;
const STAGGER = 40;

/** Nearest first, the same three that trail under the orange close. */
const TRAILS = ["#f2875f", "#eedf4e", "#63cdab"] as const;

/** The one piece of work the menu carries. */
const FEATURED = projects[0];

/**
 * The two marks, drawn as one family: outline only, one stroke weight, the
 * same rounded square around both, at a 2px stroke so they carry the same
 * weight as the Close in the opposite corner. Neither is the platform's own filled
 * logo — at this size a filled glyph reads as a sticker, and the menu is
 * set in line, not in badges.
 */
const ICON_PROPS = {
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 2,
  strokeLinecap: "round",
  strokeLinejoin: "round",
  className: "size-5",
  "aria-hidden": true,
  focusable: "false",
} as const;

const SOCIAL_ICON = {
  instagram: (
    <svg {...ICON_PROPS}>
      <rect x="3.5" y="3.5" width="17" height="17" rx="5" />
      <circle cx="12" cy="12" r="3.75" />
      <circle cx="16.9" cy="7.1" r="1.1" fill="currentColor" stroke="none" />
    </svg>
  ),
  linkedin: (
    <svg {...ICON_PROPS}>
      <rect x="3.5" y="3.5" width="17" height="17" rx="5" />
      <path d="M8.5 10.75v5.5" />
      <circle cx="8.5" cy="7.9" r="1.1" fill="currentColor" stroke="none" />
      <path d="M11.75 16.25v-5.5M11.75 13.25c0-1.55.95-2.5 2.25-2.5s2.25.95 2.25 2.5v3" />
    </svg>
  ),
} as const;

export interface SiteMenuProps {
  /** Matches the `aria-controls` on the button that opens it. */
  id: string;
  open: boolean;
  /** Must be referentially stable — the dialog's own close event calls it. */
  onClose: () => void;
}

export function SiteMenu({ id, open, onClose }: SiteMenuProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const backRef = useRef<HTMLButtonElement>(null);

  /* `data-shown` is written straight to the element rather than held in
     state. It is a cue for the stylesheet, nothing in the tree reads it, and
     routing it through React would buy a render per frame for no one. */
  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    if (!open) {
      dialog.dataset.shown = "false";
      if (dialog.open) dialog.close();
      return;
    }

    if (!dialog.open) {
      dialog.showModal();
      /* showModal() otherwise lands on the first thing it finds, which is the
         mark. Put the ring on the way out instead: it is the one control a
         keyboard user needs before they have read anything. */
      backRef.current?.focus();
    }
    /* One frame late, so the rows have a start value to travel from: until
       the dialog is rendered its children have no previous computed style
       and the browser has nothing to interpolate. */
    const frame = requestAnimationFrame(() => {
      dialog.dataset.shown = "true";
    });
    return () => cancelAnimationFrame(frame);
  }, [open]);

  /* Escape closes the element without asking React first, so the state
     follows the dialog rather than the other way round. */
  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    const sync = () => {
      dialog.dataset.shown = "false";
      onClose();
    };
    dialog.addEventListener("close", sync);
    return () => dialog.removeEventListener("close", sync);
  }, [onClose]);

  /* A modal dialog does not stop the wheel over the page behind it in every
     browser, so the document is pinned while the plate is up. The gutter is
     paid back as padding, otherwise the fixed header steps sideways by a
     scrollbar width on the platforms that reserve room for one. */
  useEffect(() => {
    if (!open) return;
    const root = document.documentElement;
    const gutter = window.innerWidth - root.clientWidth;
    const { overflow, paddingRight } = root.style;
    root.style.overflow = "hidden";
    if (gutter > 0) root.style.paddingRight = `${gutter}px`;
    return () => {
      root.style.overflow = overflow;
      root.style.paddingRight = paddingRight;
    };
  }, [open]);

  return (
    <dialog
      ref={dialogRef}
      id={id}
      aria-label="Site menu"
      className="gs-menu"
      /* The dialog is the dimmed page around the sheet; a click on it is a
         click outside. */
      onClick={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div className="gs-menu-stack">
        {TRAILS.map((color, index) => (
          <div
            key={color}
            aria-hidden
            className="gs-menu-layer gs-menu-trail"
            style={
              {
                "--d": index + 1,
                backgroundColor: color,
                zIndex: -(index + 1),
              } as CSSProperties
            }
          />
        ))}

        <div
          className="gs-menu-layer gs-menu-sheet flex flex-col"
          style={{ "--d": 0 } as CSSProperties}
        >
          <div className="flex h-[var(--gs-header-h)] shrink-0 items-center justify-between gap-8 px-5 sm:px-8 lg:px-12">
            <Link
              href="/"
              onClick={onClose}
              className="flex h-[var(--gs-header-h)] shrink-0 items-center"
              aria-label="Ghost Savvy Studios — home"
            >
              <Mark className="size-24 shrink-0 lg:size-28" decorative />
            </Link>

            {/*
              The visible word is "Close", so the accessible name starts with
              it: WCAG 2.5.3 asks that what a user says matches what they read.
            */}
            <button
              ref={backRef}
              type="button"
              onClick={onClose}
              className="gs-menu-back inline-flex min-h-11 shrink-0 items-center gap-2.5 font-sans text-[0.9375rem] leading-none font-medium tracking-[-0.01em]"
            >
              Close
              <span aria-hidden className="relative block size-3.5">
                <span className="absolute inset-x-0 top-1/2 h-[2.25px] -translate-y-1/2 rotate-45 rounded-full bg-current" />
                <span className="absolute inset-x-0 top-1/2 h-[2.25px] -translate-y-1/2 -rotate-45 rounded-full bg-current" />
              </span>
              <span className="sr-only">&nbsp;the menu</span>
            </button>
          </div>

          <div className="grid min-h-0 flex-1 content-start gap-12 overflow-y-auto px-5 pt-10 pb-14 sm:px-8 lg:grid-cols-12 lg:content-stretch lg:gap-12 lg:px-12 lg:pt-14 lg:pb-12">
            {/* The links at the top of the column and the studio's other
                addresses at the foot of it, so the bottom edge of the sheet
                is held at both corners: the elsewhere on the left, the work
                on the right. */}
            <div className="flex flex-col gap-12 lg:col-span-7 lg:justify-between">
              <nav aria-label="Site">
                <ul className="gs-menu-list flex flex-col gap-1">
                  {siteNavigation.map((item, index) => (
                    <li
                      key={item.href}
                      className="gs-menu-row"
                      /* The delay is emitted unconditionally; reduced motion
                       zeroes it in the stylesheet. Deciding it here would
                       mean the server and the client rendering different
                       attributes. */
                      style={{
                        transitionDelay: `${LEAD_IN + index * STAGGER}ms`,
                      }}
                    >
                      <a
                        href={item.href}
                        onClick={onClose}
                        className="gs-menu-item inline-flex py-1.5"
                      >
                        <span className="gs-menu-word text-[1.75rem] leading-[1.1] font-normal tracking-[-0.04em] lg:text-[2.25rem]">
                          {item.label}
                        </span>
                      </a>
                    </li>
                  ))}
                </ul>
              </nav>

              <ul
                aria-label="Ghost Savvy elsewhere"
                /* The hit areas are 40px but the icons are 20px, so the row
                   is pulled left by the difference to sit on the links' edge. */
                className="gs-menu-row -ml-2.5 flex"
                style={{
                  transitionDelay: `${LEAD_IN + siteNavigation.length * STAGGER}ms`,
                }}
              >
                {social.map((item) => (
                  <li key={item.id}>
                    <a
                      href={item.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={`${item.label} (opens in a new tab)`}
                      className="grid size-10 place-items-center text-ink-950 transition-colors duration-200 hover:text-ink-500"
                    >
                      {SOCIAL_ICON[item.id]}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            {/* Off to the bottom-right corner on wide screens: the links own
                the top of the sheet, and the work sits where the eye lands
                last, as a postscript rather than a rival. */}
            <div
              className="gs-menu-row lg:col-span-4 lg:col-start-9 lg:w-[18rem] lg:self-end lg:justify-self-end"
              style={{
                transitionDelay: `${LEAD_IN + siteNavigation.length * STAGGER}ms`,
              }}
            >
              <a
                href={projectHref(FEATURED.slug)}
                onClick={onClose}
                /* The plate carries no words, so the link names itself. */
                aria-label={`${FEATURED.name} — ${FEATURED.scope}`}
                className="group block"
              >
                <div className="relative aspect-[4/3] w-24 shrink-0 overflow-hidden rounded-[0.625rem] bg-ink-950 lg:w-full lg:max-w-[18rem]">
                  <Image
                    src={FEATURED.image}
                    alt=""
                    fill
                    sizes="(min-width: 1024px) 18rem, 6rem"
                    className="object-cover transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.03]"
                  />
                </div>
              </a>
            </div>
          </div>
        </div>
      </div>
    </dialog>
  );
}
