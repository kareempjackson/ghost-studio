/**
 * Ghost Savvy Studios — `/engage`.
 *
 * The scoped project, in the same order `/build` answers in: what is it,
 * what are the terms, is it for us, what do we get, how does it run, and the
 * questions left over. Set from the `/engage` comp.
 *
 * PLACEHOLDER: the plate under the cover is the huddle photograph in the
 * comp, looking up into a ring of faces; it is not exported yet. Drop it
 * into `public/images/` at 2x and set `plate.src`. The comp closes the
 * questions, so the answers are written here from the rest of the page and
 * want signing off.
 */

import type { TrackPageData } from "./track-page";

export const engagePage = {
  slug: "engage",
  title: "Engage",
  description:
    "A defined engagement for a specific business problem, with named deliverables and a written path to handover.",
  eyebrow: "Work with us / Engage",
  heading: ["A clear brief.", "A real result."],
  summary:
    "A defined engagement for a specific business problem, with named deliverables and a written path to handover.",
  action: { label: "Talk about Engage", href: "/contact?model=engage" },
  plate: {
    src: null,
    alt: "Five people in a huddle looking down into the camera, the Ghost wordmark across them.",
    ground: "#3a4450",
  },
  terms: {
    price: "Project-based",
    minimum: "Scope agreed before delivery",
    compare: { label: "Compare the three tracks", href: "/services#ways-in" },
  },
  who: {
    label: "Who it’s for",
    heading: ["A real problem.", "A decision you can justify."],
    deck: "Engage is for institutions and organisations buying through procurement or a statement of work. We respond to formal RFPs and provide the documentation your decision needs.",
  },
  shape: {
    label: "What comes together",
    heading: "The shape of the work.",
    items: [
      {
        title: "Discovery and scope",
        body: "Agree the problem, deliverables and acceptance criteria before committing to the build.",
      },
      {
        title: "Connected Delivery",
        body: "Bring the relevant disciplines together under one scope.",
      },
      {
        title: "A usable handover",
        body: "Deliver the work with documentation and the knowledge your team needs to use it.",
      },
    ],
  },
  process: {
    label: "Working together",
    heading: ["From the first conversation", "to the next step."],
    items: [
      {
        title: "Understand",
        body: "Review the brief, stakeholders and constraints.",
      },
      {
        title: "Deliver",
        body: "Design and build against the agreed scope, with review points.",
      },
      {
        title: "Hand over",
        body: "Test, document and support the transition to your team.",
      },
    ],
  },
  questions: {
    label: "A little more detail",
    heading: "Before we start.",
    items: [
      {
        question: "Can you respond to an RFP?",
        answer:
          "Yes. We respond to formal RFPs and statements of work, and provide the proposal, credentials and documentation your procurement process asks for.",
      },
      {
        question: "How is a project priced?",
        answer:
          "Against the problem. Discovery sets the deliverables and acceptance criteria, and the price is agreed on that scope before delivery starts.",
      },
      {
        question: "What if the scope changes?",
        answer:
          "We agree the change in writing before we act on it: what it adds, what it costs and what it moves. Nothing grows the scope quietly.",
      },
    ],
  },
  others: { label: "A different kind of engagement?" },
} as const satisfies TrackPageData;
