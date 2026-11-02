/**
 * Ghost Savvy Studios — cookie consent.
 *
 * Visitors in the EEA, the UK and Switzerland are asked before any tracking
 * cookie is set, or every visitor, if Site settings › Tracking says so;
 * everyone else is counted with cookies from the first page, and can still
 * say no from Cookie settings in the footer. Whether this visitor must be
 * asked comes from /api/region, which reads the country Vercel locates them
 * in; if it can't say, they are asked.
 *
 * The choice is kept in a first-party cookie, `gs_consent`, for six months.
 * A cookie that only records the choice is strictly necessary, so it needs
 * no consent of its own. Google's tag reads it before it starts
 * (lib/analytics.ts); PostHog, the ad pixels, the attribution record and the
 * banner follow this store.
 */

export type Choice = "granted" | "denied";

export interface ConsentState {
  /** What the visitor chose, or null if they haven't. */
  readonly choice: Choice | null;
  /** Whether they must be asked: null until it is known. */
  readonly required: boolean | null;
  /** The banner, reopened from the footer's Cookie settings. */
  readonly reopened: boolean;
}

const COOKIE = "gs_consent";
const SIX_MONTHS = 60 * 60 * 24 * 182;

/** Before anything is known: on the server, and on first paint. */
const UNKNOWN: ConsentState = { choice: null, required: null, reopened: false };

let state = UNKNOWN;
let resolving: Promise<void> | null = null;
const listeners = new Set<() => void>();

function set(next: Partial<ConsentState>) {
  state = { ...state, ...next };
  for (const listener of listeners) listener();
}

function stored(): Choice | null {
  const match = document.cookie.match(/(?:^|; )gs_consent=(granted|denied)/);
  return match ? (match[1] as Choice) : null;
}

export const consent = {
  get: () => state,
  getServer: () => UNKNOWN,
  subscribe(listener: () => void) {
    listeners.add(listener);
    return () => {
      listeners.delete(listener);
    };
  },

  /** The choice already made, or else whether this visitor must be asked. Once a page load. */
  resolve(askEveryone = false) {
    resolving ??= (async () => {
      const choice = stored();
      if (choice) return set({ choice });
      if (askEveryone) return set({ required: true });
      const required = await fetch("/api/region")
        .then((response) => response.json() as Promise<{ consentRequired?: boolean }>)
        .then((body) => body.consentRequired !== false)
        .catch(() => true);
      set({ required });
    })();
    return resolving;
  },

  choose(choice: Choice) {
    const secure = location.protocol === "https:" ? "; Secure" : "";
    document.cookie = `${COOKIE}=${choice}; Path=/; Max-Age=${SIX_MONTHS}; SameSite=Lax${secure}`;
    set({ choice, reopened: false });
  },

  reopen: () => set({ reopened: true }),
};

/** Known: the visitor chose, or it is known whether they must be asked. */
export const isSettled = (s: ConsentState) => s.choice !== null || s.required !== null;

/** Whether tracking may set cookies: the visitor said yes, or needn't be asked and hasn't said no. */
export const allowsCookies = (s: ConsentState) => (s.choice ? s.choice === "granted" : s.required === false);

/** Whether the banner is up: reopened, or a choice is owed and not yet made. */
export const asks = (s: ConsentState) => s.reopened || (s.required === true && s.choice === null);
