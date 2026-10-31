/**
 * The site guide's events, for Google Analytics (lib/analytics.ts): that the
 * panel was opened, what the two questions were answered, which pages it
 * sent people to, that a question was asked and that a brief was sent.
 * Counts and pages only: nothing anyone types is ever sent.
 *
 * Quiet wherever the Google tag is not loaded, which is everywhere but a
 * production build.
 */

type Gtag = (command: "event", name: string, params: Record<string, string | number>) => void;

export type GuideEventName = "guide_open" | "guide_pick" | "guide_ask" | "guide_card_click" | "guide_brief_sent";

export function track(name: GuideEventName, params: Record<string, string | number> = {}) {
  if (typeof window === "undefined") return;
  (window as { gtag?: Gtag }).gtag?.("event", name, params);
}
