/**
 * Ghost Savvy Studios — what a visitor is looking for.
 *
 * Which of the studio's audiences (Who we serve) they seem to be, and which
 * of the site guide's needs they have: two choices from the site's own
 * lists, never their words. It is kept in their browser with their visits
 * (lib/visitor.ts), and the site uses it to put the work closest to theirs
 * first. It is learned from four places, strongest first:
 *
 * - picker: what they answered to the guide's two questions;
 * - guide and box: what Claude judged from what they told the guide, or
 *   typed into the box on the home page;
 * - reading: an audience that two or more of the pages they read were
 *   written for (Tailor with AI, lib/tailor.ts).
 *
 * A weaker source never overwrites a stronger one; the same or a stronger
 * one does. Each choice keeps where it came from, so an audience they picked
 * and a need Claude judged can stand side by side.
 */

export type InterestSource = "picker" | "guide" | "box" | "reading";

const STRENGTH: Record<InterestSource, number> = { picker: 3, guide: 2, box: 2, reading: 1 };

/**
 * A need, as the guide's picker lists it. Its key can change when an editor
 * remakes the list, so the way of working and the discipline it leads to go
 * with it: the rest of the site reads those.
 */
export interface NeedNote {
  readonly key: string;
  /** The track it leads to: build, engage or integrate. */
  readonly track?: string;
  readonly discipline?: string;
}

export interface Interest {
  readonly audience?: { readonly slug: string; readonly from: InterestSource; readonly at: string };
  readonly need?: NeedNote & { readonly from: InterestSource; readonly at: string };
}

/** What one source says: either choice or both. */
export interface InterestNote {
  readonly audience?: string;
  readonly need?: NeedNote;
  readonly from: InterestSource;
}

/** The interest with a new note taken in, where the note is strong enough. */
export function mergeInterest(held: Interest | undefined, note: InterestNote, at = new Date().toISOString()): Interest {
  const wins = (current?: { from: InterestSource }) => !current || STRENGTH[note.from] >= STRENGTH[current.from];
  return {
    ...held,
    ...(note.audience && wins(held?.audience) ? { audience: { slug: note.audience, from: note.from, at } } : {}),
    ...(note.need && wins(held?.need) ? { need: { ...note.need, from: note.from, at } } : {}),
  };
}

/** A need from the guide's catalogue, as it is noted. */
export const needNote = (need: { key: string; track?: string | null; discipline?: string | null }): NeedNote => ({
  key: need.key,
  ...(need.track ? { track: need.track.replace(/^\//, "") } : {}),
  ...(need.discipline ? { discipline: need.discipline } : {}),
});

/** The audience that two or more of the pages read were written for, the most often first. */
export function audienceFromReads(reads: readonly { readonly audiences?: readonly string[] }[]): string | undefined {
  const counts = new Map<string, number>();
  for (const read of reads) {
    for (const audience of new Set(read.audiences ?? [])) counts.set(audience, (counts.get(audience) ?? 0) + 1);
  }
  const [best] = [...counts].sort((a, b) => b[1] - a[1]);
  return best && best[1] >= 2 ? best[0] : undefined;
}
