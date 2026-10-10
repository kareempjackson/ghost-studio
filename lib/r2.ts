/**
 * The films live in a Cloudflare R2 bucket rather than Sanity's asset store:
 * R2 serves video without egress fees, and Sanity keeps only the URL.
 *
 * R2 speaks the S3 API, so a write is a SigV4-signed PUT. The Studio never
 * sees the keys: it asks /api/r2/upload for a signed URL that lets it PUT one
 * object for a few minutes, and /api/r2/films for what is already there; the
 * seed and migration scripts sign their own.
 * Reads go to the bucket's public URL (a custom domain, or its r2.dev URL).
 *
 * Not "server-only" so the scripts under sanity/ can import it with tsx; the
 * keys are not NEXT_PUBLIC_, so Next never puts them in a browser bundle.
 */

import { AwsClient } from "aws4fetch";

function env(name: string) {
  const value = process.env[name];
  if (!value) throw new Error(`Missing ${name}. See .env.example.`);
  return value;
}

function r2() {
  const account = env("R2_ACCOUNT_ID");
  const bucket = env("R2_BUCKET");
  /* The S3 endpoint only answers signed requests: a <video> gets a 400. */
  if (env("R2_PUBLIC_URL").includes("r2.cloudflarestorage.com")) {
    throw new Error(
      "R2_PUBLIC_URL is the bucket's S3 endpoint, which is private. Use its r2.dev URL or custom domain.",
    );
  }
  return {
    client: new AwsClient({
      accessKeyId: env("R2_ACCESS_KEY_ID"),
      secretAccessKey: env("R2_SECRET_ACCESS_KEY"),
      service: "s3",
      region: "auto",
    }),
    endpoint: `https://${account}.r2.cloudflarestorage.com/${bucket}`,
    publicUrl: env("R2_PUBLIC_URL").replace(/\/$/, ""),
  };
}

/** A film as Sanity stores it: where it plays from, and what it was. */
export interface R2Video {
  readonly _type: "r2Video";
  readonly url: string;
  readonly key: string;
  readonly filename: string;
  readonly mimeType: string;
  readonly size: number;
}

/** A filename as it appears at the end of a key: lower case, URL-safe. */
export function safeName(filename: string) {
  return (
    filename
      .toLowerCase()
      .replace(/[^a-z0-9._-]+/g, "-")
      .replace(/-+\./g, ".")
      .replace(/^-+|-+$/g, "") || "film.mp4"
  );
}

/**
 * Where a new film goes: under films/, behind a random prefix so two uploads
 * of "reel.mp4" never overwrite each other, with the name kept readable.
 */
export function videoKey(filename: string) {
  return `films/${crypto.randomUUID().slice(0, 8)}/${safeName(filename)}`;
}

/** Keys are never reused, so a film can be cached for good. */
export const CACHE_CONTROL = "public, max-age=31536000, immutable";

/* Keys from videoKey need no escaping; one put in from Cloudflare's dashboard might. */
export function publicUrl(key: string) {
  return `${r2().publicUrl}/${key.split("/").map(encodeURIComponent).join("/")}`;
}

/** What a listing can tell of a file's type: only its extension. */
const VIDEO_TYPES: Record<string, string> = {
  mp4: "video/mp4",
  m4v: "video/mp4",
  mov: "video/quicktime",
  webm: "video/webm",
};

const ENTITIES: Record<string, string> = { amp: "&", lt: "<", gt: ">", quot: '"', apos: "'" };

/** The text of the first <name> in a scrap of S3's XML. */
function tag(xml: string, name: string) {
  const text = xml.match(new RegExp(`<${name}>([^<]*)</${name}>`))?.[1] ?? "";
  return text.replace(/&(amp|lt|gt|quot|apos);/g, (_, entity: string) => ENTITIES[entity]);
}

/** A film in the bucket, as a field would store it, and when it went up. */
export interface StoredFilm {
  readonly video: R2Video;
  readonly uploaded: string;
}

/**
 * Every film in the bucket, newest first, so the Studio can reuse one instead
 * of uploading it again. ListObjectsV2 answers in XML, a thousand keys a
 * page; the shape is flat enough to read without a parser.
 */
export async function listFilms() {
  const { client, endpoint } = r2();
  const films: StoredFilm[] = [];
  let next = "";
  do {
    const url = new URL(endpoint);
    url.searchParams.set("list-type", "2");
    if (next) url.searchParams.set("continuation-token", next);
    const res = await client.fetch(url);
    const xml = await res.text();
    if (!res.ok) throw new Error(`R2 list failed: ${res.status} ${xml}`);

    for (const [, entry] of xml.matchAll(/<Contents>([\s\S]*?)<\/Contents>/g)) {
      const key = tag(entry, "Key");
      const filename = key.split("/").pop()!;
      const mimeType = VIDEO_TYPES[filename.split(".").pop()!.toLowerCase()];
      if (!mimeType) continue;
      films.push({
        video: { _type: "r2Video", url: publicUrl(key), key, filename, mimeType, size: Number(tag(entry, "Size")) },
        uploaded: tag(entry, "LastModified"),
      });
    }
    next = tag(xml, "IsTruncated") === "true" ? tag(xml, "NextContinuationToken") : "";
  } while (next);
  return films.sort((a, b) => b.uploaded.localeCompare(a.uploaded));
}

/**
 * A URL the browser can PUT one object to, good for `expires` seconds. The
 * PUT must send the same Content-Type and Cache-Control, which are signed.
 */
export async function signedPut(key: string, contentType: string, expires = 600) {
  const { client, endpoint } = r2();
  const url = new URL(`${endpoint}/${key}`);
  url.searchParams.set("X-Amz-Expires", String(expires));
  const request = new Request(url, {
    method: "PUT",
    headers: { "Content-Type": contentType, "Cache-Control": CACHE_CONTROL },
  });
  /* allHeaders: aws4fetch leaves Content-Type unsigned unless told to. */
  const signed = await client.sign(request, { aws: { signQuery: true, allHeaders: true } });
  return signed.url;
}

/** Writes an object from the server, for the scripts. */
export async function put(key: string, body: BodyInit, contentType: string) {
  const { client, endpoint } = r2();
  const res = await client.fetch(`${endpoint}/${key}`, {
    method: "PUT",
    body,
    headers: { "Content-Type": contentType, "Cache-Control": CACHE_CONTROL },
  });
  if (!res.ok) throw new Error(`R2 PUT ${key} failed: ${res.status} ${await res.text()}`);
  return publicUrl(key);
}
