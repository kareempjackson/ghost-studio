import type { SanityClient } from "sanity";

/**
 * Calls one of the site's routes for editors (/api/r2, /api/tailor) as the
 * signed-in Studio user: their session token goes with it, and the route
 * checks it (lib/studio-auth.ts). A refusal comes back as an error carrying
 * the route's words.
 */
export async function callSite<T>(
  client: SanityClient,
  path: string,
  { body, signal }: { body?: unknown; signal?: AbortSignal } = {},
) {
  const token = client.config().token;
  if (!token) throw new Error("No Studio session token. Sign out and in again.");
  const res = await fetch(path, {
    method: body === undefined ? "GET" : "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
    body: body === undefined ? undefined : JSON.stringify(body),
    cache: "no-store",
    signal,
  });
  if (!res.ok) throw new Error(await res.text());
  return (await res.json()) as T;
}
