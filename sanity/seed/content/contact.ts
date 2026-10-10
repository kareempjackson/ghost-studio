/**
 * Ghost Savvy Studios — `/contact`, and everything it says.
 *
 * The page asks one question and gives two ways to answer it: the address,
 * for anyone who would rather write their own letter, and a form that sends
 * the message to the studio. A sent message is stored in Sanity as an
 * enquiry, and the sender gets the confirmation email below: see
 * app/(site)/contact/actions.ts.
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
    action: "Send message",
    /** Under the button: what happens to the message. */
    note: "A copy of your message goes to your inbox, and someone from the studio will reply personally. Your details are only used to answer you.",
    sending: "Sending…",
    sent: "Thank you. Your message is with the studio, and a confirmation is on its way to {email}.",
    another: "Send another message",
    failed: "That didn’t send. Please try again, or write to us at {email}.",
  },

  /** The confirmation email, sent the moment a message arrives. */
  acknowledgement: {
    subject: "We’ve got your message",
    greeting: "Hi {name},",
    body: "Thank you for writing to Ghost Savvy Studios. Your message has reached the studio, and someone from the team will reply to you personally.\n\nIf there’s anything you’d like to add in the meantime, just reply to this email.",
    recapLabel: "What you sent",
    signoff: ["Speak soon,", "Ghost Savvy Studios"],
  },
} as const;
