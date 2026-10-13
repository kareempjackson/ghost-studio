/**
 * Puts the /integrate/managed-services page into Sanity without resetting anything an
 * editor has done.
 *
 *   npm run seed:managed-services -- --dry   # print what would be written
 *   npm run seed:managed-services
 *
 * Creates the page's document from sanity/seed/content/managed-services.ts
 * if there isn't one yet. If there is, it's left exactly as it is: the page
 * is the editors' once it exists.
 *
 * Then links to it from /integrate: the line under Integrate's shape of the
 * work ("Need us to keep it running? See Managed Services"), set only where
 * those two fields are empty, on the published page and on any draft of it,
 * so publishing the draft later doesn't drop them. Nothing else is touched.
 *
 * Unlike `npm run seed`, safe to run on a dataset editors are working in.
 * Needs SANITY_API_WRITE_TOKEN, read from .env.local.
 */

import { createClient } from "next-sanity";
import { richify } from "../lib/rich";
import { schemaTypes } from "../schemaTypes";
import { integratePage } from "./content/integrate";
import { managedServicesPage } from "./content/managed-services";
import { keyed } from "./shape";

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

const _id = "managedServicesPage";

async function main() {
  /* The plate's photograph isn't exported yet: the page starts on its ground. */
  const { plate, ...page } = managedServicesPage;
  const doc = richify(
    {
      _id,
      _type: _id,
      ...(keyed({ ...page, plate: { image: { _type: "image", alt: plate.alt }, ground: plate.ground } }) as object),
    },
    schemaTypes as never,
  ) as Record<string, unknown>;

  if (dry) {
    console.log(JSON.stringify(doc, null, 2));
    return;
  }

  const existing = await client.getDocument(_id);
  if (existing) {
    console.log(`${_id}: already in ${dataset}, left as it is.`);
  } else {
    await client.createIfNotExists(doc as never);
    console.log(`${_id}: created in ${dataset}. Edit it in the Studio under Managed services.`);
  }

  /* The way in from /integrate. */
  const { nextLead, next } = integratePage.shape;
  for (const id of ["trackPage-integrate", "drafts.trackPage-integrate"]) {
    const page = await client.getDocument<{ shape?: { next?: { href?: string } } }>(id);
    if (!page) continue;
    if (page.shape?.next?.href) {
      console.log(`${id}: already links on from the shape of the work, left as it is.`);
      continue;
    }
    await client
      .patch(id)
      .setIfMissing({ shape: {} })
      .setIfMissing({ "shape.nextLead": nextLead, "shape.next": { _type: "action", ...next } })
      .commit();
    console.log(`${id}: now links to Managed services under the shape of the work.`);
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
