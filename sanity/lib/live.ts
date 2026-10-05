import "server-only";

import { draftMode } from "next/headers";
import type { QueryParams } from "next-sanity";
import { defineLive } from "next-sanity/live";
import { client } from "./client";

const token = process.env.SANITY_API_READ_TOKEN;

const live = defineLive({
  client,
  serverToken: token || false,
  browserToken: token || false,
  strict: true,
});

export const SanityLive = live.SanityLive;

/**
 * Every read from Sanity goes through here. It is the site's one cache
 * boundary: published content is cached until Sanity Live (or the webhook)
 * expires its tags, and with Draft Mode on Next re-runs it on every request
 * and saves nothing, so drafts are always fresh.
 *
 * `draftMode()` is the one runtime API that may be read inside 'use cache'.
 * In draft we read the `drafts` perspective with stega on, so Presentation
 * can map every string back to its field.
 */
export async function sanityFetch<const Query extends string>({
  query,
  params = {},
  tags = [],
}: {
  query: Query;
  params?: QueryParams;
  tags?: string[];
}) {
  "use cache";
  const { isEnabled } = await draftMode();
  const { data } = await live.sanityFetch({
    query,
    params,
    tags,
    perspective: isEnabled ? "drafts" : "published",
    stega: isEnabled,
  });
  return data;
}
