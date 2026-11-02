/**
 * The home page's moments as they are first written (lib/moments.ts): what
 * the motto gives way to for a visitor the site knows something about.
 * Seeded into a new dataset, and into the live one by
 * `npm run migrate:moments` where Home page › Moments is empty. Two lines
 * each, at the motto's measure, in the voice of lib/brand/voice.ts: plain,
 * declarative, nothing hurried.
 */

import type { MomentWhen, TimeOfDay } from "../../types";

export const greetings: Record<TimeOfDay, string> = {
  morning: "Good morning",
  afternoon: "Good afternoon",
  evening: "Good evening",
  night: "Good evening",
};

/** The mark on what is new since a returning visitor was last here. */
export const newLabel = "New";

/** Said after the moments for returning visitors, and before the rest. */
export const localMoment = {
  title: "Work from where they are",
  when: { local: true },
  lines: ["Work from {region}", "is shown first."],
};

export const moments: readonly { title: string; when: MomentWhen; lines: string[] }[] = [
  {
    title: "Back, with something new",
    when: { visit: "returning", fresh: true },
    lines: ["New since {lastVisit}:", "{new}."],
  },
  {
    title: "Back",
    when: { visit: "returning" },
    lines: ["{greeting}.", "Welcome back."],
  },
  localMoment,
  {
    title: "Late, hours apart",
    when: { times: ["night"], gap: true },
    lines: ["It is {studioTime} here.", "We will reply in your morning."],
  },
  {
    title: "Weekend",
    when: { days: "weekend" },
    lines: ["Briefs sent this weekend", "are answered on Monday."],
  },
];

/** The studio's clock, as Site settings is first given it. */
export const studioTimeZone = "America/New_York";
