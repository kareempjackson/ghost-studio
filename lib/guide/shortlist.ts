/**
 * The site guide's shortlist: what two answers, who the work is for and what
 * it needs, narrow the site to before anyone types a word.
 *
 * Pure, so the panel draws it the moment the second answer is picked, with no
 * round trip, and the guide's answers are written knowing what it already
 * showed (app/api/guide). Every path it returns has a card in the catalogue,
 * which leaves out the work the guide must never recommend.
 */

import type { GuideCatalogue } from "@/sanity/types";

/** The two answers. An audience's slug or OTHER; a need's key or UNSURE. */
export interface Profile {
  readonly audience: string | null;
  readonly need: string | null;
}

export interface Shortlist {
  /** The cards, in order: the work, then the way of working, then the reading. */
  readonly paths: readonly string[];
  /** The audience's own page, linked under the cards, when it has one. */
  readonly audience: { readonly path: string; readonly name: string } | null;
}

/** The chip after the audiences, for anyone else. */
export const OTHER = "other";
/** The last need, for someone who doesn't know yet. */
export const UNSURE = "unsure";

/** How many projects the shortlist leads with. */
const WORK = 2;

/**
 * The work closest to theirs, the way of working that fits, and something to
 * read. The work is, in order: the project the audience's page closes on, the
 * one the need's track closes on, then work of the need's discipline in
 * /work's order, then anything else in that order, so the shortlist is never
 * short of work. Someone who doesn't know what they need is pointed at the
 * first phase of the approach rather than a track.
 */
export function shortlist(catalogue: GuideCatalogue, profile: Profile): Shortlist {
  const audience = catalogue.audiences.find((one) => one.slug === profile.audience) ?? null;
  const need = catalogue.needs.find((one) => one.key === profile.need) ?? null;
  const track = need?.track ? (catalogue.tracks.find((one) => one.path === need.track) ?? null) : null;
  const shown = (path: string | null | undefined): path is string => Boolean(path && catalogue.cards[path]);

  const work: string[] = [];
  const take = (path: string | null | undefined) => {
    if (shown(path) && work.length < WORK && !work.includes(path)) work.push(path);
  };
  take(audience?.featured);
  take(track?.featured);
  if (need?.discipline) {
    for (const project of catalogue.projects) {
      if (project.disciplines.includes(need.discipline)) take(project.path);
    }
  }
  for (const project of catalogue.projects) take(project.path);

  const way = shown(track?.path) ? track.path : shown(catalogue.start) ? catalogue.start : null;
  const reading =
    (need?.topic && catalogue.insights.find((insight) => insight.topic === need.topic)) ||
    catalogue.insights[0];

  const page = audience?.hasPage ? `/who-we-serve/${audience.slug}` : null;
  return {
    paths: [...work, way, reading?.path].filter(shown),
    audience: audience && page ? { path: page, name: audience.name } : null,
  };
}
