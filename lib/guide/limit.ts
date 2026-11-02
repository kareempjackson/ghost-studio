/**
 * How often the site guide may be asked: the cap on what its answers cost.
 *
 * Three counts, kept before a question reaches Anthropic. A visitor may ask
 * a few in a minute, which nobody reading the answers needs to beat, and a
 * couple of conversations' worth in a day; the whole site may ask a set
 * number in a day, which holds the bill to a few dollars however many
 * visitors, or addresses, there are.
 *
 * The counts live in Upstash Redis (REDIS_KV_REST_API_URL and _TOKEN, as the
 * Vercel integration set them for this project; KV_REST_API_ or
 * UPSTASH_REDIS_REST_ work too), which every instance shares: Vercel runs many, and a count one instance keeps in memory is no
 * limit. In production the guide takes no questions without it; in
 * development a count in memory stands in. A visitor is counted by a keyed
 * hash of their address, never the address itself, and a count goes when
 * its window does. When Redis can't be reached, the question is refused.
 */

import "server-only";
import { createHmac } from "node:crypto";
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";
import { SITE_URL } from "@/lib/site";
import { GUIDE_ON } from "./protocol";

/** Questions one visitor may ask in a minute. */
const PER_MINUTE = 5;
/** Questions one visitor may ask in a day: two full conversations and more. */
const PER_DAY = 30;
/** Questions the whole site may ask in a day (UTC): at a cent or two each, $2 to $4. */
const SITE_PER_DAY = 200;
/** Searches one visitor may make from the home page's box (Describe.tsx) in a minute, and in a day. */
const MATCH_PER_MINUTE = 3;
const MATCH_PER_DAY = 10;
/** How long to wait for Redis before refusing the question. */
const TIMEOUT = 2000;

const url =
  process.env.REDIS_KV_REST_API_URL || process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL;
const token =
  process.env.REDIS_KV_REST_API_TOKEN || process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN;
const redis = url && token ? new Redis({ url, token }) : null;

/** Whether the guide may answer questions: on, with a key, and with counts that hold. */
export const canAsk =
  GUIDE_ON &&
  Boolean(process.env.ANTHROPIC_API_KEY) &&
  (Boolean(redis) || process.env.NODE_ENV !== "production");

const windows = {
  minute: { max: PER_MINUTE, ms: 60_000, limiter: Ratelimit.slidingWindow(PER_MINUTE, "1 m") },
  day: { max: PER_DAY, ms: 86_400_000, limiter: Ratelimit.fixedWindow(PER_DAY, "1 d") },
  site: { max: SITE_PER_DAY, ms: 86_400_000, limiter: Ratelimit.fixedWindow(SITE_PER_DAY, "1 d") },
  matchMinute: { max: MATCH_PER_MINUTE, ms: 60_000, limiter: Ratelimit.slidingWindow(MATCH_PER_MINUTE, "1 m") },
  matchDay: { max: MATCH_PER_DAY, ms: 86_400_000, limiter: Ratelimit.fixedWindow(MATCH_PER_DAY, "1 d") },
};
type Window = keyof typeof windows;

const limiters =
  redis &&
  (Object.fromEntries(
    Object.entries(windows).map(([name, { limiter }]) => [
      name,
      new Ratelimit({ redis, limiter, prefix: `guide:${name}`, timeout: TIMEOUT }),
    ]),
  ) as Record<Window, Ratelimit>);

/* Development, without Redis: one process, so its memory will do. */
const memory = new Map<string, number[]>();

function inMemory(window: Window, id: string) {
  const { max, ms } = windows[window];
  const now = Date.now();
  const times = (memory.get(`${window}:${id}`) ?? []).filter((time) => now - time < ms);
  if (times.length >= max) return false;
  memory.set(`${window}:${id}`, [...times, now]);
  return true;
}

/** Counts one more question in this window, and whether it fits. */
async function within(window: Window, id: string) {
  if (!limiters) return inMemory(window, id);
  try {
    const { success, reason } = await limiters[window].limit(id);
    return success && reason !== "timeout";
  } catch (error) {
    console.error("[guide] the limit couldn't be checked", error);
    return false;
  }
}

/**
 * Who is asking, as an address: the first hop Vercel records, which it sets
 * itself. IPv6 by its /64, the block one connection is given, so stepping
 * through it doesn't make a new visitor.
 */
function visitor(request: Request) {
  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    request.headers.get("x-real-ip") ||
    "unknown";
  let address = ip;
  if (ip.includes(":") && !ip.includes(".")) {
    const [head, tail] = ip.split("::");
    const left = head ? head.split(":") : [];
    const right = tail ? tail.split(":") : [];
    const groups = tail === undefined ? left : [...left, ...Array(8 - left.length - right.length).fill("0"), ...right];
    address = `${groups.slice(0, 4).join(":")}::/64`;
  }
  const key = process.env.GUIDE_SECRET || process.env.ANTHROPIC_API_KEY || "guide";
  return createHmac("sha256", key).update(address).digest("base64url").slice(0, 22);
}

/**
 * Whether this visitor may ask again: "busy" if they are asking faster than
 * the answers can be read, "limit" once they have asked their day's worth.
 */
export async function visitorMay(request: Request): Promise<"ok" | "busy" | "limit"> {
  const id = visitor(request);
  const [minute, day] = await Promise.all([within("minute", id), within("day", id)]);
  return !minute ? "busy" : !day ? "limit" : "ok";
}

/**
 * Whether this visitor may search from the box on the home page again: its
 * own counts, kept apart from the guide's, so one never uses up the other.
 */
export async function matchMay(request: Request): Promise<"ok" | "busy" | "limit"> {
  const id = visitor(request);
  const [minute, day] = await Promise.all([within("matchMinute", id), within("matchDay", id)]);
  return !minute ? "busy" : !day ? "limit" : "ok";
}

/** Whether the site has questions left today, counting this one: the guide's and the box's together. */
export const siteMay = () => within("site", "all");

/** A browser on this site: its Origin is the site's, or the address the request came in at. */
export function fromTheSite(request: Request) {
  const origin = request.headers.get("origin");
  if (!origin) return false;
  return origin === new URL(SITE_URL).origin || origin === new URL(request.url).origin;
}
