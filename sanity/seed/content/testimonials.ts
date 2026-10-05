/**
 * Ghost Savvy Studios — what clients say.
 *
 * PLACEHOLDER, all of it: the names, roles, companies and quotes are stand-ins
 * from the comp. Replace each with a real quote the client has approved
 * before this ships — a testimonial that cannot be attributed does not run.
 */

export interface Testimonial {
  readonly quote: string;
  readonly name: string;
  readonly role: string;
  readonly company: string;
}

export const testimonials = {
  eyebrow: "Good work. Good company.",
  heading: "Better together",
  deck: ["A few words from the other", "side of the table."],
  label: "Client perspectives",
  items: [
    {
      quote:
        "They brought clarity to a complicated brief, challenged our assumptions, and made the whole process feel like one team working towards the same thing.",
      name: "Alex Morgan",
      role: "Project lead",
      company: "Example company",
    },
    {
      quote:
        "We came in with a list of features and left with a product that solves the actual problem. The thinking up front saved us months.",
      name: "Jordan Lee",
      role: "Head of digital",
      company: "Example organisation",
    },
    {
      quote:
        "Calm, direct and properly accountable. They were as invested in what happened after launch as they were in getting there.",
      name: "Sam Rivera",
      role: "Operations director",
      company: "Example agency",
    },
  ],
} as const satisfies {
  eyebrow: string;
  heading: string;
  deck: readonly string[];
  label: string;
  items: readonly Testimonial[];
};
