/**
 * Moves the copy written as plain text into the rich text fields.
 *
 *   npm run migrate:rich -- --dry   # list what would change
 *   npm run migrate:rich
 *
 * Every field that is now rich text but still holds a string, or a list of
 * strings, is rewritten as blocks: one per paragraph, the words unchanged.
 * Drafts and release versions too. Each document is patched against the
 * revision it was read at, so an edit made meanwhile fails that one patch
 * instead of being lost; run it again to pick up whatever was skipped.
 * Fields already rich are left alone, so a second run only does what is left.
 *
 * Needs SANITY_API_WRITE_TOKEN, read from .env.local.
 */

import { createClient } from "next-sanity";
import { richify } from "../lib/rich";
import { schemaTypes } from "../schemaTypes";

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
  perspective: "raw",
});

type Doc = { _id: string; _rev: string; _type: string; [key: string]: unknown };

async function main() {
  const types = schemaTypes.filter((t) => t.type === "document").map((t) => t.name);
  const docs = await client.fetch<Doc[]>(`*[_type in $types]`, { types });

  let changed = 0;
  let failed = 0;
  for (const doc of docs) {
    const next = richify(doc, schemaTypes as never);
    if (next === doc) continue;
    /* Only the top-level fields that changed: everything else is untouched. */
    const set = Object.fromEntries(Object.entries(next).filter(([k, v]) => doc[k] !== v));
    changed++;
    console.log(`${doc._id}: ${Object.keys(set).join(", ")}`);
    if (dry) continue;
    try {
      await client.patch(doc._id).ifRevisionId(doc._rev).set(set).commit();
    } catch (e) {
      failed++;
      console.error(`  ! not patched: ${e instanceof Error ? e.message : e}`);
    }
  }

  console.log(
    changed
      ? `${changed} document(s) ${dry ? "would change. Dry run: nothing written." : "updated."}`
      : "Every rich text field is already rich. Nothing to do.",
  );
  if (failed) {
    console.error(`${failed} document(s) changed while this ran. Run it again to finish them.`);
    process.exit(1);
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
