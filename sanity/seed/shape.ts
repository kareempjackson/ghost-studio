/**
 * The shapes the seed scripts write: plain content objects made into what a
 * Sanity document stores. Shared by seed.ts and projects.ts.
 */

import type { CaseStudySeed, PlateSeed } from "./content/work";

type Json = string | number | boolean | null | undefined | Json[] | { [key: string]: Json };

/** Sanity needs a _key on every object in an array. Strip readonly as we go. */
export function keyed(value: unknown): Json {
  if (Array.isArray(value)) {
    return value.map((item, i) =>
      item && typeof item === "object" && !Array.isArray(item)
        ? { _key: `k${i}`, ...(keyed(item) as Record<string, Json>) }
        : keyed(item),
    );
  }
  if (value && typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value).map(([k, v]) => [k, keyed(v)]),
    );
  }
  return value as Json;
}

/** A plate, until its picture is in: the ground and the shape. */
export const media = (plate: PlateSeed) => ({ _type: "media", ...plate });

/** A project's case study, in the shape the project document stores it. */
export function caseStudy(study: CaseStudySeed | undefined) {
  if (!study) return {};
  const { hero, feature, chapters, ...fields } = study;
  return {
    ...fields,
    ...(hero ? { hero: media(hero) } : {}),
    ...(feature ? { feature: media(feature) } : {}),
    chapters: chapters.map(({ media: rows, ...chapter }) => ({
      _type: "chapter",
      ...chapter,
      media: rows.map((row) => ({ _type: "mediaRow", items: row.map(media) })),
    })),
  };
}

/** A topic's document, at a fixed id from its name: "Strategy" → insightTopic-strategy. */
export const topicId = (name: string) =>
  `insightTopic-${name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "")}`;
