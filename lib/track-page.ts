/**
 * Ghost Savvy Studios — the shape every track page shares.
 *
 * `/build`, `/engage` and `/integrate` answer the same questions in the same
 * order, so each is one entry of this shape, set by `TrackPage`. The fields
 * match `lib/build.ts`, so `/build` can move onto the template unchanged.
 */

import type { Question, Step } from "./build";

export interface TrackPageData {
  /** The track's slug in lib/engagement.ts, so the list of others leaves it out. */
  readonly slug: string;
  readonly title: string;
  readonly description: string;
  readonly eyebrow: string;
  readonly heading: readonly string[];
  readonly summary: string;
  readonly action: { readonly label: string; readonly href: string };
  readonly plate: {
    readonly src: string | null;
    readonly alt: string;
    /** The plate's colour until the photograph is in, picked off the comp. */
    readonly ground: string;
  };
  /** Two facts and the way to compare, set in a row under the plate. */
  readonly terms: {
    readonly price: string;
    readonly minimum: string;
    readonly compare: { readonly label: string; readonly href: string };
  };
  readonly who: {
    readonly label: string;
    readonly heading: readonly string[];
    readonly deck: string;
  };
  readonly shape: {
    readonly label: string;
    readonly heading: string;
    readonly items: readonly Step[];
  };
  readonly process: {
    readonly label: string;
    readonly heading: readonly string[];
    readonly items: readonly Step[];
  };
  readonly questions: {
    readonly label: string;
    readonly heading: string;
    readonly items: readonly Question[];
  };
  readonly others: { readonly label: string };
}
