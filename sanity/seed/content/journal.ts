/**
 * Ghost Savvy Studios — the journal, as the home page shows it.
 *
 * One featured piece at full width, then two more as cards side by side.
 *
 * PLACEHOLDER: the featured image points at the hero poster. Export the
 * comp's plate (the profile card, browser and app icons on the dark ground)
 * to `public/images/` and change `featured.image`. Of the two cards, the
 * engineering one borrows the intro's laptop still; the design one is its
 * lilac ground until the comp's render (the purple folded shapes) is
 * exported. The excerpts are drafts until the articles are written. Every
 * `href` assumes the article exists; any that does not should come off.
 */

export interface JournalEntry {
  readonly slug: string;
  readonly category: string;
  /** One entry per line, as the comp breaks it. */
  readonly title: readonly string[];
  /** One or two sentences under the title: why the piece is worth opening. */
  readonly excerpt: string;
  /** The card's picture, on its ground; the ground alone until there is one. */
  readonly cover: { src: string | null; alt: string; ground: string };
}

export const journal = {
  eyebrow: "The Ghostsavvy journal",
  heading: "A little perspective",
  featured: {
    slug: "clarity-before-the-first-pixel",
    category: "Strategy",
    label: "Featured perspective",
    title: ["Clarity before", "the first pixel."],
    summary:
      "Before choosing a direction, ask a better question. A shared understanding of the problem changes everything that follows.",
    action: "Read the story",
    image: {
      src: "/media/hero-poster.jpg",
      alt: "",
    },
  },
  entries: [
    {
      slug: "design-systems-that-grow-with-you",
      category: "Design",
      title: ["Design systems that", "grow with you."],
      excerpt:
        "A system is only as good as the next thing it lets a team build. Components, tokens and rules that hold as a product grows.",
      cover: { src: null, alt: "", ground: "#e6dcf0" },
    },
    {
      slug: "built-to-be-handed-over",
      category: "Engineering",
      title: ["Built to be", "handed over."],
      excerpt:
        "We write code for the team that inherits it. Clear structure, plain documentation and nothing only we can maintain.",
      cover: { src: "/media/intro-still.jpg", alt: "", ground: "#1a1815" },
    },
  ],
} as const satisfies {
  eyebrow: string;
  heading: string;
  featured: {
    slug: string;
    category: string;
    label: string;
    title: readonly string[];
    summary: string;
    action: string;
    image: { src: string; alt: string };
  };
  entries: readonly JournalEntry[];
};

export const insightHref = (slug: string) => `/insights/${slug}`;
