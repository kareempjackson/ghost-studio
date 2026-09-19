/**
 * Ghost Savvy Studios — how the studio is bought.
 *
 * Three ways to work together, in descending order of how much the studio
 * owns: a defined project, a standing relationship, and people inside the
 * client's own team. Each has a one-word name, what it is in three words, a
 * paragraph, and the way through.
 *
 * PLACEHOLDER: the Integrate copy is from the comp. Build and Engage are
 * written to the same shape and need confirming.
 */

export interface EngagementModel {
  readonly slug: string;
  readonly name: string;
  /** What the model is, in three words or fewer. */
  readonly kind: string;
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
      kind: "Project partnership",
      /* PLACEHOLDER — confirm. */
      copy: "A defined piece of work, from first question to launch. We scope it, design it and build it with you, then hand over a product your team can run.",
      action: { label: "Start a project", href: "/contact?model=build" },
    },
    {
      slug: "engage",
      name: "Engage",
      kind: "Ongoing support",
      /* PLACEHOLDER — confirm. */
      copy: "A standing team on call every month. Design, engineering and strategy that keep your product moving, improving and ready for what comes next.",
      action: { label: "Keep us on hand", href: "/contact?model=engage" },
    },
    {
      slug: "integrate",
      name: "Integrate",
      kind: "Embedded team",
      copy: "Specialist thinking, embedded in your team. We work with your people and processes, bringing design and engineering capacity to the challenges that matter.",
      action: {
        label: "Bring us into your team",
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
