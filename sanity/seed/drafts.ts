/**
 * Puts the sub-portfolios into Sanity as drafts, for an editor to finish
 * and publish.
 *
 *   npm run seed:drafts -- --dry   # print what would be written
 *   npm run seed:drafts
 *
 * For every sub-portfolio in sanity/seed/content/sub-portfolios.ts: a draft
 * is written (drafts.project-<slug>), Part of the project its `parent` slug
 * names, if no project has that slug yet, as a draft or published; one that
 * does is left as it is. Nothing is published, and nothing else is touched:
 * the larger project links to the part once the part is published.
 *
 * The drafts carry placeholders in square brackets, beginning "Add:", for
 * what only the team knows. Fill each in, or cut it, before publishing.
 *
 * Needs SANITY_API_WRITE_TOKEN, read from .env.local.
 */

import { createClient } from "next-sanity";
import { richify } from "../lib/rich";
import { schemaTypes } from "../schemaTypes";
import { subPortfolios } from "./content/sub-portfolios";
import { caseStudy, keyed } from "./shape";

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
const shaped = (doc: Record<string, unknown>) =>
  richify({ _type: "project", ...(keyed(doc) as object) }, schemaTypes as never) as Record<
    string,
    unknown
  >;

async function main() {
  const tx = client.transaction();
  let writes = 0;

  for (const seed of subPortfolios) {
    const { parent, slug, hero, feature, chapters, headline, facts, tags, overview, website, ...card } = seed;
    const _id = `drafts.project-${slug}`;

    /* Any project already at this slug, draft or published, is an editor's. */
    const taken = await client.fetch<string[]>(
      `*[_type == "project" && slug.current == $slug]._id`,
      { slug },
      { perspective: "raw" },
    );
    if (taken.length) {
      console.log(`${slug}: already in Sanity (${taken.join(", ")}), left as it is`);
      continue;
    }

    /* The larger project, by its slug: its id need not match it. */
    const parentId = await client.fetch<string | null>(
      `*[_type == "project" && slug.current == $parent && !(_id in path("drafts.**"))][0]._id`,
      { parent },
      { perspective: "raw" },
    );
    if (!parentId) {
      console.error(`${slug}: no published project at "${parent}" to be part of`);
      process.exit(1);
    }

    const doc = {
      ...shaped({
        ...card,
        slug: { _type: "slug", current: slug },
        parent: { _type: "reference", _ref: parentId },
        image: { _type: "image", alt: "" },
        fit: "cover",
        ...caseStudy({ hero, feature, chapters, headline, facts, tags, overview, website }),
      }),
      _id,
    };
    console.log(`${slug}: drafts a case study Part of ${parentId}`);
    if (dry) console.log(JSON.stringify(doc, null, 2));
    tx.createIfNotExists(doc as never);
    writes++;
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
  console.log("Done. Open it in the Studio under Projects: it is a draft until published.");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
