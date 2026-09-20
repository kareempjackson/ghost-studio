/**
 * Ghost Savvy Studios — `/contact`, and everything it says.
 *
 * The page asks one question and gives two ways to answer it: the address,
 * for anyone who would rather write their own letter, and a form that drafts
 * one for them. Nothing here posts anywhere — see `ContactForm` — so the copy
 * says as much rather than implying an inbox the studio has not built yet.
 *
 * PLACEHOLDER: `budgets` are written to the shape the comp shows but the
 * bands themselves are a guess. Confirm before this ships.
 */

import { email } from "./footer";

export const contact = {
  eyebrow: "Contact us",
  heading: ["What are you", "trying to solve?"],
  summary: [
    "A clear brief, a rough idea or a problem that needs a name.",
    "Let’s start there.",
  ],

  start: {
    label: "A good place to start",
    email,
    /** The clipboard control under the address, and what it says once used. */
    copy: "Copy email address",
    copied: "Copied",
  },

  base: {
    label: "Remote-first / Fort Lauderdale, FL",
    lines: ["Working across the Caribbean,", "North America and Europe."],
  },

  next: {
    label: "What happens next",
    steps: [
      "Tell us what’s on your mind.",
      "We discuss the problem and the fit.",
      "We agree a sensible next step.",
    ],
  },

  form: {
    label: "Your project / The first conversation",
    heading: "Tell us a little.",
    optional: "(optional)",
    name: { label: "Your name", placeholder: "Name" },
    email: { label: "Your email", placeholder: "you@company.com" },
    company: { label: "Company", placeholder: "Company or organisation" },
    help: {
      label: "What do you need help with?",
      options: [
        "Strategy",
        "Brand",
        "Design",
        "Technology",
        "Marketing",
        "Creative production",
        "Not sure yet",
      ],
    },
    brief: {
      label: "What would you like to change?",
      placeholder:
        "A little context, what’s getting in the way, and what a good outcome would look like.",
    },
    budget: {
      label: "Budget",
      placeholder: "Select a range",
      /* PLACEHOLDER — confirm the bands. */
      options: [
        "Under $25k",
        "$25k – $50k",
        "$50k – $100k",
        "$100k+",
        "Not sure yet",
      ],
    },
    timing: { label: "Timing", placeholder: "e.g. This quarter" },
    action: "Continue in mail",
    /** The one thing the form must be honest about. */
    note: "This prepares a draft in your email app. Nothing is sent or stored by this form.",
    /** Shown when the draft has been handed to the mail app. */
    handed: "Your draft is open in your email app.",
    again: "Change anything above and press the button again.",
  },
} as const;
