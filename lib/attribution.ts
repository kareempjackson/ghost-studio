/**
 * Ghost Savvy Studios — where a lead came from.
 *
 * On the first page of each visit the browser notes how the visitor arrived:
 * the campaign tags on the link (utm_source, utm_medium, utm_campaign,
 * utm_term, utm_content), the site that sent them, and the page they landed
 * on. Two such touches are kept: the first, for 90 days, and the last that
 * came from somewhere, a tagged link or another site, rather than straight
 * in. An enquiry or a sign-up sends both, and they are stored with it in
 * Sanity ("First came from", "Last came from").
 *
 * Where the visitor allows analytics cookies (lib/consent.ts), the record is
 * kept in local storage, so a return visit weeks later still knows the first
 * touch. Until then it is kept in session storage, for the tab only, and it
 * moves across if they accept.
 */

export interface Touch {
  readonly source?: string;
  readonly medium?: string;
  readonly campaign?: string;
  readonly term?: string;
  readonly content?: string;
  /** The page on another site that linked here. */
  readonly referrer?: string;
  /** The path the visit began on, e.g. /work. */
  readonly landingPage?: string;
  /** When, as an ISO date. */
  readonly at?: string;
}

export interface Attribution {
  readonly first?: Touch;
  readonly last?: Touch;
}

const KEY = "gs-attribution";
const KEEP_FIRST_MS = 90 * 24 * 60 * 60 * 1000;
const TAGS = ["source", "medium", "campaign", "term", "content"] as const;

/* ---- In the browser ------------------------------------------------------- */

/** Once a page load: the visit begins on the page the site was loaded on. */
let noted = false;

/** This visit's way in. Campaign tags are lowercased, as the naming convention writes them. */
function here(): Touch {
  const params = new URLSearchParams(location.search);
  const tags = Object.fromEntries(
    TAGS.map((tag) => [tag, params.get(`utm_${tag}`)?.trim().toLowerCase() || undefined]),
  );
  let referrer: string | undefined;
  try {
    if (document.referrer && new URL(document.referrer).host !== location.host) referrer = document.referrer;
  } catch {}
  return { ...tags, referrer, landingPage: location.pathname, at: new Date().toISOString() };
}

const cameFromSomewhere = (touch: Touch) => Boolean(touch.referrer || TAGS.some((tag) => touch[tag]));

function parse(raw: string | null): Attribution | null {
  try {
    return raw ? (JSON.parse(raw) as Attribution) : null;
  } catch {
    return null;
  }
}

export function readAttribution(): Attribution | undefined {
  try {
    return parse(localStorage.getItem(KEY)) ?? parse(sessionStorage.getItem(KEY)) ?? undefined;
  } catch {
    return undefined;
  }
}

/**
 * Notes this visit, once a page load, and keeps the record where consent
 * allows: local storage with it, session storage without, and never both.
 * Called again when the visitor's choice changes, to move it.
 */
export function noteAttribution(persist: boolean) {
  try {
    let record = readAttribution() ?? null;
    if (!noted) {
      noted = true;
      const touch = here();
      const firstAt = record?.first?.at ? Date.parse(record.first.at) : NaN;
      const first = Date.now() - firstAt < KEEP_FIRST_MS ? record!.first : touch;
      const last = cameFromSomewhere(touch) ? touch : (record?.last ?? touch);
      record = { first, last };
    }
    if (!record) return;
    const [keep, drop] = persist ? [localStorage, sessionStorage] : [sessionStorage, localStorage];
    keep.setItem(KEY, JSON.stringify(record));
    drop.removeItem(KEY);
  } catch {}
}

/* ---- On the server -------------------------------------------------------- */

/** One line, trimmed and cut to length, as the forms' fields are. */
const line = (value: unknown, max: number) =>
  typeof value === "string" ? value.replace(/\s+/g, " ").trim().slice(0, max) : "";

/** A touch as the browser sent it, kept only where it has the shape it should. */
function cleanTouch(value: unknown): Touch | undefined {
  if (!value || typeof value !== "object") return undefined;
  const input = value as Record<string, unknown>;
  const touch: Record<string, string> = {};
  for (const tag of TAGS) {
    const tagValue = line(input[tag], 120).toLowerCase();
    if (tagValue) touch[tag] = tagValue;
  }
  const referrer = line(input.referrer, 500);
  if (/^https?:\/\//.test(referrer)) touch.referrer = referrer;
  const landingPage = line(input.landingPage, 200);
  if (landingPage.startsWith("/")) touch.landingPage = landingPage;
  const at = line(input.at, 40);
  if (at && !Number.isNaN(Date.parse(at))) touch.at = new Date(at).toISOString();
  return Object.keys(touch).length ? touch : undefined;
}

/** The record an enquiry or a sign-up was sent with, cleaned for storing. */
export function cleanAttribution(value: unknown): Attribution {
  const input = value && typeof value === "object" ? (value as Record<string, unknown>) : {};
  return { first: cleanTouch(input.first), last: cleanTouch(input.last) };
}

/** The touches as Sanity stores them, only those there are. */
export const touchFields = ({ first, last }: Attribution) => ({
  ...(first ? { firstTouch: first } : {}),
  ...(last ? { lastTouch: last } : {}),
});
