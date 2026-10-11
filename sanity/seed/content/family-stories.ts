/**
 * Ghost Savvy Studios — the Ghost family's stories, at /[family]/[slug]:
 * Ghost Labs' experiments and Ghost Gives' projects. Ghost U has none yet.
 *
 * Each is told in the same order, the order a story is: what the situation
 * was, what was tried, where it turned, and what was kept; then what
 * changed, in figures, and someone it was for, in their words.
 *
 * STUBS — the three Labs stories are real, but only what is known about them
 * is written down: a name, a line, and an opening. Their chapters, figures
 * and quotes are left out rather than guessed, and the story page goes
 * without each part until it is written in the Studio. Unpluggd Travel and
 * Access Audit have a holding line only: replace it with what each one is.
 *
 * DUMMY DATA — Bahd Chef is told in full, to show the story at length, but
 * only the brief is real (a brand, a website and a mobile app for a private
 * chef). Everything else — the situation, the chapters, the figures, the
 * studio time and the quote — is invented. Replace it before the site ships.
 *
 * The dates only set the order (newest first) and the numbers (oldest
 * first); they are not shown, and are guesses until corrected. Every plate
 * is a colour until its picture or film is uploaded.
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
    slug: "unpluggd-travel",
    title: "Unpluggd Travel",
    date: "2026-09-01",
    summary: "A Ghost Labs experiment in travel. The full story is on its way.",
    ground: ACID,
    hero: plate(ACID, "wide"),
    notes: [],
    headline: "Unpluggd Travel, from the Ghost Labs bench.",
    facts: [{ label: "From", value: "Ghost Labs" }],
    tags: ["Travel"],
    overview: [
      "Unpluggd Travel is one of the products the studio has built on its own time. The full story, what it is, why we built it and what we learned, is being written.",
    ],
    chapters: [],
  },

  {
    family: "ghost-labs",
    slug: "vynl",
    title: "Vynl",
    date: "2026-08-01",
    summary:
      "Music streaming the fair way: your subscription goes to the artists you actually listen to.",
    ground: LILAC,
    hero: plate(LILAC, "wide"),
    notes: [],
    headline: "Stream music the fair way. Support the artists you love.",
    facts: [{ label: "From", value: "Ghost Labs" }],
    tags: ["Music", "Streaming"],
    overview: [
      "Vynl is a music streaming service built around a fairer deal for artists. Instead of pooling every subscription and paying out by overall popularity, each listener’s subscription goes to the artists they actually listen to.",
      "Listeners get more than the music, too: behind-the-scenes content from the artists they support.",
    ],
    chapters: [],
  },

  {
    family: "ghost-labs",
    slug: "access-audit",
    title: "Access Audit",
    date: "2026-07-01",
    summary: "A Ghost Labs experiment in accessibility. The full story is on its way.",
    ground: VERMILION,
    hero: plate(VERMILION, "wide"),
    notes: [],
    headline: "Access Audit, from the Ghost Labs bench.",
    facts: [{ label: "From", value: "Ghost Labs" }],
    tags: ["Accessibility"],
    overview: [
      "Access Audit is one of the products the studio has built on its own time. The full story, what it is, why we built it and what we learned, is being written.",
    ],
    chapters: [],
  },

  /* DUMMY DATA beyond the brief: see the note at the top of the file. */
  {
    family: "ghost-gives",
    slug: "bahd-chef",
    title: "Bahd Chef",
    date: "2026-09-01",
    summary:
      "A private chef was taking bookings through Instagram messages and chasing deposits by text. We gave the business a brand, a website and a mobile app to run it from.",
    ground: MINT,
    description:
      "Ghost Gives gave a private chef a brand, a website with menus and booking, and a mobile app to run the business from.",
    hero: plate(MINT, "wide"),
    notes: [
      { text: "Mise en place.", ground: ACID },
      { text: "Book the table.", ground: MINT },
    ],
    headline: "A brand, a website and a mobile app for a private chef.",
    facts: [
      { label: "Partner", value: "Bahd Chef" },
      { label: "What they do", value: "Private dining and events, cooked in the client’s own home" },
      { label: "What we gave", value: "Brand, website and mobile app" },
      { label: "Studio time", value: "Eight weeks, given in full" },
    ],
    tags: ["Brand", "Website", "Mobile app"],
    overview: [
      "Bahd Chef cooks private dinners and small events in people’s homes: a menu planned with the host, the shopping done, the meal cooked and served, the kitchen left cleaner than it was found. The food had a following. The business around it was held together by a phone.",
      "Enquiries came in through Instagram messages, WhatsApp and missed calls. Menus went out as photos of a notebook. Deposits were chased by text, dietary needs were scrolled for on the morning of the dinner, and every Sunday went on answering messages instead of planning the week’s menus.",
      "Ghost Gives is where we give the studio’s work away to people who could use it. This time we gave it to a kitchen: a brand worth putting on an apron, a website that takes a booking, and an app to run the business from.",
    ],
    feature: plate(INK),
    chapters: [
      {
        label: "The kitchen",
        heading: "Great food, booked through a message inbox.",
        body: [
          "We spent a week shadowing the business before designing anything: two dinners, one birthday lunch, and a lot of time watching the phone. The cooking was organised to the minute. Everything before it was not.",
          "A single dinner took, on average, more than thirty messages to confirm: the date, the guest count, the menu, the allergies, the address, the deposit, and the same questions again when the details changed.",
        ],
        listHeading: "What we found",
        items: [
          { text: "Enquiries spread across Instagram, WhatsApp, email and voicemail, with no single list of what was booked." },
          { text: "Menus sent as photos, so a client could not read one on a small screen, or share it with their guests." },
          { text: "Deposits requested by text and chased by hand, with bookings sometimes lost when a client went quiet." },
          { text: "Allergies and dietary needs buried in old conversations, found again on the day." },
        ],
        media: [[plate(ACID, "wide")]],
      },
      {
        label: "The brand",
        heading: "A name that looks the way the food tastes.",
        body: [
          "The cooking is generous, loud and a little irreverent, and the old logo, a script font on a chef’s hat, said none of it. We built the identity from the plate outwards: a heavy, confident wordmark, a palette taken from the kitchen, and a system that works as well on an apron as on a phone screen.",
        ],
        listHeading: "What we made",
        items: [
          { lead: "Wordmark", text: "A bold mark that holds up embroidered on an apron and stamped on a takeaway box." },
          { lead: "Colour and type", text: "A warm palette from the kitchen, and type that stays readable on a printed menu by candlelight." },
          { lead: "Menu cards", text: "Templates the chef can fill in for each dinner, printed at home or sent as a link." },
          { lead: "Photography", text: "A short guide to shooting the food in the client’s own light, with a phone." },
        ],
        media: [[plate(MINT, "portrait"), plate(INK, "portrait")]],
      },
      {
        label: "The website",
        heading: "Menus you can read, and dates you can book.",
        body: [
          "The website does one job: turn someone who has tasted the food at a friend’s dinner into a booking. It shows what a dinner looks like, what it costs per head, and which dates are free, and it asks every question the chef used to ask by message, once.",
        ],
        listHeading: "What it does",
        items: [
          { lead: "Sample menus", text: "Seasonal menus a client can read, share with their guests and choose from." },
          { lead: "Availability", text: "A calendar of open dates, so nobody asks for a Saturday that has gone." },
          { lead: "Enquiry", text: "Guest count, occasion, address and every allergy, collected in one form." },
          { lead: "Deposits", text: "Paid online when the date is confirmed, so the booking is held and the chef is not chasing it." },
        ],
        media: [[plate(PAPER, "wide")]],
      },
      {
        label: "The app",
        heading: "The whole business, in the chef’s pocket.",
        body: [
          "The chef is rarely at a desk. The app is built for a kitchen: big targets, short screens, and everything about the next dinner one tap from the home screen. It picks up every booking from the website and keeps the details of each client from one dinner to the next.",
        ],
        listHeading: "What it does",
        items: [
          { lead: "Bookings", text: "Every confirmed dinner, its deposit and its balance, in one list." },
          { lead: "Menu builder", text: "Dishes saved once and put together into a menu for each client, sent as a link." },
          { lead: "Client notes", text: "Allergies, likes and last time’s menu, waiting the next time they book." },
          { lead: "Prep lists", text: "The shopping and prep for each dinner, built from its menu and guest count." },
        ],
        media: [[plate(LILAC, "portrait"), plate(MINT, "portrait")]],
      },
      {
        label: "Handing it over",
        heading: "Built to be run by one person, between services.",
        body: [
          "A gift that needs the studio to keep it running is not a gift. Everything is in the chef’s own name, from the domain to the app store listing, and everything an update needs can be done from a phone. We spent the last week cooking the system in: a dry run of a real booking, from the first enquiry to the thank-you message.",
        ],
        listHeading: "How we left it",
        items: [
          { text: "Moved every account, domain and payment setting into the business’s own name." },
          { text: "Ran a real dinner through the whole system with the chef before launch." },
          { text: "Wrote a one-page guide for the chef, not for a developer." },
        ],
        media: [[plate(ACID)]],
      },
    ],
    outcome: {
      label: "What changed",
      heading: "Three months after launch.",
      items: [
        { value: "3×", label: "more enquiries a month than before the website" },
        { value: "80%", label: "of bookings now confirmed with a deposit paid online" },
        { value: "30 → 4", label: "messages to confirm a dinner, before and after" },
        { value: "8 weeks", label: "of studio time, given in full" },
      ],
    },
    voice: {
      quote:
        "I used to spend every Sunday answering messages. Now people pick a menu, pay the deposit and tell me about their allergies before I’ve even called them back. I just get to cook.",
      name: "Bahd Chef",
      role: "Private chef",
    },
  },
];
