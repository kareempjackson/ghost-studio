/**
 * Ghost Savvy Studios — the journal, as the home page shows it.
 *
 * One featured piece at full width, then the three after it as a ruled list.
 *
 * PLACEHOLDER: the featured image points at the hero poster. Export the
 * comp's plate (the profile card, browser and app icons on the dark ground)
 * to `public/images/` and change `featured.image`. Every `href` assumes the
 * article exists; any that does not should come off the list.
 */

export interface JournalEntry {
  readonly slug: string;
  readonly category: string;
  readonly title: string;
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
      title: "Design systems that grow with you",
    },
    {
      slug: "built-to-be-handed-over",
      category: "Engineering",
      title: "Built to be handed over",
    },
    {
      slug: "how-we-work-together",
      category: "Studio",
      title: "How we work, together",
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

export const journalHref = (slug: string) => `/journal/${slug}`;
