/**
 * Ghost Savvy Studios — the Ghost family's stories: one each for Ghost Labs,
 * Ghost U and Ghost Gives, at /[family]/[slug].
 *
 * Each is told in the same order, the order a story is: what the situation
 * was, what was tried, where it turned, and what was kept; then what
 * changed, in figures, and someone it was for, in their words.
 *
 * DEMO — all three are invented, written to show the template at full
 * length: the experiment, the cohort, the league, the figures and the people
 * quoted are not real. Replace or delete them before the site ships. Every
 * plate is a colour until its picture or film is uploaded in the Studio.
 */

import type { FamilySlug } from "../../../lib/links";
import type { CaseStudySeed, PlateSeed } from "./work";

export interface StorySeed {
  readonly family: FamilySlug;
  readonly slug: string;
  readonly title: string;
  /** YYYY-MM-DD. Newest first in the archive; numbered oldest first. */
  readonly date: string;
  readonly summary: string;
  readonly ground: string;
  readonly description?: string;
  readonly hero?: PlateSeed;
  readonly notes: readonly { readonly text: string; readonly ground: string }[];
  readonly headline: string;
  readonly facts: readonly { readonly label: string; readonly value: string }[];
  readonly tags: readonly string[];
  readonly overview: readonly string[];
  readonly link?: { readonly label: string; readonly href: string };
  readonly feature?: PlateSeed;
  /** A case study's parts, each able to name its own list. */
  readonly chapters: readonly (CaseStudySeed["chapters"][number] & { readonly listHeading?: string })[];
  readonly outcome?: {
    readonly label: string;
    readonly heading: string;
    readonly items: readonly { readonly value: string; readonly label: string }[];
  };
  readonly voice?: {
    readonly quote: string;
    readonly name: string;
    readonly role?: string;
    readonly company?: string;
  };
}

const plate = (ground: string, aspect: PlateSeed["aspect"] = "landscape"): PlateSeed => ({
  ground,
  aspect,
});

/** The family's colours, from the notes on their pages and the menu. */
const INK = "#0e0d0b";
const PAPER = "#f2f0eb";
const VERMILION = "#eb5b32";
const ACID = "#e0eab4";
const LILAC = "#dcd3ea";
const MINT = "#63e3c2";

export const stories: readonly StorySeed[] = [
  {
    family: "ghost-labs",
    slug: "low-signal",
    title: "Low Signal",
    date: "2026-06-12",
    summary:
      "A public-service form that keeps working with no signal at all, and tells people the truth about where their report is.",
    ground: ACID,
    description:
      "Ghost Labs built a form that keeps working when the network doesn't: saved on the phone, sent when a signal returns, and honest about where a report is.",
    hero: plate(INK, "wide"),
    notes: [
      { text: "No bars?", ground: VERMILION },
      { text: "Still sent.", ground: ACID },
    ],
    headline: "A form that keeps working when the network doesn’t.",
    facts: [
      { label: "What", value: "An offline-first pattern for public-service forms" },
      { label: "Started", value: "June 2026" },
      { label: "Bench time", value: "Three weeks, two people" },
      { label: "Status", value: "Prototype, now built into client work" },
    ],
    tags: ["Prototype", "Offline-first", "Public services"],
    overview: [
      "Every hurricane season, the same thing happens to public services across the region. The power goes, the towers go with it, and the forms people most need to fill in — damage reports, relief applications, outage notices — stop working at exactly the moment they matter.",
      "Most forms treat a lost connection as an error. We wanted to know what it would take to treat it as normal: to let someone fill in a form with no signal, keep it safe on their phone, send it the moment a bar comes back, and tell them honestly what has happened to it in between.",
      "Low Signal was three weeks on the bench. It started as a question, broke in a way we did not expect, and ended as a pattern we now build into client work by default.",
    ],
    feature: plate(ACID),
    chapters: [
      {
        label: "The question",
        heading: "What does a form do when the power goes?",
        body: [
          "We started with a damage report: the form a household fills in after a storm to tell a utility or a relief agency what happened. On a good day it takes four minutes. After a storm it can take four days — not because the form is hard, but because there is nothing to send it over.",
          "The person filling it in is standing in the wreckage with a phone at twenty per cent. The question was never really technical. It was: what would a form have to do to be trusted in that moment?",
        ],
        listHeading: "Where we started",
        items: [
          { text: "Filled in the damage report as it exists today, on a phone with the network switched off." },
          { text: "Listed every point where it lost work, showed a vague error, or asked people to try again later." },
          { text: "Wrote the one test the prototype had to pass: nothing typed is ever lost, and nobody is left guessing." },
        ],
        media: [[plate("#1d1c19", "wide")]],
      },
      {
        label: "On the bench",
        heading: "Save first. Send when you can.",
        body: [
          "The first build was simple on purpose. Every answer is saved to the phone as it is typed. Pressing send does not send anything; it puts the report in a queue. The queue tries quietly in the background, and the moment there is a connection — one bar, for a few seconds — it goes.",
          "We tested it the honest way: in a car park with the phone in airplane mode, in a basement, and on a bus route through the hills where the signal came and went every few hundred metres.",
        ],
        listHeading: "What we built",
        items: [
          { lead: "Local first", text: "Answers are kept on the device as they are entered, so closing the app or a dying battery loses nothing." },
          { lead: "A send queue", text: "Reports wait their turn and go when a connection appears, without anyone pressing anything again." },
          { lead: "Small payloads", text: "Photos are resized on the phone before they are queued, so a weak signal only carries what matters." },
        ],
        media: [[plate(ACID, "portrait"), plate(INK, "portrait")]],
      },
      {
        label: "What broke",
        heading: "The network was not the hard part. Trust was.",
        body: [
          "The queue worked. The people using it did not trust it. With no clear sign that a report had gone, testers did what anyone would: they pressed send again, and again. On the bus route, one tester’s report arrived four times.",
          "The second problem was quieter. “Sent” meant three different things — saved on the phone, received by the server, read by a person — and the form used the same word for all of them.",
        ],
        listHeading: "What we found",
        items: [
          { text: "Duplicate reports whenever the signal flickered in the middle of a send." },
          { text: "No visible difference between waiting, sending and sent." },
          { text: "A confirmation screen that promised more than the system knew." },
        ],
        media: [[plate(VERMILION, "wide")]],
      },
      {
        label: "What we kept",
        heading: "Tell people the truth about where their report is.",
        body: [
          "The fix was mostly words. Every report now gets a receipt number on the phone before it leaves, so sending it twice cannot create two. The status is plain and specific — Saved on this phone, Waiting for signal, Received — and it only moves forward when the system actually knows.",
          "That honesty turned out to be the whole feature. Testers stopped re-sending once the form told them exactly what was happening, even when what was happening was nothing yet.",
        ],
        listHeading: "What we kept",
        items: [
          { lead: "Receipts before sending", text: "A number issued on the device makes every report safe to send twice." },
          { lead: "Three honest states", text: "Saved, waiting and received, in plain language, never a step ahead of the truth." },
          { lead: "A pattern, not a product", text: "Written up so any team can build it into any form, not just this one." },
        ],
        media: [[plate(PAPER), plate(ACID)]],
      },
    ],
    outcome: {
      label: "What changed",
      heading: "Three weeks on the bench. One pattern we now build by default.",
      items: [
        { value: "212", label: "test reports sent from a phone with no signal" },
        { value: "0", label: "reports lost between the phone and the server" },
        { value: "4 → 1", label: "copies of a report on a flickering signal, before and after receipts" },
        { value: "3 weeks", label: "from the question to a working prototype" },
      ],
    },
    voice: {
      quote:
        "I was standing in a car park with no bars, and it just said Waiting for signal. It was the first time a form has told me the truth about what it was doing.",
      name: "Renée Alleyne",
      role: "Volunteer tester",
      company: "Low Signal field trial",
    },
  },

  {
    family: "ghost-u",
    slug: "clarity-sprint-cohort-one",
    title: "Clarity Sprint: Cohort One",
    date: "2026-04-20",
    summary:
      "Four evenings, fourteen people and one rule: nobody builds anything until they can say what problem it solves.",
    ground: LILAC,
    description:
      "Ghost U’s first cohort: fourteen people from nine organisations learned Clarity Engineering on the projects they were about to fund.",
    hero: plate(LILAC, "wide"),
    notes: [
      { text: "Why?", ground: LILAC },
      { text: "Then build.", ground: ACID },
    ],
    headline: "Fourteen people learned to define the problem before paying to solve it.",
    facts: [
      { label: "Format", value: "Four evenings, one a week, in person in Bridgetown" },
      { label: "Who", value: "Fourteen people from two ministries, a university, four nonprofits and two startups" },
      { label: "Taught", value: "Clarity Engineering, the method the studio uses with clients" },
      { label: "Next", value: "Cohort Two, early 2027" },
    ],
    tags: ["Programme", "Clarity Engineering", "Teaching"],
    overview: [
      "Most of the projects we are asked to rescue went wrong in the first week, not the last. Somebody wrote a brief for a solution before anyone had agreed on the problem, and everything after it was built on a guess.",
      "Clarity Sprint was Ghost U’s first cohort: four evenings teaching the people who write those briefs to do the hard part first. We taught the method we use with clients, Clarity Engineering, on the projects the participants were actually about to fund.",
      "Nobody wrote a line of code. Two teams changed what they were building. One stopped a project before it had cost anything.",
    ],
    feature: plate("#1d1c19"),
    chapters: [
      {
        label: "The room",
        heading: "People who write briefs, not people who write code.",
        body: [
          "We wanted the people who decide what gets built: programme leads, department heads, founders, the person in a nonprofit who writes the grant application. Fourteen came, from nine organisations, each bringing one real project they were about to start.",
          "That rule mattered. Teaching a method on a made-up case is easy. Teaching it on a project someone’s budget depends on is the only way to know whether it works.",
        ],
        listHeading: "Who came",
        items: [
          { text: "Fourteen people from two ministries, a university, four nonprofits and two startups." },
          { text: "One live project per team, each within six months of being funded." },
          { text: "One evening a week for four weeks, with homework done on their own project." },
        ],
        media: [[plate(LILAC, "wide")]],
      },
      {
        label: "Week by week",
        heading: "One question a week, and no skipping ahead.",
        body: [
          "Each evening took one question from Clarity Engineering and stayed with it. The homework was always the same: go back to your project and answer the question properly, with the people involved, not from your desk.",
        ],
        listHeading: "The four evenings",
        items: [
          { lead: "Week one", text: "What are we actually solving? Talk to the people who live with the problem, not the people who describe it." },
          { lead: "Week two", text: "What is really happening? Watch the work as it is done, and write down where it breaks." },
          { lead: "Week three", text: "What should exist? Draw the system — people, steps and information — before choosing any software." },
          { lead: "Week four", text: "What is the first useful release? Cut the plan to the smallest thing that would genuinely help." },
        ],
        media: [[plate(PAPER, "portrait"), plate(LILAC, "portrait")]],
      },
      {
        label: "The turn",
        heading: "Week two is where the briefs started to change.",
        body: [
          "Watching the work happen is the step everyone wants to skip, and the one that changed the most. One ministry team had planned a new online portal for licence renewals. When they spent a morning at the front desk, they found most of the delay came from one paper form that had to be signed in another building.",
          "They did not need a portal. They needed that signature to move. The fix cost a fraction of the budget, and the portal was put on hold until it could be built on a process that worked.",
        ],
        listHeading: "What shifted",
        items: [
          { text: "Two teams rewrote their brief around a different problem from the one they arrived with." },
          { text: "One team stopped a build after week two, before any money was spent." },
          { text: "Every team left with a problem statement their colleagues signed off." },
        ],
        media: [[plate(VERMILION, "wide")]],
      },
      {
        label: "What they took home",
        heading: "A brief they could defend, and a way of working they could repeat.",
        body: [
          "Nobody left with a product. Everybody left with a brief that would survive a procurement review: a named problem, the evidence for it, a map of the system around it, and a first release small enough to deliver.",
        ],
        listHeading: "What each team left with",
        items: [
          { lead: "A problem statement", text: "In one sentence, agreed by the people who live with it." },
          { lead: "A system map", text: "The people, steps and information involved, on one page." },
          { lead: "A first release", text: "The smallest useful thing, and what it would take to build." },
        ],
        media: [[plate("#1d1c19"), plate(ACID)]],
      },
    ],
    outcome: {
      label: "What changed",
      heading: "Four evenings. No code. Better decisions.",
      items: [
        { value: "14", label: "people from nine organisations" },
        { value: "4", label: "evenings, one question each" },
        { value: "2", label: "briefs rewritten around a different problem" },
        { value: "1", label: "build stopped before it cost anything" },
      ],
    },
    voice: {
      quote:
        "We came in with a portal we were sure we needed. We left with a signature we needed to move. That one evening saved us most of a year.",
      name: "Andrea Marshall",
      role: "Programme lead",
      company: "Clarity Sprint, Cohort One",
    },
  },

  {
    family: "ghost-gives",
    slug: "full-court",
    title: "Full Court",
    date: "2026-08-30",
    summary:
      "A volunteer-run youth basketball league was signing up two hundred players on paper and WhatsApp. We gave it a name worth wearing, a site, and a sign-up that works on any phone.",
    ground: MINT,
    description:
      "Ghost Gives gave a volunteer-run youth basketball league an identity, a website and a two-minute online registration.",
    hero: plate(MINT, "wide"),
    notes: [
      { text: "Pass it on.", ground: ACID },
      { text: "Game on.", ground: MINT },
    ],
    headline: "A brand and a sign-up for a youth league run entirely by volunteers.",
    facts: [
      { label: "Partner", value: "Northpoint Youth Basketball" },
      { label: "What they do", value: "Free weekend basketball for players aged 9 to 17" },
      { label: "What we gave", value: "Identity, website, online registration and kit" },
      { label: "Studio time", value: "Six weeks, given in full" },
    ],
    tags: ["Brand", "Website", "Registration"],
    overview: [
      "Northpoint Youth Basketball runs free weekend games for more than two hundred young players, with a coaching team made up entirely of volunteers. The basketball was never the problem. Everything around it was.",
      "Registration happened on paper forms passed around the court and in a WhatsApp group with four hundred members. Parents could not tell whether their child had a place. Coaches spent the first month of every season chasing consent forms. Sponsors who wanted to help had nowhere to look.",
      "Ghost Gives is where we give the studio’s work away to people who could use it. This season, we gave it to Northpoint.",
    ],
    feature: plate(INK),
    chapters: [
      {
        label: "The cause",
        heading: "Two hundred players. Twelve volunteers. One WhatsApp group.",
        body: [
          "The league started in 2019 with one coach, one hoop and a dozen children. By this year it had grown to more than two hundred players across four age groups, still run by volunteers in the time they had left after work.",
          "That growth was the point, and it was also the strain. Every new player meant another paper form, another phone number, another parent asking in the group whether their child was signed up.",
        ],
        listHeading: "What we found",
        items: [
          { text: "Paper registration forms, collected by hand at the court." },
          { text: "A 400-member WhatsApp group carrying schedules, consent, kit sizes and questions all at once." },
          { text: "No public presence for sponsors, schools or new families to find." },
        ],
        media: [[plate(ACID, "wide")]],
      },
      {
        label: "What we gave",
        heading: "A name worth wearing, and a sign-up that takes two minutes.",
        body: [
          "We started with the identity, because the players asked for it first: a mark that would look right on a jersey and a crest a nine-year-old would want to wear. Then we built what the volunteers needed: a simple site, and a registration that works on any phone, including the cheapest one in the queue.",
        ],
        listHeading: "What we gave",
        items: [
          { lead: "Identity", text: "A wordmark, a crest and colours made for jerseys, banners and a phone screen." },
          { lead: "Website", text: "One clear site with the schedule, the age groups and how to help." },
          { lead: "Registration", text: "A two-minute sign-up that collects consent and medical details once, and keeps them private." },
          { lead: "Kit", text: "Jerseys and training tops designed to be printed locally, at a price the league can carry." },
        ],
        media: [[plate(MINT, "portrait"), plate(INK, "portrait")], [plate(PAPER, "wide")]],
      },
      {
        label: "Handing it over",
        heading: "Built so the volunteers can run it without us.",
        body: [
          "A gift that needs the studio to keep it running is not a gift. Everything was built to be updated by the league’s own volunteers: the schedule, the news, the registration window. We spent the last week teaching three of them to run it, and wrote the guide they asked for, in their words.",
        ],
        listHeading: "How we left it",
        items: [
          { text: "Trained three volunteers to update the site and open each season’s registration." },
          { text: "Wrote a one-page guide for the coaches, not for a developer." },
          { text: "Moved every account into the league’s own name, so nothing depends on us." },
        ],
        media: [[plate(ACID)]],
      },
    ],
    outcome: {
      label: "What changed",
      heading: "One season later.",
      items: [
        { value: "212", label: "players registered online in the first week" },
        { value: "0", label: "paper forms collected at the court" },
        { value: "3", label: "local sponsors who found the league through its site" },
        { value: "6 weeks", label: "of studio time, given in full" },
      ],
    },
    voice: {
      quote:
        "For five years, the first month of every season was paperwork. This year it was basketball. The kids wore the new jerseys to school.",
      name: "Marcus Bovell",
      role: "Founder and head coach",
      company: "Northpoint Youth Basketball",
    },
  },
];
