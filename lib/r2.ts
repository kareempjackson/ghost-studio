/**
 * The films live in a Cloudflare R2 bucket rather than Sanity's asset store:
 * R2 serves video without egress fees, and Sanity keeps only the URL.
 *
 * R2 speaks the S3 API, so a write is a SigV4-signed PUT. The Studio never
 * sees the keys: it asks /api/r2/upload for a signed URL that lets it PUT one
 * object for a few minutes, and the seed and migration scripts sign their own.
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

/**
 * Where a new film goes: under films/, behind a random prefix so two uploads
 * of "reel.mp4" never overwrite each other, with the name kept readable.
 */
export function videoKey(filename: string) {
  const safe =
    filename
      .toLowerCase()
      .replace(/[^a-z0-9._-]+/g, "-")
      .replace(/-+\./g, ".")
      .replace(/^-+|-+$/g, "") || "film.mp4";
  return `films/${crypto.randomUUID().slice(0, 8)}/${safe}`;
}

/** Keys are never reused, so a film can be cached for good. */
export const CACHE_CONTROL = "public, max-age=31536000, immutable";

export function publicUrl(key: string) {
  return `${r2().publicUrl}/${key}`;
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
