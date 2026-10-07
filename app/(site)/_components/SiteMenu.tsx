"use client";

import Link from "next/link";
import { useEffect, useId, useRef, useState, type CSSProperties } from "react";
import { projectHref } from "@/lib/links";
import { Visual } from "./Visual";
import { useChrome } from "./ChromeProvider";
import { Mark } from "./Mark";

/**
 * The menu, as a white sheet dropped over the top of the page.
 *
 * It does not take the whole screen: it comes down from the top edge as far
 * as it needs to, with the same rounded bottom corners as the orange close,
 * and the page stays dimmed beneath it. On the way down the colours trail
 * out from under its bottom edge, the teal first and the white last, and
 * they fold back under the sheet as it settles. The routes run down the left,
 * large and plain; one piece of work is pinned on the right as a card, so the
 * menu shows the studio as well as the site; and the foot holds the studio's
 * other ventures on the left and the way to write on the right.
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


export interface SiteMenuProps {
  /** Matches the `aria-controls` on the button that opens it. */
  id: string;
  open: boolean;
  /** Must be referentially stable — the dialog's own close event calls it. */
  onClose: () => void;
}

export function SiteMenu({ id, open, onClose }: SiteMenuProps) {
  const {
    settings: { email },
    navigation,
  } = useChrome();
  const { items: siteNavigation, ventures: ventureNavigation } = navigation;
  /* The one piece of work the menu carries, if one is selected. */
  const featured = navigation.feature;
  /* Everything after the routes arrives with the last of them. */
  const tail = {
    transitionDelay: `${LEAD_IN + siteNavigation.length * STAGGER}ms`,
  };
  const dialogRef = useRef<HTMLDialogElement>(null);
  const backRef = useRef<HTMLButtonElement>(null);
  /* Which group is open ("Work with us"). Folded again whenever the menu
     closes, so it always opens onto the plain list. */
  const [expanded, setExpanded] = useState<string | null>(null);
  const groupId = useId();
  /* A short grace period before a hovered group folds, so the pointer can
     cross from the label to its routes without the pop-out flickering shut. */
  const foldTimer = useRef<number | undefined>(undefined);
  const openGroup = (label: string) => {
    window.clearTimeout(foldTimer.current);
    setExpanded(label);
  };
  const foldGroup = () => {
    window.clearTimeout(foldTimer.current);
    foldTimer.current = window.setTimeout(() => setExpanded(null), 160);
  };

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
      setExpanded(null);
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
      {/*
        The way out is the header's own menu button, carried on. It is pinned
        in the dialog — outside the sheet, which slides — at exactly the
        coordinates of the button that opened the menu, so the icon never
        moves: the three lines simply fold into a cross as the sheet lands,
        and unfold again as it leaves. Written first so it is also first in
        the tab order, over the sheet by its own stacking.
      */}
      <div className="pointer-events-none absolute inset-x-0 top-0 z-10 flex h-[var(--gs-header-h)] items-center justify-end px-5 sm:px-8 lg:px-12">
        <button
          ref={backRef}
          type="button"
          onClick={onClose}
          aria-label="Close menu"
          className="gs-menu-back pointer-events-auto grid size-11 shrink-0 place-items-center"
        >
          <span aria-hidden className="relative block size-6">
            <span className="gs-burger-line gs-burger-top" />
            <span className="gs-burger-line gs-burger-mid" />
            <span className="gs-burger-line gs-burger-bot" />
          </span>
        </button>
      </div>

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
          </div>

          <div className="grid min-h-0 flex-1 content-start gap-[var(--gs-menu-space)] overflow-y-auto px-5 py-[var(--gs-menu-space)] sm:px-8 lg:grid-cols-[minmax(0,1fr)_18rem] lg:grid-rows-[1fr_auto] lg:content-stretch lg:gap-x-12 lg:px-12">
            <nav aria-label="Site">
              <ul className="gs-menu-list flex flex-col gap-[var(--gs-menu-gap)]">
                {siteNavigation.map((item, index) => {
                  const delay = {
                    transitionDelay: `${LEAD_IN + index * STAGGER}ms`,
                  };
                  const word =
                    "gs-menu-word text-[length:var(--gs-menu-word)] leading-[1.1] font-normal tracking-[-0.045em]";

                  if (!item.children) {
                    return (
                      <li
                        key={item.label}
                        className="gs-menu-row"
                        /* The delay is emitted unconditionally; reduced
                           motion zeroes it in the stylesheet. Deciding it
                           here would mean the server and the client
                           rendering different attributes. */
                        style={delay}
                      >
                        <a
                          href={item.href}
                          onClick={onClose}
                          className="gs-menu-item inline-flex py-1"
                        >
                          <span className={word}>{item.label}</span>
                        </a>
                      </li>
                    );
                  }

                  /* A group: its routes open out to the label's right on
                     wide screens, where there is room, and in place under it
                     on narrow ones. The label is still a link: with a mouse,
                     hovering opens the routes and a click goes to the page;
                     on touch, where there is no hover, a tap opens them. */
                  const isOpen = expanded === item.label;
                  const panelId = `${groupId}-${index}`;
                  return (
                    <li
                      key={item.label}
                      className="gs-menu-row gs-menu-group lg:relative lg:w-fit"
                      style={delay}
                      /* Hover opens it for a mouse; touch keeps the tap
                         toggle, because a tap also fires pointer events
                         and would open and close it in one go. Keyboard
                         focus arriving anywhere in the group opens it too
                         — keyboard only: Android focuses a link on tap,
                         and opening on that focus would let the tap's own
                         click fold the group straight back. */
                      onPointerEnter={(event) => {
                        if (event.pointerType === "mouse")
                          openGroup(item.label);
                      }}
                      onPointerLeave={(event) => {
                        if (event.pointerType === "mouse") foldGroup();
                      }}
                      onFocus={(event) => {
                        if (event.target.matches(":focus-visible"))
                          openGroup(item.label);
                      }}
                      onBlur={(event) => {
                        if (
                          !event.currentTarget.contains(event.relatedTarget)
                        )
                          foldGroup();
                      }}
                    >
                      <a
                        href={item.href}
                        aria-expanded={isOpen}
                        aria-controls={panelId}
                        onClick={(event) => {
                          if (window.matchMedia("(hover: hover)").matches) {
                            onClose();
                            return;
                          }
                          event.preventDefault();
                          if (isOpen) setExpanded(null);
                          else openGroup(item.label);
                        }}
                        className="gs-menu-item inline-flex items-center py-1 text-left"
                      >
                        <span className={word}>{item.label}</span>
                      </a>

                      {/* The routes. Narrow: opening in place, the height
                          travelling as a grid track from 0fr to 1fr so the
                          browser measures it. Wide: popping out to the
                          right of the label, centred on it, sliding in as
                          they fade up, without moving the list. The gap to
                          the label is padding, not margin, so the pointer
                          never leaves the group on its way across. Closed,
                          either way, it is inert: not in the tab order, not
                          read out. */}
                      <div
                        id={panelId}
                        inert={!isOpen}
                        className={`grid transition-[grid-template-rows,opacity,translate] duration-400 ease-[cubic-bezier(0.22,1,0.36,1)] lg:absolute lg:top-1/2 lg:left-full lg:-translate-y-1/2 lg:grid-rows-[1fr] lg:pl-16 ${
                          isOpen
                            ? "grid-rows-[1fr] opacity-100 lg:translate-x-0"
                            : "grid-rows-[0fr] opacity-0 lg:-translate-x-4"
                        }`}
                      >
                        <div className="min-h-0 overflow-hidden lg:overflow-visible lg:whitespace-nowrap">
                          {item.intro && (
                            <div className="hidden pb-5 lg:block">
                              <p className="font-label text-[0.5625rem] leading-none tracking-[0.04em] text-ink-950 uppercase">
                                {item.intro.label}
                              </p>
                              <p className="mt-2.5 text-[0.75rem] leading-none font-medium tracking-[-0.01em] text-ink-950">
                                {item.intro.deck}
                              </p>
                            </div>
                          )}
                          <ul className="gs-menu-sub">
                            {item.children.map((child) => (
                              <li key={child.href}>
                                <a
                                  href={child.href}
                                  onClick={onClose}
                                  className="gs-menu-item flex items-center py-1.5 pl-5 lg:py-2.5 lg:pl-0"
                                >
                                  <span className="gs-menu-word text-[1.125rem] leading-[1.25] tracking-[-0.02em] first-letter:uppercase lg:text-[1.1875rem]">
                                    {child.label}
                                  </span>
                                </a>
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </li>
                  );
                })}
              </ul>
            </nav>

            {/* The one piece of work, pinned to the right of the routes like
                a card on a wall: off true, in the studio's vermilion, with
                the client's name on it. Wide screens only: on a phone it
                would push the foot of the menu off the sheet. */}
            {featured && (
              <div
                className="gs-menu-row hidden lg:col-start-2 lg:row-start-1 lg:block lg:self-end"
                style={tail}
              >
                <a
                  href={projectHref(featured.slug)}
                  onClick={onClose}
                  className="group block w-full rotate-2 rounded-[0.375rem] bg-signal-500 p-3.5 pb-4 shadow-overlay transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] hover:rotate-0 lg:w-full"
                >
                  {/* The project's own card picture or film, as /work sets
                      it: filling the plate, or fitted on its colour. */}
                  <div
                    aria-hidden
                    className="relative aspect-[8/7] -rotate-1 overflow-hidden rounded-[0.125rem]"
                    style={{ backgroundColor: featured.ground }}
                  >
                    <Visual
                      src={featured.image}
                      video={featured.imageVideo}
                      alt=""
                      sizes="18rem"
                      className={featured.fit === "contain" ? "object-contain" : "object-cover"}
                    />
                  </div>
                  <p className="mt-4 font-label text-[0.5625rem] leading-none tracking-[0.06em] text-ink-950 uppercase">
                    {navigation.featureLabel}
                  </p>
                  <p className="mt-1.5 text-[1.125rem] leading-[1.15] tracking-[-0.035em] text-ink-950">
                    {featured.name}
                  </p>
                </a>
              </div>
            )}

            {/* The studio's other ventures, as pills at the foot of the
                routes: part of the menu, not in competition with it. */}
            <nav
              aria-label={ventureNavigation.label}
              className="gs-menu-row lg:col-start-1 lg:row-start-2 lg:self-end"
              style={tail}
            >
              <p className="font-label text-[0.6875rem] leading-none tracking-[0.04em] text-ink-950 uppercase">
                {ventureNavigation.label}
              </p>
              <ul className="mt-4 flex flex-wrap gap-2.5">
                {ventureNavigation.links.map((link) => (
                  <li key={link.href}>
                    <a
                      href={link.href}
                      onClick={onClose}
                      style={{ backgroundColor: link.ground, color: link.ink }}
                      className="inline-flex h-9 items-center rounded-pill px-7 text-[0.9375rem] leading-none tracking-[-0.03em] transition-[translate,filter] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] hover:-translate-y-0.5 hover:brightness-95"
                    >
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </nav>

            <div
              className="gs-menu-row lg:col-start-2 lg:row-start-2 lg:self-end"
              style={tail}
            >
              <p className="font-label text-[0.625rem] leading-none tracking-[0.04em] text-ink-950 uppercase">
                {navigation.contactLabel}
              </p>
              <a
                href={`mailto:${email}`}
                className="mt-2 inline-block text-[1rem] leading-none tracking-[-0.02em] text-ink-950 transition-colors duration-200 hover:text-accent"
              >
                {email}
              </a>
            </div>
          </div>
        </div>
      </div>
    </dialog>
  );
}
