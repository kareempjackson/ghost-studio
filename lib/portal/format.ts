/**
 * How the portal writes dates, money and names. Shared by server and client
 * components, so both render the same characters: every format is pinned to
 * UTC and en-GB, never the machine's own zone or locale.
 */

/** The prototype's "now". Fixed, so the fixtures' dates read the same every day. */
export const TODAY = "2026-10-10T09:30:00Z";

const DAY_MS = 86_400_000;

const fmt = (options: Intl.DateTimeFormatOptions) =>
  new Intl.DateTimeFormat("en-GB", { timeZone: "UTC", ...options });

/* Months spelled the same three letters every time: Intl's en-GB gives "Sept". */
const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const DAY = { format: (d: Date) => `${d.getUTCDate()} ${MONTHS[d.getUTCMonth()]}` };
const DAY_YEAR = { format: (d: Date) => `${DAY.format(d)} ${d.getUTCFullYear()}` };
const LONG = fmt({ weekday: "long", day: "numeric", month: "long" });
const TIME = fmt({ hour: "2-digit", minute: "2-digit", hour12: false });
const WEEKDAY = fmt({ weekday: "short" });

/** 24 Oct */
export const day = (iso: string) => DAY.format(new Date(iso));
/** 24 Oct 2026 */
export const dayYear = (iso: string) => DAY_YEAR.format(new Date(iso));
/** Saturday 10 October */
export const dayLong = (iso: string) => LONG.format(new Date(iso));
/** 08:47 */
export const time = (iso: string) => TIME.format(new Date(iso));

const midnight = (iso: string) => Math.floor(new Date(iso).getTime() / DAY_MS);

/** Whole days from today to the date: negative once it has passed. */
export const daysUntil = (iso: string) => midnight(iso) - midnight(TODAY);

/** When something happened, as a list would say it: 08:47, Yesterday, Thu, 24 Sep. */
export function when(iso: string) {
  const ago = -daysUntil(iso);
  if (ago <= 0) return time(iso);
  if (ago === 1) return "Yesterday";
  if (ago < 7) return WEEKDAY.format(new Date(iso));
  return day(iso);
}

/** When something is due, as a chip would say it: Due today, 4 days, 3 days late. */
export function due(iso: string) {
  const left = daysUntil(iso);
  if (left === 0) return "Due today";
  if (left === 1) return "Due tomorrow";
  if (left > 1) return `${left} days`;
  return left === -1 ? "1 day late" : `${-left} days late`;
}

/** Numbers in a sequence are always two digits: 01, 02 / 05. */
export const pad = (n: number) => String(n).padStart(2, "0");

/** $9,500 */
export const money = (cents: number) =>
  `$${(cents / 100).toLocaleString("en-US", { maximumFractionDigits: cents % 100 ? 2 : 0, minimumFractionDigits: cents % 100 ? 2 : 0 })}`;

/** A figure set large: the symbol, the whole part and the cents, each sized on its own. */
export function moneyParts(cents: number) {
  const whole = Math.floor(cents / 100).toLocaleString("en-US");
  return { symbol: "$", whole, fraction: `.${String(cents % 100).padStart(2, "0")}` };
}

/** 2.4 MB */
export function bytes(size: number) {
  if (size < 1024) return `${size} B`;
  if (size < 1024 ** 2) return `${Math.round(size / 1024)} KB`;
  return `${(size / 1024 ** 2).toFixed(1)} MB`;
}

/** DW, from Dana Whitfield. */
export const initials = (name: string) =>
  name
    .split(/\s+/)
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

export const firstName = (name: string) => name.split(/\s+/)[0];

/** Good morning, from the fixed "now". */
export function greeting() {
  const hour = new Date(TODAY).getUTCHours();
  if (hour < 12) return "Good morning";
  if (hour < 18) return "Good afternoon";
  return "Good evening";
}

const WEEKDAY_SHORT = fmt({ weekday: "short" });
/** Sat */
export const weekday = (iso: string) => WEEKDAY_SHORT.format(new Date(iso));
/** 10, from 10 October */
export const dateNumber = (iso: string) => new Date(iso).getUTCDate();
/** Saturday or Sunday. */
export const isWeekend = (iso: string) => [0, 6].includes(new Date(iso).getUTCDay());

/** When someone was last here, as a person would say it: Seen at 08:47, Seen yesterday, Seen Thu, Seen 2 Sep. */
export function seen(iso: string) {
  const ago = -daysUntil(iso);
  if (ago <= 0) return `Seen at ${time(iso)}`;
  if (ago === 1) return "Seen yesterday";
  if (ago < 7) return `Seen ${WEEKDAY.format(new Date(iso))}`;
  return `Seen ${day(iso)}`;
}
