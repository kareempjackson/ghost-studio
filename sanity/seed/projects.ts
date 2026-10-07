/**
 * Fills in the work without resetting anything an editor has done.
 *
 *   npm run seed:projects -- --dry   # print what would be written
 *   npm run seed:projects
 *
 * For every project in sanity/seed/content/work.ts after BPI: a project
 * that already exists gets the case study fields it does not have yet,
 * and nothing else is touched (its card, picture, film and any written
 * part of the study stay as they are); a project that does not exist is
 * created, with its card and case study and no picture, so /work shows its
 * ground until one is uploaded. New projects are added to the end of the
 * order on /work.
 *
 * Unlike `npm run seed`, safe to run on a dataset editors are working in.
 * Needs SANITY_API_WRITE_TOKEN, read from .env.local.
 */

import { createClient } from "next-sanity";
import { richify } from "../lib/rich";
import { schemaTypes } from "../schemaTypes";
import { caseStudies, projects } from "./content/work";
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
  const added: string[] = [];

  for (const project of projects.filter((p) => p.slug !== "barbados-pharmaceuticals")) {
    /* The card, without the seed's poster: the picture is uploaded in the Studio. */
    const { slug, name, scope, tagline, location, sector, disciplines, ground } = project;
    const card = { name, scope, tagline, location, sector, disciplines, ground };
    const _id = `project-${slug}`;
    const study = shaped(caseStudy(caseStudies[slug]));
    const existing = await client.getDocument(_id);

    if (existing) {
      const missing = Object.fromEntries(
        Object.entries(study).filter(([k]) => k !== "_type" && existing[k] === undefined),
      );
      const fields = Object.keys(missing);
      console.log(`${_id}: ${fields.length ? `adds ${fields.join(", ")}` : "already has a case study"}`);
      if (fields.length) tx.patch(_id, (p) => p.setIfMissing(missing));
    } else {
      const doc = {
        ...shaped({ ...card, slug: { _type: "slug", current: slug }, image: { _type: "image", alt: "" } }),
        ...study,
        _id,
      };
      console.log(`${_id}: creates ${project.name}`);
      tx.createIfNotExists(doc as never);
      added.push(_id);
    }
  }

  /* New projects go to the end of the order on /work. */
  const order = await client.fetch<string[]>(`coalesce(*[_id == "workPage"][0].projects[]._ref, [])`);
  const unlisted = added.filter((id) => !order.includes(id));
  if (unlisted.length) {
    console.log(`workPage: lists ${unlisted.join(", ")}`);
    tx.patch("workPage", (p) =>
      p
        .setIfMissing({ projects: [] })
        .append("projects", unlisted.map((id) => ({ _type: "reference", _ref: id, _key: id }))),
    );
  }

  if (dry) {
    console.log("Dry run: nothing written.");
    return;
  }
  await tx.commit();
  console.log("Done.");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
