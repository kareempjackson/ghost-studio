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
 * the first draft of this file. `copy` is the paragraph the home page
 * carries; `/services` sets each model by who it is for and what it costs
 * instead, `audience` and `terms`.
 */

export interface EngagementModel {
  readonly slug: string;
  readonly name: string;
  /** What the model is, in three words or fewer. */
  readonly kind: string;
  readonly copy: string;
  /** Who the model is for, in one sentence. */
  readonly audience: string;
  /** The commercial shape, as short as a price tag. */
  readonly terms: string;
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
      copy: "Ongoing design, engineering and product direction for a business with work to keep moving.",
      audience:
        "For funded teams past MVP who need more disciplines than they can hire.",
      terms: "Six-month minimum · From $15,000/month",
      action: {
        label: "Discuss an ongoing team",
        href: "/contact?model=build",
      },
    },
    {
      slug: "engage",
      name: "Engage",
      kind: "Scoped project",
      copy: "A scoped project, from discovery and design through delivery and handover.",
      audience:
        "For organisations that need named deliverables and a clear procurement process.",
      terms: "Scoped against the problem",
      action: { label: "Talk about a project", href: "/contact?model=engage" },
    },
    {
      slug: "integrate",
      name: "Integrate",
      kind: "The business behind the work",
      copy: "Cloud, identity, collaboration and automation that help the organisation operate.",
      audience:
        "For businesses that need the operational layer built as carefully as the product.",
      terms: "Ongoing or project-based",
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
