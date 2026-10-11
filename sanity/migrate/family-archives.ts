/**
 * Swaps the Ghost family's demo content for the real thing.
 *
 *   npm run migrate:family -- --dry   # list what would change
 *   npm run migrate:family
 *
 * Deletes the three invented demo stories (Low Signal, Clarity Sprint:
 * Cohort One, Full Court), drafts included; creates every story in
 * sanity/seed/content/family-stories.ts that does not exist yet, leaving any
 * that does as it is; and on each family page, published and draft, removes
 * the placeholder plates from the archive and sets its deck and its empty
 * state from sanity/seed/content/family-pages.ts. A second run only does
 * what is left.
 *
 * Ghost U's empty state needs the code that shows it: deploy that first, or
 * its archive is a heading over nothing until it is.
 *
 * Needs SANITY_API_WRITE_TOKEN, read from .env.local.
 */

import { createClient } from "next-sanity";
import { richify } from "../lib/rich";
import { schemaTypes } from "../schemaTypes";
import { ghostUPage, givesPage, labsPage } from "../seed/content/family-pages";
import { stories } from "../seed/content/family-stories";
import { keyed, story, storyId } from "../seed/shape";

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

/** The stories written to show the template, before there were real ones. */
const DEMOS = [
  "familyStory-ghost-labs-low-signal",
  "familyStory-ghost-u-clarity-sprint-cohort-one",
  "familyStory-ghost-gives-full-court",
];

/** As a document stores it: keys on array items, rich text as blocks. */
const shaped = (type: string, doc: Record<string, unknown>) =>
  richify({ _type: type, ...(keyed(doc) as object) }, schemaTypes as never) as Record<string, unknown>;

async function main() {
  const tx = client.transaction();
  let writes = 0;

  for (const id of DEMOS) {
    for (const _id of [id, `drafts.${id}`]) {
      if (!(await client.getDocument(_id))) continue;
      console.log(`${_id}: deletes the demo story`);
      tx.delete(_id);
      writes++;
    }
  }

  for (const seed of stories) {
    const _id = storyId(seed);
    if (await client.getDocument(_id)) {
      console.log(`${_id}: already there, left as it is`);
      continue;
    }
    console.log(`${_id}: creates ${seed.title}`);
    tx.createIfNotExists({ ...shaped("familyStory", story(seed)), _id } as never);
    writes++;
  }

  for (const page of [labsPage, ghostUPage, givesPage]) {
    const id = `familyPage-${page.href.slice(1)}`;
    const { archive } = shaped("familyPage", { archive: page.archive }) as {
      archive: { deck: unknown; empty?: unknown };
    };
    for (const _id of [id, `drafts.${id}`]) {
      if (!(await client.getDocument(_id))) continue;
      console.log(`${_id}: clears the archive's plates, sets its deck${archive.empty ? " and empty state" : ""}`);
      tx.patch(_id, (p) => {
        const patch = p.unset(["archive.items"]).set({ "archive.deck": archive.deck });
        return archive.empty ? patch.set({ "archive.empty": archive.empty }) : patch;
      });
      writes++;
    }
  }

  if (dry) {
    console.log("Dry run: nothing written.");
    return;
  }
  if (!writes) {
    console.log("Nothing to write.");
    return;
  }
  await tx.commit();
  console.log("Done.");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
