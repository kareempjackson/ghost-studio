/**
 * Ghost Savvy Studios — `/who-we-serve`.
 *
 * Who is on the other side of the table: six kinds of client, each named with
 * what the work looks like for them. Set from the `/who-we-serve` comp.
 *
 * These are wider than the four sectors the home page lists (lib/sectors.ts),
 * which are the public-sector buyers alone; this page adds the commercial
 * side. Where the two overlap, keep the lines in step.
 */

export interface Audience {
  readonly name: readonly string[];
  readonly body: string;
}

export const whoWeServePage = {
  title: "Who we serve",
  description:
    "Ghost Savvy works with founders, institutions and enterprise teams.",
  eyebrow: "Who we serve",
  heading: ["Different needs.", "A shared starting", "point."],
  summary:
    "GhostSavvy works with founders, institutions and enterprise teams.",
  action: { label: "Tell us about your organization", href: "/contact" },
  audiences: {
    label: "Who we work with",
    heading: ["The work looks different", "depending on who you are."],
    deck: "What stays the same is where we start.",
    items: [
      {
        name: ["Funded startups", "and founders"],
        body: "Product teams past the MVP stage who need more disciplines than they can hire.",
      },
      {
        name: ["Enterprise and", "mid-market teams"],
        body: "Systems already running, and a case for building on top of them.",
      },
      {
        name: ["Institutions and", "public agencies"],
        body: "Public websites, engagement platforms and service portals.",
      },
      {
        name: ["Nonprofits", "and NGOs"],
        body: "Large amounts of content, small internal teams.",
      },
      {
        name: ["Universities and", "research institutions"],
        body: "Publishing across departments without losing the standard.",
      },
      {
        name: ["Health and", "public health"],
        body: "Public-facing systems, scoped outside protected health data.",
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
  audiences: {
    label: string;
    heading: readonly string[];
    deck: string;
    items: readonly Audience[];
  };
};
