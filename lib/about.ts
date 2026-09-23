/**
 * Ghost Savvy Studios — `/about`.
 *
 * Who the studio is, in the order a stranger asks: what do you do, who does
 * it, what is it like to work with you, and what else are you. Set from the
 * `/about` comp.
 *
 * PLACEHOLDER: the team is six stand-ins, names and portraits both, as the
 * comp itself says in the deck. Replace `name`, set `portrait` to a file in
 * `public/images/`, and take the second sentence off the deck.
 */

export interface TeamMember {
  readonly name: string;
  readonly role: string;
  /** A square portrait. Until there is one, the plate is `ground`. */
  readonly portrait: string | null;
  readonly ground: string;
}

export interface Expectation {
  readonly title: string;
  readonly body: string;
}

export interface FamilyMember {
  readonly name: string;
  /** What it is for, as the comp breaks it. */
  readonly statement: readonly string[];
  readonly href: string;
}

export const aboutPage = {
  title: "About us",
  description:
    "Ghost Savvy Studios builds companies: the product, the brand around it and the systems it runs on.",
  eyebrow: "About us",
  heading: ["Different minds.", "One studio."],
  summary:
    "Working out what should be built is the harder problem, and it is the one we take first.",
  action: { label: "Meet the team", href: "#team" },

  who: {
    label: "Who we are",
    heading: "We build companies.",
    deck: "Not just the product, but the brand around it and the systems it runs on.",
    body: [
      "We work with funded startups, institutions and established businesses. Some need a full team on retainer. Others need a fixed-scope project or a stronger operational foundation.",
      "We shape the engagement around the problem, then bring the right people into the room.",
    ],
  },

  team: {
    label: "The people behind the work",
    heading: ["A team, not a single", "point of view."],
    deck: "Strategy, design, engineering and delivery working together. Team names and portraits below are placeholders.",
    portraitLabel: "Portrait",
    members: [
      {
        name: "Team member 01",
        role: "Strategy & leadership",
        portrait: null,
        ground: "#e7e6e1",
      },
      {
        name: "Team member 02",
        role: "Brand & creative direction",
        portrait: null,
        ground: "#dfe0dc",
      },
      {
        name: "Team member 03",
        role: "Product design",
        portrait: null,
        ground: "#e1e0df",
      },
      {
        name: "Team member 04",
        role: "Engineering",
        portrait: null,
        ground: "#e7e6e1",
      },
      {
        name: "Team member 05",
        role: "Systems & infrastructure",
        portrait: null,
        ground: "#dfe0dc",
      },
      {
        name: "Team member 06",
        role: "Project delivery",
        portrait: null,
        ground: "#e1e0df",
      },
    ],
  },

  expect: {
    label: "How we work",
    heading: "What you can expect.",
    items: [
      {
        title: "Ask before making.",
        body: "Understand the business problem before deciding what to build.",
      },
      {
        title: "Make decisions visible.",
        body: "Write down the thinking so the whole team can act on it.",
      },
      {
        title: "Stay close to the work.",
        body: "Keep strategy involved as the design and engineering take shape.",
      },
      {
        title: "Leave you in control.",
        body: "Hand over the working system and the knowledge to use it.",
      },
    ],
  },

  family: {
    label: "The Ghost family",
    heading: ["Room for work", "beyond the brief."],
    members: [
      {
        name: "Ghost Labs",
        statement: ["Where we", "experiment."],
        href: "/ghost-labs",
      },
      {
        name: "Ghost U",
        statement: ["Where we teach", "Clarity Engineering."],
        href: "/ghost-u",
      },
      {
        name: "Ghost Gives",
        statement: ["Where we give the", "work away."],
        href: "/ghost-gives",
      },
    ],
  },
} as const satisfies {
  title: string;
  description: string;
  eyebrow: string;
  heading: readonly string[];
  summary: string;
  action: { label: string; href: string };
  who: { label: string; heading: string; deck: string; body: readonly string[] };
  team: {
    label: string;
    heading: readonly string[];
    deck: string;
    portraitLabel: string;
    members: readonly TeamMember[];
  };
  expect: { label: string; heading: string; items: readonly Expectation[] };
  family: {
    label: string;
    heading: readonly string[];
    members: readonly FamilyMember[];
  };
};
