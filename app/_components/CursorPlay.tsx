"use client";

import { motion, useMotionValue, useSpring } from "motion/react";
import { useRef, useState } from "react";

/**
 * The play affordance, carried on the pointer.
 *
 * The whole picture is the target, so the label follows the cursor across it
 * rather than sitting in one corner waiting to be found. The system arrow is
 * swapped for a white one drawn in the frame, because the OS cursor is a dark
 * shape on dark footage; ours is painted with the label and reads on any still.
 * The arrow tracks the pointer exactly, the label lags on a spring.
 *
 * It is a real button filling the image, which is what makes it reachable
 * without a mouse. On keyboard focus the label stops chasing anything and
 * parks in the middle of the frame, where a focus ring can be seen.
 */
const SPRING = { stiffness: 520, damping: 42, mass: 0.5 };
/** Sits just off the arrow tip, clear of the tail, the way a tooltip does. */
const OFFSET = { x: 20, y: 17 };
/** The arrow leans into its direction, the way a drawn pointer does and the system one does not. */
const TILT = -14;

export function CursorPlay({
  onActivate,
  label = "Play Video",
}: {
  onActivate: () => void;
  label?: string;
}) {
  const ref = useRef<HTMLButtonElement>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const sx = useSpring(x, SPRING);
  const sy = useSpring(y, SPRING);
  const [shown, setShown] = useState(false);
  const [parked, setParked] = useState(false);

  function track(e: React.PointerEvent<HTMLButtonElement>) {
    const r = ref.current?.getBoundingClientRect();
    if (!r) return;
    x.set(e.clientX - r.left);
    y.set(e.clientY - r.top);
  }

  return (
    <button
      ref={ref}
      type="button"
      onClick={onActivate}
      onPointerEnter={(e) => {
        const r = ref.current?.getBoundingClientRect();
        if (r) {
          /* Snap to the entry point so it does not fly in from the corner. */
          sx.jump(e.clientX - r.left);
          sy.jump(e.clientY - r.top);
        }
        track(e);
        setParked(false);
        setShown(true);
      }}
      onPointerMove={track}
      onPointerLeave={() => setShown(false)}
      onFocus={(e) => {
        if (!e.target.matches(":focus-visible")) return;
        const r = ref.current?.getBoundingClientRect();
        if (r) {
          sx.jump(r.width / 2);
          sy.jump(r.height / 2);
        }
        setParked(true);
        setShown(true);
      }}
      onBlur={() => setShown(false)}
      className="absolute inset-0 z-10 cursor-none"
    >
      <span className="sr-only">{label}</span>
      {/* The arrow, on the pointer itself — no spring, or it would not read as a cursor. */}
      <motion.span
        aria-hidden
        style={{ x, y }}
        animate={{ opacity: shown && !parked ? 1 : 0 }}
        transition={{ duration: 0.12, ease: "linear" }}
        className="pointer-events-none absolute top-0 left-0 will-change-transform"
      >
        <svg
          viewBox="0 0 18 23"
          className="h-[23px] w-[18px] origin-top-left drop-shadow-[0_1px_3px_rgb(14_13_11/0.45)]"
          style={{ rotate: `${TILT}deg` }}
          aria-hidden
          focusable="false"
        >
          <path
            d="M1 1v18.2l4.9-4.4 3.3 6.9 3.4-1.6-3.3-6.8h7.1z"
            fill="#fff"
            stroke="rgb(14 13 11 / 0.28)"
            strokeWidth="1"
            strokeLinejoin="round"
          />
        </svg>
      </motion.span>
      <motion.span
        aria-hidden
        style={{ x: sx, y: sy }}
        animate={{ opacity: shown ? 1 : 0, scale: shown ? 1 : 0.9 }}
        transition={{ duration: 0.18, ease: [0, 0, 0.2, 1] }}
        className="pointer-events-none absolute top-0 left-0 will-change-transform"
      >
        <span
          className={`flex min-h-11 items-center gap-2.5 rounded-sm bg-white px-5 font-sans text-[0.9375rem] font-bold whitespace-nowrap text-ink-950 shadow-overlay ${
            parked ? "-translate-x-1/2 -translate-y-1/2" : ""
          }`}
          style={
            parked ? undefined : { marginLeft: OFFSET.x, marginTop: OFFSET.y }
          }
        >
          <svg
            viewBox="0 0 10 12"
            className="size-3"
            aria-hidden
            focusable="false"
          >
            <path d="M0 0v12l10-6z" fill="currentColor" />
          </svg>
          {label}
        </span>
      </motion.span>
    </button>
  );
}
