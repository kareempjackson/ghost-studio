/**
 * Ghost Savvy Studios — the site guide: the pill in the corner and the panel
 * it opens (app/(site)/_components/ChatPanel.tsx).
 *
 * Written to the voice in lib/brand/voice.ts: what it is said plainly, no
 * urgency, no exclamation marks, and nothing promised that the studio has
 * not promised elsewhere. Read by the seed and by `npm run migrate:guide`,
 * which also turns the references below into the dataset's own.
 */

/** A need the guide asks about, by the ids of what it points to. */
export interface GuideNeed {
  readonly label: string;
  /** A track page's slug: build, engage or integrate. */
  readonly track: string;
  /** A discipline's name on /work. */
  readonly discipline?: string;
  /** An insight topic's name. */
  readonly topic?: string;
}

export const guideNeeds: readonly GuideNeed[] = [
  { label: "A new product or service", track: "engage", discipline: "Digital", topic: "Strategy" },
  { label: "A brand that holds up", track: "engage", discipline: "Brand", topic: "Design" },
  { label: "A team to keep building", track: "build", discipline: "Digital", topic: "Engineering" },
  { label: "The systems behind the business", track: "integrate", discipline: "Systems", topic: "Engineering" },
];

/**
 * The invented clients written to fill /work (sanity/seed/content/work.ts):
 * the guide never points anyone to them.
 */
export const guideExclude = [
  "saltmere-credit-union",
  "kestrel-bay-resort",
  "calabash-water-authority",
  "fieldnote-learning",
  "ardent-logistics-group",
] as const;

/** The guide's words, without the needs and the work it leaves out, which are references. */
export const guide = {
  launcher: { open: "Find your way in", close: "Close", label: "The Ghost Savvy site guide" },
  heading: "Find the work closest to yours",
  disclosure:
    "A guide to the studio. Its answers are written by AI from this site, and it says when it doesn’t know.",
  intro:
    "Two questions, and we’ll show you the work, the way of working and the reading that fit. Or ask what you came to ask.",
  closeLabel: "Close the guide",
  picker: {
    audienceLabel: "Who is the work for?",
    other: "Someone else",
    needLabel: "What does it need?",
    unsure: "Not sure yet",
    skip: "Skip the questions and ask",
    resultLabel: "Your shortlist",
    kinds: { work: "Work", track: "How we’d work", insight: "Reading", page: "Page" },
    audienceLink: "More for {audience}",
    restart: "Start again",
  },
  starters: [
    {
      where: "any",
      prompts: [
        "What does a project with you look like?",
        "How do you price the work?",
        "What happens after launch?",
      ],
    },
    {
      where: "returning",
      prompts: ["What should I read next?", "Show me more like what I read last time", "Where should we start?"],
    },
    {
      where: "home",
      prompts: ["Where should we start?", "Who do you usually work with?", "How do you price the work?"],
    },
    {
      where: "work",
      prompts: ["What did this project involve?", "Show me similar work", "Who was this for?"],
    },
    {
      where: "insights",
      prompts: ["Where does this show up in your work?", "Show me a project like this"],
    },
    {
      where: "services",
      prompts: ["Which way of working fits us?", "What does the first month look like?", "What do we own at the end?"],
    },
    {
      where: "audiences",
      prompts: [
        "What have you built for teams like ours?",
        "How do you handle accessibility?",
        "What do we leave with?",
      ],
    },
    {
      where: "approach",
      prompts: ["Where do most projects start?", "What comes out of the first phase?"],
    },
  ],
  ask: {
    placeholder: "Ask about the work, or your project",
    send: "Ask",
    reading: "Reading the site",
    you: "You asked:",
    guide: "The guide answered:",
    error: "That answer didn’t come through. Ask again, or talk to the team.",
    busy: "A lot of questions are arriving at once. Give it a minute, then ask again.",
    limit:
      "That’s as far as this conversation goes here. Send it to the team as a brief and a person will pick it up.",
  },
  brief: {
    open: "Talk to the team",
    review: "Check the brief",
    heading: "Your brief",
    lead: "Check what it says, add how to reach you, and send it. Someone from the studio will reply to you personally.",
    name: { label: "Your name", placeholder: "Name" },
    email: { label: "Email", placeholder: "you@company.com" },
    company: { label: "Organisation", placeholder: "Where you work" },
    summary: { label: "What you need", placeholder: "What you’re working on, and what you need from us" },
    optional: "(optional)",
    send: "Send the brief",
    sending: "Sending",
    sent: "Your brief is with the studio, and a confirmation is on its way to {email}.",
    failed: "That didn’t send. Please try again, or write to us at {email}.",
    note: "The conversation goes with your brief, so you don’t have to repeat yourself. Nothing else you typed is kept.",
    back: "Back to the guide",
  },
} as const;
