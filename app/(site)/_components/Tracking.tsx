"use client";

import { usePathname } from "next/navigation";
import posthog from "posthog-js";
import { Suspense, useEffect, useSyncExternalStore } from "react";
import { adPageView, adsLoaded, loadAds } from "@/lib/ads";
import type { BrowserTrackers } from "@/lib/analytics";
import { noteAttribution } from "@/lib/attribution";
import { allowsCookies, consent, isSettled } from "@/lib/consent";
import { sendHeld, track } from "@/lib/track";

type Gtag = (command: "consent", action: "update", params: Record<string, string>) => void;

/**
 * What runs in the browser once the visitor's consent is known
 * (lib/consent.ts), as Site settings › Tracking sets it up
 * (lib/analytics.ts): PostHog, the LinkedIn and Meta pixels (lib/ads.ts),
 * the note of where they came from (lib/attribution.ts), and Google's
 * consent, kept in step with their choice. And the two conversions that are
 * links: the booking page and the credentials deck, wherever an editor has
 * linked to /book or /deck.
 *
 * PostHog runs in cookieless mode until cookies are allowed, so a visitor
 * who is still to choose, or who said no, is counted without anything kept
 * in their browser, and without a recording. It sends to /ingest/us or
 * /ingest/eu, which next.config.ts passes on to its cloud, so blockers of
 * PostHog's own address don't silence it. The pixels wait for consent
 * altogether.
 */
export function Tracking({ trackers }: { trackers: BrowserTrackers }) {
  const { posthog: project, linkedin, meta, askEveryone } = trackers;
  const state = useSyncExternalStore(consent.subscribe, consent.get, consent.getServer);
  const settled = isSettled(state);
  const allowed = allowsCookies(state);

  useEffect(() => {
    void consent.resolve(askEveryone);
  }, [askEveryone]);

  useEffect(() => {
    if (!settled) return;
    noteAttribution(allowed);
    (window as { gtag?: Gtag }).gtag?.("consent", "update", {
      analytics_storage: allowed ? "granted" : "denied",
    });
    if (allowed) loadAds({ linkedin, meta });
    else if (adsLoaded()) return location.reload();
    if (!project) return;
    if (!posthog.__loaded) {
      posthog.init(project.key, {
        api_host: `/ingest/${project.region}`,
        ui_host: `https://${project.region}.posthog.com`,
        defaults: "2026-08-30",
        capture_pageview: "history_change",
        cookieless_mode: "on_reject",
        opt_out_capturing_by_default: !allowed,
        disable_session_recording: !project.replays,
      });
      sendHeld();
    }
    if (allowed && posthog.has_opted_out_capturing()) posthog.opt_in_capturing({ captureEventName: false });
    if (!allowed && !posthog.has_opted_out_capturing()) posthog.opt_out_capturing();
  }, [settled, allowed, project, linkedin, meta]);

  useEffect(() => {
    function onClick(event: MouseEvent) {
      const link = (event.target as Element | null)?.closest?.("a[href]");
      if (!(link instanceof HTMLAnchorElement) || link.origin !== location.origin) return;
      if (link.pathname === "/book") track("booking_opened", { path: location.pathname });
      if (link.pathname === "/deck") track("deck_download", { path: location.pathname });
    }
    document.addEventListener("click", onClick, { capture: true });
    return () => document.removeEventListener("click", onClick, { capture: true });
  }, []);

  /* Its own boundary: the address can wait for the request (WithPathname.tsx). */
  return linkedin ? (
    <Suspense>
      <Moves />
    </Suspense>
  ) : null;
}

/** Each move inside the site, for LinkedIn's count of page views. */
function Moves() {
  const pathname = usePathname();
  useEffect(adPageView, [pathname]);
  return null;
}
