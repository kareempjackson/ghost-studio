/**
 * Puts the Ghost family's stories into Sanity without resetting anything an
 * editor has done.
 *
 *   npm run seed:stories -- --dry   # print what would be written
 *   npm run seed:stories
 *
 * For every story in sanity/seed/content/family-stories.ts: a story that
 * does not exist yet is created, with no picture, so its plates show their
 * colours until pictures are uploaded; one that exists is left as it is.
 * Each family page gets the words its stories share (its Stories fields) if
 * it has none yet, on the published page and on any draft of it, so
 * publishing the draft later does not drop them. Nothing else is touched.
 *
 * Unlike `npm run seed`, safe to run on a dataset editors are working in.
 * Needs SANITY_API_WRITE_TOKEN, read from .env.local.
 */

import { createClient } from "next-sanity";
import { richify } from "../lib/rich";
import { schemaTypes } from "../schemaTypes";
import { ghostUPage, givesPage, labsPage } from "./content/family-pages";
import { stories } from "./content/family-stories";
import { keyed, story, storyId } from "./shape";

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

/** As a document stores it: keys on array items, rich text as blocks. */
const shaped = (type: string, doc: Record<string, unknown>) =>
  richify({ _type: type, ...(keyed(doc) as object) }, schemaTypes as never) as Record<
    string,
    unknown
  >;

async function main() {
  const tx = client.transaction();
  let writes = 0;

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
    for (const _id of [id, `drafts.${id}`]) {
      const existing = await client.getDocument(_id);
      if (!existing) continue;
      if (existing.stories) {
        console.log(`${_id}: already has its story words`);
        continue;
      }
      console.log(`${_id}: adds its story words`);
      const { stories: labels } = shaped("familyPage", { stories: page.stories });
      tx.patch(_id, (p) => p.setIfMissing({ stories: labels }));
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
