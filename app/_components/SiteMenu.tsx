"use client";

import Link from "next/link";
import { useEffect, useRef } from "react";
import { siteNavigation } from "@/lib/navigation";
import { Mark } from "./Mark";
import { Type } from "./Type";

/**
 * The menu, as a full-screen plate.
 *
 * A printed contents page: the six routes of the site set at section-opener
 * size, each one counted, with a leader rule running from the word out to its
 * number. The rule is the same hairline the rest of the site is built on,
 * doing the job it has done in books for four hundred years — carrying the eye
 * across the gap without adding a second graphic idea.
 *
 * Three notes on the build:
 *
 * 1. It is a native `<dialog>` opened with `showModal()`. Focus containment,
 *    Escape, the inert page behind it, top-layer stacking over the fixed
 *    header, and the return of focus to the button that opened it are all the
 *    platform's job. Nothing here re-implements any of them.
 * 2. The dimming is a spotlight, not a resting state. Every line sits at
 *    ink-200 — 14:1 on this ground — and the others recede only while a
 *    pointer is actually on one of them. Nobody reading the menu reads it dim.
 *    See the `.gs-menu` block in globals.css.
 * 3. The mark is drawn at the header's own coordinates, so opening the menu
 *    does not move the logo. The plate arrives behind it.
 */

/** Lead-in before the first row rises, and the gap between rows, in ms. */
const LEAD_IN = 60;
const STAGGER = 45;

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
    <dialog ref={dialogRef} id={id} aria-label="Site menu" className="gs-menu">
      <div className="flex h-full flex-col">
        <div className="flex h-[var(--gs-header-h)] shrink-0 items-center justify-between gap-8 px-5 sm:px-8 lg:px-10">
          <Link
            href="/"
            onClick={onClose}
            className="shrink-0"
            aria-label="Ghost Savvy Studios — home"
          >
            <Mark className="size-12 sm:size-14 lg:size-16" decorative />
          </Link>

          {/*
            The visible word is "Back", so the accessible name starts with it:
            WCAG 2.5.3 asks that what a user says matches what they read. The
            rest is only there because "Back" on its own says nothing about
            where.
          */}
          <button
            ref={backRef}
            type="button"
            onClick={onClose}
            className="gs-menu-back inline-flex min-h-11 shrink-0 items-center font-sans text-[1.0625rem] font-bold tracking-[0.06em] uppercase"
          >
            Back
            <span className="sr-only">&nbsp;to the page</span>
          </button>
        </div>

        <nav aria-label="Site" className="min-h-0 flex-1 overflow-y-auto">
          <ul className="gs-menu-list flex min-h-full flex-col justify-evenly px-5 pb-12 sm:px-8 lg:px-10">
            {siteNavigation.map((item, index) => (
              <li
                key={item.href}
                className="gs-menu-row"
                /* The delay is emitted unconditionally; reduced motion zeroes
                   it in the stylesheet. Deciding it here would mean the
                   server and the client rendering different attributes. */
                style={{ transitionDelay: `${LEAD_IN + index * STAGGER}ms` }}
              >
                <a
                  href={item.href}
                  onClick={onClose}
                  className="gs-menu-item grid grid-cols-[auto_minmax(1.5rem,1fr)_auto] items-center gap-4 py-2 sm:gap-8 lg:gap-14"
                >
                  <Type role="display-l" as="span" className="gs-menu-word">
                    {item.label}
                  </Type>
                  {/* The leader. Ornament, and named as such. */}
                  <span aria-hidden className="gs-menu-rule h-px w-full" />
                  <Type
                    role="label"
                    as="span"
                    className="gs-menu-index"
                    aria-hidden
                  >
                    {String(index + 1).padStart(2, "0")}
                  </Type>
                </a>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </dialog>
  );
}
