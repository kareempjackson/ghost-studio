/**
 * Ghost Savvy Studios — what the studio is hired to do.
 *
 * Six disciplines, in the order the work usually runs: the problem is
 * defined, the business is made recognisable, the product is designed and
 * built, and then it has to be taken to market and kept alive. Every
 * capability is a line item a procurement officer could put on a contract.
 *
 * One list, read three ways: the home page deals the deck, `/services`
 * opens them one at a time, and `/contact` offers the same six as the thing
 * a visitor needs help with. The names have to agree, so they live here.
 *
 * PLACEHOLDER: `promise` and the capability lines beyond Strategy are
 * written to the comp's shape and need confirming.
 */

export interface Service {
  /** The anchor on /services this card opens onto. */
  readonly slug: string;
  readonly name: string;
  /** What the discipline is for, in one line. */
  readonly promise: string;
  /** Line items, in the order they are usually bought. */
  readonly capabilities: readonly string[];
  /** The way through, from the open row. */
  readonly action: string;
}

export const services = {
  eyebrow: "Services",
  /**
   * One label for every card. The card's own name is added to the accessible
   * name, so six links read out of context are six destinations.
   */
  cta: "See how we work",
  items: [
    {
      slug: "strategy",
      name: "Strategy",
      promise: "Define the problem. Choose a direction.",
      capabilities: [
        "Discovery & research",
        "Positioning & product direction",
        "System blueprints",
      ],
      action: "Let’s talk strategy",
    },
    {
      slug: "brand",
      name: "Brand",
      promise: "Make the business recognisable everywhere.",
      capabilities: [
        "Identity & visual systems",
        "Messaging & tone of voice",
        "Brand guidelines & rollout",
      ],
      action: "Let’s talk brand",
    },
    {
      slug: "design",
      name: "Design",
      promise: "Turn complexity into a useful experience.",
      capabilities: [
        "Product & interface design",
        "Design systems",
        "Prototyping, testing & accessibility",
      ],
      action: "Let’s talk design",
    },
    {
      slug: "technology",
      name: "Technology",
      promise: "Build the product and the foundation beneath it.",
      capabilities: [
        "Web & application engineering",
        "Platforms, cloud & integration",
        "Security, support & handover",
      ],
      action: "Let’s talk technology",
    },
    {
      slug: "marketing",
      name: "Marketing",
      promise: "Connect attention to action.",
      capabilities: [
        "Campaign & channel strategy",
        "Content & lifecycle marketing",
        "Measurement & optimisation",
      ],
      action: "Let’s talk marketing",
    },
    {
      slug: "creative-production",
      name: "Creative production",
      promise: "Give the story a life beyond the page.",
      capabilities: [
        "Art direction & photography",
        "Film, motion & animation",
        "Environmental & print",
      ],
      action: "Let’s talk production",
    },
  ],
} as const satisfies {
  eyebrow: string;
  cta: string;
  items: readonly Service[];
};

/** `/services` itself: the cover, the bands, and the way on. */
export const servicesPage = {
  title: "Services",
  description:
    "Strategy, design and engineering under one roof. Ghost Savvy Studios shapes the team around the problem, then builds it with you.",
  eyebrow: "Our services",
  heading: ["Clarity first.", "Everything connects."],
  summary: [
    "Strategy, design and engineering under one roof.",
    "We shape the team around the problem, then build it together.",
  ],
  action: { label: "Find your starting point", href: "/contact" },

  disciplines: {
    heading: "What we bring to the table.",
    label: "Six connected disciplines",
  },

  /** The proof: one engagement where every discipline was in the room. */
  showcase: {
    label: "What connected looks like",
    heading: ["One team.", "The whole picture."],
    copy: "For BPI, a new brand, a multilingual website and internal operations came together in one engagement.",
    action: {
      label: "Explore the BPI story",
      href: "/work/barbados-pharmaceuticals",
    },
    /* PLACEHOLDER — the comp sets a collage of the BPI work here. Export it
       to `public/media/` and drop it in; until then the plate is a ground. */
    previewLabel: "Project preview / artwork placeholder",
  },

  models: {
    heading: "Three ways to work together.",
    label: "The right shape for the work",
  },

  method: {
    label: "Our method / Clarity engineering",
    heading: ["Good work starts", "with better questions."],
  },
} as const;

export const serviceHref = (slug: string) => `/services#${slug}`;

/** The way in from a discipline, carrying what the reader was reading. */
export const serviceEnquiryHref = (slug: string) => `/contact?need=${slug}`;
