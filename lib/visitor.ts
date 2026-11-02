/**
 * Ghost Savvy Studios — a visitor's own history with the site.
 *
 * How many times they have been, when they were last here, and which case
 * studies and insights they have read: what the home page says to someone
 * who is back (lib/moments.ts). A visit begins on the first page after half
 * an hour away, and a record not seen for a year starts again. It stays in
 * the browser but for one thing: a question to the site guide carries the
 * case studies and insights read on earlier visits (guide/store.ts), so it
 * can build on them. No event or form sends it.
 *
 * It also holds what they seem to be looking for (lib/interest.ts): which of
 * the studio's audiences and needs, learned from the guide, the box on the
 * home page and what they read.
 *
 * Kept where consent allows, as the attribution record is
 * (lib/attribution.ts): in local storage once the visitor allows cookies
 * (lib/consent.ts), so a visit weeks later still knows them; until then in
 * session storage, for the tab only; and never both. It moves across when
 * they choose. Until consent is known it is only held, and written once it is.
 */

import { audienceFromReads, mergeInterest, type Interest, type InterestNote } from "./interest";

export interface Read {
  readonly slug: string;
  /** When, as an ISO date. */
  readonly at: string;
  /** The audiences the page was written for (Tailor with AI), once it has said. */
  readonly audiences?: readonly string[];
}

export interface Visitor {
  /** When they first came, as an ISO date. */
  readonly first: string;
  /** How many visits, this one included. */
  readonly visits: number;
  /** When this visit began. */
  readonly current: string;
  /** When they were last here before this visit, if they have been. */
  readonly previous?: string;
  /** When they were last on a page. */
  readonly lastSeen: string;
  /** The case studies and insights they have read, latest first. */
  readonly read: { readonly work: readonly Read[]; readonly insights: readonly Read[] };
  /** What they seem to be looking for, if anything has said. */
  readonly interest?: Interest;
}

const KEY = "gs-visitor";
/** Away this long, and the next page begins a new visit. */
const VISIT_GAP_MS = 30 * 60 * 1000;
/** Away this long, and they are new again. */
const FORGET_MS = 365 * 24 * 60 * 60 * 1000;
/** Reads kept of each kind. */
const KEEP_READS = 20;

/** This page load's record: the stored one, with the visit counted. */
let record: Visitor | null = null;
/** Where it is kept: null until consent is known. */
let persist: boolean | null = null;
const listeners = new Set<() => void>();

/** Hears each change to the record in this page: a page read, an interest noted. */
export function subscribeVisitor(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

function parse(raw: string | null): Visitor | null {
  try {
    const value = raw ? (JSON.parse(raw) as Visitor) : null;
    return value && typeof value.visits === "number" && !Number.isNaN(Date.parse(value.lastSeen)) && value.read
      ? value
      : null;
  } catch {
    return null;
  }
}

const stored = () => parse(localStorage.getItem(KEY)) ?? parse(sessionStorage.getItem(KEY));

/** The record as of `now`: a first visit, the next one after time away, or more of this one. */
function advance(before: Visitor | null, now: Date): Visitor {
  const at = now.toISOString();
  const away = before ? now.getTime() - Date.parse(before.lastSeen) : Infinity;
  if (!before || away > FORGET_MS) {
    return { first: at, visits: 1, current: at, lastSeen: at, read: { work: [], insights: [] } };
  }
  if (away > VISIT_GAP_MS) {
    return { ...before, visits: before.visits + 1, current: at, previous: before.lastSeen, lastSeen: at };
  }
  return { ...before, lastSeen: at };
}

/** Takes the new record, tells whoever listens, and keeps it where consent allows. */
function commit(next: Visitor) {
  record = next;
  for (const listener of listeners) listener();
  save();
}

function save() {
  if (!record || persist === null) return;
  try {
    const [keep, drop] = persist ? [localStorage, sessionStorage] : [sessionStorage, localStorage];
    keep.setItem(KEY, JSON.stringify(record));
    drop.removeItem(KEY);
  } catch {}
}

/** The visitor as of this page, this visit counted. Undefined where the browser keeps nothing. */
export function readVisitor(): Visitor | undefined {
  if (record) return record;
  try {
    record = advance(stored(), new Date());
    return record;
  } catch {
    return undefined;
  }
}

/**
 * Keeps the record where consent allows: local storage with cookies
 * allowed, session storage without. Called once consent is known, and again
 * when the visitor's choice changes, to move it.
 */
export function noteVisit(allowed: boolean) {
  persist = allowed;
  readVisitor();
  save();
}

/** Notes a page: the visit goes on, and a case study or an insight joins what they have read. */
export function noteRead(path: string) {
  const before = readVisitor();
  if (!before) return;
  const now = new Date();
  let next = advance(before, now);
  const page = /^\/(work|insights)\/([^/?#]+)\/?$/.exec(path);
  if (page) {
    const kind = page[1] === "work" ? "work" : "insights";
    const slug = decodeURIComponent(page[2]);
    const known = next.read[kind].find((one) => one.slug === slug);
    const read = [{ ...known, slug, at: now.toISOString() }, ...next.read[kind].filter((one) => one.slug !== slug)];
    next = { ...next, read: { ...next.read, [kind]: read.slice(0, KEEP_READS) } };
  }
  commit(next);
}

/** Notes what a source says they are looking for (lib/interest.ts). */
export function noteInterest(note: InterestNote) {
  const before = readVisitor();
  if (!before) return;
  commit({ ...before, interest: mergeInterest(before.interest, note) });
}

/**
 * Notes the audiences a page they are reading was written for, and, once two
 * or more pages share one, takes it as what they are looking for.
 */
export function noteTags(kind: "work" | "insights", slug: string, audiences: readonly string[]) {
  const before = readVisitor();
  if (!before) return;
  const known = before.read[kind].find((one) => one.slug === slug);
  const read = known
    ? before.read[kind].map((one) => (one.slug === slug ? { ...one, audiences } : one))
    : [{ slug, at: new Date().toISOString(), audiences }, ...before.read[kind]].slice(0, KEEP_READS);
  const next = { ...before, read: { ...before.read, [kind]: read } };
  const audience = audienceFromReads([...next.read.work, ...next.read.insights]);
  commit(audience ? { ...next, interest: mergeInterest(next.interest, { audience, from: "reading" }) } : next);
}
