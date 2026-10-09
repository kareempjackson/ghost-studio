/**
 * Moves the insights' topics from words to documents.
 *
 *   npm run migrate:topics -- --dry   # list what would change
 *   npm run migrate:topics
 *
 * Every topic an insight names as a plain word becomes a Topic document
 * (Strategy, Design and Engineering keep the filter's order), and every
 * insight, draft or published, is pointed at its topic instead. Topics that
 * already exist are reused, and insights already pointing at one are left
 * alone, so a second run only does what is left. Each insight is patched
 * against the revision it was read at: one edited meanwhile makes the run
 * fail without writing, and running it again picks it up.
 *
 * Run it after the code that reads topics as documents is deployed: the
 * site before that change reads the topic as a word.
 *
 * Needs SANITY_API_WRITE_TOKEN, read from .env.local.
 */

import { createClient } from "next-sanity";
import { topics as seedOrder } from "../seed/content/insights";
import { topicId } from "../seed/shape";

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
  const articles = await client.fetch<{ _id: string; _rev: string; topic: string }[]>(
    `*[_type == "article" && defined(topic) && !defined(topic._ref)]{_id, _rev, topic}`,
  );
  if (!articles.length) {
    console.log("Every insight already points at a topic. Nothing to do.");
    return;
  }

  const existing = new Set(
    await client.fetch<string[]>(`*[_type == "insightTopic"]._id`),
  );
  const tx = client.transaction();

  for (const title of [...new Set(articles.map((a) => a.topic))]) {
    const _id = topicId(title);
    if (existing.has(_id)) continue;
    const order = (seedOrder as readonly string[]).indexOf(title);
    console.log(`creates topic ${title} (${_id})`);
    tx.createIfNotExists({ _id, _type: "insightTopic", title, ...(order >= 0 ? { order } : {}) });
  }

  for (const article of articles) {
    console.log(`${article._id}: ${article.topic} → ${topicId(article.topic)}`);
    tx.patch(article._id, (p) =>
      p.ifRevisionId(article._rev).set({ topic: { _type: "reference", _ref: topicId(article.topic) } }),
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
