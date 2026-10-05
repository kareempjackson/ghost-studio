/**
 * Ghost Savvy Studios — `/our-approach`.
 *
 * Clarity Engineering, in the order it is done: why the brief is only where
 * the work starts, the four phases that carry one understanding through to
 * the product, and the people that understanding connects. Set from the
 * `/our-approach` comp.
 *
 * Each phase is its own document: its card here and its page at
 * /our-approach/[slug], each set from its own comp. The comps all carry
 * "Phase 01" in the eyebrow; the pages number themselves by position.
 *
 * PLACEHOLDER: the comps leave the plates as grounds; drop the pictures in
 * through the Studio.
 */

export const approachPage = {
  title: "Our approach",
  description:
    "Clarity Engineering: how Ghost Savvy works out what should exist before building it, and keeps that understanding connected to the work.",
  eyebrow: "Our approach / Clarity Engineering",
  heading: ["Know why.", "Then build."],
  summary:
    "We work out what should exist before we build it. Clarity Engineering keeps that understanding connected to the work.",
  action: { label: "Explore the process", href: "#process" },
  plate: { src: null, alt: "", ground: "#f0f0f0" },
  start: {
    label: "The starting point",
    heading: "The brief is a beginning.",
    deck: "A website, a product or a workflow is usually a response to something happening in the business. We start there.",
    body: "We ask what is getting in the way, who it affects and what needs to change. That gives the team a shared basis for decisions throughout the engagement.",
  },
  phases: {
    label: "Four connected phases",
    heading: ["A clear thread", "through the work."],
    itemLabel: "Phase",
    pageEyebrow: "Clarity Engineering",
  },
} as const;

export const phases = [
  {
    slug: "discover-the-job",
    title: "Discover the Job",
    question: "What are we actually solving?",
    heading: ["Discover", "the Job"],
    action: { label: "Discuss your project", href: "/contact" },
    plate: { ground: "#edebe7" },
    purpose: {
      label: "The purpose",
      heading:
        "Understand the people, the pressure and the problem before deciding what to make.",
      deck: "A feature request is a starting point for a conversation. We look for the business need behind it.",
    },
    practice: {
      label: "In practice",
      heading: "What we work through.",
      items: [
        {
          title: "Listen to the people involved",
          body: "Speak with the people who use the system and the people responsible for its outcome.",
        },
        {
          title: "Look at the work as it happens",
          body: "Review the existing experience, tools and constraints. Identify where progress gets difficult.",
        },
        {
          title: "Name the problem",
          body: "Write a shared problem statement and agree what a useful change would look like.",
        },
      ],
    },
    outputs: {
      label: "What you leave with",
      heading: ["Something the team", "can use."],
      deck: "Typical outputs are agreed around your scope.",
      items: [
        "A shared problem statement",
        "Stakeholder and user observations",
        "Constraints and open questions",
      ],
    },
  },
  {
    /* PLACEHOLDER: the comp carries Discover's purpose, and its first step's
       title, over unchanged; replace them when this phase's own lines are
       written. */
    slug: "define-the-system",
    title: "Define the System",
    question: "What should exist, and how does it change?",
    heading: ["Define", "the System"],
    action: { label: "Discuss your project", href: "/contact" },
    plate: { ground: "#edebe7" },
    purpose: {
      label: "The purpose",
      heading:
        "Understand the people, the pressure and the problem before deciding what to make.",
      deck: "A feature request is a starting point for a conversation. We look for the business need behind it.",
    },
    practice: {
      label: "In practice",
      heading: "What we work through.",
      items: [
        {
          title: "Listen to the people involved",
          body: "Agree who the system serves, what it needs to do and what sits outside the scope.",
        },
        {
          title: "Make the relationships visible",
          body: "Map the journeys, information and dependencies that connect the experience.",
        },
        {
          title: "Agree a first useful release",
          body: "Set priorities and acceptance criteria so everyone can recognise when the work is ready.",
        },
      ],
    },
    outputs: {
      label: "What you leave with",
      heading: ["Something the team", "can use."],
      deck: "Typical outputs are agreed around your scope.",
      items: [
        "A system brief",
        "A prioritised scope",
        "A release plan and acceptance criteria",
      ],
    },
  },
  {
    slug: "build-with-precision",
    title: "Build with Precision",
    question: "How do we build it without losing the thread?",
    heading: ["Build", "with Precision"],
    action: { label: "Discuss your project", href: "/contact" },
    plate: { ground: "#edebe7" },
    purpose: {
      label: "The purpose",
      heading:
        "Keep the original problem in view as the design becomes a working product.",
      deck: "A polished interface is one part of delivery. The working system needs to carry the same thinking.",
    },
    practice: {
      label: "In practice",
      heading: "What we work through.",
      items: [
        {
          title: "Make the idea tangible",
          body: "Use prototypes and working increments to test decisions before they spread through the system.",
        },
        {
          title: "Review the work together",
          body: "Design and engineering review the same experience against the agreed brief.",
        },
        {
          title: "Prepare for everyday use",
          body: "Test the important journeys and document how the system should be run.",
        },
      ],
    },
    outputs: {
      label: "What you leave with",
      heading: ["Something the team", "can use."],
      deck: "Typical outputs are agreed around your scope.",
      items: [
        "A working product",
        "Reviewed journeys and quality checks",
        "Documentation for handover",
      ],
    },
  },
  {
    slug: "evolve-the-product",
    title: "Evolve the Product",
    question: "How does this get better?",
    heading: ["Evolve", "the Product"],
    action: { label: "Discuss your project", href: "/contact" },
    plate: { ground: "#edebe7" },
    purpose: {
      label: "The purpose",
      heading: "Learn from real use and decide what is worth changing next.",
      deck: "Launch gives you a working system and a new source of evidence. The next decision should use it.",
    },
    practice: {
      label: "In practice",
      heading: "What we work through.",
      items: [
        {
          title: "Observe what happens",
          body: "Review feedback and the signals that matter to the business.",
        },
        {
          title: "Choose the next improvement",
          body: "Separate faults, usability issues and new opportunities. Prioritise the changes that address a clear need.",
        },
        {
          title: "Keep ownership clear",
          body: "Update the roadmap and documentation as the product changes.",
        },
      ],
    },
    outputs: {
      label: "What you leave with",
      heading: ["Something the team", "can use."],
      deck: "Typical outputs are agreed around your scope.",
      items: [
        "A review of feedback",
        "A prioritised improvement backlog",
        "An updated roadmap",
      ],
    },
  },
] as const;
