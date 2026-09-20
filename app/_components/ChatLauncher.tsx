"use client";

import { AnimatePresence, motion } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { ChatPanel } from "./ChatPanel";

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
 * Show the pill only where it covers nothing that has to be read: past the
 * cover, and gone again once the close has arrived. A corner widget is always
 * over something, so it is only ever over the middle of the page.
 */
function useOutOfTheWay() {
  const [shown, setShown] = useState(false);

  useEffect(() => {
    let closeIsUp = false;

    const sync = () => {
      const pastCover = window.scrollY > window.innerHeight * 1.1;
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
  }, []);

  return shown;
}

/**
 * The way in, kept on screen.
 *
 * A pill in the corner that opens a short panel: the two ways to start a
 * conversation, and nothing else. It is deliberately not a chat window —
 * there is no one at the other end of one yet — so it answers the question a
 * chat bubble raises rather than pretending to be one. When a chat service is
 * wired up, the panel is the one piece that changes.
 *
 * Escape closes it, a click outside closes it, and focus returns to the pill
 * so the keyboard never loses its place.
 *
 * It shows only over the middle of the page: not over the cover, whose own
 * sign-off sits in this corner, and not over the close or the footer.
 */
export function ChatLauncher() {
  const [open, setOpen] = useState(false);
  const shown = useOutOfTheWay();
  const rootRef = useRef<HTMLDivElement>(null);
  const pillRef = useRef<HTMLButtonElement>(null);

  /* Out of the way is out of reach: the panel is only open with its pill. */
  const panelOpen = open && shown;

  useEffect(() => {
    if (!panelOpen) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      setOpen(false);
      pillRef.current?.focus();
    };
    const onDown = (event: PointerEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    document.addEventListener("pointerdown", onDown);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("pointerdown", onDown);
    };
  }, [panelOpen]);

  return (
    <div
      ref={rootRef}
      className="fixed right-4 bottom-4 z-50 flex flex-col items-end gap-3 sm:right-6 sm:bottom-6"
    >
      <AnimatePresence>
        {panelOpen && (
          <motion.div
            id="chat-panel"
            initial={{ opacity: 0, y: 12, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.98 }}
            transition={{ duration: 0.24, ease: EASE }}
            style={{ transformOrigin: "100% 100%" }}
            role="dialog"
            aria-label="Chat with Ghost Savvy"
          >
            <ChatPanel onClose={() => setOpen(false)} />
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
        transition={{ duration: 0.3, ease: EASE }}
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={panelOpen}
        aria-controls="chat-panel"
        className="group flex h-12 items-center gap-3 rounded-pill bg-[#111] pr-6 pl-2.5 text-white shadow-[0_12px_30px_-12px_rgb(14_13_11/0.6)] transition-transform duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] hover:scale-[1.03] lg:h-14 lg:pr-7 lg:pl-3"
      >
        <Bubble />
        <span className="font-mono text-[0.75rem] leading-none tracking-[0.12em]">
          {panelOpen ? "Close" : "Let’s talk"}
        </span>
      </motion.button>
    </div>
  );
}
