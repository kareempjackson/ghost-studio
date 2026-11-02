/**
 * What passes between the site guide's panel and app/api/guide.
 *
 * The panel sends the conversation so far, the new question, and where the
 * visitor is. The conversation travels as the server sealed it, turn by
 * turn, so the guide's earlier answers come back exactly as they were given
 * and nobody can write a turn of their own into it.
 *
 * The answer comes back as newline-delimited JSON, one event per line: its
 * words as they are written, the pages it points to, a brief if it drafted
 * one, then the turn to keep.
 */

import type { GuideCard } from "@/sanity/types";
import type { Profile } from "./shortlist";

/**
 * Whether the guide is on. Turned off, no page draws the pill and
 * app/api/guide answers that it is off.
 */
export const GUIDE_ON = true;

/** Questions one conversation can ask before the guide hands over to the team. */
export const MAX_TURNS = 12;
/** The longest question, in characters. */
export const MAX_QUESTION = 600;

/** Where the visitor is, as the panel sees it. */
export interface GuideContext {
  /** The page the panel is open on. */
  readonly path: string;
  /** The pages read in this tab, oldest first. */
  readonly visited: readonly string[];
  readonly profile: Profile;
  /** The pages the shortlist and earlier answers have shown. */
  readonly shown: readonly string[];
}

/** One question and its answer, as the API had them: JSON, and the server's seal over it. */
export interface SealedTurn {
  readonly raw: string;
  readonly seal: string;
}

export interface GuideRequest {
  readonly turns: readonly SealedTurn[];
  readonly question: string;
  readonly context: GuideContext;
}

export interface GuidePick {
  readonly card: GuideCard;
  readonly why: string;
}

export interface GuideBrief {
  readonly summary: string;
  readonly help: readonly string[];
}

/**
 * Why there is no answer: the guide is switched off, too many questions came
 * at once, the conversation has run its length, the model declined, or
 * something else went wrong.
 */
export type GuideError = "off" | "busy" | "limit" | "declined" | "failed";

export type GuideEvent =
  | { readonly t: "text"; readonly v: string }
  | { readonly t: "picks"; readonly v: readonly GuidePick[] }
  | { readonly t: "brief"; readonly v: GuideBrief }
  | { readonly t: "turn"; readonly v: SealedTurn }
  | { readonly t: "done" }
  | { readonly t: "error"; readonly v: GuideError };
