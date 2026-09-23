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

  insights: {
    slug: "insights",
    title: "Insights",
    description:
      "Perspectives from the studio on strategy, design and engineering.",
    eyebrow: "The Ghostsavvy journal",
    heading: ["A little", "perspective."],
    summary:
      "Notes from the work: what we have learned, what we would do differently, and what we think is coming. Test content.",
    action: { label: "Subscribe for new pieces", href: "/contact" },
    sections: [
      {
        label: "Latest",
        title: "Recent perspectives.",
        items: [
          {
            meta: "Strategy · Placeholder",
            title: "Clarity before the first pixel",
            body: "Placeholder summary of the piece, a sentence or two long.",
            href: "/insights",
          },
          {
            meta: "Design · Placeholder",
            title: "Design systems that grow with you",
            body: "Placeholder summary of the piece, a sentence or two long.",
            href: "/insights",
          },
          {
            meta: "Engineering · Placeholder",
            title: "Built to be handed over",
            body: "Placeholder summary of the piece, a sentence or two long.",
            href: "/insights",
          },
          {
            meta: "Studio · Placeholder",
            title: "How we work, together",
            body: "Placeholder summary of the piece, a sentence or two long.",
            href: "/insights",
          },
          {
            meta: "Strategy · Placeholder",
            title: "The brief is the product",
            body: "Placeholder summary of the piece, a sentence or two long.",
            href: "/insights",
          },
          {
            meta: "Engineering · Placeholder",
            title: "Accessible from the start",
            body: "Placeholder summary of the piece, a sentence or two long.",
            href: "/insights",
          },
        ],
      },
    ],
  },



  "who-we-serve": {
    slug: "who-we-serve",
    title: "Who we serve",
    description: "Governments, universities and mission-driven organisations.",
    eyebrow: "Who we work with",
    heading: ["The people", "accountable."],
    summary:
      "Governments, universities and mission-driven organisations — the people accountable when a service fails in public. Test content.",
    action: { label: "Talk to us about your sector", href: "/contact" },
    sections: [
      {
        label: "Sectors",
        title: "Where we do our best work.",
        items: [
          {
            meta: "01",
            title: "Local and municipal government",
            body: "Public websites, engagement platforms, and service portals.",
          },
          {
            meta: "02",
            title: "National agencies and regulators",
            body: "Case management, licensing, and the systems behind a statutory duty.",
          },
          {
            meta: "03",
            title: "Universities and research institutes",
            body: "Admissions, student services, and the tools research is published through.",
          },
          {
            meta: "04",
            title: "Mission-driven organisations",
            body: "Grant programmes, member services, and the platforms a campaign runs on.",
          },
        ],
      },
      {
        label: "What they share",
        title: "No room to get it wrong.",
        body: LOREM,
      },
    ],
  },
} as const satisfies Record<string, ScaffoldPageData>;

export type ScaffoldSlug = keyof typeof scaffoldPages;
