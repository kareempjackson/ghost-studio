"use client";

import { useEffect, useState, type RefObject } from "react";

/**
 * Whether an element is on screen, or within half a screen of it, so a film
 * further down the page loads and plays only as the reader comes to it, and
 * stops when they've scrolled past.
 *
 * `near` stays true once it has been: what has loaded stays loaded. `eager`
 * starts both true, for a film at the top of the page.
 */
export function useNearScreen(ref: RefObject<Element | null>, eager = false) {
  const [near, setNear] = useState(eager);
  const [shown, setShown] = useState(eager);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        setShown(entry.isIntersecting);
        if (entry.isIntersecting) setNear(true);
      },
      { rootMargin: "50% 0px" },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [ref]);

  return { near, shown };
}
