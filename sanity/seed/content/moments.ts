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

/** Said after "Back, with something new", once the site knows who they are and has work for them. */
export const interestMoment = {
  title: "Work for who they are",
  when: { interest: true },
  lines: ["Shown first:", "our work for {audience}."],
};

/** How a sentence names each audience, by its slug: {audience} in a moment. */
export const shortNames: Record<string, string> = {
  "funded-startups-and-founders": "founders",
  "enterprise-and-mid-market-teams": "established businesses",
  "institutions-and-public-agencies": "public agencies",
  "nonprofits-and-ngos": "nonprofits",
  "universities-and-research-institutions": "universities",
  "health-and-public-health": "health services",
};

/** The words of the box at the head of Selected work (Describe.tsx). */
export const describe = {
  label: "Describe your project",
  placeholder: "What are you working on?",
  submit: "Find the closest work",
  working: "Reading the work…",
  result: "The work closest to what you described.",
  clear: "Show our selection again",
  guide: "Take it to the site guide",
  busy: "A lot of searches are arriving at once. Try again in a minute.",
  limit: "That is today's searches. The site guide can take it from here.",
  error: "The search didn't work this time.",
};

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
  interestMoment,
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

/** The mark on what fits a visitor, as Site settings is first given it. */
export const forYouLabel = "For you";

/** The studio's clock, as Site settings is first given it. */
export const studioTimeZone = "America/New_York";
