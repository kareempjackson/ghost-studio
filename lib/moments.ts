/**
 * Ghost Savvy Studios — what the home page says to the visitor in front of it.
 *
 * The motto under the reel gives way, for a visitor the site knows something
 * about, to a line written for them: the first of the home page's moments
 * (Home page › Moments in the Studio) whose conditions all hold and whose
 * words can all be filled in. It reads the visitor's own clock, their visits
 * (lib/visitor.ts), the link they came in on (lib/attribution.ts) and the
 * part of the world they are in (lib/region.ts). With nothing to say, the
 * motto stays. The same signals put Selected work in this visitor's order
 * (orderWork, below).
 *
 * All of it is worked out in the browser once the page is up. The home page
 * is prerendered for everyone, and a clock read then would be the build's.
 */

import type { Attribution } from "./attribution";
import { regionName, regionOf, type Region } from "./region";
import type { Visitor } from "./visitor";
import type { Moment, MomentWhen, Moments, Place, Project, Published, TimeOfDay } from "@/sanity/types";

/** The studio's clock when Site settings doesn't say. */
export const STUDIO_TIME_ZONE = "America/New_York";

/**
 * The words a line may have filled in, each as long as it is likely to get:
 * what the Studio measures a line by. {greeting} is measured by the longest
 * greeting the document has.
 */
export const TOKENS = {
  greeting: "Good afternoon",
  studioTime: "12:00 pm",
  lastVisit: "30 September",
  new: "three projects and two insights",
  region: "the Caribbean",
} as const;

export type Token = keyof typeof TOKENS;

/** The longest a line may run once filled in: the motto's measure. */
export const LINE_MAX = 32;

const TOKEN = /\{(\w+)\}/g;

/** The words in braces a line has. */
export const tokensIn = (line: string) => [...line.matchAll(TOKEN)].map((match) => match[1]);

export const isToken = (name: string): name is Token => name in TOKENS;

/** What the visitor in front of the page is known by. */
export interface Signals {
  readonly time: TimeOfDay;
  readonly weekend: boolean;
  /** Visits, this one included. */
  readonly visits: number;
  /** When they were last here, before this visit. */
  readonly lastVisit?: Date;
  readonly daysAway?: number;
  /** What has gone up since then that they haven't read. */
  readonly fresh: { readonly projects: number; readonly articles: number };
  /** This visit's utm_campaign. */
  readonly campaign?: string;
  /** This visit's utm_source and the referring site's host, to be searched for words. */
  readonly source?: string;
  readonly country?: string;
  readonly region?: Region;
  /** Whether Selected work has a project from their country or region. */
  readonly local: boolean;
  /** The studio's clock, e.g. "9:40 pm". */
  readonly studioTime: string;
  /** Hours from the studio's clock to theirs. */
  readonly gapHours: number;
  /** Their time zone, that dates are given in. */
  readonly timeZone: string;
}

export interface SignalInputs {
  readonly now: Date;
  /** The browser's time zone. */
  readonly timeZone: string;
  readonly studioTimeZone: string | null;
  readonly visitor?: Visitor;
  readonly attribution?: Attribution;
  /** The query string the page was opened with, for the link's campaign tags. */
  readonly search: string;
  /** The page on another site that linked here, if this page was opened from one. */
  readonly referrer?: string;
  readonly country?: string;
  readonly recent: readonly Published[];
  /** Where Selected work's projects were for. */
  readonly work?: readonly Place[];
}

/** One moment, ready to say. */
export interface Said {
  readonly key: string;
  readonly title: string;
  readonly lines: readonly string[];
  /** Projects Selected work shows first while it is said. */
  readonly leadWith: readonly Project[];
}

const zone = (name: string | null | undefined, fallback: string) => {
  if (!name) return fallback;
  try {
    new Intl.DateTimeFormat("en-GB", { timeZone: name });
    return name;
  } catch {
    return fallback;
  }
};

/** A wall clock somewhere: its hour, its day, and how far it is from UTC. */
function clock(timeZone: string, at: Date) {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone,
    hourCycle: "h23",
    weekday: "short",
    year: "numeric",
    month: "numeric",
    day: "numeric",
    hour: "numeric",
    minute: "numeric",
  }).formatToParts(at);
  const part = (type: Intl.DateTimeFormatPartTypes) => parts.find((one) => one.type === type)?.value ?? "";
  const hour = Number(part("hour")) % 24;
  const wall = Date.UTC(Number(part("year")), Number(part("month")) - 1, Number(part("day")), hour, Number(part("minute")));
  const minute = Math.floor(at.getTime() / 60_000) * 60_000;
  return { hour, weekday: part("weekday"), offset: (wall - minute) / 60_000 };
}

const partOfDay = (hour: number): TimeOfDay =>
  hour >= 5 && hour < 12 ? "morning" : hour >= 12 && hour < 17 ? "afternoon" : hour >= 17 && hour < 22 ? "evening" : "night";

const host = (url: string | undefined) => {
  try {
    return url ? new URL(url).hostname.replace(/^www\./, "") : undefined;
  } catch {
    return undefined;
  }
};

/** Everything a moment can be told by, as of `now`. */
export function readSignals(input: SignalInputs): Signals {
  const { now, visitor, recent } = input;
  const timeZone = zone(input.timeZone, "UTC");
  const studioZone = zone(input.studioTimeZone, STUDIO_TIME_ZONE);
  const theirs = clock(timeZone, now);
  const studio = clock(studioZone, now);

  const lastVisit = visitor && visitor.visits > 1 && visitor.previous ? new Date(visitor.previous) : undefined;
  const read = new Set([
    ...(visitor?.read.work ?? []).map((one) => `project:${one.slug}`),
    ...(visitor?.read.insights ?? []).map((one) => `article:${one.slug}`),
  ]);
  const fresh = { projects: 0, articles: 0 };
  if (lastVisit) {
    for (const item of recent) {
      if (!(Date.parse(item.at) > lastVisit.getTime()) || read.has(`${item.kind}:${item.slug}`)) continue;
      if (item.kind === "project") fresh.projects += 1;
      else fresh.articles += 1;
    }
  }

  /* The way in, this visit: the tags on this page's link, or on the link an
     earlier page of the same visit was opened from. */
  const params = new URLSearchParams(input.search);
  const tag = (name: string) => params.get(`utm_${name}`)?.trim().toLowerCase() || undefined;
  const visitStart = visitor ? Date.parse(visitor.current) : now.getTime();
  const last = input.attribution?.last;
  const earlier = last?.at && Date.parse(last.at) >= visitStart - 60_000 ? last : undefined;
  const source = [tag("source") ?? earlier?.source, host(input.referrer) ?? host(earlier?.referrer)]
    .filter(Boolean)
    .join(" ");
  const country = input.country?.toUpperCase();
  const region = regionOf(country);

  return {
    time: partOfDay(theirs.hour),
    weekend: theirs.weekday === "Sat" || theirs.weekday === "Sun",
    visits: visitor?.visits ?? 1,
    lastVisit,
    daysAway: lastVisit ? (now.getTime() - lastVisit.getTime()) / 86_400_000 : undefined,
    fresh,
    campaign: tag("campaign") ?? earlier?.campaign,
    source: source || undefined,
    country,
    region,
    local: (input.work ?? []).some((place) => isFrom(place, country, region) < 2),
    studioTime: new Intl.DateTimeFormat("en-GB", {
      timeZone: studioZone,
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    }).format(now),
    gapHours: (theirs.offset - studio.offset) / 60,
    timeZone,
  };
}

const word = (value: string) => value.trim().toLowerCase();

/** Whether every condition the moment sets holds for this visitor. */
export function holds(when: MomentWhen, s: Signals): boolean {
  return (
    (!when.times?.length || when.times.includes(s.time)) &&
    (!when.days || (when.days === "weekend") === s.weekend) &&
    (!when.visit || (when.visit === "returning") === s.visits > 1) &&
    (when.away == null || (s.daysAway ?? -1) >= when.away) &&
    (when.visits == null || s.visits >= when.visits) &&
    (!when.fresh || s.fresh.projects + s.fresh.articles > 0) &&
    (!when.campaigns?.length || when.campaigns.some((one) => word(one) === s.campaign)) &&
    (!when.sources?.length || when.sources.some((one) => Boolean(word(one) && s.source?.includes(word(one))))) &&
    (!when.regions?.length || Boolean(s.region && when.regions.includes(s.region))) &&
    (!when.local || s.local) &&
    (!when.gap || Math.abs(s.gapHours) >= 2)
  );
}

const NUMBERS = ["no", "one", "two", "three", "four", "five", "six", "seven", "eight", "nine", "ten", "eleven", "twelve"];

const count = (n: number, one: string, many: string) => `${NUMBERS[n] ?? n} ${n === 1 ? one : many}`;

/** What is new, in words, e.g. "two projects and one insight". */
function whatsNew({ projects, articles }: Signals["fresh"]) {
  const parts: string[] = [];
  if (projects) parts.push(count(projects, "project", "projects"));
  if (articles) parts.push(count(articles, "insight", "insights"));
  return parts.join(" and ") || undefined;
}

/** A day as the site writes one, e.g. 14 October, with the year only if it isn't this one. */
function day(date: Date, timeZone: string, now = new Date()) {
  const year = (at: Date) => new Intl.DateTimeFormat("en-GB", { timeZone, year: "numeric" }).format(at);
  return new Intl.DateTimeFormat("en-GB", {
    timeZone,
    day: "numeric",
    month: "long",
    ...(year(date) === year(now) ? {} : { year: "numeric" }),
  }).format(date);
}

/** The moment's lines with their words filled in, or null if one of them can't be for this visitor. */
export function fill(moment: Moment, s: Signals, greetings: Moments["greetings"]): string[] | null {
  const values: Record<Token, string | undefined> = {
    greeting: greetings?.[s.time]?.trim() || undefined,
    studioTime: s.studioTime,
    lastVisit: s.lastVisit && day(s.lastVisit, s.timeZone),
    new: whatsNew(s.fresh),
    region: s.region && regionName(s.region),
  };
  let missing = false;
  const lines = (moment.lines ?? [])
    .map((line) =>
      line
        .replace(TOKEN, (whole, name: string, at: number) => {
          const value = isToken(name) ? values[name] : undefined;
          if (!value) {
            missing = true;
            return whole;
          }
          return at === 0 ? value[0].toUpperCase() + value.slice(1) : value;
        })
        .trim(),
    )
    .filter(Boolean);
  return missing || !lines.length ? null : lines;
}

/** The first moment that holds for this visitor and can be said, or null: the motto stays. */
export function pick(moments: Moments, s: Signals): Said | null {
  for (const moment of moments.items) {
    if (!holds(moment.when ?? {}, s)) continue;
    const lines = fill(moment, s, moments.greetings);
    if (lines) return { key: moment.key, title: moment.title, lines, leadWith: moment.leadWith ?? [] };
  }
  return null;
}

/** Whether a moment depends on where the visitor is. */
const readsRegion = (moment: Moment) =>
  Boolean(moment.when?.regions?.length || moment.when?.local) ||
  (moment.lines ?? []).some((line) => line.includes("{region}"));

/**
 * Whether knowing the visitor's region could change what is said: a moment
 * that reads it comes before the first that can be said without it.
 */
export function waitsForRegion(moments: Moments, s: Signals): boolean {
  for (const moment of moments.items) {
    if (readsRegion(moment)) return true;
    if (holds(moment.when ?? {}, s) && fill(moment, s, moments.greetings)) return false;
  }
  return false;
}

/** How near a project was to the visitor: 0 their country, 1 their region, 2 neither. */
function isFrom(place: Partial<Pick<Place, "region" | "countries">>, country?: string, region?: Region) {
  if (country && place.countries?.includes(country)) return 0;
  if (region && place.region === region) return 1;
  return 2;
}

/**
 * Selected work in this visitor's order. The projects the moment said leads
 * with come first, taking the places of the last in the selection, so the
 * grid keeps its count. Then work from their country, then their region; a
 * returning visitor's unread before what they have read; and otherwise the
 * order the editor set.
 */
export function orderWork(
  items: readonly Project[],
  { leadWith = [], country, region, read }: {
    leadWith?: readonly Project[];
    country?: string;
    region?: Region;
    read?: ReadonlySet<string>;
  },
): readonly Project[] {
  const lead = leadWith.filter((project, i) => leadWith.findIndex((one) => one.slug === project.slug) === i);
  const rest = items
    .filter((project) => !lead.some((one) => one.slug === project.slug))
    .map((project, i) => ({ project, rank: [isFrom(project, country, region), read?.has(project.slug) ? 1 : 0, i] }))
    .sort((a, b) => a.rank[0] - b.rank[0] || a.rank[1] - b.rank[1] || a.rank[2] - b.rank[2])
    .map(({ project }) => project);
  return [...lead, ...rest].slice(0, Math.max(items.length, lead.length));
}
