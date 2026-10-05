/**
 * Ghost Savvy Studios — `/integrate`.
 *
 * The operational layer, in the same order `/build` answers in: what is it,
 * what are the terms, is it for us, what do we get, how does it run, and the
 * questions left over. Set from the `/integrate` comp.
 *
 * PLACEHOLDER: the plate under the cover is the field of ones and zeros in
 * the comp, a figure walking through it; it is not exported yet. Drop it
 * into `public/images/` at 2x and set `plate.src`. The comp closes the
 * questions, so the answers are written here from the rest of the page and
 * want signing off.
 */

import type { TrackPageData } from "./track-page";

export const integratePage = {
  slug: "integrate",
  title: "Integrate",
  description:
    "Cloud, identity and connected workflows. The operational layer that helps your team get the work done.",
  eyebrow: "Work with us / Integrate",
  heading: ["Behind every", "business that works."],
  summary:
    "Cloud, identity and connected workflows. The operational layer that helps your team get the work done.",
  action: { label: "Talk about Integrate", href: "/contact?model=integrate" },
  plate: {
    src: null,
    alt: "A figure walking through a wall of ones and zeros, the Ghost wordmark across it.",
    ground: "#3a3b4a",
  },
  terms: {
    price: "Ongoing or project-based",
    minimum: "Built around your existing systems",
    compare: { label: "Compare the three tracks", href: "/services#ways-in" },
  },
  who: {
    label: "Who it’s for",
    heading: ["Things are running.", "They could run better."],
    deck: "When information lives in too many places and everyday work depends on manual fixes, Integrate helps you build a more dependable foundation.",
  },
  shape: {
    label: "What comes together",
    heading: "The shape of the work.",
    items: [
      {
        title: "Cloud and access",
        body: "Azure or AWS infrastructure with considered identity and access controls.",
      },
      {
        title: "Connected workflows",
        body: "Project management, shared information and automation that reduce repetitive work.",
      },
      {
        title: "Useful implementation",
        body: "Custom data systems and AI where they earn their place in the workflow.",
      },
    ],
  },
  process: {
    label: "Working together",
    heading: ["From the first conversation", "to the next step."],
    items: [
      {
        title: "Map",
        body: "Understand the tools, people and dependencies already in place.",
      },
      {
        title: "Connect",
        body: "Plan and implement the operational changes in manageable stages.",
      },
      {
        title: "Enable",
        body: "Document the setup and help your team take ownership.",
      },
    ],
  },
  questions: {
    label: "A little more detail",
    heading: "Before we start.",
    items: [
      {
        question: "Do we have to replace our existing tools?",
        answer:
          "No. We start from what you already run and change only what is getting in the way. Where a tool works, we connect to it rather than replace it.",
      },
      {
        question: "Can this run alongside a website project?",
        answer:
          "Yes. Integrate can run next to a Build or Engage project, so the product and the systems behind it are planned together rather than joined up afterwards.",
      },
      {
        question: "Is AI part of every engagement?",
        answer:
          "No. We use it where it earns its place in the workflow, and leave it out where a simpler system does the job better.",
      },
    ],
  },
  others: { label: "A different kind of engagement?" },
} as const satisfies TrackPageData;
