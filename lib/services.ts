/**
 * Ghost Savvy Studios — what the studio is hired to do.
 *
 * Four services in the order the work actually happens: the problem is
 * defined, the product is designed, the thing is built, and then it has to
 * keep running after the studio has gone. Every capability is a line item a
 * procurement officer could put on a contract.
 */

export interface Service {
  /** The anchor on /services this card opens onto. */
  readonly slug: string;
  readonly name: string;
  /** Line items, in the order they are usually bought. */
  readonly capabilities: readonly string[];
}

export const services = {
  eyebrow: "Services",
  /**
   * One label for every card. The card's own name is added to the accessible
   * name, so four links read out of context are four destinations.
   */
  cta: "See how we work",
  items: [
    {
      slug: "strategy",
      name: "Strategy",
      capabilities: [
        "Problem definition",
        "Research and discovery",
        "Service design",
        "Business case and roadmap",
      ],
    },
    {
      slug: "product",
      name: "Product",
      capabilities: [
        "Product and interface design",
        "Design systems",
        "Prototyping and user testing",
        "Accessibility to WCAG 2.1 AA",
      ],
    },
    {
      slug: "engineering",
      name: "Engineering",
      capabilities: [
        "Web and application development",
        "Headless architecture",
        "Platform engineering",
        "Content migration",
      ],
    },
    {
      slug: "systems-and-infrastructure",
      name: "Systems",
      capabilities: [
        "Cloud hosting and deployment",
        "Security and compliance",
        "Integration with existing systems",
        "Monitoring, support and handover",
      ],
    },
  ],
} as const satisfies {
  eyebrow: string;
  cta: string;
  items: readonly Service[];
};

export const serviceHref = (slug: string) => `/services#${slug}`;
