/**
 * The site's events, for Google Analytics and PostHog (lib/analytics.ts),
 * and the conversions among them for the LinkedIn and Meta pixels
 * (lib/ads.ts).
 *
 * The conversions the studio counts: an enquiry sent from the contact form
 * or the site guide, a newsletter sign-up, a case study read, the booking
 * page opened, the credentials deck downloaded. And the site guide's own:
 * that the panel was opened, what its two questions were answered, which
 * pages it sent people to, that a question was asked and that a brief was
 * sent. Counts and pages only: nothing anyone types is ever sent.
 *
 * Quiet wherever no tool is loaded, which is everywhere but a production
 * build with their IDs set. An event from before PostHog or the pixels have
 * started (they wait on the visitor's consent) is held and sent when they do.
 */

import posthog from "posthog-js";
import { adEvent } from "./ads";

type Gtag = (command: "event", name: string, params: Record<string, string | number>) => void;
export type Params = Record<string, string | number>;

export type EventName =
  | "enquiry_sent"
  | "newsletter_signup"
  | "case_study_view"
  | "booking_opened"
  | "deck_download"
  | "guide_open"
  | "guide_pick"
  | "guide_ask"
  | "guide_card_click"
  | "guide_brief_sent";

/** Held until PostHog starts, if it is going to. */
const held: [EventName, Params][] = [];

export function track(name: EventName, params: Params = {}) {
  if (typeof window === "undefined") return;
  (window as { gtag?: Gtag }).gtag?.("event", name, params);
  if (posthog.__loaded) posthog.capture(name, params);
  else if (held.length < 20) held.push([name, params]);
  adEvent(name, params);
}

/** Sends what was held. Tracking.tsx calls it once PostHog has started. */
export function sendHeld() {
  for (const [name, params] of held.splice(0)) posthog.capture(name, params);
}

/** The PostHog recording of this visit, at this moment, if one is being made. */
export function replayUrl(): string | undefined {
  try {
    return posthog.__loaded && posthog.sessionRecordingStarted()
      ? posthog.get_session_replay_url({ withTimestamp: true })
      : undefined;
  } catch {
    return undefined;
  }
}
