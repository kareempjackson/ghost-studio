"use client";

import {
  AnimatePresence,
  motion,
  useMotionValue,
  useSpring,
} from "motion/react";
import Image from "next/image";
import type { CSSProperties, PointerEvent as ReactPointerEvent } from "react";
import { useRef, useState } from "react";
import { journal, journalHref } from "@/lib/journal";
import { usePrefersReducedMotion } from "./usePrefersReducedMotion";

/** 20px at 390 to 26px at 1440, held there. */
const ENTRY_STYLE: CSSProperties = {
  fontSize: "clamp(1.25rem, 1.1107rem + 0.571vw, 1.625rem)",
  letterSpacing: "-0.03em",
  lineHeight: 1.15,
};

/** The preview's size, in px. A capsule the plate fills edge to edge. */
const PREVIEW = { width: 320, height: 150 };
/** How slack the preview is on the cursor. Lower stiffness, longer tail. */
const FOLLOW = { stiffness: 240, damping: 30, mass: 0.6 };

const pad = (n: number) => String(n).padStart(2, "0");

/**
 * The journal index: three ruled rows, one link each.
 *
 * Hovering a row fills its arrow, nudges the title, and floats that piece's
 * plate under the cursor — a capsule that trails the pointer a beat behind
 * rather than sticking to it. The plate is decorative: it is pointer-inert,
 * hidden from the reader, and never shown to a pen, a finger, or anyone who
 * asked for less motion, all of whom get the row on its own.
 */
export function JournalIndex() {
  const listRef = useRef<HTMLOListElement>(null);
  const reduced = usePrefersReducedMotion();
  const [active, setActive] = useState<number | null>(null);

  const pointerX = useMotionValue(0);
  const pointerY = useMotionValue(0);
  const x = useSpring(pointerX, FOLLOW);
  const y = useSpring(pointerY, FOLLOW);

  /* Cursor position in the list's own box, since the preview sits inside it. */
  const track = (event: ReactPointerEvent) => {
    const box = listRef.current?.getBoundingClientRect();
    if (!box) return;
    pointerX.set(event.clientX - box.left);
    pointerY.set(event.clientY - box.top);
  };

  const enter = (index: number) => (event: ReactPointerEvent) => {
    if (reduced || event.pointerType !== "mouse") return;
    /* Place it before the first frame, or it flies in from the last row. */
    track(event);
    x.jump(pointerX.get());
    y.jump(pointerY.get());
    setActive(index);
  };

  const move = (event: ReactPointerEvent) => {
    if (active === null) return;
    track(event);
  };

  const entry = active === null ? null : journal.entries[active];

  return (
    <ol
      ref={listRef}
      className="relative mt-8 border-t border-edge-subtle lg:mt-12"
      onPointerMove={move}
      onPointerLeave={() => setActive(null)}
    >
      {journal.entries.map((item, index) => (
        <li key={item.slug} className="border-b border-edge-subtle">
          <a
            href={journalHref(item.slug)}
            className="group grid grid-cols-[minmax(0,1fr)_auto] items-center gap-x-6 py-7 sm:grid-cols-[4rem_minmax(0,1fr)_auto] lg:grid-cols-[minmax(0,1fr)_minmax(0,6fr)_auto] lg:py-10"
            onPointerEnter={enter(index)}
          >
            <span className="hidden font-mono text-[0.6875rem] leading-none text-ink-500 sm:block">
              {pad(index + 1)}
            </span>
            <span className="min-w-0">
              <span className="block font-mono text-[0.625rem] leading-none tracking-[0.04em] text-ink-500 uppercase">
                {item.category}
              </span>
              <span
                className="mt-3 block transition-transform duration-300 ease-out group-hover:translate-x-1.5"
                style={ENTRY_STYLE}
              >
                {item.title}
              </span>
            </span>
            <span
              aria-hidden
              className="grid size-10 place-items-center rounded-full border border-ink-300 text-ink-950 transition-colors duration-200 group-hover:border-ink-950 group-hover:bg-ink-950 group-hover:text-white"
            >
              <svg
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
            </span>
          </a>
        </li>
      ))}

      <AnimatePresence>
        {entry && (
          <motion.div
            key={entry.slug}
            aria-hidden
            initial={{ opacity: 0, scale: 0.92 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.94 }}
            transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
            style={{
              x,
              y,
              width: PREVIEW.width,
              height: PREVIEW.height,
              translateX: "-50%",
              translateY: "-50%",
            }}
            className="pointer-events-none absolute top-0 left-0 z-20 hidden overflow-hidden rounded-pill bg-ink-100 will-change-transform lg:block"
          >
            <Image
              src={entry.preview.src}
              alt={entry.preview.alt}
              fill
              sizes="320px"
              className="object-cover"
            />
          </motion.div>
        )}
      </AnimatePresence>
    </ol>
  );
}
