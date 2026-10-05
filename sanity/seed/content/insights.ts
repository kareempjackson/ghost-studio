/**
 * Ghost Savvy Studios — `/insights`.
 *
 * The journal's index: the cover, then every piece as a card, filtered by
 * what it is about. Set from the `/insights` comp.
 *
 * PLACEHOLDER: the three pieces are the comp's samples, and it says so on the
 * cover and on every card. They have no pages yet, so the cards are not
 * links; give a piece an `href` once it is written, and a `cover` once its
 * plate is exported to `public/images/`.
 */

export const topics = ["Strategy", "Design", "Engineering"] as const;

export type Topic = (typeof topics)[number];

export interface Article {
  readonly slug: string;
  readonly topic: Topic;
  readonly title: string;
  readonly excerpt: string;
  readonly href: string | null;
  readonly cover: { readonly src: string; readonly alt: string } | null;
}

export const insightsPage = {
  title: "Insights",
  description:
    "Notes from the work: ideas on strategy, design and building useful things.",
  eyebrow: "Insights",
  heading: ["Notes from", "the work."],
  summary:
    "Ideas on strategy, design and building useful things. Sample articles for this website preview.",
  /** Set after the topic on every card while the pieces are samples. */
  status: "Sample article",
  all: "All",
  filterLabel: "Filter the articles by topic",
  empty: "Nothing on this yet.",
} as const;

export const articles: readonly Article[] = [
  {
    slug: "clarity-before-the-first-pixel",
    topic: "Strategy",
    title: "Clarity before the first pixel",
    excerpt:
      "Before a team can agree on a solution, it needs a shared understanding of the problem.",
    href: null,
    cover: null,
  },
  {
    slug: "design-systems-that-grow-with-you",
    topic: "Design",
    title: "Design systems that grow with you",
    excerpt:
      "A shared system should make the next decision easier, without making every experience the same.",
    href: null,
    cover: null,
  },
  {
    slug: "built-to-be-handed-over",
    topic: "Engineering",
    title: "Built to be handed over",
    excerpt:
      "Ownership is easier when the working knowledge travels with the working product.",
    href: null,
    cover: null,
  },
];
