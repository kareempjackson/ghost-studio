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

/** An audience's anchor on the page, from its name: "funded-startups-and-founders". */
export const audienceSlug = (audience: Audience) =>
  audience.name
    .join(" ")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

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

/**
 * The audiences' own pages, at /who-we-serve/[slug], by the audience's slug.
 * Set from each audience's comp; an audience without one is a card only.
 * Headings with a break the comp sets by hand carry it as a line of their own.
 *
 * PLACEHOLDER: the funded-startups comp carries Discover the Job's three
 * practice bodies over unchanged, and leaves the first step untitled.
 * Replace them when this page's own lines are written.
 */
export const audiencePages: Record<string, object> = {
  "funded-startups-and-founders": {
    heading: ["Past the MVP.", "Into what’s next."],
    summary:
      "A product team for funded founders who need more disciplines than they can hire.",
    action: { label: "Define your next release", href: "/contact" },
    plate: { ground: "#edebe7" },
    challenge: {
      label: "The challenge",
      heading: ["The product has started.", "The demands keep growing."],
      deck: "The first version gets you into the market. The next stage needs clearer priorities and a team that can carry the product forward without losing the original idea.",
    },
    practice: {
      label: "In practice",
      heading: ["Work shaped", "around your needs."],
      items: [
        {
          body: "Speak with the people who use the system and the people responsible for its outcome.",
        },
        {
          title: "Make the experience consistent",
          body: "Review the existing experience, tools and constraints. Identify where progress gets difficult.",
        },
        {
          title: "Build a dependable foundation",
          body: "Write a shared problem statement and agree what a useful change would look like.",
        },
      ],
    },
    outputs: {
      label: "What you leave with",
      heading: ["The right mix", "for the problem."],
      items: [
        "Product strategy",
        "Product design",
        "Application development",
        "Design systems",
      ],
    },
  },
  "enterprise-and-mid-market-teams": {
    heading: ["Move forward.", "Keep what works."],
    summary:
      "Design and technology for organisations with established systems and a new set of needs.",
    action: { label: "Talk through your systems", href: "/contact" },
    plate: { ground: "#edebe7" },
    challenge: {
      label: "The challenge",
      heading: ["Change has to fit", "the business already running."],
      deck: "Your tools, teams and processes have a history. We start by understanding those dependencies, then define changes that make the experience and the operation work better.",
    },
    practice: {
      label: "In practice",
      heading: ["Work shaped", "around your needs."],
      items: [
        {
          title: "Make complex journeys clearer",
          body: "Help customers and internal teams navigate products, information and tasks.",
        },
        {
          title: "Connect the operational layer",
          body: "Bring workflows, shared information and access into a more coherent setup.",
        },
        {
          title: "Plan a manageable transition",
          body: "Agree priorities and dependencies before changing the systems people rely on.",
        },
      ],
    },
    outputs: {
      label: "What you leave with",
      heading: ["The right mix", "for the problem."],
      items: [
        "Experience design",
        "Platform engineering",
        "Cloud infrastructure",
        "Workflow automation",
      ],
    },
  },
  "institutions-and-public-agencies": {
    heading: ["Public services.", "Clearer access."],
    summary:
      "Public websites, engagement platforms and service portals built around the people who need them.",
    action: { label: "Share your brief or RFP", href: "/contact" },
    plate: { ground: "#edebe7" },
    challenge: {
      label: "The challenge",
      heading: ["A complex organisation.", "A clear public", "experience."],
      deck: "Residents and service users arrive with a task to complete. We help teams organise information and shape journeys while keeping procurement requirements and internal responsibilities in view.",
    },
    practice: {
      label: "In practice",
      heading: ["Work shaped", "around your needs."],
      items: [
        {
          title: "Organise around public needs",
          body: "Structure content around the questions and tasks people bring to the service.",
        },
        {
          title: "Make delivery reviewable",
          body: "Define the scope, deliverables and acceptance criteria so stakeholders can assess progress.",
        },
        {
          title: "Support the team after launch",
          body: "Plan publishing workflows and hand over documentation for everyday use.",
        },
      ],
    },
    outputs: {
      label: "What you leave with",
      heading: ["The right mix", "for the problem."],
      items: [
        "Discovery and research",
        "Information architecture",
        "Accessible interface design",
        "Website development",
      ],
    },
  },
  "nonprofits-and-ngos": {
    heading: ["More purpose.", "Less friction."],
    summary:
      "Websites and working systems for organisations with a lot to communicate and a small team to do it.",
    action: { label: "Tell us about your mission", href: "/contact" },
    plate: { ground: "#edebe7" },
    challenge: {
      label: "The challenge",
      heading: ["The mission is clear.", "The workload is full."],
      deck: "When resources are stretched, the website needs to be easier to manage. We help organise the content and the journeys that connect people to your work.",
    },
    practice: {
      label: "In practice",
      heading: ["Work shaped", "around your needs."],
      items: [
        {
          title: "Make the mission understandable",
          body: "Help visitors find what you do, who it serves and how they can participate.",
        },
        {
          title: "Make publishing manageable",
          body: "Build a content structure and reusable patterns that work for a small team.",
        },
        {
          title: "Reduce repeat administration",
          body: "Identify useful connections between enquiries, information and everyday workflows.",
        },
      ],
    },
    outputs: {
      label: "What you leave with",
      heading: ["The right mix", "for the problem."],
      items: [
        "Content strategy",
        "Brand and messaging",
        "CMS development",
        "Workflow design",
      ],
    },
  },
  "universities-and-research-institutions": {
    heading: ["Many voices.", "A shared standard."],
    summary:
      "Publishing and digital experiences that connect departments, research and the people looking for them.",
    action: { label: "Discuss your publishing needs", href: "/contact" },
    plate: { ground: "#edebe7" },
    challenge: {
      label: "The challenge",
      heading: ["Different departments.", "One connected", "experience."],
      deck: "Large institutions need room for different subjects and audiences. We help create a shared structure without making every department say the same thing.",
    },
    practice: {
      label: "In practice",
      heading: ["Work shaped", "around your needs."],
      items: [
        {
          title: "Help people find their way",
          body: "Map journeys for prospective students, researchers and other priority audiences.",
        },
        {
          title: "Give publishing a structure",
          body: "Define content models and reusable templates for departments and research groups.",
        },
        {
          title: "Keep ownership clear",
          body: "Plan editorial responsibilities, access and guidance so the system stays usable.",
        },
      ],
    },
    outputs: {
      label: "What you leave with",
      heading: ["The right mix", "for the problem."],
      items: [
        "User research",
        "Information architecture",
        "Content migration",
        "Design systems",
      ],
    },
  },
  "health-and-public-health": {
    heading: ["Useful information.", "Within reach."],
    summary:
      "Public-facing websites and communications systems, scoped outside protected health data.",
    action: { label: "Discuss a public-facing project", href: "/contact" },
    plate: { ground: "#edebe7" },
    challenge: {
      label: "The challenge",
      heading: ["Important information", "needs a clearer way in."],
      deck: "We help health organisations organise their public presence around the audiences they serve. The focus is on communication and access to published information.",
    },
    practice: {
      label: "In practice",
      heading: ["Work shaped", "around your needs."],
      items: [
        {
          title: "Make public information easier to find",
          body: "Shape navigation and content around the questions visitors need answered.",
        },
        {
          title: "Connect the brand and the platform",
          body: "Carry a consistent identity through the public website and communication materials.",
        },
        {
          title: "Define the boundaries early",
          body: "Keep the scope focused on public-facing systems outside protected health data.",
        },
      ],
    },
    outputs: {
      label: "What you leave with",
      heading: ["The right mix", "for the problem."],
      items: [
        "Brand identity",
        "Content design",
        "Multilingual websites",
        "Public information architecture",
      ],
    },
  },
};
