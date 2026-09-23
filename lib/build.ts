/**
 * Ghost Savvy Studios — `/build`.
 *
 * The standing team, in the order a buyer asks: what is it, what does it
 * cost, is it for us, what do we get, how does it run, and the questions
 * left over. Set from the `/build` comp.
 *
 * PLACEHOLDER: the plate under the cover is the hands-joined photograph in
 * the comp; it is not exported yet. Drop it into `public/images/` at 2x and
 * set `plate.src`. The comp closes the questions, so the answers are written
 * here from the rest of the page and want signing off.
 */

export interface Step {
  readonly title: string;
  readonly body: string;
}

export interface Question {
  readonly question: string;
  readonly answer: string;
}

export const buildPage = {
  title: "Build",
  description:
    "Engineering, design and product strategy on a monthly subscription. A team composed around what you’re building.",
  eyebrow: "Work with us / Build",
  heading: ["Your next chapter.", "Our team."],
  summary:
    "Engineering, design and product strategy on a monthly subscription. A team composed around what you’re building.",
  action: { label: "Talk about Build", href: "/contact?model=build" },
  plate: {
    src: null as string | null,
    alt: "Four hands clasped at the wrists in a ring, the Ghost wordmark across them.",
  },
  terms: {
    price: "From $15,000 / month",
    minimum: "Six-month minimum",
    compare: { label: "Compare the three tracks", href: "/services#ways-in" },
  },
  who: {
    label: "Who it’s for",
    heading: ["You’re past MVP.", "The work is getting bigger."],
    deck: "You need a broader team without hiring every discipline separately. Build brings the people and direction needed to move the product forward each month.",
  },
  shape: {
    label: "What comes together",
    heading: "The shape of the work.",
    items: [
      {
        title: "Product direction",
        body: "A shared roadmap grounded in what the business needs next.",
      },
      {
        title: "Design and engineering",
        body: "The people shaping the experience work alongside the people building it.",
      },
      {
        title: "Delivery management",
        body: "Clear priorities, regular reviews and a team accountable for moving the work forward.",
      },
    ],
  },
  process: {
    label: "Working together",
    heading: ["From the first conversation", "to the next step."],
    items: [
      {
        title: "Define",
        body: "Agree the problem, priorities and first release.",
      },
      {
        title: "Build",
        body: "Work through the roadmap in regular delivery cycles.",
      },
      {
        title: "Establish",
        body: "Document the system and make the next stage clear.",
      },
    ],
  },
  questions: {
    label: "A little more detail",
    heading: "Before we start.",
    items: [
      {
        question: "Is this for an early idea?",
        answer:
          "Build suits teams past MVP with work to keep moving. If the idea is earlier than that, a scoped Engage project is usually the better first step.",
      },
      {
        question: "Who is on the team?",
        answer:
          "A product lead, designers and engineers, composed around what you are building. The mix changes as the work does, without you hiring for each discipline.",
      },
      {
        question: "What happens after six months?",
        answer:
          "Build continues month to month. We reshape the team around what comes next, or document the system and hand it over to yours.",
      },
    ],
  },
  others: { label: "A different kind of engagement?" },
} as const satisfies {
  title: string;
  description: string;
  eyebrow: string;
  heading: readonly string[];
  summary: string;
  action: { label: string; href: string };
  plate: { src: string | null; alt: string };
  terms: {
    price: string;
    minimum: string;
    compare: { label: string; href: string };
  };
  who: { label: string; heading: readonly string[]; deck: string };
  shape: { label: string; heading: string; items: readonly Step[] };
  process: { label: string; heading: readonly string[]; items: readonly Step[] };
  questions: { label: string; heading: string; items: readonly Question[] };
  others: { label: string };
};
