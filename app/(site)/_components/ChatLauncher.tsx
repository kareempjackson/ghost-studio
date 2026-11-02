"use client";

import { AnimatePresence, motion } from "motion/react";
import { useCallback, useEffect, useRef, useState } from "react";
import { GUIDE_ON } from "@/lib/guide/protocol";
import { ChatPanel } from "./ChatPanel";
import { useChrome } from "./ChromeProvider";
import { guide, openRequests, prepare, useOpenRequests } from "./guide/store";
import { usePrefersReducedMotion } from "./usePrefersReducedMotion";
import { WithPathname } from "./WithPathname";

const EASE = [0.22, 1, 0.36, 1] as const;

/** The mark in the pill: a speech bubble with the studio's G inside it. */
function Bubble() {
  return (
    <svg
      aria-hidden
      viewBox="0 0 32 32"
      fill="none"
      className="size-7 shrink-0"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M16 5.5c6 0 10.5 4 10.5 9.2S22 24 16 24h-4.3l-4.6 3.4a.4.4 0 0 1-.6-.4l.6-4.2C4.6 21.1 5.5 18 5.5 14.7 5.5 9.5 10 5.5 16 5.5Z" />
      <text
        x="16"
        y="19.4"
        textAnchor="middle"
        fontSize="11"
        fontWeight="700"
        stroke="none"
        fill="currentColor"
        fontFamily="var(--font-sans)"
      >
        G
      </text>
    </svg>
  );
}

/** The band the pill must never sit on top of: the close and the footer. */
const CLOSE_SELECTOR = '[aria-labelledby="contact-heading"]';

/**
 * Show the pill only where it covers nothing that has to be read, and gone
 * again once the close has arrived. On the home page that means past the
 * cover, whose motto sits in this corner; every other page's cover leaves the
 * corner empty, so there it is there from the start. Before the address is
 * known, it is treated as the home page.
 */
function useOutOfTheWay(path: string | null) {
  const [shown, setShown] = useState(false);
  const home = !path || path === "/";

  useEffect(() => {
    let closeIsUp = false;

    const sync = () => {
      const pastCover = !home || window.scrollY > window.innerHeight * 1.1;
      setShown(pastCover && !closeIsUp);
    };

    const band = document.querySelector(CLOSE_SELECTOR);
    const observer = band
      ? new IntersectionObserver(
          ([entry]) => {
            closeIsUp = entry.isIntersecting;
            sync();
          },
          { threshold: 0 },
        )
      : null;
    observer?.observe(band!);

    sync();
    window.addEventListener("scroll", sync, { passive: true });
    window.addEventListener("resize", sync);
    return () => {
      observer?.disconnect();
      window.removeEventListener("scroll", sync);
      window.removeEventListener("resize", sync);
    };
  }, [home]);

  return shown;
}

/**
 * The way in, kept on screen: the site guide.
 *
 * A pill in the corner that opens the guide's panel (ChatPanel.tsx). It never
 * opens by itself and never asks for attention: no badge, no sound, no
 * greeting that pops up. Escape closes it, a click outside closes it, and
 * focus returns to the pill so the keyboard never loses its place. On a
 * phone the panel rises as a sheet from the foot of the screen.
 *
 * It stays out of the way: not over the home page's cover, whose own sign-off
 * sits in this corner, and not over the close or the footer. The
 * first time it shows, it reads what the guide's shortlist is made from, so
 * the panel has it the moment it opens. Each page it sits on is noted for the
 * guide, for this tab only.
 */
function Launcher({ path }: { path: string | null }) {
  const { launcher } = useChrome().chat;
  const [open, setOpen] = useState(false);
  /* Asked for from elsewhere on the page (guide.openWith): open until closed. */
  const asked = useOpenRequests();
  const [answered, setAnswered] = useState(0);
  const wanted = open || asked > answered;
  const close = useCallback(() => {
    setOpen(false);
    setAnswered(openRequests());
  }, []);
  const shown = useOutOfTheWay(path);
  const still = usePrefersReducedMotion();
  const rootRef = useRef<HTMLDivElement>(null);
  const pillRef = useRef<HTMLButtonElement>(null);

  /* Out of the way is out of reach: the panel is only open with its pill. */
  const panelOpen = wanted && shown;
  const motionFor = (duration: number) => ({ duration: still ? 0 : duration, ease: EASE });

  useEffect(() => {
    if (path) guide.visit(path);
  }, [path]);

  useEffect(() => {
    if (shown) prepare();
  }, [shown]);

  useEffect(() => {
    if (!panelOpen) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      close();
      pillRef.current?.focus();
    };
    const onDown = (event: PointerEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) close();
    };
    document.addEventListener("keydown", onKey);
    document.addEventListener("pointerdown", onDown);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("pointerdown", onDown);
    };
  }, [panelOpen, close]);

  return (
    <div
      ref={rootRef}
      data-page-keep
      className="fixed right-4 bottom-4 z-50 flex flex-col items-end gap-3 sm:right-6 sm:bottom-6"
    >
      <AnimatePresence>
        {panelOpen && (
          <motion.div
            id="chat-panel"
            initial={{ opacity: 0, y: 12, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.98 }}
            transition={motionFor(0.24)}
            style={{ transformOrigin: "100% 100%" }}
            role="dialog"
            aria-label={launcher.label}
            className="max-sm:fixed max-sm:inset-x-0 max-sm:bottom-0"
          >
            <ChatPanel
              path={path ?? "/"}
              onClose={() => {
                close();
                pillRef.current?.focus({ preventScroll: true });
              }}
            />
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        ref={pillRef}
        initial={false}
        animate={
          shown
            ? { opacity: 1, y: 0, pointerEvents: "auto" }
            : { opacity: 0, y: 16, pointerEvents: "none" }
        }
        transition={motionFor(0.3)}
        type="button"
        onClick={() => (wanted ? close() : setOpen(true))}
        aria-expanded={panelOpen}
        aria-controls="chat-panel"
        className={`${panelOpen ? "max-sm:hidden" : ""} group flex h-12 items-center gap-3 rounded-pill bg-[#111] pr-6 pl-2.5 text-white shadow-[0_12px_30px_-12px_rgb(14_13_11/0.6)] transition-transform duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] hover:scale-[1.03] motion-reduce:hover:scale-100 lg:h-14 lg:pr-7 lg:pl-3`}
      >
        <Bubble />
        <span className="font-label text-[0.75rem] leading-none tracking-[0.12em]">
          {panelOpen ? launcher.close : launcher.open}
        </span>
      </motion.button>
    </div>
  );
}

/**
 * The pill, while the guide is on (see GUIDE_ON). Every page places it;
 * turned off, it draws nothing. Until `npm run migrate:guide` has run, the
 * guide speaks with its seeded words (sanity/content.ts).
 */
export function ChatLauncher() {
  if (!GUIDE_ON) return null;
  return <WithPathname>{(path) => <Launcher path={path} />}</WithPathname>;
}
