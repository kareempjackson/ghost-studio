/**
 * Gives the home page its moments, the studio its clock, each project the
 * part of the world it was for, and brings the privacy and cookie policies
 * up to date with what the home page now knows about a visitor.
 *
 *   npm run migrate:moments -- --dry   # list what would change
 *   npm run migrate:moments
 *
 * Until it has run, the motto stays for everyone: the site has no moments
 * to say.
 *
 * The home page (published, and any draft): the greetings and the moments in
 * sanity/seed/content/moments.ts, where Home page › Moments has none yet;
 * where it has, the "work from where they are" moment, after the moments for
 * returning visitors, if no moment reads that yet; and the New mark's words,
 * where they are empty.
 *
 * The projects (published, and any drafts): Region and Countries, read from
 * the Location on the card (sanity/lib/places.ts), where both are empty. A
 * location it can't read is listed, to be set by hand.
 *
 * Site settings (published, and any draft): the studio's time zone,
 * America/New_York, where it is empty.
 *
 * The privacy policy (published, and any draft): lines for your visits and
 * your country are added to what is collected automatically, and to how it is
 * used and how long it is kept, each only if it isn't there yet; and the line
 * on your choice speaks of "these notes" where it still speaks of "the note".
 *
 * The privacy policy and the cookie policy also say, where they still read as
 * this migration first wrote them, that a question to the site guide carries
 * the pages read on earlier visits.
 *
 * The cookie policy (published, and any draft): the gs-visitor item is added
 * to the Analytics list, after gs-attribution, if it isn't there yet.
 *
 * The footer (published, and any draft): what the contact band says to
 * someone on their third visit, where For returning visitors is empty.
 *
 * The site guide (published, and any draft): questions for the home page
 * when someone is back and has read the work before, if it has none yet.
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
import { placeOf } from "../lib/places";
import { toBlocks } from "../lib/rich";
import { legalDocuments, type LegalSection } from "../seed/content/legal";
import { returningBand } from "../seed/content/footer";
import { guide } from "../seed/content/guide";
import { greetings, localMoment, moments, newLabel, studioTimeZone } from "../seed/content/moments";

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

/** The policy's "last updated", as it reads: the day it changes, e.g. 2 November 2026. */
const today = new Date().toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });

const key = () => randomUUID().replace(/-/g, "").slice(0, 12);

/* ---- The home page and Site settings ---------------------------------------------- */

type Doc = Record<string, unknown> & { _rev: string };

type Item = { _key: string; title?: string; when?: { visit?: string; local?: boolean } };

async function migrateHome(id: string) {
  const doc = await client.getDocument<
    Doc & { moments?: { greetings?: unknown; newLabel?: string; items?: Item[] } }
  >(id);
  if (!doc) return;
  const items = doc.moments?.items ?? [];
  const patch = client.patch(id).ifRevisionId(doc._rev);
  const changes: string[] = [];

  if (!items.length) {
    patch.set({
      moments: {
        ...doc.moments,
        greetings: doc.moments?.greetings ?? greetings,
        newLabel: doc.moments?.newLabel ?? newLabel,
        items: moments.map((moment) => ({ _key: key(), ...moment })),
      },
    });
    changes.push(`sets the greetings, the New mark and ${moments.length} moments`);
  } else {
    if (!items.some((item) => item.when?.local)) {
      /* After the last moment for returning visitors, or first if there are none. */
      const back = items.filter((item) => item.when?.visit === "returning").at(-1);
      const moment = { _key: key(), ...localMoment };
      if (back) patch.insert("after", `moments.items[_key=="${back._key}"]`, [moment]);
      else patch.insert("before", "moments.items[0]", [moment]);
      changes.push(`adds “${localMoment.title}”${back ? ` after “${back.title}”` : " first"}`);
    }
    if (!doc.moments?.newLabel) {
      patch.set({ "moments.newLabel": newLabel });
      changes.push("sets the New mark");
    }
  }

  if (!changes.length) {
    console.log(`${id}: up to date.`);
    return;
  }
  console.log(`${id}: ${changes.join("; ")}.`);
  if (dry) return;
  await patch.commit();
}

/* ---- The contact band and the site guide ------------------------------------------ */

async function migrateFooter(id: string) {
  const doc = await client.getDocument<Doc & { contactBand?: { returning?: { heading?: string[] } } }>(id);
  if (!doc?.contactBand) return;
  if (doc.contactBand.returning?.heading?.length) {
    console.log(`${id}: up to date.`);
    return;
  }
  console.log(`${id}: sets the contact band for returning visitors.`);
  if (dry) return;
  await client.patch(id).ifRevisionId(doc._rev).set({ "contactBand.returning": returningBand }).commit();
}

async function migrateChat(id: string) {
  const doc = await client.getDocument<Doc & { starters?: { where?: string }[] }>(id);
  if (!doc?.starters) return;
  const set = guide.starters.find((one) => one.where === "returning");
  if (!set || doc.starters.some((one) => one.where === "returning")) {
    console.log(`${id}: up to date.`);
    return;
  }
  console.log(`${id}: adds the questions for someone back who has read the work.`);
  if (dry) return;
  await client
    .patch(id)
    .ifRevisionId(doc._rev)
    .insert("before", "starters[0]", [{ _key: key(), where: set.where, prompts: [...set.prompts] }])
    .commit();
}

/* ---- The projects ---------------------------------------------------------------- */

async function migrateProjects() {
  const projects = await client.fetch<
    { _id: string; _rev: string; location?: string; region?: string; countries?: string[] }[]
  >(`*[_type == "project"]{_id, _rev, location, region, countries}`);
  for (const project of projects) {
    if (project.region || project.countries?.length) continue;
    const place = placeOf(project.location);
    if (!Object.keys(place).length) {
      console.log(`${project._id}: can't read “${project.location ?? ""}”; set Region by hand.`);
      continue;
    }
    console.log(
      `${project._id}: “${project.location}” → ${[place.region, place.countries?.join(" ")].filter(Boolean).join(", ")}.`,
    );
    if (dry) continue;
    await client.patch(project._id).ifRevisionId(project._rev).set(place).commit();
  }
}

async function migrateSettings(id: string) {
  const doc = await client.getDocument<Doc>(id);
  if (!doc) return;
  if (doc.studioTimeZone) {
    console.log(`${id}: up to date.`);
    return;
  }
  console.log(`${id}: sets studioTimeZone to ${studioTimeZone}.`);
  if (dry) return;
  await client.patch(id).ifRevisionId(doc._rev).set({ studioTimeZone }).commit();
}

/* ---- The policies ---------------------------------------------------------------- */

type Pair = readonly [string, string];
type Span = { _type: string; _key: string; text?: string; marks?: string[] };
type Block = { _type: string; _key: string; children?: Span[]; markDefs?: unknown[]; [k: string]: unknown };
type Section = { _key: string; id?: string; list?: Block[]; paragraphs?: Block[] };
type Legal = { _rev: string; intro?: Block[]; sections?: Section[] };

/** A line for a section's list, by its bold lead in legal.ts, and the lead of the line it goes after. */
interface Line {
  readonly section: string;
  readonly lead: string;
  readonly after: string;
}

interface Policy {
  readonly slug: "privacy" | "cookies";
  readonly pairs: readonly Pair[];
  readonly lines: readonly Line[];
}

/** A line of a seeded list, by its bold lead. */
function seededLine(slug: Policy["slug"], id: string, lead: string) {
  const section = (legalDocuments[slug].sections as readonly LegalSection[]).find((one) => one.id === id);
  const line = section?.list?.find((one) => one.startsWith(`**${lead}**`));
  if (!line) throw new Error(`legal.ts has no ${slug} line led “${lead}” in "${id}"`);
  return line;
}

const PRIVACY: Policy = {
  slug: "privacy",
  pairs: [
    [
      "no analytics cookie is set and the note is kept only until you close the tab, unless you accept.",
      "no analytics cookie is set, and these notes are kept only until you close the tab, unless you accept.",
    ],
    [
      "and which of our pages you’ve opened in that tab, so it can answer them.",
      "and which of our pages you’ve opened in that tab and, if you’ve been before, on earlier visits, so it can answer them.",
    ],
    [
      "It never leaves your browser, and is forgotten a year after your last visit.",
      "It stays in your browser, except that a question to the site guide carries the case studies and insights you read on earlier visits, so it can answer. It is forgotten a year after your last visit.",
    ],
  ],
  lines: [
    { section: "information-collected-automatically", lead: "Your visits:", after: "How you found us:" },
    { section: "information-collected-automatically", lead: "Your country:", after: "Your visits:" },
    {
      section: "how-we-use-it",
      lead: "To show you what’s new since your last visit",
      after: "To understand how our site is used",
    },
    { section: "retention", lead: "Your visits:", after: "How you found us:" },
  ],
};

const COOKIES: Policy = {
  slug: "cookies",
  pairs: [
    [
      "so the home page can tell you what’s new since then. It never leaves your browser.",
      "so the home page can tell you what’s new since then. It stays in your browser, except that a question to the site guide carries the case studies and insights you read before.",
    ],
  ],
  lines: [{ section: "analytics", lead: "gs-visitor", after: "gs-attribution" }],
};

/** A list line's bold lead: its first span. */
const leadOf = (block: Block) => block.children?.[0]?.text ?? "";

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

async function migratePolicy(id: string, policy: Policy) {
  const doc = await client.getDocument<Legal>(id);
  if (!doc?.sections) return;
  const sections = structuredClone(doc.sections);
  const changes: string[] = [];

  for (const section of sections) rewrite([...(section.paragraphs ?? []), ...(section.list ?? [])], policy.pairs, changes);

  for (const line of policy.lines) {
    const list = sections.find((section) => section.id === line.section)?.list;
    if (!list?.length || list.some((one) => leadOf(one) === line.lead)) continue;
    /* In the shape of its neighbours: a list line, its lead in bold. */
    const like = list.find((block) => block.children?.[0]?.marks?.includes("strong")) ?? list[0];
    const block: Block = { ...like, ...(toBlocks(seededLine(policy.slug, line.section, line.lead))[0] as Block), _key: key() };
    const at = list.findIndex((one) => leadOf(one) === line.after);
    list.splice(at >= 0 ? at + 1 : list.length, 0, block);
    changes.push(`adds “${line.lead}” to “${line.section}”`);
  }

  if (!changes.length) {
    console.log(`${id}: up to date.`);
    return;
  }
  console.log(`${id}: ${changes.join("; ")}; dated ${today}.`);
  if (dry) return;
  await client.patch(id).ifRevisionId(doc._rev).set({ sections, updated: today }).commit();
}

async function main() {
  for (const id of ["homePage", "drafts.homePage"]) await migrateHome(id);
  for (const id of ["siteSettings", "drafts.siteSettings"]) await migrateSettings(id);
  await migrateProjects();
  for (const id of ["footer", "drafts.footer"]) await migrateFooter(id);
  for (const id of ["chat", "drafts.chat"]) await migrateChat(id);
  for (const id of ["legalPage-privacy", "drafts.legalPage-privacy"]) await migratePolicy(id, PRIVACY);
  for (const id of ["legalPage-cookies", "drafts.legalPage-cookies"]) await migratePolicy(id, COOKIES);
  if (dry) console.log("\n--dry: nothing written.");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
