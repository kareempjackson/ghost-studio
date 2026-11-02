/**
 * Brings the privacy and cookie policies up to date with what the site now
 * notes about what a visitor is looking for (lib/interest.ts): which of the
 * studio's audiences and needs, from the site guide, the box on the home
 * page and what they read. And gives the home page what it says to them.
 *
 * The audiences (published, and any drafts): a short name, e.g. health
 * services, where it is empty, for {audience} in the home page's moments.
 *
 * The home page (published, and any draft): the "work for who they are"
 * moment, after "Back, with something new", if no moment reads that yet; and
 * the words of the box at the head of Selected work, where they are empty.
 *
 * Site settings (published, and any draft): the For you mark, where empty.
 *
 * The footer (published, and any draft): what the contact band says for
 * each way of working, where For what they need is empty.
 *
 * The testimonials (published, and any draft): each quote's project, where
 * it has none and its company is a project's name.
 *
 *   npm run migrate:interest -- --dry   # list what would change
 *   npm run migrate:interest
 *
 * The privacy policy (published, and any draft): a line on what you're
 * looking for is added to what is collected automatically, after your
 * country, and lines on the box to what you give us and how long it is kept,
 * each if it isn't there yet; the line on how it is used adds "the work
 * closest to yours", and the line on Anthropic adds the box, where they
 * still read as before.
 *
 * The cookie policy (published, and any draft): the gs-visitor item adds the
 * kind of organisation, where it still reads as `migrate:moments` wrote it.
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
import { toBlocks } from "../lib/rich";
import { legalDocuments, type LegalSection } from "../seed/content/legal";
import { trackBands } from "../seed/content/footer";
import { describe, forYouLabel, interestMoment, shortNames } from "../seed/content/moments";

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

/* ---- The policies ---------------------------------------------------------------- */

type Pair = readonly [string, string];
type Span = { _type: string; _key: string; text?: string; marks?: string[] };
type Block = { _type: string; _key: string; children?: Span[]; markDefs?: unknown[]; [k: string]: unknown };
type Section = { _key: string; id?: string; list?: Block[]; paragraphs?: Block[] };
type Legal = { _rev: string; sections?: Section[] };

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
      ", and work from your part of the world:",
      ", work from your part of the world, and the work closest to yours:",
    ],
    [
      ", which writes the site guide’s answers from what you type into it.",
      ", which writes the site guide’s answers from what you type into it, and matches what you describe in the box on our home page to our work.",
    ],
  ],
  lines: [
    { section: "information-collected-automatically", lead: "What you’re looking for:", after: "Your country:" },
    { section: "information-you-give-us", lead: "The box on our home page:", after: "The site guide:" },
    { section: "retention", lead: "What you type into the box on our home page:", after: "Site guide conversations:" },
  ],
};

const COOKIES: Policy = {
  slug: "cookies",
  pairs: [
    [
      "how many times you’ve visited, when you were last here and which case studies and insights you’ve read, so the home page can tell you what’s new since then.",
      "how many times you’ve visited, when you were last here, which case studies and insights you’ve read, and which of the kinds of organisation we work with you seem to be and what you need, so the site can tell you what’s new and show you the work closest to yours first.",
    ],
  ],
  lines: [],
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

/* ---- The audiences and the home page ----------------------------------------- */

async function migrateAudiences() {
  const audiences = await client.fetch<{ _id: string; _rev: string; slug?: string; shortName?: string }[]>(
    `*[_type == "audience"]{_id, _rev, "slug": slug.current, shortName}`,
  );
  for (const audience of audiences) {
    const short = audience.slug && shortNames[audience.slug];
    if (audience.shortName || !short) continue;
    console.log(`${audience._id}: short name “${short}”.`);
    if (!dry) await client.patch(audience._id).ifRevisionId(audience._rev).set({ shortName: short }).commit();
  }
}

type Item = { _key: string; title?: string; when?: { fresh?: boolean; interest?: boolean } };

async function migrateHome(id: string) {
  const doc = await client.getDocument<{ _rev: string; moments?: { items?: Item[] }; describe?: unknown }>(id);
  if (!doc) return;
  const patch = client.patch(id).ifRevisionId(doc._rev);
  const changes: string[] = [];
  const items = doc.moments?.items ?? [];
  if (items.length && !items.some((item) => item.when?.interest)) {
    /* After the moment for someone back with something new, or first. */
    const after = items.find((item) => item.when?.fresh);
    const moment = { _key: key(), ...interestMoment };
    if (after) patch.insert("after", `moments.items[_key=="${after._key}"]`, [moment]);
    else patch.insert("before", "moments.items[0]", [moment]);
    changes.push(`adds “${interestMoment.title}”${after ? ` after “${after.title}”` : " first"}`);
  }
  if (!doc.describe) {
    patch.set({ describe });
    changes.push("sets the box's words");
  }
  if (!changes.length) {
    console.log(`${id}: up to date.`);
    return;
  }
  console.log(`${id}: ${changes.join("; ")}.`);
  if (!dry) await patch.commit();
}

/* ---- Site settings, the footer and the testimonials ---------------------------- */

async function migrateSettings(id: string) {
  const doc = await client.getDocument<{ _rev: string; forYouLabel?: string }>(id);
  if (!doc) return;
  if (doc.forYouLabel) return console.log(`${id}: up to date.`);
  console.log(`${id}: sets the For you mark.`);
  if (!dry) await client.patch(id).ifRevisionId(doc._rev).set({ forYouLabel }).commit();
}

async function migrateFooter(id: string) {
  const doc = await client.getDocument<{ _rev: string; contactBand?: { forTracks?: unknown[] } }>(id);
  if (!doc?.contactBand) return;
  if (doc.contactBand.forTracks?.length) return console.log(`${id}: up to date.`);
  console.log(`${id}: sets the contact band for each way of working.`);
  if (dry) return;
  await client
    .patch(id)
    .ifRevisionId(doc._rev)
    .set({ "contactBand.forTracks": trackBands.map((band) => ({ _key: key(), track: band.track, heading: [...band.heading] })) })
    .commit();
}

/** A name as it is compared: lower case, without punctuation or a company suffix. */
const bare = (name: string) =>
  name
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9 ]/g, " ")
    .replace(/\b(inc|ltd|llc|limited|co)\b/g, " ")
    .replace(/\s+/g, " ")
    .trim();

async function migrateTestimonials(id: string) {
  const doc = await client.getDocument<{ _rev: string; items?: { _key: string; company?: string; project?: unknown }[] }>(id);
  if (!doc?.items) return;
  const projects = await client.fetch<{ _id: string; name: string }[]>(
    `*[_type == "project" && !(_id in path("drafts.**"))]{_id, name}`,
  );
  const patch = client.patch(id).ifRevisionId(doc._rev);
  const changes: string[] = [];
  for (const item of doc.items) {
    if (item.project || !item.company) continue;
    const project = projects.find((one) => bare(one.name) === bare(item.company!));
    if (!project) continue;
    patch.set({ [`items[_key=="${item._key}"].project`]: { _type: "reference", _ref: project._id } });
    changes.push(`links “${item.company}” to ${project._id}`);
  }
  if (!changes.length) return console.log(`${id}: up to date.`);
  console.log(`${id}: ${changes.join("; ")}.`);
  if (!dry) await patch.commit();
}

async function main() {
  await migrateAudiences();
  for (const id of ["siteSettings", "drafts.siteSettings"]) await migrateSettings(id);
  for (const id of ["footer", "drafts.footer"]) await migrateFooter(id);
  for (const id of ["testimonials", "drafts.testimonials"]) await migrateTestimonials(id);
  for (const id of ["homePage", "drafts.homePage"]) await migrateHome(id);
  for (const id of ["legalPage-privacy", "drafts.legalPage-privacy"]) await migratePolicy(id, PRIVACY);
  for (const id of ["legalPage-cookies", "drafts.legalPage-cookies"]) await migratePolicy(id, COOKIES);
  if (dry) console.log("\n--dry: nothing written.");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
