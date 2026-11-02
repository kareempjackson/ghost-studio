/**
 * Tailor with AI, for every project and insight at once (lib/tailor.ts).
 *
 *   npm run ai:tailor -- --dry           # write nothing: print what Claude would write
 *   npm run ai:tailor                    # write it to the documents
 *   npm run ai:tailor -- --only=trekker  # one document, by slug
 *   npm run ai:tailor -- --force         # write again even what is up to date
 *
 * A document is written when what it would be written from has changed since
 * it last was (its words, the audiences, the briefs), and never while Keep my
 * edits is on. What Claude writes is kept in node_modules/.cache, so a run
 * after a dry run writes what the dry run showed, without asking again.
 *
 * The published document is patched, and its draft too if it has one, so
 * publishing the draft later doesn't take the words away again. Each is
 * patched against the revision it was read at: one edited meanwhile makes
 * the run fail for it without writing; run it again.
 *
 * Calls Claude (Opus) once a document that is due. Needs
 * SANITY_API_WRITE_TOKEN and ANTHROPIC_API_KEY, read from .env.local.
 */

import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import Anthropic from "@anthropic-ai/sdk";
import { createClient } from "next-sanity";
import {
  AUDIENCES_QUERY,
  INSIGHT_SOURCE,
  PROJECT_SOURCE,
  insightText,
  isDue,
  projectText,
  sourceHash,
  tailorInsight,
  tailorProject,
  tailoredValue,
  type Audience,
  type InsightSource,
  type InsightTailoring,
  type ProjectSource,
  type ProjectTailoring,
  type Stored,
} from "../../lib/tailor";
import { CARD_MAX } from "../../lib/tailored";

const dry = process.argv.includes("--dry");
const force = process.argv.includes("--force");
const only = process.argv.find((arg) => arg.startsWith("--only="))?.slice("--only=".length);

const token = process.env.SANITY_API_WRITE_TOKEN;
const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET;
if (!token || !projectId || !dataset || !process.env.ANTHROPIC_API_KEY) {
  console.error(
    "Set NEXT_PUBLIC_SANITY_PROJECT_ID, NEXT_PUBLIC_SANITY_DATASET, SANITY_API_WRITE_TOKEN and ANTHROPIC_API_KEY in .env.local.",
  );
  process.exit(1);
}

const sanity = createClient({
  projectId,
  dataset,
  token,
  apiVersion: process.env.NEXT_PUBLIC_SANITY_API_VERSION || "2026-10-01",
  useCdn: false,
  perspective: "published",
});
const claude = new Anthropic();

/* ---- What Claude wrote before, by document and source -------------------------- */

const CACHE = join(process.cwd(), "node_modules/.cache/ghost-tailor.json");
type Written = ProjectTailoring | InsightTailoring;

function readCache(): Record<string, Written> {
  try {
    return JSON.parse(readFileSync(CACHE, "utf8")) as Record<string, Written>;
  } catch {
    return {};
  }
}
const cache = readCache();
function remember(at: string, written: Written) {
  cache[at] = written;
  mkdirSync(dirname(CACHE), { recursive: true });
  writeFileSync(CACHE, JSON.stringify(cache, null, 2));
}

/* ---- One document ------------------------------------------------------------- */

type Doc = { _id: string; _rev: string; slug: string; tailored?: Stored | null };

function show(slug: string, written: Written, audiences: readonly Audience[]) {
  const name = (audience: string) => audiences.find((one) => one.slug === audience)?.name ?? audience;
  console.log(`  speaks to: ${written.suits.map(name).join(", ") || "none"}`);
  if (!("forAudience" in written)) return;
  for (const one of written.forAudience) {
    const long = one.card.length > CARD_MAX ? `  [${one.card.length} characters: over ${CARD_MAX}]` : "";
    console.log(`  · ${name(one.audience)}\n      card: ${one.card}${long}\n      summary: ${one.summary}`);
  }
  const missing = audiences.filter((audience) => !written.forAudience.some((one) => one.audience === audience.slug));
  if (missing.length) console.log(`  ! nothing for ${missing.map((one) => one.name).join(", ")}`);
}

async function tailor<T extends Doc>(
  kind: "project" | "insight",
  doc: T,
  audiences: readonly Audience[],
  text: string,
  write: () => Promise<Written>,
) {
  const label = `${kind} ${doc.slug}`;
  const hash = sourceHash(text, audiences);
  if (doc.tailored?.keep) return console.log(`${label}: Keep my edits is on; left alone.`);
  if (!force && !isDue(doc.tailored, hash)) return console.log(`${label}: up to date.`);

  const at = `${doc._id}:${hash}`;
  const before = cache[at];
  const written = before ?? (await write());
  if (!before) remember(at, written);
  console.log(`${label}:${before ? " (as the last dry run wrote it)" : ""}`);
  show(doc.slug, written, audiences);
  if (dry) return;

  const value = tailoredValue(written, audiences, hash);
  await sanity.patch(doc._id).ifRevisionId(doc._rev).set({ tailored: value }).commit();
  const draft = await sanity.getDocument<{ _rev: string; tailored?: Stored }>(`drafts.${doc._id}`);
  if (draft && !draft.tailored?.keep) {
    await sanity.patch(`drafts.${doc._id}`).ifRevisionId(draft._rev).set({ tailored: value }).commit();
  }
  console.log(`  written${draft ? ", and to its draft" : ""}.`);
}

/** Runs `work` over `items`, a few at a time. */
async function inTurn<T>(items: readonly T[], at: number, work: (item: T) => Promise<void>) {
  let next = 0;
  await Promise.all(
    Array.from({ length: Math.min(at, items.length) }, async () => {
      while (next < items.length) {
        const item = items[next++];
        try {
          await work(item);
        } catch (error) {
          console.error(`  failed: ${(error as Error).message}`);
          process.exitCode = 1;
        }
      }
    }),
  );
}

async function main() {
  const audiences = (await sanity.fetch<Audience[] | null>(AUDIENCES_QUERY)) ?? [];
  if (!audiences.length) throw new Error("Who we serve lists no audiences.");
  console.log(`Audiences: ${audiences.map((one) => one.name).join(", ")}\n`);

  const filter = only ? " && slug.current == $only" : "";
  const projects = await sanity.fetch<(Doc & ProjectSource)[]>(
    `*[_type == "project" && defined(slug.current)${filter}] | order(name asc) ${PROJECT_SOURCE}`,
    { only: only ?? "" },
  );
  const insights = await sanity.fetch<(Doc & InsightSource)[]>(
    `*[_type == "article" && defined(slug.current)${filter}] | order(publishedAt desc) ${INSIGHT_SOURCE}`,
    { only: only ?? "" },
  );

  await inTurn(projects, 3, (project) =>
    tailor("project", project, audiences, projectText(project), () => tailorProject(claude, project, audiences)),
  );
  await inTurn(insights, 3, (insight) =>
    tailor("insight", insight, audiences, insightText(insight), () => tailorInsight(claude, insight, audiences)),
  );
  if (dry) console.log("\n--dry: nothing written. Run without --dry to write what is shown above.");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
