"use client";

import { useEffect, useState } from "react";

/**
 * Read the preference directly.
 *
 * motion's own `useReducedMotion` reported false here while the media query
 * matched, which left the pinned track in place for exactly the people it is
 * meant to spare. A query we subscribe to ourselves cannot drift.
 */
export function usePrefersReducedMotion() {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const sync = () => setReduced(mq.matches);
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);
  return reduced;
}
