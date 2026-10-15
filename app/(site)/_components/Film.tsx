"use client";

import { useEffect, useRef } from "react";
import { useNearScreen } from "./useNearScreen";
import { usePrefersReducedMotion } from "./usePrefersReducedMotion";

/**
 * A film in a picture's place: muted, looped, filling its box over the
 * picture it starts from. Anyone who has asked for less motion gets the
 * still — the picture, or the film's first frame where there is none.
 *
 * Films are the heaviest things on a page, so one loads nothing — not even
 * its still — until the reader is half a screen from it, plays only while
 * it's on screen, and pauses once it's scrolled past. Until then the slot
 * shows its ground. `eager` loads one at the top of the page at once.
 *
 * It carries the slot's alt text when given one; without, it is decoration
 * and hidden from assistive tech.
 */
export function Film({
  src,
  poster,
  label,
  eager = false,
  className = "absolute inset-0 size-full object-cover",
}: {
  src: string;
  poster?: string | null;
  /** The slot's alt text. Empty or unset, the film is hidden from assistive tech. */
  label?: string;
  /** At the top of the page: load it now. */
  eager?: boolean;
  className?: string;
}) {
  const ref = useRef<HTMLVideoElement>(null);
  const still = usePrefersReducedMotion();
  const { near, shown } = useNearScreen(ref, eager);

  useEffect(() => {
    const video = ref.current;
    if (!video || !near) return;
    if (still || !shown) video.pause();
    else void video.play().catch(() => {});
  }, [still, near, shown]);

  return (
    <video
      ref={ref}
      src={near ? src : undefined}
      poster={near ? (poster ?? undefined) : undefined}
      muted
      loop
      playsInline
      autoPlay={near && !still}
      preload={near ? "metadata" : "none"}
      aria-label={label || undefined}
      aria-hidden={label ? undefined : true}
      className={className}
    />
  );
}
