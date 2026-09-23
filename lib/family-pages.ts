/**
 * Ghost Savvy Studios — the family pages, `/ghost-labs`, `/ghost-u` and
 * `/ghost-gives`.
 *
 * One shape, set from their comps: the claim with notes stuck around it, a
 * band on what it is, the ask, and the rest of the family.
 *
 * PLACEHOLDER: the archive plates are stand-ins, as the comps' own decks say.
 * The cover card is the basketball “Ghost” poster in the comps; it is not
 * exported yet. Drop it into `public/images/` at 2x and set `card.src`.
 */

export interface Experiment {
  readonly title: string;
  readonly body: string;
  /** The plate, until there is a picture of the thing. */
  readonly ground: string;
}

export interface Note {
  readonly text: string;
  readonly ground: string;
}

export interface FamilyPageData {
  /** The route, so the family list can leave this page out. */
  readonly href: string;
  readonly title: string;
  readonly description: string;
  readonly cover: {
    readonly heading: readonly string[];
    readonly summary: string;
    readonly action: { readonly label: string; readonly href: string };
    /** Two notes: one high on the left, one lower and further in. */
    readonly notes: readonly [Note, Note];
    readonly card: { readonly src: string | null; readonly alt: string };
  };
  readonly archive: {
    readonly label: string;
    readonly heading: readonly string[];
    readonly deck: string;
    readonly items: readonly Experiment[];
  };
  readonly ask: {
    readonly label: string;
    readonly heading: readonly string[];
    readonly summary: string;
    readonly action: { readonly label: string; readonly href: string };
  };
  readonly family: { readonly label: string; readonly heading: readonly string[] };
}

const VERMILION = "#eb5b32";
const LILAC = "#dcd3ea";
const ACID = "#e0eab4";

const card = {
  src: null,
  alt: "A Ghost Savvy poster: a basketball player rising through the Ghost wordmark.",
} as const;

const family = {
  label: "The Ghost family",
  heading: ["Room for work", "beyond the brief."],
} as const;

/** The plates both comps set, word for word, until each has its own. */
const placeholderItems: readonly Experiment[] = [
  { title: "Product experiments", body: "Details to come.", ground: VERMILION },
  { title: "Tools for the studio", body: "Details to come.", ground: LILAC },
  { title: "Early prototypes", body: "Details to come.", ground: ACID },
  { title: "Open questions", body: "Details to come.", ground: LILAC },
];

export const labsPage: FamilyPageData = {
  href: "/ghost-labs",
  title: "Ghost Labs",
  description:
    "Where Ghost Savvy experiments: ideas that need a working prototype before they need a pitch.",
  cover: {
    heading: ["Ideas need", "room to", "play."],
    summary:
      "Where we experiment. A space for ideas that need a working prototype before they need a pitch.",
    action: { label: "Share an idea", href: "/contact" },
    notes: [
      { text: "What if?", ground: VERMILION },
      { text: "Try it.", ground: ACID },
    ],
    card,
  },
  archive: {
    label: "Experiment archive",
    heading: ["A place for what", "we’re exploring."],
    deck: "A preview of the direction. These are placeholders, not published projects or available programmes.",
    items: placeholderItems,
  },
  ask: {
    label: "Stay in the conversation",
    heading: ["Have something", "worth testing?"],
    summary: "Send us a note. We’ll take it from there.",
    action: { label: "Share an idea", href: "/contact" },
  },
  family,
};

/**
 * PLACEHOLDER: the comp carries the Labs cover sentence and the Labs plates
 * over unchanged. Both are set here as the comp has them; replace them when
 * the programme's own copy is signed off.
 */
export const ghostUPage: FamilyPageData = {
  href: "/ghost-u",
  title: "Ghost U",
  description:
    "The learning side of Ghost Savvy: a programme on defining problems and making decisions before starting to build.",
  cover: {
    heading: ["Learn to ask", "better", "questions."],
    summary:
      "Where we experiment. A space for ideas that need a working prototype before they need a pitch.",
    action: { label: "Share an idea", href: "/contact" },
    notes: [
      { text: "Ask why.", ground: LILAC },
      { text: "Then make.", ground: LILAC },
    ],
    card,
  },
  archive: {
    label: "Programme in development",
    heading: ["Better questions can", "be taught."],
    deck: "Ghost U is the learning side of the studio. The proposed programme focuses on defining problems and making decisions before starting to build.",
    items: placeholderItems,
  },
  ask: {
    label: "Stay in the conversation",
    heading: ["Want to hear", "when it’s ready?"],
    summary: "Send us a note. We’ll take it from there.",
    action: { label: "Ask about Ghost U", href: "/contact" },
  },
  family,
};

/**
 * PLACEHOLDER: the comp carries the Labs plates over unchanged, and its cover
 * button reads “Ask about Ghost U”. Both are set here as the comp has them;
 * replace them when the programme's own copy is signed off.
 */
export const givesPage: FamilyPageData = {
  href: "/ghost-gives",
  title: "Ghost Gives",
  description:
    "Where Ghost Savvy gives the work away: making space for organisations and ideas that could use the studio's skills.",
  cover: {
    heading: ["Good work.", "More people."],
    summary:
      "Where we give the work away. Making space for organisations and ideas that could use our skills.",
    action: { label: "Ask about Ghost U", href: "/contact" },
    notes: [
      { text: "Pass it on.", ground: ACID },
      { text: "Make it matter.", ground: ACID },
    ],
    card,
  },
  archive: {
    label: "Programme in development",
    heading: ["Make room for", "useful work."],
    deck: "Ghost Gives is a space for the studio to contribute its skills beyond commercial engagements. The programme format and eligibility are still being shaped.",
    items: placeholderItems,
  },
  ask: {
    label: "Stay in the conversation",
    heading: ["Know a project we", "should hear about?"],
    summary: "Send us a note. We’ll take it from there.",
    action: { label: "Tell us about it", href: "/contact" },
  },
  family,
};
