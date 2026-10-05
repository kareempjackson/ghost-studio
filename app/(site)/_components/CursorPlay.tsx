"use client";

import { motion, useMotionValue, useSpring } from "motion/react";
import { useRef, useState } from "react";

/**
 * The play affordance, carried on the pointer.
 *
 * The whole picture is the target, so the label follows the cursor across it
 * rather than sitting in one corner waiting to be found. Over the picture the
 * label *is* the cursor: the system pointer is hidden and nothing is drawn in
 * its place, so there is one thing on the footage and it says what a click
 * does. It is centred on the pointer and lags it on a spring.
 *
 * It is a real button filling the image, which is what makes it reachable
 * without a mouse. On keyboard focus the label stops chasing anything and
 * parks in the middle of the frame, where a focus ring can be seen.
 */
const SPRING = { stiffness: 520, damping: 42, mass: 0.5 };

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
        setShown(true);
      }}
      onBlur={() => setShown(false)}
      className="absolute inset-0 z-10 cursor-none"
    >
      <span className="sr-only">{label}</span>
      <motion.span
        aria-hidden
        style={{ x: sx, y: sy }}
        animate={{ opacity: shown ? 1 : 0, scale: shown ? 1 : 0.9 }}
        transition={{ duration: 0.18, ease: [0, 0, 0.2, 1] }}
        className="pointer-events-none absolute top-0 left-0 will-change-transform"
      >
        <span className="flex h-[46px] w-[157px] -translate-x-1/2 -translate-y-1/2 items-center justify-center gap-3 rounded-[8px] bg-white font-sans text-[17px] leading-[46px] font-normal tracking-[0.03em] whitespace-nowrap text-ink-950 shadow-overlay">
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
