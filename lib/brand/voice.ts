/**
 * Ghost Savvy Studios — voice.
 *
 * The studio's audience is a programme lead who is accountable to a minister,
 * an auditor, or a court. They are not looking to be impressed. Every line of
 * copy is written as if it will be read aloud in a procurement review.
 */

export const positioning = {
  /**
   * The cover statement, stored as its two lines.
   *
   * The break falls on the comma because the sentence turns there: the first
   * half is the claim and the second is what the claim is not. The hero sets
   * one line per row and swings them against each other, so the break point is
   * content and cannot be left to the column width to decide.
   *
   * Sentence case here. The display role sets the caps, the way it does
   * everywhere else in the system.
   */
  cover: ["We build companies,", "not just products"],
  /**
   * The sign-off set opposite the cover, one sentence per line. Stored in
   * sentence case; the mono label that carries it sets the caps.
   */
  motto: ["Independent thinking.", "Connected execution."],
  line: "We build public-facing digital systems for institutions that cannot afford to get them wrong.",
  audience:
    "Governments, universities, and mission-driven organisations — the people accountable when a service fails in public.",
  promise:
    "We define the problem properly, then build the system that solves it. Accessible from the start, and yours to run afterwards.",
  proof:
    "Building has never been the hard part. Knowing what to build is the hard part. We solve the hard part first.",
  /**
   * The band under the cover: what the claim above it is actually claiming.
   *
   * It is written against a competitor rather than for an audience — the first
   * sentence is what everyone else does, the second is the order this studio
   * works in. That order is the whole argument, so the sentence names all
   * three things it produces and puts them after the thinking, not before it.
   */
  difference:
    "Most studios ship what you ask for and stop there. We work out what your business actually needs first, then build the product, the brand, and the systems it runs on.",
  /**
   * Audience and promise as one sentence. Written for the band under the hero
   * and kept after that band was rewritten around `difference`: it is the only
   * place the three audiences and the handover promise are said in one breath,
   * and it is the line to reach for when a page needs that rather than the
   * comparison.
   */
  summary:
    "Governments, universities, and mission-driven organisations hire us to define the problem properly, then build the system that solves it. Accessible from the start, and yours to run afterwards.",
} as const;

export interface VoicePrinciple {
  readonly name: string;
  readonly statement: string;
  readonly why: string;
  readonly yes: string;
  readonly no: string;
}

export const voicePrinciples: readonly VoicePrinciple[] = [
  {
    name: "Declarative",
    statement: "State the thing. Do not build up to it.",
    why: "Institutional readers scan for the commitment. Anything before it is friction.",
    yes: "Accessibility is not a phase at the end.",
    no: "We believe that accessibility should ideally be considered earlier in the process.",
  },
  {
    name: "Plain",
    statement: "Use the word the reader already uses.",
    why: "Jargon transfers risk to the reader. Plain language is the accessible default, not the simple one.",
    yes: "Your team runs it after we leave.",
    no: "We enable sustainable post-engagement operational autonomy.",
  },
  {
    name: "Accountable",
    statement: "Name the standard, the date, or the consequence.",
    why: "A specific claim can be checked. That is the point.",
    yes: "Built to WCAG 2.1 AA, tested with assistive technology before launch.",
    no: "Built with best-in-class accessibility.",
  },
  {
    name: "Unhurried",
    statement: "No urgency theatre. No exclamation marks.",
    why: "The work is measured in years of public service. Copy that shouts undermines it.",
    yes: "Talk to us about the problem you have not scoped yet.",
    no: "Book your free strategy call today — spots are limited!",
  },
  {
    name: "Credited",
    statement: "The institution is the subject. We are the method.",
    why: 'The studio is called Ghost for a reason: the client\'s name goes on the door.',
    yes: "The department cut form abandonment by a third.",
    no: "We slashed form abandonment by a third.",
  },
];

/** Mechanics that make the voice reproducible by anyone writing for the brand. */
export const writingMechanics = [
  {
    rule: "Sentence case everywhere except display type and labels.",
    detail:
      "Title Case In Running Copy reads as marketing. Display roles are uppercase because the wordmark is.",
  },
  {
    rule: "Active voice, present tense.",
    detail: '"We define the problem," not "the problem is defined by us."',
  },
  {
    rule: "One idea per sentence. Full stops over semicolons.",
    detail:
      "Short sentences survive translation, screen readers and being quoted out of context.",
  },
  {
    rule: "Numerals from 10 up; spell out one to nine. Always numerals in data and dates.",
    detail: "Consistent with most public-sector style guides the clients follow.",
  },
  {
    rule: "Expand an acronym on first use, every page.",
    detail: "Pages are entered from search, not from the top of the site.",
  },
  {
    rule: "Link text describes the destination.",
    detail:
      '"Read the accessibility statement", never "click here" or "learn more" — WCAG 2.4.4.',
  },
] as const;

/** Words the studio does not use, and what to write instead. */
export const bannedLanguage = [
  { avoid: "solutions", instead: "the system, the service, the site" },
  { avoid: "seamless / frictionless", instead: "say what got faster, and by how much" },
  { avoid: "leverage", instead: "use" },
  { avoid: "cutting-edge / next-gen", instead: "name the technology" },
  { avoid: "user-friendly", instead: "name the standard it meets" },
  { avoid: "revolutionise / transform", instead: "describe the before and after" },
  { avoid: "simply / just / easy", instead: "delete it — it is only easy for the writer" },
] as const;
