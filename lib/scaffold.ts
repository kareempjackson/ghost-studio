/**
 * Ghost Savvy Studios — scaffold pages.
 *
 * TEST DATA, all of it. These are placeholder pages so the routes exist, link
 * up and can be walked through before each one is designed. Every string here
 * is a stand-in written to the right shape and length, not approved copy.
 * When a page is built out properly, its entry comes off this file and the
 * route stops using `ScaffoldPage`.
 */

export interface ScaffoldItem {
  readonly title: string;
  readonly body: string;
  /** A small label above the title: a category, a date, a stat. */
  readonly meta?: string;
  readonly href?: string;
}

export interface ScaffoldSection {
  readonly label: string;
  readonly title: string;
  readonly body?: string;
  readonly items?: readonly ScaffoldItem[];
}

export interface ScaffoldPageData {
  readonly slug: string;
  /** The <title> and the browser tab. */
  readonly title: string;
  readonly description: string;
  readonly eyebrow: string;
  /** The cover heading, one entry per line. */
  readonly heading: readonly string[];
  readonly summary: string;
  readonly action: { readonly label: string; readonly href: string };
  readonly sections: readonly ScaffoldSection[];
}

const LOREM =
  "Placeholder copy written to length. It will be replaced with the real paragraph once this page is designed and the content is signed off.";

export const scaffoldPages = {

  "our-approach": {
    slug: "our-approach",
    title: "Our approach",
    description:
      "How Ghost Savvy Studios works: clarity first, then the build.",
    eyebrow: "Our approach",
    heading: ["Clarity before", "the first pixel."],
    summary:
      "We define the problem properly, then build the system that solves it. Accessible from the start, and yours to run afterwards. Test content.",
    action: { label: "See how we work", href: "/services" },
    sections: [
      {
        label: "Principles",
        title: "Three things we hold to.",
        items: [
          {
            meta: "01",
            title: "Clarity",
            body: "Placeholder: start with the right question.",
          },
          {
            meta: "02",
            title: "Judgement",
            body: "Placeholder: give the work a clear direction.",
          },
          {
            meta: "03",
            title: "Ownership",
            body: "Placeholder: take responsibility for what is next.",
          },
        ],
      },
      {
        label: "Process",
        title: "Discover, define, build, evolve.",
        body: LOREM,
      },
      {
        label: "The team",
        title: "Specialists, in one room.",
        body: LOREM,
      },
    ],
  },

} as const satisfies Record<string, ScaffoldPageData>;

export type ScaffoldSlug = keyof typeof scaffoldPages;
