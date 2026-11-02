/**
 * Ghost Savvy Studios — what Tailor with AI wrote, as the site reads it.
 *
 * Each project carries, for each of the studio's audiences, a card line and
 * a summary (lib/tailor.ts writes them; Project › For each audience holds
 * them). The site shows a visitor the ones for their audience, and the
 * card's own line, or nothing, to everyone else. Safe in the browser and the
 * Studio: no model, no keys.
 */

import type { Tailored } from "../sanity/types";

/** The longest a card line should run: a tagline's length. */
export const CARD_MAX = 90;

/** The project's card line for an audience, if it has one. */
export const cardFor = (tailored: Tailored | null | undefined, audience: string | null | undefined) =>
  audience ? tailored?.cards.find((one) => one.audience === audience)?.line : undefined;
