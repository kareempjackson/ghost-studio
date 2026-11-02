/**
 * How often the site guide may be asked: the cap on what its answers cost.
 *
 * Three counts, kept before a question reaches Anthropic. A visitor may ask
 * a few in a minute, which nobody reading the answers needs to beat, and a
 * couple of conversations' worth in a day; the whole site may ask a set
 * number in a day, which holds the bill to a few dollars however many
 * visitors, or addresses, there are.
 *
 * The counts live in Upstash Redis (UPSTASH_REDIS_REST_URL and _TOKEN, or the
 * KV_REST_API_ pair the Vercel integration sets), which every instance
 * shares: Vercel runs many, and a count one instance keeps in memory is no
 * limit. In production the guide takes no questions without it; in
 * development a count in memory stands in. A visitor is counted by a keyed
 * hash of their address, never the address itself, and a count goes when
 * its window does. When Redis can't be reached, the question is refused.
 */

import "server-only";
import { createHmac } from "node:crypto";
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";
import { GUIDE_ON } from "./protocol";

/** Questions one visitor may ask in a minute. */
const PER_MINUTE = 5;
/** Questions one visitor may ask in a day: two full conversations and more. */
const PER_DAY = 30;
/** Questions the whole site may ask in a day (UTC): at a cent or two each, $2 to $4. */
const SITE_PER_DAY = 200;
/** How long to wait for Redis before refusing the question. */
const TIMEOUT = 2000;

const redis =
  process.env.UPSTASH_REDIS_REST_URL || process.env.KV_REST_API_URL ? Redis.fromEnv() : null;

/** Whether the guide may answer questions: on, with a key, and with counts that hold. */
export const canAsk =
  GUIDE_ON &&
  Boolean(process.env.ANTHROPIC_API_KEY) &&
  (Boolean(redis) || process.env.NODE_ENV !== "production");

const windows = {
  minute: { max: PER_MINUTE, ms: 60_000, limiter: Ratelimit.slidingWindow(PER_MINUTE, "1 m") },
  day: { max: PER_DAY, ms: 86_400_000, limiter: Ratelimit.fixedWindow(PER_DAY, "1 d") },
  site: { max: SITE_PER_DAY, ms: 86_400_000, limiter: Ratelimit.fixedWindow(SITE_PER_DAY, "1 d") },
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

/** Whether the site has questions left today, counting this one. */
export const siteMay = () => within("site", "all");
