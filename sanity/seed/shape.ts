/**
 * The shapes the seed scripts write: plain content objects made into what a
 * Sanity document stores. Shared by seed.ts, projects.ts and stories.ts.
 */

import type { StorySeed } from "./content/family-stories";
import { guide, guideExclude, guideNeeds } from "./content/guide";
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

/** A story's parts, as a document stores them: each a chapter, its plates in rows. */
const chapters = (parts: CaseStudySeed["chapters"]) =>
  parts.map(({ media: rows, ...chapter }) => ({
    _type: "chapter",
    ...chapter,
    media: rows.map((row) => ({ _type: "mediaRow", items: row.map(media) })),
  }));

/** A project's case study, in the shape the project document stores it. */
export function caseStudy(study: CaseStudySeed | undefined) {
  if (!study) return {};
  const { hero, feature, chapters: parts, ...fields } = study;
  return {
    ...fields,
    ...(hero ? { hero: media(hero) } : {}),
    ...(feature ? { feature: media(feature) } : {}),
    chapters: chapters(parts),
  };
}

/** A Ghost family story, in the shape its document stores it. */
export function story(seed: StorySeed) {
  const { slug, hero, feature, chapters: parts, ...fields } = seed;
  return {
    ...fields,
    slug: { _type: "slug", current: slug },
    image: { _type: "image", alt: "" },
    ...(hero ? { hero: media(hero) } : {}),
    ...(feature ? { feature: media(feature) } : {}),
    chapters: chapters(parts),
  };
}

/** A story's document id, from its family and slug: familyStory-ghost-labs-vynl. */
export const storyId = (seed: Pick<StorySeed, "family" | "slug">) =>
  `familyStory-${seed.family}-${seed.slug}`;

/** A topic's document, at a fixed id from its name: "Strategy" → insightTopic-strategy. */
export const topicId = (name: string) =>
  `insightTopic-${name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "")}`;

/** The order the filter on /work has always had; disciplines added later follow. */
export const disciplineOrder = ["Brand", "Digital", "Systems"] as const;

/** A discipline's document, at a fixed id from its name: "Managed IT" → discipline-managed-it. */
export const disciplineId = (name: string) =>
  `discipline-${name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "")}`;

/** A discipline's document, in the filter's order where it has a place in it. */
export function disciplineDoc(title: string) {
  const order = (disciplineOrder as readonly string[]).indexOf(title);
  return { _id: disciplineId(title), _type: "discipline", title, ...(order >= 0 ? { order } : {}) };
}

/** A project's disciplines, as its document stores them: references to them. */
export const disciplineRefs = (names: readonly string[]) =>
  names.map((name) => ({ _type: "reference", _ref: disciplineId(name), _key: disciplineId(name) }));

/** A discipline's or topic's document id, by its name: the seed's own ids unless told otherwise. */
type IdOf = (type: "discipline" | "insightTopic", title: string) => string | null;

const seededId: IdOf = (type, title) => (type === "discipline" ? disciplineId(title) : topicId(title));

/**
 * The site guide's document: its words, its needs as references to a track,
 * a discipline and a topic, and the work it never recommends, by weak
 * reference so the demo projects can still be deleted. `idOf` finds a
 * discipline or topic in a dataset where it was made under another id; one it
 * cannot find is left off the need.
 */
export function guideFields(idOf: IdOf = seededId) {
  const weak = (_ref: string) => ({ _type: "reference", _ref, _weak: true });
  const named = (type: "discipline" | "insightTopic", title?: string) => {
    const id = title ? idOf(type, title) : null;
    return id ? weak(id) : undefined;
  };
  return {
    ...guide,
    picker: {
      ...guide.picker,
      needs: guideNeeds.map((need) => {
        const discipline = named("discipline", need.discipline);
        const topic = named("insightTopic", need.topic);
        return {
          label: need.label,
          track: { _type: "reference", _ref: `trackPage-${need.track}` },
          ...(discipline ? { discipline } : {}),
          ...(topic ? { topic } : {}),
        };
      }),
    },
    exclude: guideExclude.map((slug) => ({ ...weak(`project-${slug}`), _key: slug })),
  };
}
