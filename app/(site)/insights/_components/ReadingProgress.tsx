"use client";

import { useEffect, useRef } from "react";

/**
 * A vermilion hairline across the top of the screen that fills as the body
 * is read: empty where the text starts, full where it ends. Drawn by
 * transform, off the main thread, and hidden from assistive technology; the
 * scroll position already says how far along a reader is.
 */
export function ReadingProgress({ target }: { target: string }) {
  const bar = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const body = document.getElementById(target);
    if (!body || !bar.current) return;
    let frame = 0;

    const update = () => {
      frame = 0;
      const { top, height } = body.getBoundingClientRect();
      const span = height - window.innerHeight * 0.6;
      const read = span > 0 ? (window.innerHeight * 0.4 - top) / span : top < 0 ? 1 : 0;
      bar.current!.style.transform = `scaleX(${Math.min(1, Math.max(0, read))})`;
    };
    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };

    update();
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
    };
  }, [target]);

  return (
    <div aria-hidden className="pointer-events-none fixed inset-x-0 top-0 z-[60] h-[3px]">
      <div
        ref={bar}
        className="h-full origin-left scale-x-0 bg-surface-accent will-change-transform"
      />
    </div>
  );
}
