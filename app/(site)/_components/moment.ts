"use client";

import { useEffect, useSyncExternalStore } from "react";
import { readAttribution } from "@/lib/attribution";
import { orderWork, pick, readSignals, waitsForRegion, type Said } from "@/lib/moments";
import { regionOf, whereFrom, type Region } from "@/lib/region";
import { cardFor } from "@/lib/tailored";
import { readVisitor, subscribeVisitor, type Visitor } from "@/lib/visitor";
import type { Moments, Project } from "@/sanity/types";

/**
 * What the home page knows about the visitor reading it (lib/moments.ts),
 * worked out once a page load after the page is up, and shared: the moment
 * said in the motto's place, which the claim's two instances never disagree
 * on; where the visitor is, which orders Selected work; and their visits,
 * which mark what is new since the last one; what they seem to be looking
 * for (lib/interest.ts), which orders Selected work and says its lines in
 * their terms; and the work the box at its head found for them.
 *
 * The moment is decided at once from what the browser knows. Only when a
 * moment that reads the visitor's region comes before the first that holds
 * without it does it wait for their country, and then not for long. The
 * work's order takes the country whenever it comes.
 */

/** The longest the line waits for the visitor's country. */
const REGION_WAIT_MS = 600;

interface Known {
  /** Undefined while it is worked out; null when the motto stays. */
  readonly said?: Said | null;
  /** Where they are, once it is known. */
  readonly where?: { readonly country?: string; readonly region?: Region };
  /** Their visits, this one counted; null where the browser keeps nothing. */
  readonly visitor?: Visitor | null;
  /** The work the box found for what they described, each with why (Describe.tsx). */
  readonly matched?: { readonly slugs: readonly string[]; readonly why: Readonly<Record<string, string>> } | null;
}

const NOTHING: Known = {};
let known: Known = NOTHING;
/** The moments it was worked out from, so a second claim doesn't work it out again. */
let workedFrom: string | null = null;
const listeners = new Set<() => void>();

function learn(next: Known) {
  known = { ...known, ...next };
  for (const listener of listeners) listener();
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

const useKnown = () => useSyncExternalStore(subscribe, () => known, () => NOTHING);

/**
 * In development, the address stands in for the visitor:
 * ?gs-hour=23&gs-tz=Europe/London&gs-country=TT.
 */
function standIns() {
  if (process.env.NODE_ENV === "production") return {};
  const params = new URLSearchParams(location.search);
  const hour = params.get("gs-hour");
  return {
    hour: hour && /^\d{1,2}$/.test(hour) ? Number(hour) % 24 : undefined,
    timeZone: params.get("gs-tz") ?? undefined,
    country: params.get("gs-country")?.toUpperCase() ?? undefined,
  };
}

/** The visitor's clock, moved to the hour asked for, if one was. */
function clockAt(timeZone: string, hour: number | undefined) {
  const now = new Date();
  if (hour === undefined) return now;
  const current = Number(new Intl.DateTimeFormat("en-US", { timeZone, hour: "numeric", hourCycle: "h23" }).format(now)) % 24;
  return new Date(now.getTime() + (hour - current) * 3_600_000);
}

async function workOut(moments: Moments, from: string) {
  const standIn = standIns();
  let timeZone = standIn.timeZone ?? Intl.DateTimeFormat().resolvedOptions().timeZone;
  try {
    new Intl.DateTimeFormat("en-US", { timeZone });
  } catch {
    timeZone = "UTC";
  }
  let referrer: string | undefined;
  try {
    if (document.referrer && new URL(document.referrer).host !== location.host) referrer = document.referrer;
  } catch {}

  const visitor = readVisitor();
  learn({ visitor: visitor ?? null });
  const country = standIn.country
    ? Promise.resolve(standIn.country)
    : whereFrom().then((where) => where.country);
  void country.then((code) => {
    if (workedFrom === from) learn({ where: { country: code, region: regionOf(code) } });
  });

  const input = {
    now: clockAt(timeZone, standIn.hour),
    timeZone,
    studioTimeZone: moments.studioTimeZone,
    visitor,
    attribution: readAttribution(),
    search: location.search,
    referrer,
    country: standIn.country,
    recent: moments.recent,
    work: moments.work,
    interest: visitor?.interest,
    audienceNames: moments.audienceNames,
  };
  let signals = readSignals(input);
  if (!standIn.country && waitsForRegion(moments, signals)) {
    const code = await Promise.race([country, new Promise<undefined>((resolve) => setTimeout(resolve, REGION_WAIT_MS))]);
    if (code) signals = readSignals({ ...input, country: code });
  }
  return pick(moments, signals);
}

/** What the motto gives way to: undefined while it is worked out, null if nothing. */
export function useMoment(moments: Moments | undefined) {
  useEffect(() => {
    if (!moments) return;
    const from = JSON.stringify(moments);
    if (workedFrom === from) return;
    workedFrom = from;
    const settle = (said: Said | null) => {
      if (workedFrom === from) learn({ said });
    };
    workOut(moments, from).then(settle, () => settle(null));
  }, [moments]);
  return useKnown().said;
}

/**
 * The visitor's visits, this one counted: undefined until the page is up,
 * null if the browser keeps nothing. Kept up to date as the page goes on: a
 * page read, an interest noted.
 */
export function useVisitor() {
  useEffect(() => {
    if (known.visitor === undefined) learn({ visitor: readVisitor() ?? null });
    return subscribeVisitor(() => learn({ visitor: readVisitor() ?? null }));
  }, []);
  return useKnown().visitor;
}

/** What the visitor seems to be looking for (lib/interest.ts): undefined until the page is up, or if nothing has said. */
export const useInterest = () => useVisitor()?.interest;

/** The work the box found, shown first until they clear it; null clears it. */
export function showMatched(matched: Known["matched"]) {
  learn({ matched });
}

export const useMatched = () => useKnown().matched;

/** A card as this visitor sees it: the project, and the line under its name. */
export interface Shown {
  readonly project: Project;
  readonly line: string;
}

/**
 * Selected work in this visitor's order, each card with its line. The work
 * the box found leads, with why; otherwise lib/moments.ts › orderWork, with
 * the line Tailor with AI wrote for their audience, or the scope. As the
 * editor set it until anything is known, so the page is prerendered and
 * hydrated in that order.
 */
export function useOrderedWork(items: readonly Project[], moments: Moments, all: readonly Project[]): readonly Shown[] {
  const said = useMoment(moments);
  const visitor = useVisitor();
  const { where, matched } = useKnown();
  const audience = visitor?.interest?.audience?.slug;
  const line = (project: Project) => matched?.why[project.slug] || cardFor(project.tailored, audience) || project.scope;

  if (matched?.slugs.length) {
    const found = matched.slugs.flatMap((slug) => all.find((one) => one.slug === slug) ?? []);
    return orderWork(items, { leadWith: found }).map((project) => ({ project, line: line(project) }));
  }
  const ordered =
    !said?.leadWith.length && !where?.country && !(visitor && visitor.visits > 1) && !visitor?.interest
      ? items
      : orderWork(items, {
          leadWith: said?.leadWith,
          audience,
          discipline: visitor?.interest?.need?.discipline,
          country: where?.country,
          region: where?.region,
          read: visitor && visitor.visits > 1 ? new Set(visitor.read.work.map((one) => one.slug)) : undefined,
        });
  return ordered.map((project) => ({ project, line: line(project) }));
}
