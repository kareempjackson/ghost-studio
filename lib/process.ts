/**
 * Ghost Savvy Studios — the process, as the home page shows it.
 *
 * Four steps, in order. Each names what the studio does, the question that
 * step answers, and what comes out of it. The numbers are positional.
 */

export type ProcessIcon = "target" | "merge" | "layers" | "cycle";

export interface ProcessStep {
  readonly title: string;
  /** The question the step exists to answer. */
  readonly question: string;
  readonly body: string;
  /** What the step produces, set as a dotted run under a rule. */
  readonly outputs: readonly string[];
  readonly icon: ProcessIcon;
}

export const process = {
  /** The line on the foot of every plate. */
  mark: "Ghostsavvy / Process",
  steps: [
    {
      title: "Discover the job",
      question: "What are we actually solving?",
      body: "Understand the business, the people and the problem before deciding what to make.",
      outputs: ["Research", "Direction", "Positioning"],
      icon: "target",
    },
    {
      title: "Define the direction",
      question: "What does the right solution look like?",
      body: "Turn the findings into a clear strategy, shared priorities and a focused plan.",
      outputs: ["Strategy", "Scope", "Success criteria"],
      icon: "merge",
    },
    {
      title: "Design & build",
      question: "How do we make it work beautifully?",
      body: "Bring brand, product and engineering together. Prototype, test and build as one team.",
      outputs: ["Design", "Prototyping", "Engineering"],
      icon: "layers",
    },
    {
      title: "Launch & evolve",
      question: "What happens after we go live?",
      body: "Launch with confidence, hand over with care, and improve with real-world feedback.",
      outputs: ["Launch", "Handover", "Iteration"],
      icon: "cycle",
    },
  ],
} as const satisfies { mark: string; steps: readonly ProcessStep[] };
