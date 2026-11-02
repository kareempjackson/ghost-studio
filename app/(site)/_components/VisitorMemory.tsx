"use client";

import { usePathname } from "next/navigation";
import { Suspense, useEffect, useSyncExternalStore } from "react";
import { allowsCookies, consent, isSettled } from "@/lib/consent";
import { noteRead, noteVisit } from "@/lib/visitor";

/**
 * Keeps the note of this visitor's visits and reading (lib/visitor.ts):
 * each page they open, and where the note is kept, which follows their
 * consent as Tracking.tsx resolves it. Draws nothing.
 */
export function VisitorMemory() {
  const state = useSyncExternalStore(consent.subscribe, consent.get, consent.getServer);
  const settled = isSettled(state);
  const allowed = allowsCookies(state);

  useEffect(() => {
    if (settled) noteVisit(allowed);
  }, [settled, allowed]);

  /* Its own boundary: the address can wait for the request (WithPathname.tsx). */
  return (
    <Suspense>
      <Pages />
    </Suspense>
  );
}

/** Each page opened, as the visitor moves around the site. */
function Pages() {
  const pathname = usePathname();
  useEffect(() => noteRead(pathname), [pathname]);
  return null;
}
