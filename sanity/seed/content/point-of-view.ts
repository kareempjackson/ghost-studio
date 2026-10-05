/**
 * Ghost Savvy Studios — the point of view band.
 *
 * One claim on the left, and the three things it asks for on the right, one
 * card each. The cards read as a sentence in order — clarity, judgement,
 * ownership — so the order is content and the numbers are positional.
 */

export interface ViewCard {
  /** The one-word name of the principle. */
  readonly label: string;
  /** The line on the card. `\n` marks the break the comp sets. */
  readonly statement: string;
  /** What to do about it, at the foot of the card. */
  readonly action: string;
  /** The card's ground. Ink on all three, so each clears AA at its size. */
  readonly ground: string;
  /** Resting tilt, in degrees. */
  readonly tilt: number;
}

export const pointOfView = {
  eyebrow: "Our point of view",
  heading: ["AI didn’t make", "engineering", "easier."],
  deck: ["Better tools still need", "better decisions."],
  action: { label: "See how we work", href: "/how-we-work" },
  cards: [
    {
      label: "Clarity",
      statement: "It made\nbeing vague\nexpensive.",
      action: "Start with the right question.",
      ground: "#eb5b32",
      tilt: -3,
    },
    {
      label: "Judgement",
      statement: "Getting it right\nneeds judgement\n& definition.",
      action: "Give the work a clear direction.",
      ground: "#eedf4e",
      tilt: 2,
    },
    {
      label: "Ownership",
      statement: "And someone\nwilling\nto decide.",
      action: "Take responsibility for what’s next.",
      ground: "#63cdab",
      tilt: -1.5,
    },
  ],
} as const satisfies {
  eyebrow: string;
  heading: readonly string[];
  deck: readonly string[];
  action: { label: string; href: string };
  cards: readonly ViewCard[];
};
