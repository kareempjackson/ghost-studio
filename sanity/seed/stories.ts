/**
 * Puts the Ghost family's stories into Sanity without resetting anything an
 * editor has done.
 *
 *   npm run seed:stories -- --dry   # print what would be written
 *   npm run seed:stories
 *   npm run seed:stories -- --replace bahd-chef   # rewrite that story
 *
 * For every story in sanity/seed/content/family-stories.ts: a story that
 * does not exist yet is created, with no picture, so its plates show their
 * colours until pictures are uploaded; one that exists is left as it is,
 * unless it is named with --replace (by slug, once per story). A replaced
 * story is rewritten from the seed, so it is refused while it has an open
 * draft or any picture uploaded: those are an editor's, and would be lost.
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
/** Slugs named after --replace: stories to rewrite from the seed. */
const replace = new Set(process.argv.filter((_, i) => process.argv[i - 1] === "--replace"));

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

  for (const slug of replace) {
    if (!stories.some((seed) => seed.slug === slug)) {
      console.error(`--replace ${slug}: no story with that slug in family-stories.ts`);
      process.exit(1);
    }
  }

  for (const seed of stories) {
    const _id = storyId(seed);
    const existing = await client.getDocument(_id);
    if (existing && replace.has(seed.slug)) {
      if (await client.getDocument(`drafts.${_id}`)) {
        console.log(`${_id}: has an open draft, not replaced. Publish or discard it first.`);
        continue;
      }
      if (JSON.stringify(existing).includes('"asset"')) {
        console.log(`${_id}: has pictures uploaded, not replaced.`);
        continue;
      }
      console.log(`${_id}: replaces ${seed.title} with the seed`);
      tx.createOrReplace({ ...shaped("familyStory", story(seed)), _id } as never);
      writes++;
      continue;
    }
    if (existing) {
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
