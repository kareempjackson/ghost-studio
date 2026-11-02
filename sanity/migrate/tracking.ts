/**
 * Moves the Google Analytics ID into Site settings, writes the cookie
 * banner's words, and brings the privacy and cookie policies up to date with
 * analytics, the banner and the note of where visitors came from.
 *
 *   npm run migrate:tracking -- --dry   # list what would change
 *   npm run migrate:tracking
 *
 * Run it before the site that reads the ID from Site settings goes live:
 * until the ID is there, Google Analytics is off.
 *
 * Site settings (published, and any draft): the GA4 measurement ID the site
 * used to carry in code, the cookie banner's words, and the choices under
 * Tracking as the site reads them when they're empty (PostHog's US cloud,
 * sessions recorded, the EEA, the UK and Switzerland asked), so the Studio
 * shows what is in force. Each only where the field is empty.
 *
 * The privacy policy (published, and any draft): the intro's promise of no
 * analytics cookies, the line over what is collected automatically and the
 * browser storage line are rewritten where they still read as seeded; lines
 * for analytics, session recordings, how you found us and your choice are
 * added to what is collected, and lines to how it is used, who it is shared
 * with and how long it is kept, with a paragraph on Cookie settings under
 * your rights, each only if it isn't there yet.
 *
 * The cookie policy (published, and any draft): the intro, the words over
 * what the site needs to work and the consent section are rewritten where
 * they still read as seeded; the gs_consent cookie is added to the list, and
 * the Analytics section after it, if they aren't there yet.
 *
 * Every line is written as in sanity/seed/content/legal.ts, which a new
 * dataset is seeded from. A policy's "last updated" date moves to the day of
 * the run, if anything in it changed. Each document is patched against the
 * revision it was read at: one edited meanwhile makes the run fail without
 * writing it; run it again.
 *
 * Needs SANITY_API_WRITE_TOKEN, read from .env.local.
 */

import { randomUUID } from "node:crypto";
import { createClient } from "next-sanity";
import { richify, toBlocks, toPlain } from "../lib/rich";
import { schemaTypes } from "../schemaTypes";
import { legalDocuments, type LegalSection } from "../seed/content/legal";
import { keyed } from "../seed/shape";
import type { Rich } from "../types";

const dry = process.argv.includes("--dry");

const token = process.env.SANITY_API_WRITE_TOKEN;
const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET;
if (!token || !projectId || !dataset) {
  console.error(
    "Set NEXT_PUBLIC_SANITY_PROJECT_ID, NEXT_PUBLIC_SANITY_DATASET and SANITY_API_WRITE_TOKEN in .env.local.",
  );
  process.exit(1);
}

const client = createClient({
  projectId,
  dataset,
  token,
  apiVersion: process.env.NEXT_PUBLIC_SANITY_API_VERSION || "2026-10-01",
  useCdn: false,
});

/** The policy's "last updated", as it reads: the day it changes, e.g. 1 November 2026. */
const today = new Date().toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });

const key = () => randomUUID().replace(/-/g, "").slice(0, 12);

/* ---- Site settings --------------------------------------------------------------- */

/** The ID lib/analytics.ts carried before it moved here. */
const GA_ID = "G-BPMZV2P5TG";

const COOKIE_BANNER = {
  message: "We use cookies to see how our site is used, so we can make it better.",
  link: { label: "Cookie policy", href: "/cookies" },
  accept: "Accept",
  decline: "Decline",
  settings: "Cookie settings",
};

/** What lib/analytics.ts takes an empty choice under Tracking to mean. */
const CHOICES = { posthogRegion: "us", sessionReplays: true, consentScope: "regions" } as const;

async function migrateSettings(id: string) {
  const doc = await client.getDocument<Record<string, unknown> & { _rev: string }>(id);
  if (!doc) return;
  const set: Record<string, unknown> = {};
  if (!doc.gaMeasurementId) set.gaMeasurementId = GA_ID;
  if (!doc.cookieBanner) set.cookieBanner = COOKIE_BANNER;
  for (const [field, value] of Object.entries(CHOICES)) if (doc[field] == null) set[field] = value;

  if (!Object.keys(set).length) {
    console.log(`${id}: up to date.`);
    return;
  }
  console.log(`${id}: sets ${Object.keys(set).join(", ")}.`);
  if (dry) return;
  await client.patch(id).ifRevisionId(doc._rev).set(set).commit();
}

/* ---- The policies ---------------------------------------------------------------- */

type Pair = readonly [string, string];
type Span = { _type: string; _key: string; text?: string; marks?: string[] };
type Block = { _type: string; _key: string; children?: Span[]; markDefs?: unknown[]; [k: string]: unknown };
type Section = { _key: string; id?: string; title?: string; list?: Block[]; paragraphs?: Block[] };
type Legal = { _rev: string; intro?: Block[]; sections?: Section[] };

/**
 * A line for a section's list, as legal.ts writes it, and the bold lead of
 * the line it goes after: "start" for first, the end if absent.
 */
interface Line {
  readonly section: string;
  readonly text: string;
  readonly after?: string;
}

/** A section's paragraphs, rewritten while their first still reads as seeded. */
interface Paragraphs {
  readonly section: string;
  readonly was: string;
  readonly title?: string;
  readonly now: readonly string[];
}

/** A paragraph added to a section, after the one that starts with `after`, unless one with `mark` is there. */
interface Paragraph {
  readonly section: string;
  readonly after: string;
  readonly mark: string;
  readonly text: string;
}

interface Policy {
  readonly pairs: readonly Pair[];
  readonly rewrites: readonly Paragraphs[];
  readonly lines: readonly Line[];
  readonly paragraphs: readonly Paragraph[];
  /** Whole sections added after another, if they aren't there yet. */
  readonly sections: readonly { readonly id: string; readonly after: string }[];
}

const seeded = (slug: "privacy" | "cookies", id: string): LegalSection => {
  const section = (legalDocuments[slug].sections as readonly LegalSection[]).find((one) => one.id === id);
  if (!section) throw new Error(`legal.ts has no ${slug} section "${id}"`);
  return section;
};

/** A line of a seeded list, by its bold lead. */
const seededLine = (slug: "privacy" | "cookies", id: string, lead: string) => {
  const line = seeded(slug, id).list?.find((one) => one.startsWith(`**${lead}**`));
  if (!line) throw new Error(`legal.ts has no ${slug} line led “${lead}” in "${id}"`);
  return line;
};

const PRIVACY: Policy = {
  pairs: [
    [
      "We collect very little: no advertising trackers, no analytics cookies, and we never sell your information.",
      "We collect what we need to answer you and to understand how our site is used. We never sell your information or use it to advertise to you, and if you’re in the European Economic Area, the United Kingdom or Switzerland, we ask before setting any analytics cookie.",
    ],
    [
      " one item in your browser’s session storage remembers that you’ve seen the opening animation. It holds no personal information and is deleted when you close the tab. Our ",
      " a few small items in your browser let the site work as designed, such as one that remembers you’ve seen the opening animation and a cookie that remembers your cookie choice. Our ",
    ],
  ],
  rewrites: [
    {
      section: "information-collected-automatically",
      was: "We don’t use analytics, advertising or tracking cookies, and we don’t build profiles of visitors.",
      now: seeded("privacy", "information-collected-automatically").paragraphs,
    },
  ],
  lines: [
    ...["Analytics:", "Session recordings:", "How you found us:", "Your choice:"].map((lead, i, all) => ({
      section: "information-collected-automatically",
      after: i ? all[i - 1] : "Server logs:",
      text: seededLine("privacy", "information-collected-automatically", lead),
    })),
    {
      section: "how-we-use-it",
      after: "To run and secure the website",
      text: seededLine("privacy", "how-we-use-it", "To understand how our site is used"),
    },
    { section: "sharing", after: "Resend", text: seededLine("privacy", "sharing", "Google") },
    { section: "sharing", after: "Google", text: seededLine("privacy", "sharing", "PostHog") },
    ...["Analytics:", "Session recordings:", "How you found us:"].map((lead, i, all) => ({
      section: "retention",
      after: i ? all[i - 1] : "Site guide conversations:",
      text: seededLine("privacy", "retention", lead),
    })),
  ],
  paragraphs: [
    {
      section: "your-rights",
      after: "Depending on where you live",
      mark: "Cookie settings",
      text: seeded("privacy", "your-rights").paragraphs.find((one) => one.includes("**Cookie settings**"))!,
    },
  ],
  sections: [],
};

const COOKIES: Policy = {
  pairs: [
    [
      "In short: our website doesn’t use advertising, analytics or tracking cookies. This policy explains the little we keep in your browser, the services that load with our pages, and how to control them.",
      legalDocuments.cookies.intro,
    ],
    [
      "you may just see the opening animation more than once.",
      "you may just see the opening animation more than once, or be asked about cookies again.",
    ],
  ],
  rewrites: [
    {
      section: "what-we-use",
      was: "We don’t use cookies to track you, measure visits or show you advertising.",
      title: seeded("cookies", "what-we-use").title,
      now: seeded("cookies", "what-we-use").paragraphs,
    },
    {
      section: "consent",
      was: "Because we only use storage that is strictly necessary, we don’t ask for consent or show a cookie banner.",
      now: seeded("cookies", "consent").paragraphs,
    },
  ],
  lines: [{ section: "what-we-use", after: "start", text: seededLine("cookies", "what-we-use", "gs_consent") }],
  paragraphs: [],
  sections: [{ id: "analytics", after: "what-we-use" }],
};

const plain = (blocks: readonly Block[] | undefined) => toPlain((blocks ?? []) as unknown as Rich);

/** A list line's bold lead: its first span. */
const lead = (block: Block) => block.children?.[0]?.text ?? "";

/** Rewrites each pair's old words in place, wherever a span still holds them. */
function rewrite(blocks: readonly Block[], pairs: readonly Pair[], changes: string[]) {
  for (const block of blocks) {
    for (const span of block.children ?? []) {
      for (const [from, to] of pairs) {
        if (span.text?.includes(from)) {
          span.text = span.text.replace(from, to);
          changes.push(`rewrites “${from.trim().slice(0, 48)}…”`);
        }
      }
    }
  }
}

/** A seeded section as the document stores it: keyed, its runs rich. */
function asStored(slug: "privacy" | "cookies", id: string): Section {
  const doc = richify(
    { _type: "legalPage", ...(keyed({ sections: [seeded(slug, id)] }) as object) },
    schemaTypes as never,
  ) as unknown as { sections: Section[] };
  return { ...doc.sections[0], _key: key() };
}

async function migratePolicy(id: string, slug: "privacy" | "cookies", policy: Policy) {
  const doc = await client.getDocument<Legal>(id);
  if (!doc?.sections) return;
  const sections = structuredClone(doc.sections);
  const intro = structuredClone(doc.intro ?? []);
  const changes: string[] = [];
  const find = (sectionId: string) => sections.find((section) => section.id === sectionId);

  rewrite(intro, policy.pairs, changes);
  for (const section of sections) rewrite([...(section.paragraphs ?? []), ...(section.list ?? [])], policy.pairs, changes);

  for (const { section: sectionId, was, title, now } of policy.rewrites) {
    const section = find(sectionId);
    if (!section || !plain(section.paragraphs?.slice(0, 1)).startsWith(was)) continue;
    section.paragraphs = toBlocks(now) as Block[];
    if (title) section.title = title;
    changes.push(`rewrites the words in “${sectionId}”`);
  }

  for (const line of policy.lines) {
    const list = find(line.section)?.list;
    /* In the shape of its neighbours: a list line, its lead in bold. */
    const like = list?.find((block) => block.children?.[0]?.marks?.includes("strong")) ?? list?.[0];
    const block: Block = { ...like, ...(toBlocks(line.text)[0] as Block), _key: key() };
    if (!list || list.some((one) => lead(one) === lead(block))) continue;
    const after = line.after && line.after !== "start" ? list.findIndex((one) => lead(one) === line.after) : -1;
    list.splice(line.after === "start" ? 0 : after >= 0 ? after + 1 : list.length, 0, block);
    changes.push(`adds “${lead(block)}” to “${line.section}”`);
  }

  for (const { section: sectionId, after, mark, text } of policy.paragraphs) {
    const paragraphs = find(sectionId)?.paragraphs;
    if (!paragraphs || paragraphs.some((block) => plain([block]).includes(mark))) continue;
    const at = paragraphs.findIndex((block) => plain([block]).startsWith(after));
    paragraphs.splice(at >= 0 ? at + 1 : paragraphs.length, 0, { ...(toBlocks(text)[0] as Block), _key: key() });
    changes.push(`adds a paragraph to “${sectionId}”`);
  }

  for (const { id: sectionId, after } of policy.sections) {
    if (find(sectionId)) continue;
    const at = sections.findIndex((section) => section.id === after);
    sections.splice(at >= 0 ? at + 1 : sections.length, 0, asStored(slug, sectionId));
    changes.push(`adds the “${sectionId}” section`);
  }

  if (!changes.length) {
    console.log(`${id}: up to date.`);
    return;
  }
  console.log(`${id}: ${changes.join("; ")}; dated ${today}.`);
  if (dry) return;
  await client.patch(id).ifRevisionId(doc._rev).set({ intro, sections, updated: today }).commit();
}

async function main() {
  for (const id of ["siteSettings", "drafts.siteSettings"]) await migrateSettings(id);
  for (const id of ["legalPage-privacy", "drafts.legalPage-privacy"]) await migratePolicy(id, "privacy", PRIVACY);
  for (const id of ["legalPage-cookies", "drafts.legalPage-cookies"]) await migratePolicy(id, "cookies", COOKIES);
  if (dry) console.log("\n--dry: nothing written.");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
