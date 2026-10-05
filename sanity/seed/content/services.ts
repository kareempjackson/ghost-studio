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
 * `promise` is set from the `/services` comp. PLACEHOLDER: the capability
 * lines beyond Strategy are written to the comp's shape and need confirming.
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
      promise: "Work out what should exist.",
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
      promise: "Give the business a clear identity.",
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
      promise: "Make the experience easier to use.",
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
      promise: "Build what the business needs to run.",
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
      promise: "Help the right people find you.",
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
      promise: "Make the work visible.",
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
    "Strategy, brand, design, technology, marketing and creative production under one roof, and three ways to engage Ghost Savvy Studios for them.",
  eyebrow: "Services",
  heading: ["Good thinking.", "Made real."],
  summary: "Everything we do, and the three ways to engage us for it.",
  action: { label: "Find your fit", href: "#ways-in" },

  ways: {
    label: "Work with us",
    heading: "Three ways in.",
    deck: "Choose the shape of the engagement. We compose the team around the work.",
  },

  disciplines: {
    label: "What we do",
    heading: "Depth where you need it.",
    deck: "A senior core team across six practice areas. Open a discipline to explore its scope.",
  },

  method: {
    label: "Clarity engineering",
    heading: ["The work", "before the build."],
    copy: [
      "We talk to the people responsible for the outcome. We separate the actual problem from the feature requests. Then we write down what should exist and why.",
      "Every discipline works from that same document.",
    ],
    action: { label: "Start a conversation", href: "/contact" },
    /**
     * The people in the room, as a chain: each node is one conversation, and
     * the links run in the order the work is written down. Positions are in
     * the plate's own 1436 × 756 units, off the comp.
     *
     * PLACEHOLDER — the comp sets a portrait in each node. Export them to
     * `public/images/` and set `src`; until then a node is a ground.
     */
    network: {
      alt: "Six people from one engagement, from the clinic floor to the operating theatre, joined in a single chain.",
      nodes: [
        { x: 433, y: 243, r: 90, src: null },
        { x: 567, y: 538, r: 60, src: null },
        { x: 728, y: 416, r: 55, src: null },
        { x: 896, y: 534, r: 55, src: null },
        { x: 990, y: 290, r: 95, src: null },
        { x: 730, y: 248, r: 55, src: null },
      ] as readonly { x: number; y: number; r: number; src: string | null }[],
    },
  },
} as const;

export const serviceHref = (slug: string) => `/services#${slug}`;

/** The way in from a discipline, carrying what the reader was reading. */
export const serviceEnquiryHref = (slug: string) => `/contact?need=${slug}`;
