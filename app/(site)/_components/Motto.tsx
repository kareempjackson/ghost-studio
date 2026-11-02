"use client";

import { useEffect, useState } from "react";
import { duration, easing } from "@/lib/brand/motion";
import type { Said } from "@/lib/moments";
import { track } from "@/lib/track";
import type { Lines, Moments } from "@/sanity/types";
import { useMoment } from "./moment";

/** The moment the hero has reported this page load, so it is counted once. */
let reported: string | null = null;

/**
 * The motto, or the line the home page has for this visitor in its place
 * (lib/moments.ts). The motto is what the page is prerendered with, and what
 * stays when there is nothing to say; a moment takes over with a cross-fade
 * once it is worked out, or at once while the intro still covers the page.
 * It holds the motto's height, so the claim beside it never moves.
 */
export function Motto({
  motto,
  moments,
  repeat = false,
}: {
  motto: Lines;
  /** The home page's moments; without them, only the motto. */
  moments?: Moments;
  /** The claim's visual repeat, which doesn't report what it shows. */
  repeat?: boolean;
}) {
  const said = useMoment(moments);
  /* Back on the home page within the tab, the moment is known from the start. */
  const [shown, setShown] = useState<Said | null>(() => said ?? null);
  /* What is on screen fades out while what replaces it waits its turn. */
  const fading = said !== undefined && said?.key !== shown?.key;

  useEffect(() => {
    if (!fading) return;
    const covered = document.documentElement.hasAttribute("data-intro");
    const swap = setTimeout(() => setShown(said ?? null), covered ? 0 : duration.base);
    return () => clearTimeout(swap);
  }, [fading, said]);

  useEffect(() => {
    if (repeat || !shown || reported === shown.key) return;
    reported = shown.key;
    track("moment_shown", { moment: shown.title || shown.key });
  }, [repeat, shown]);

  return (
    <span
      className="block"
      style={{
        minHeight: `${motto.length * 1.6}em`,
        opacity: fading ? 0 : 1,
        transition: `opacity ${duration.base}ms ${easing.standard}`,
      }}
    >
      {(shown?.lines ?? motto).map((line) => (
        <span key={line} className="block">
          {line}
        </span>
      ))}
    </span>
  );
}
