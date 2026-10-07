"use client";

import { useEffect, useRef } from "react";
import { usePrefersReducedMotion } from "./usePrefersReducedMotion";

/**
 * A film in a picture's place: muted, looped, filling its box over the
 * picture it starts from. Anyone who has asked for less motion gets the
 * still — the picture, or the film's first frame where there is none.
 *
 * It carries the slot's alt text when given one; without, it is decoration
 * and hidden from assistive tech.
 */
export function Film({
  src,
  poster,
  label,
  className = "absolute inset-0 size-full object-cover",
}: {
  src: string;
  poster?: string | null;
  /** The slot's alt text. Empty or unset, the film is hidden from assistive tech. */
  label?: string;
  className?: string;
}) {
  const ref = useRef<HTMLVideoElement>(null);
  const still = usePrefersReducedMotion();

  useEffect(() => {
    const video = ref.current;
    if (!video) return;
    if (still) video.pause();
    else void video.play().catch(() => {});
  }, [still]);

  return (
    <video
      ref={ref}
      src={src}
      poster={poster ?? undefined}
      muted
      loop
      playsInline
      autoPlay={!still}
      preload="metadata"
      aria-label={label || undefined}
      aria-hidden={label ? undefined : true}
      className={className}
    />
  );
}
