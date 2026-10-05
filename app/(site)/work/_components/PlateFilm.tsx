"use client";

import { useEffect, useRef } from "react";
import { usePrefersReducedMotion } from "../../_components/usePrefersReducedMotion";

/**
 * A plate's film: muted, looped, over the picture it starts from. Anyone who
 * has asked for less motion gets the picture, still.
 */
export function PlateFilm({ src, label }: { src: string; label: string }) {
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
      muted
      loop
      playsInline
      autoPlay={!still}
      preload="metadata"
      aria-label={label || undefined}
      aria-hidden={label ? undefined : true}
      className="absolute inset-0 size-full object-cover"
    />
  );
}
