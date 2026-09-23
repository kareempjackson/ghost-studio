"use client";

import { useEffect, useRef } from "react";
import { usePrefersReducedMotion } from "./usePrefersReducedMotion";

/**
 * The reel, offered rather than played at you.
 *
 * A plate runs the showreel silently on a loop, with the studio's own pill on
 * it — vermilion ground, mono label, the play on an ink disc — so the control
 * belongs to the same set as every other button on the page, down to the way
 * it opens on hover. Activating it hands over the real thing: full frame, with
 * sound and the browser's own controls, which is also the pause the looping
 * crop never had. The same bargain the cover makes.
 *
 * Reduced motion gets the poster frame and no loop — the reel still plays in
 * full when it is asked for.
 */
export function ShowreelButton({
  label = "Play showreel",
}: {
  label?: string;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const reduced = usePrefersReducedMotion();

  useEffect(() => {
    const el = videoRef.current;
    if (!el) return;
    if (reduced) {
      el.pause();
      return;
    }
    void el.play().catch(() => {});
  }, [reduced]);

  /* Leaving full screen puts the crop back the way it was found. */
  useEffect(() => {
    const el = videoRef.current;
    if (!el) return;
    const restore = () => {
      if (document.fullscreenElement) return;
      el.muted = true;
      el.controls = false;
      el.loop = true;
      if (!reduced) void el.play().catch(() => {});
    };
    document.addEventListener("fullscreenchange", restore);
    return () => document.removeEventListener("fullscreenchange", restore);
  }, [reduced]);

  async function open() {
    const el = videoRef.current;
    if (!el) return;
    el.muted = false;
    el.controls = true;
    el.loop = false;
    type IosVideo = HTMLVideoElement & { webkitEnterFullscreen?: () => void };
    try {
      if (el.requestFullscreen) await el.requestFullscreen();
      else (el as IosVideo).webkitEnterFullscreen?.();
    } catch {
      /* Fullscreen refused: the controls and sound still stand on their own. */
    }
    await el.play().catch(() => {});
  }

  return (
    <button
      type="button"
      onClick={open}
      className="group relative block aspect-[16/9] w-full max-w-[24rem] overflow-hidden rounded-[1rem] bg-ink-950 text-left"
    >
      <video
        ref={videoRef}
        className="size-full object-cover transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.04]"
        poster="/media/hero-poster.jpg"
        preload="metadata"
        muted
        loop
        playsInline
        aria-hidden
        tabIndex={-1}
      >
        <source src="/media/hero.mp4" type="video/mp4" />
      </video>

      {/* The plate says what it is, in the same corner hand as the process
          plates: mono, quiet, bottom left. */}
      <span
        aria-hidden
        className="pointer-events-none absolute bottom-4 left-4 font-label text-[0.625rem] leading-none tracking-[0.08em] text-white/70 uppercase"
      >
        Ghostsavvy / Showreel
      </span>

      {/*
        The control is the site's own pill, not a glass one: vermilion ground,
        mono label, the play on an ink disc. Hovered, it makes the same gesture
        as every `ArrowPill` on the page — it turns over to ink, and the disc
        travels the length of the pill to the left end while the label makes
        room for it. The whole plate is the target, so the plate's hover drives
        it; the pill itself never takes the pointer.

        The disc sits 6px in from the right; hovered, 6px in from the left, so
        `right` runs the full width less the disc and both gaps. The label's
        padding is the disc plus its gap plus the breathing room, and swaps.
      */}
      <span className="pointer-events-none absolute inset-0 grid place-items-center">
        <span className="relative flex h-12 items-center rounded-pill bg-[#eb5b32] font-label text-[0.75rem] leading-none tracking-[0.08em] text-ink-950 uppercase transition-colors duration-300 group-hover:bg-ink-950 group-hover:text-white">
          <span className="block pr-14 pl-6 transition-[padding] duration-400 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:pr-6 group-hover:pl-14">
            {label}
          </span>
          <span className="absolute top-1/2 right-1.5 grid size-9 -translate-y-1/2 place-items-center rounded-pill bg-ink-950 text-white transition-[right,background-color] duration-400 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:right-[calc(100%-2.625rem)] group-hover:bg-white/15">
            <svg
              aria-hidden
              viewBox="0 0 16 16"
              className="size-3 fill-current"
            >
              <path d="M5 3.2v9.6l8-4.8-8-4.8Z" />
            </svg>
          </span>
        </span>
      </span>
    </button>
  );
}
