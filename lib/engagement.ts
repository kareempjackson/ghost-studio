/**
 * Ghost Savvy Studios — how the studio is bought.
 *
 * Three ways to work together, in descending order of how much the studio
 * owns: a defined project, a standing relationship, and people inside the
 * client's own team. Each has a one-word name, what it is in three words, a
 * paragraph, and the way through.
 *
 * The three are set from the `/services` comp, which reads Build as the
 * standing team and Engage as the scoped project — the other way round from
 * the first draft of this file. `headline` is the two-line version the cards
 * on `/services` carry; `copy` is the paragraph under it.
 */

export interface EngagementModel {
  readonly slug: string;
  readonly name: string;
  /** What the model is, in three words or fewer. */
  readonly kind: string;
  /** The offer, set as two lines on the card. */
  readonly headline: readonly string[];
  readonly copy: string;
  readonly action: { readonly label: string; readonly href: string };
}

export const engagement = {
  chip: "Our approach",
  title: "Working with Ghost Savvy",
  subtitle: "Three ways to work together",
  image: {
    src: "/images/merch.png",
    width: 326,
    height: 347,
    alt: "The back of a black Ghost Savvy t-shirt reading “Unclear brief, shipped product.”",
  },
  models: [
    {
      slug: "build",
      name: "Build",
      kind: "Standing team",
      headline: ["A team that", "stays with you."],
      copy: "Ongoing design, engineering and product direction for a business with work to keep moving.",
      action: {
        label: "Discuss an ongoing team",
        href: "/contact?model=build",
      },
    },
    {
      slug: "engage",
      name: "Engage",
      kind: "Scoped project",
      headline: ["A clear brief.", "A defined outcome."],
      copy: "A scoped project, from discovery and design through delivery and handover.",
      action: { label: "Talk about a project", href: "/contact?model=engage" },
    },
    {
      slug: "integrate",
      name: "Integrate",
      kind: "The business behind the work",
      headline: ["The systems", "behind the business."],
      copy: "Cloud, identity, collaboration and automation that help the organisation operate.",
      action: {
        label: "Explore your systems",
        href: "/contact?model=integrate",
      },
    },
  ],
} as const satisfies {
  chip: string;
  title: string;
  subtitle: string;
  image: { src: string; width: number; height: number; alt: string };
  models: readonly EngagementModel[];
};
