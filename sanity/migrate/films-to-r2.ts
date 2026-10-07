/**
 * Moves the films already uploaded to Sanity onto R2.
 *
 *   npm run migrate:films -- --dry   # list what would move
 *   npm run migrate:films
 *
 * Finds every video file asset, copies each to R2 once, and rewrites every
 * field that used it (drafts and release versions too) from a Sanity file
 * into an r2Video. Each document is patched against the revision it was read
 * at, so an edit made meanwhile fails that one patch instead of being lost;
 * run it again to pick up whatever was skipped. Already-moved fields are no
 * longer file references, so a second run only does what is left.
 *
 * The Sanity assets are left where they are. Once the site has been checked,
 * delete them from the Studio's media browser, and drop the asset-> fallback
 * in sanity/content.ts.
 *
 * Needs SANITY_API_WRITE_TOKEN and the R2_ values, read from .env.local.
 */

import { createClient } from "next-sanity";
import { put, videoKey, type R2Video } from "../../lib/r2";

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

type Asset = { _id: string; url: string; originalFilename?: string; mimeType: string; size: number };
type Doc = { _id: string; _rev: string; [key: string]: unknown };
type Segment = string | number | { _key: string };

/** A patch path, e.g. body[_key=="a1"].video or hero.video. */
function pathString(path: Segment[]) {
  return path
    .map((s, i) =>
      typeof s === "number" ? `[${s}]` : typeof s === "object" ? `[_key=="${s._key}"]` : i ? `.${s}` : s,
    )
    .join("");
}

/** Every file field in a document that points at one of the films. */
function findFilms(value: unknown, assets: Map<string, Asset>, path: Segment[] = []) {
  const found: { path: string; assetId: string }[] = [];
  if (Array.isArray(value)) {
    value.forEach((item, i) => {
      const key = item && typeof item === "object" && "_key" in item ? { _key: String(item._key) } : i;
      found.push(...findFilms(item, assets, [...path, key]));
    });
  } else if (value && typeof value === "object") {
    const record = value as { _type?: string; asset?: { _ref?: string } };
    const ref = record.asset?._ref;
    if (record._type === "file" && ref && assets.has(ref)) {
      found.push({ path: pathString(path), assetId: ref });
    } else {
      for (const [k, v] of Object.entries(value)) found.push(...findFilms(v, assets, [...path, k]));
    }
  }
  return found;
}

const moved = new Map<string, Promise<R2Video>>();

/** Copies one asset to R2, once however many fields use it. */
function move(asset: Asset) {
  if (!moved.has(asset._id)) {
    moved.set(
      asset._id,
      (async () => {
        const filename = asset.originalFilename || `${asset._id}.mp4`;
        const key = videoKey(filename);
        let url = `r2-dry/${key}`;
        if (!dry) {
          const res = await fetch(asset.url);
          if (!res.ok) throw new Error(`Could not download ${asset.url}: ${res.status}`);
          url = await put(key, await res.arrayBuffer(), asset.mimeType);
        }
        console.log(`  ${dry ? "would copy" : "copied"} ${filename} (${(asset.size / 1024 / 1024).toFixed(1)} MB) → ${key}`);
        return { _type: "r2Video", url, key, filename, mimeType: asset.mimeType, size: asset.size };
      })(),
    );
  }
  return moved.get(asset._id)!;
}

async function main() {
  const assets = await client.fetch<Asset[]>(
    `*[_type == "sanity.fileAsset" && mimeType match "video/*"]{_id, url, originalFilename, mimeType, size}`,
  );
  if (!assets.length) {
    console.log("No films in Sanity's asset store. Nothing to move.");
    return;
  }
  const byId = new Map(assets.map((a) => [a._id, a]));
  const docs = await client.fetch<Doc[]>(`*[references($ids)]`, { ids: [...byId.keys()] });
  console.log(`${assets.length} film(s), used in ${docs.length} document(s).`);

  let failed = 0;
  for (const doc of docs) {
    const films = findFilms(doc, byId);
    if (!films.length) continue;
    console.log(`${doc._id}`);
    const set: Record<string, R2Video> = {};
    for (const { path, assetId } of films) {
      set[path] = await move(byId.get(assetId)!);
      console.log(`    ${path}`);
    }
    if (dry) continue;
    try {
      await client.patch(doc._id).ifRevisionId(doc._rev).set(set).commit({ autoGenerateArrayKeys: false });
    } catch (e) {
      failed++;
      console.error(`  ! ${doc._id} not patched: ${e instanceof Error ? e.message : e}`);
    }
  }

  if (failed) {
    console.error(`${failed} document(s) changed while this ran. Run it again to finish them.`);
    process.exit(1);
  }
  console.log(dry ? "Dry run: nothing written." : "Done.");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
