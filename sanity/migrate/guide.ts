/**
 * Turns the chat window into the site guide, and brings the privacy and
 * cookie policies up to date with it.
 *
 *   npm run migrate:guide -- --dry   # list what would change
 *   npm run migrate:guide
 *
 * Run it before the site that draws the guide goes live: until the guide's
 * words are in, the pill draws nothing.
 *
 * The Site guide (published, and any draft of it): every field the guide
 * reads is filled from sanity/seed/content/guide.ts where it is empty; the
 * four it shares with the chat window (the pill, the heading, the intro and
 * the close label) are replaced only while they still read as seeded, so a
 * line an editor has rewritten stays theirs; and the chat window's form
 * fields, which nothing reads any more, are dropped.
 *
 * The privacy policy (published, and any draft): the line that said the chat
 * opens your mail app loses that sentence, where it still reads as seeded;
 * lines for the guide are added to what you give us, what is collected, how
 * it is used, who it is shared with and how long it is kept, each only if it
 * isn't there yet.
 *
 * The cookie policy (published, and any draft): a line for the gs-guide item
 * of session storage, if it isn't there yet, and the sentence over the list
 * no longer counts the items, whether it still reads as seeded or as
 * `npm run migrate:consent` leaves it. Only lines are added, and only that
 * sentence is rewritten, so the two migrations can run in either order.
 *
 * A policy's "last updated" date moves to the day of the run, if anything in
 * it changed. Each document is patched against the revision it was read at:
 * one edited meanwhile makes the run fail without writing it; run it again.
 *
 * Needs SANITY_API_WRITE_TOKEN, read from .env.local.
 */

import { randomUUID } from "node:crypto";
import { createClient } from "next-sanity";
import { richify, toPlain } from "../lib/rich";
import { schemaTypes } from "../schemaTypes";
import { guideFields, keyed } from "../seed/shape";
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

/** The policy's "last updated", as it reads: the day it changes, e.g. 31 October 2026. */
const today = new Date().toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });

const key = () => randomUUID().replace(/-/g, "").slice(0, 12);

/* ---- The guide ----------------------------------------------------------------- */

/** The chat window's words, as seeded: replaced where they still read so. */
const OLD = {
  open: "Let’s talk",
  heading: "A good conversation starts here",
  intro: "Tell us what you’re thinking. A new idea, a tricky problem, or a question about working together.",
  closeLabel: "Close chat",
};

/** The fields the guide reads that the chat window never had. */
const NEW_FIELDS = ["disclosure", "picker", "exclude", "starters", "ask", "brief"] as const;

/** The chat window's form, which nothing reads any more. */
const OLD_FIELDS = ["status", "topics", "topicsLabel", "name", "email", "message", "preview", "ready", "note", "contact"];

/** The disciplines and topics as this dataset has them: one made in the Studio has an id of its own. */
async function namedIds() {
  const rows = await client.fetch<{ _id: string; _type: string; title: string }[]>(
    `*[_type in ["discipline", "insightTopic"] && !(_id in path("drafts.**"))]{_id, _type, title}`,
  );
  return (type: string, title: string) => rows.find((row) => row._type === type && row.title === title)?._id ?? null;
}

async function migrateGuide(id: string, idOf: Awaited<ReturnType<typeof namedIds>>) {
  const doc = await client.getDocument<Record<string, unknown> & { _rev: string }>(id);
  if (!doc) return;
  const fresh = richify(
    { _id: id, _type: "chat", ...(keyed(guideFields(idOf)) as object) },
    schemaTypes as never,
  ) as Record<string, unknown>;
  const set: Record<string, unknown> = {};
  const changes: string[] = [];

  for (const field of NEW_FIELDS) {
    if (doc[field] == null) {
      set[field] = fresh[field];
      changes.push(`adds ${field}`);
    }
  }
  const launcher = doc.launcher as { open?: string } | undefined;
  if (!launcher?.open || launcher.open === OLD.open) {
    set.launcher = fresh.launcher;
    changes.push("rewrites the pill");
  }
  if (!doc.heading || doc.heading === OLD.heading) {
    set.heading = fresh.heading;
    changes.push("rewrites the heading");
  }
  if (!doc.intro || toPlain(doc.intro as Rich).trim() === OLD.intro) {
    set.intro = fresh.intro;
    changes.push("rewrites the intro");
  }
  if (!doc.closeLabel || doc.closeLabel === OLD.closeLabel) {
    set.closeLabel = fresh.closeLabel;
    changes.push("rewrites the close label");
  }
  const unset = OLD_FIELDS.filter((field) => field in doc);
  if (unset.length) changes.push(`drops the chat window's ${unset.join(", ")}`);

  if (!changes.length) {
    console.log(`${id}: up to date.`);
    return;
  }
  console.log(`${id}: ${changes.join("; ")}.`);
  if (dry) {
    const needs = (set.picker as { needs?: { label: string; discipline?: unknown; topic?: unknown }[] } | undefined)?.needs;
    for (const need of needs ?? []) {
      console.log(`  need “${need.label}”: ${need.discipline ? "discipline found" : "no discipline"}, ${need.topic ? "topic found" : "no topic"}`);
    }
    return;
  }
  await client.patch(id).ifRevisionId(doc._rev).set(set).unset(unset).commit();
}

/* ---- The policies ---------------------------------------------------------------- */

type Pair = readonly [string, string];
type Span = { _type: string; _key: string; text?: string; marks?: string[] };
type Block = { _type: string; _key: string; children?: Span[]; markDefs?: unknown[]; [k: string]: unknown };
type Section = { _key: string; id?: string; list?: Block[]; paragraphs?: Block[] };
type Legal = { _rev: string; intro?: Block[]; sections?: Section[] };

/** Old words → new, as the privacy policy's spans hold them. */
const PRIVACY: readonly Pair[] = [
  [
    " anything you include when you write to us. The chat window opens a message in your own email app, so what you send that way reaches us as an email.",
    " anything you include when you write to us.",
  ],
];

/** Old words → new, as the cookie policy's spans hold them: as seeded, and as migrate:consent leaves them. */
const COOKIES: readonly Pair[] = [
  [
    "The only thing we store in your browser is one item of session storage, which the site needs to work as designed:",
    "The only things we keep in your browser are a few small items the site needs to work as designed:",
  ],
  [
    "The only things we keep in your browser are two small items the site needs to work as designed:",
    "The only things we keep in your browser are a few small items the site needs to work as designed:",
  ],
  [
    "This policy explains the one small piece of browser storage we do use,",
    "This policy explains the little we keep in your browser,",
  ],
];

/** A line for a list: its bold lead, the rest, and the lead of the line it goes after (the end if absent). */
interface Line {
  readonly section: string;
  readonly lead: string;
  readonly rest: string;
  readonly after?: string;
}

const PRIVACY_LINES: readonly Line[] = [
  {
    section: "information-you-give-us",
    after: "Email:",
    lead: "The site guide:",
    rest: " the questions you type into the guide on our pages, and which of our pages you’ve opened in that tab, so it can answer them. We keep none of it unless you send the conversation to us as a brief, when it is stored with your enquiry.",
  },
  {
    section: "information-collected-automatically",
    lead: "The site guide’s conversation:",
    rest: " if you use the site guide, your browser’s session storage keeps the conversation as you move between pages. It is deleted when you close the tab.",
  },
  {
    section: "how-we-use-it",
    after: "To answer your enquiry",
    lead: "To answer your questions in the site guide",
    rest: ": our legitimate interest in helping visitors find what they’re looking for.",
  },
  {
    section: "sharing",
    after: "Resend",
    lead: "Anthropic",
    rest: ", which writes the site guide’s answers from what you type into it.",
  },
  {
    section: "retention",
    after: "Newsletter:",
    lead: "Site guide conversations:",
    rest: " not kept, unless you send one to us as a brief, when it is kept as an enquiry is.",
  },
];

const COOKIE_LINES: readonly Line[] = [
  {
    section: "what-we-use",
    lead: "gs-guide",
    rest: " (session storage): keeps your conversation with the site guide, if you use it, as you move between pages. It holds only what you typed into the guide and is deleted when you close the tab.",
  },
];

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

/** Adds each line to its section's list, in the shape of its neighbours, if it isn't there yet. */
function addLines(sections: Section[], lines: readonly Line[], changes: string[]) {
  for (const line of lines) {
    const list = sections.find((section) => section.id === line.section)?.list;
    if (!list?.length || list.some((block) => lead(block) === line.lead)) continue;
    const like = list.find((block) => block.children?.[0]?.marks?.includes("strong")) ?? list[0];
    const block: Block = {
      ...like,
      _key: key(),
      markDefs: [],
      children: [
        { _type: "span", _key: key(), text: line.lead, marks: ["strong"] },
        { _type: "span", _key: key(), text: line.rest, marks: [] },
      ],
    };
    const at = line.after ? list.findIndex((one) => lead(one) === line.after) : -1;
    list.splice(at >= 0 ? at + 1 : list.length, 0, block);
    changes.push(`adds “${line.lead}”`);
  }
}

async function migratePolicy(id: string, pairs: readonly Pair[], lines: readonly Line[]) {
  const doc = await client.getDocument<Legal>(id);
  if (!doc?.sections) return;
  const sections = structuredClone(doc.sections);
  const intro = structuredClone(doc.intro ?? []);
  const changes: string[] = [];

  rewrite(intro, pairs, changes);
  for (const section of sections) rewrite([...(section.paragraphs ?? []), ...(section.list ?? [])], pairs, changes);
  addLines(sections, lines, changes);

  if (!changes.length) {
    console.log(`${id}: up to date.`);
    return;
  }
  console.log(`${id}: ${changes.join("; ")}; dated ${today}.`);
  if (dry) return;
  await client.patch(id).ifRevisionId(doc._rev).set({ intro, sections, updated: today }).commit();
}

async function main() {
  const idOf = await namedIds();
  for (const id of ["chat", "drafts.chat"]) await migrateGuide(id, idOf);
  for (const id of ["legalPage-privacy", "drafts.legalPage-privacy"]) await migratePolicy(id, PRIVACY, PRIVACY_LINES);
  for (const id of ["legalPage-cookies", "drafts.legalPage-cookies"]) await migratePolicy(id, COOKIES, COOKIE_LINES);
  if (dry) console.log("\n--dry: nothing written.");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
