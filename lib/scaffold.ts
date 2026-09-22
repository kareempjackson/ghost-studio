/**
 * Ghost Savvy Studios — scaffold pages.
 *
 * TEST DATA, all of it. These are placeholder pages so the routes exist, link
 * up and can be walked through before each one is designed. Every string here
 * is a stand-in written to the right shape and length, not approved copy.
 * When a page is built out properly, its entry comes off this file and the
 * route stops using `ScaffoldPage`.
 */

export interface ScaffoldItem {
  readonly title: string;
  readonly body: string;
  /** A small label above the title: a category, a date, a stat. */
  readonly meta?: string;
  readonly href?: string;
}

export interface ScaffoldSection {
  readonly label: string;
  readonly title: string;
  readonly body?: string;
  readonly items?: readonly ScaffoldItem[];
}

export interface ScaffoldPageData {
  readonly slug: string;
  /** The <title> and the browser tab. */
  readonly title: string;
  readonly description: string;
  readonly eyebrow: string;
  /** The cover heading, one entry per line. */
  readonly heading: readonly string[];
  readonly summary: string;
  readonly action: { readonly label: string; readonly href: string };
  readonly sections: readonly ScaffoldSection[];
}

const LOREM =
  "Placeholder copy written to length. It will be replaced with the real paragraph once this page is designed and the content is signed off.";

export const scaffoldPages = {
  build: {
    slug: "build",
    title: "Build",
    description:
      "A standing product team, composed around what you are building.",
    eyebrow: "Working with us — Build",
    heading: ["A team that", "stays with you."],
    summary:
      "Ongoing design, engineering and product direction for a business with work to keep moving. Test content.",
    action: { label: "Discuss an ongoing team", href: "/contact?model=build" },
    sections: [
      {
        label: "What you get",
        title: "Every discipline, every month.",
        body: LOREM,
        items: [
          {
            meta: "01",
            title: "Product direction",
            body: "Placeholder: a named lead who owns the roadmap with you.",
          },
          {
            meta: "02",
            title: "Design",
            body: "Placeholder: interface, brand and design system, kept current.",
          },
          {
            meta: "03",
            title: "Engineering",
            body: "Placeholder: build, ship and maintain, to your standards.",
          },
          {
            meta: "04",
            title: "Reporting",
            body: "Placeholder: a monthly read-out of what shipped and what is next.",
          },
        ],
      },
      {
        label: "Who it suits",
        title: "Teams past the first release.",
        body: LOREM,
      },
      {
        label: "How it runs",
        title: "Monthly, with a six-month start.",
        items: [
          {
            meta: "Month 1",
            title: "Onboard",
            body: "Placeholder: access, context and a first plan.",
          },
          {
            meta: "Months 2–6",
            title: "Ship",
            body: "Placeholder: a steady cadence of releases.",
          },
          {
            meta: "Ongoing",
            title: "Evolve",
            body: "Placeholder: the team reshapes as the work changes.",
          },
        ],
      },
    ],
  },

  engage: {
    slug: "engage",
    title: "Engage",
    description:
      "A scoped project, from discovery and design through delivery and handover.",
    eyebrow: "Working with us — Engage",
    heading: ["A clear brief.", "A defined outcome."],
    summary:
      "One defined piece of work, scoped and priced before it starts. It ships, and then it is yours. Test content.",
    action: { label: "Talk about a project", href: "/contact?model=engage" },
    sections: [
      {
        label: "The shape of it",
        title: "Fixed scope, fixed price.",
        body: LOREM,
        items: [
          {
            meta: "Weeks 1–2",
            title: "Discovery",
            body: "Placeholder: the problem, defined properly.",
          },
          {
            meta: "Weeks 3–6",
            title: "Design",
            body: "Placeholder: the solution, prototyped and tested.",
          },
          {
            meta: "Weeks 7–14",
            title: "Build",
            body: "Placeholder: engineering to launch.",
          },
          {
            meta: "Week 15",
            title: "Handover",
            body: "Placeholder: documentation, training and keys.",
          },
        ],
      },
      {
        label: "Good fits",
        title: "When you know what needs doing.",
        body: LOREM,
      },
    ],
  },

  integrate: {
    slug: "integrate",
    title: "Integrate",
    description:
      "Cloud, identity, collaboration and automation that help the organisation operate.",
    eyebrow: "Working with us — Integrate",
    heading: ["The systems", "behind the business."],
    summary:
      "The infrastructure that lets a team work: identity, collaboration, cloud and the automation between them. Test content.",
    action: { label: "Explore your systems", href: "/contact?model=integrate" },
    sections: [
      {
        label: "What we set up",
        title: "Four layers, working as one.",
        items: [
          {
            meta: "Identity",
            title: "Accounts and access",
            body: "Placeholder: single sign-on and permissions.",
          },
          {
            meta: "Collaboration",
            title: "Where the work happens",
            body: "Placeholder: mail, files and chat.",
          },
          {
            meta: "Cloud",
            title: "Hosting and data",
            body: "Placeholder: environments, backups, monitoring.",
          },
          {
            meta: "Automation",
            title: "The joins between",
            body: "Placeholder: workflows that remove busywork.",
          },
        ],
      },
      {
        label: "After launch",
        title: "Supported, then handed over.",
        body: LOREM,
      },
    ],
  },

  "our-approach": {
    slug: "our-approach",
    title: "Our approach",
    description:
      "How Ghost Savvy Studios works: clarity first, then the build.",
    eyebrow: "Our approach",
    heading: ["Clarity before", "the first pixel."],
    summary:
      "We define the problem properly, then build the system that solves it. Accessible from the start, and yours to run afterwards. Test content.",
    action: { label: "See how we work", href: "/services" },
    sections: [
      {
        label: "Principles",
        title: "Three things we hold to.",
        items: [
          {
            meta: "01",
            title: "Clarity",
            body: "Placeholder: start with the right question.",
          },
          {
            meta: "02",
            title: "Judgement",
            body: "Placeholder: give the work a clear direction.",
          },
          {
            meta: "03",
            title: "Ownership",
            body: "Placeholder: take responsibility for what is next.",
          },
        ],
      },
      {
        label: "Process",
        title: "Discover, define, build, evolve.",
        body: LOREM,
      },
      {
        label: "The team",
        title: "Specialists, in one room.",
        body: LOREM,
      },
    ],
  },

  insights: {
    slug: "insights",
    title: "Insights",
    description:
      "Perspectives from the studio on strategy, design and engineering.",
    eyebrow: "The Ghostsavvy journal",
    heading: ["A little", "perspective."],
    summary:
      "Notes from the work: what we have learned, what we would do differently, and what we think is coming. Test content.",
    action: { label: "Subscribe for new pieces", href: "/contact" },
    sections: [
      {
        label: "Latest",
        title: "Recent perspectives.",
        items: [
          {
            meta: "Strategy · Placeholder",
            title: "Clarity before the first pixel",
            body: "Placeholder summary of the piece, a sentence or two long.",
            href: "/insights",
          },
          {
            meta: "Design · Placeholder",
            title: "Design systems that grow with you",
            body: "Placeholder summary of the piece, a sentence or two long.",
            href: "/insights",
          },
          {
            meta: "Engineering · Placeholder",
            title: "Built to be handed over",
            body: "Placeholder summary of the piece, a sentence or two long.",
            href: "/insights",
          },
          {
            meta: "Studio · Placeholder",
            title: "How we work, together",
            body: "Placeholder summary of the piece, a sentence or two long.",
            href: "/insights",
          },
          {
            meta: "Strategy · Placeholder",
            title: "The brief is the product",
            body: "Placeholder summary of the piece, a sentence or two long.",
            href: "/insights",
          },
          {
            meta: "Engineering · Placeholder",
            title: "Accessible from the start",
            body: "Placeholder summary of the piece, a sentence or two long.",
            href: "/insights",
          },
        ],
      },
    ],
  },

  "ghost-labs": {
    slug: "ghost-labs",
    title: "Ghost Labs",
    description: "Where the studio builds its own products and experiments.",
    eyebrow: "More from Ghost Savvy — Labs",
    heading: ["Where we build", "for ourselves."],
    summary:
      "Our own products, prototypes and experiments — the place we try things before we recommend them. Test content.",
    action: { label: "Get in touch", href: "/contact" },
    sections: [
      {
        label: "Projects",
        title: "In the lab right now.",
        items: [
          {
            meta: "Product · Placeholder",
            title: "Project one",
            body: "Placeholder: a one-line description of the product.",
          },
          {
            meta: "Prototype · Placeholder",
            title: "Project two",
            body: "Placeholder: a one-line description of the prototype.",
          },
          {
            meta: "Experiment · Placeholder",
            title: "Project three",
            body: "Placeholder: a one-line description of the experiment.",
          },
        ],
      },
      {
        label: "Why a lab",
        title: "We test on ourselves first.",
        body: LOREM,
      },
    ],
  },

  "ghost-u": {
    slug: "ghost-u",
    title: "Ghost U",
    description: "Learning from the studio: courses, workshops and resources.",
    eyebrow: "More from Ghost Savvy — Ghost U",
    heading: ["Learn how", "we work."],
    summary:
      "Courses, workshops and open resources that share the studio's methods with the people who will use them. Test content.",
    action: { label: "Join the waitlist", href: "/contact" },
    sections: [
      {
        label: "Programmes",
        title: "Ways to learn with us.",
        items: [
          {
            meta: "Course · Placeholder",
            title: "Product thinking",
            body: "Placeholder: a short description of the course.",
          },
          {
            meta: "Workshop · Placeholder",
            title: "Design systems in practice",
            body: "Placeholder: a short description of the workshop.",
          },
          {
            meta: "Resource · Placeholder",
            title: "The Ghost playbook",
            body: "Placeholder: a short description of the resource.",
          },
        ],
      },
      {
        label: "For teams",
        title: "Training, in-house.",
        body: LOREM,
      },
    ],
  },

  "ghost-gives": {
    slug: "ghost-gives",
    title: "Ghost Gives",
    description: "The studio's work with nonprofits and communities.",
    eyebrow: "More from Ghost Savvy — Ghost Gives",
    heading: ["Good work,", "given back."],
    summary:
      "Pro bono and reduced-rate work for nonprofits and community organisations doing things that matter. Test content.",
    action: { label: "Apply for support", href: "/contact" },
    sections: [
      {
        label: "The programme",
        title: "How we give.",
        items: [
          {
            meta: "Pro bono · Placeholder",
            title: "Projects",
            body: "Placeholder: selected projects each year, at no cost.",
          },
          {
            meta: "Mentoring · Placeholder",
            title: "Time",
            body: "Placeholder: our people, advising founders and teams.",
          },
          {
            meta: "Open source · Placeholder",
            title: "Tools",
            body: "Placeholder: what we build, shared openly.",
          },
        ],
      },
      {
        label: "Impact",
        title: "What it has added up to.",
        items: [
          {
            meta: "Placeholder",
            title: "00",
            body: "Organisations supported.",
          },
          { meta: "Placeholder", title: "000", body: "Hours given." },
          { meta: "Placeholder", title: "00", body: "Projects shipped." },
        ],
      },
    ],
  },

  about: {
    slug: "about",
    title: "About us",
    description:
      "Ghost Savvy Studios: a strategy, design and engineering studio for work that has to be right.",
    eyebrow: "About us",
    heading: ["Independent minds.", "Shared ambition."],
    summary:
      "A studio of strategists, designers and engineers who define the problem properly, then build the system that solves it. Test content.",
    action: { label: "Work with us", href: "/contact" },
    sections: [
      {
        label: "The studio",
        title: "Why Ghost Savvy exists.",
        body: LOREM,
      },
      {
        label: "What we believe",
        title: "Three things we hold to.",
        items: [
          {
            meta: "01",
            title: "Clarity",
            body: "Placeholder: start with the right question.",
          },
          {
            meta: "02",
            title: "Judgement",
            body: "Placeholder: give the work a clear direction.",
          },
          {
            meta: "03",
            title: "Ownership",
            body: "Placeholder: take responsibility for what is next.",
          },
        ],
      },
      {
        label: "The team",
        title: "The people in the room.",
        items: [
          {
            meta: "Founder · Placeholder",
            title: "Team member one",
            body: "Placeholder: role and a one-line bio.",
          },
          {
            meta: "Design · Placeholder",
            title: "Team member two",
            body: "Placeholder: role and a one-line bio.",
          },
          {
            meta: "Engineering · Placeholder",
            title: "Team member three",
            body: "Placeholder: role and a one-line bio.",
          },
          {
            meta: "Strategy · Placeholder",
            title: "Team member four",
            body: "Placeholder: role and a one-line bio.",
          },
        ],
      },
      {
        label: "By the numbers",
        title: "The studio so far.",
        items: [
          { meta: "Placeholder", title: "00", body: "Years in practice." },
          { meta: "Placeholder", title: "00", body: "Products shipped." },
          { meta: "Placeholder", title: "00", body: "Sectors served." },
        ],
      },
    ],
  },

  "who-we-serve": {
    slug: "who-we-serve",
    title: "Who we serve",
    description: "Governments, universities and mission-driven organisations.",
    eyebrow: "Who we work with",
    heading: ["The people", "accountable."],
    summary:
      "Governments, universities and mission-driven organisations — the people accountable when a service fails in public. Test content.",
    action: { label: "Talk to us about your sector", href: "/contact" },
    sections: [
      {
        label: "Sectors",
        title: "Where we do our best work.",
        items: [
          {
            meta: "01",
            title: "Local and municipal government",
            body: "Public websites, engagement platforms, and service portals.",
          },
          {
            meta: "02",
            title: "National agencies and regulators",
            body: "Case management, licensing, and the systems behind a statutory duty.",
          },
          {
            meta: "03",
            title: "Universities and research institutes",
            body: "Admissions, student services, and the tools research is published through.",
          },
          {
            meta: "04",
            title: "Mission-driven organisations",
            body: "Grant programmes, member services, and the platforms a campaign runs on.",
          },
        ],
      },
      {
        label: "What they share",
        title: "No room to get it wrong.",
        body: LOREM,
      },
    ],
  },
} as const satisfies Record<string, ScaffoldPageData>;

export type ScaffoldSlug = keyof typeof scaffoldPages;
