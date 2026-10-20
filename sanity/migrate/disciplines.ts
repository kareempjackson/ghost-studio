/**
 * Moves the projects' disciplines from words to documents.
 *
 *   npm run migrate:disciplines -- --dry   # list what would change
 *   npm run migrate:disciplines
 *
 * Every discipline a project names as a plain word becomes a Discipline
 * document (Brand, Digital and Systems keep the filter's order), and every
 * project, draft or published, is pointed at its disciplines instead.
 * Disciplines that already exist are reused, and projects already pointing
 * at them are left alone, so a second run only does what is left. Each
 * project is patched against the revision it was read at: one edited
 * meanwhile makes the run fail without writing, and running it again picks
 * it up.
 *
 * Run it after the code that reads disciplines as documents is deployed: the
 * site before that change reads them as words.
 *
 * Needs SANITY_API_WRITE_TOKEN, read from .env.local.
 */

import { createClient } from "next-sanity";
import { disciplineDoc, disciplineId, disciplineRefs } from "../seed/shape";

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

async function main() {
  /* Projects with any discipline still stored as a word. */
  const projects = await client.fetch<
    { _id: string; _rev: string; words: string[]; refs: { _ref: string; _key?: string }[] }[]
  >(
    `*[_type == "project" && count(disciplines[!defined(_ref)]) > 0]{
      _id, _rev,
      "words": disciplines[!defined(_ref)],
      "refs": coalesce(disciplines[defined(_ref)], [])
    }`,
  );
  if (!projects.length) {
    console.log("Every project already points at its disciplines. Nothing to do.");
    return;
  }

  const existing = new Set(await client.fetch<string[]>(`*[_type == "discipline"]._id`));
  const tx = client.transaction();

  for (const title of new Set(projects.flatMap((p) => p.words))) {
    if (existing.has(disciplineId(title))) continue;
    console.log(`creates discipline ${title} (${disciplineId(title)})`);
    tx.createIfNotExists(disciplineDoc(title));
  }

  for (const project of projects) {
    /* Any it already points at stay first; the words follow, once each. */
    const kept = new Set(project.refs.map((r) => r._ref));
    const added = disciplineRefs(project.words).filter((r) => !kept.has(r._ref));
    console.log(`${project._id}: ${project.words.join(", ")} → references`);
    tx.patch(project._id, (p) =>
      p.ifRevisionId(project._rev).set({ disciplines: [...project.refs, ...added] }),
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
