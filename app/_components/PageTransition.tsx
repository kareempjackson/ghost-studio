"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Suspense, useCallback, useEffect, useRef } from "react";

/** Matches `--gs-leave` in globals.css: the old page clears the stage. */
const LEAVE_MS = 450;
/** Long enough for the last line and reveal to land; then the page is plain. */
const ARRIVE_MS = 1600;
/** If a navigation never lands, give the page back rather than leave it blank. */
const SAFETY_MS = 3000;

/**
 * The link a click is for, if the transition should take it: a plain
 * left-click on a link to another page of this site. Anything else (a new
 * tab, a download, mail, another site, a jump on the same page) is left to
 * the browser.
 */
function transitionTarget(event: MouseEvent): URL | null {
  if (
    event.defaultPrevented ||
    event.button !== 0 ||
    event.metaKey ||
    event.ctrlKey ||
    event.shiftKey ||
    event.altKey
  )
    return null;

  const anchor = (event.target as Element | null)?.closest?.("a[href]");
  if (!(anchor instanceof HTMLAnchorElement)) return null;
  if (anchor.target && anchor.target !== "_self") return null;
  if (anchor.hasAttribute("download")) return null;

  const url = new URL(anchor.href, window.location.href);
  if (url.origin !== window.location.origin) return null;
  if (
    url.pathname === window.location.pathname &&
    url.search === window.location.search
  )
    return null;

  return url;
}

/** Calls `onChange` whenever the route changes, but not on the first load. */
function RouteWatcher({ onChange }: { onChange: () => void }) {
  const pathname = usePathname();
  const search = useSearchParams().toString();
  const first = useRef(true);

  useEffect(() => {
    if (first.current) {
      first.current = false;
      return;
    }
    onChange();
  }, [pathname, search, onChange]);

  return null;
}

/**
 * The page transition. Renders nothing; it takes over the site's links.
 *
 * Every link on the site is a plain anchor, so rather than rewrite them, a
 * click on one that goes to another page here is caught once, at the window:
 * the page leaves (it fades and drifts up), the route changes behind it
 * without a reload, and the new page arrives, its cover rising into place a
 * line at a time. The motion itself is in globals.css ("Page transition"),
 * keyed to `data-page` on <html>: `leaving`, then `entering`.
 *
 * Anyone who has asked for less motion is left alone: their links load
 * pages exactly as they always have.
 */
export function PageTransition() {
  const router = useRouter();
  const leaving = useRef(false);
  const timers = useRef<{ push?: number; safety?: number; arrive?: number }>(
    {},
  );

  /* The new route has rendered: bring it in. */
  const arrive = useCallback(() => {
    const root = document.documentElement;
    const t = timers.current;
    leaving.current = false;
    window.clearTimeout(t.safety);
    window.clearTimeout(t.arrive);
    root.dataset.page = "entering";
    t.arrive = window.setTimeout(() => {
      if (root.dataset.page === "entering") delete root.dataset.page;
    }, ARRIVE_MS);
  }, []);

  useEffect(() => {
    const root = document.documentElement;
    const t = timers.current;
    const prefetched = new Set<string>();
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");

    /* Bubble phase, on the window: React's own handlers have run by now, so
       a link that has already handled itself (next/link) is left alone. */
    const onClick = (event: MouseEvent) => {
      if (reduced.matches) return;
      const url = transitionTarget(event);
      if (!url) return;
      event.preventDefault();
      if (leaving.current) return;

      leaving.current = true;
      window.clearTimeout(t.arrive);
      root.dataset.page = "leaving";
      t.push = window.setTimeout(() => {
        router.push(url.pathname + url.search + url.hash);
      }, LEAVE_MS);
      t.safety = window.setTimeout(() => {
        leaving.current = false;
        delete root.dataset.page;
      }, LEAVE_MS + SAFETY_MS);
    };

    /* The first hover on a link starts fetching its page, so by the time the
       old page has left, the new one is usually ready to show. */
    const onPointerOver = (event: PointerEvent) => {
      const anchor = (event.target as Element | null)?.closest?.("a[href]");
      if (!(anchor instanceof HTMLAnchorElement)) return;
      const url = new URL(anchor.href, window.location.href);
      if (url.origin !== window.location.origin) return;
      const key = url.pathname + url.search;
      if (prefetched.has(key)) return;
      prefetched.add(key);
      router.prefetch(key);
    };

    window.addEventListener("click", onClick);
    document.addEventListener("pointerover", onPointerOver);
    return () => {
      window.removeEventListener("click", onClick);
      document.removeEventListener("pointerover", onPointerOver);
      window.clearTimeout(t.push);
      window.clearTimeout(t.safety);
      window.clearTimeout(t.arrive);
    };
  }, [router]);

  return (
    <Suspense fallback={null}>
      <RouteWatcher onChange={arrive} />
    </Suspense>
  );
}
