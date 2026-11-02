/**
 * Ghost Savvy Studios — Tailor with AI.
 *
 * A case study is written once, for everyone. This reads one and writes, for
 * each of the studio's audiences (Who we serve), the line its card carries
 * for them and a summary for the top of its page: the same work, told in the
 * terms that kind of organisation uses for its own. It also says which
 * audiences the work answers directly, and the site leads with it for
 * visitors who fit them. An insight gets only the last.
 *
 * Claude writes it when the work is written or changed, never while anyone is
 * reading: `npm run ai:tailor`, or Tailor with AI in the Studio. It lands in
 * the document's For each audience tab, where an editor can change any of
 * it; with Keep my edits on, it is never written over. It may say only what
 * the case study says, in the brand's voice (lib/brand/voice.ts), as the
 * site guide is held to.
 *
 * Plain data in and out, so the Studio's route and the script share it.
 */

import { createHash, randomUUID } from "node:crypto";
import Anthropic from "@anthropic-ai/sdk";
import { betaJSONSchemaOutputFormat } from "@anthropic-ai/sdk/helpers/beta/json-schema";
import { toPlain } from "../sanity/lib/rich";
import type { Rich } from "../sanity/types";
import { bannedLanguage, voicePrinciples, writingMechanics } from "./brand/voice";
import { CARD_MAX } from "./tailored";

/** Written once a document, so the most capable model. */
const MODEL = "claude-opus-5-5";
/** Bumped when the briefs below change, so every document is written again. */
const BRIEF_VERSION = 2;

/* ---- What it reads ---------------------------------------------------------- */

/** One of the studio's audiences, as Who we serve describes it. */
export interface Audience {
  readonly _id: string;
  readonly slug: string;
  readonly name: string;
  readonly body?: Rich | null;
  readonly summary?: Rich | null;
  readonly challenge?: { readonly heading?: readonly string[] | null; readonly deck?: Rich | null } | null;
}

/** The audiences, in Who we serve's order, as the script and the route read them. */
export const AUDIENCES_QUERY = `*[_id == "whoWeServePage"][0].audiences.items[defined(@->slug.current)]->{
  _id, "slug": slug.current, "name": array::join(name, " "), body, summary, challenge{heading, deck}
}`;

/** A case study, as much of it as says what the work was. */
export const PROJECT_SOURCE = `{
  _id, _rev, "slug": slug.current, name, scope, tagline, location, sector,
  "disciplines": disciplines[]->title, headline, facts[]{label, value}, overview,
  chapters[]{label, heading, body, items[]{lead, text}},
  testimonial{quote, name, role, company}, tailored
}`;

/** An insight: its title, topic and words. */
export const INSIGHT_SOURCE = `{ _id, _rev, "slug": slug.current, title, "topic": topic->title, excerpt, body, tailored }`;

export interface ProjectSource {
  readonly name: string;
  readonly scope?: string | null;
  readonly tagline?: string | null;
  readonly location?: string | null;
  readonly sector?: string | null;
  readonly disciplines?: readonly string[] | null;
  readonly headline?: Rich | null;
  readonly facts?: readonly { readonly label?: string | null; readonly value?: Rich | null }[] | null;
  readonly overview?: Rich | null;
  readonly chapters?:
    | readonly {
        readonly label?: string | null;
        readonly heading?: Rich | null;
        readonly body?: Rich | null;
        readonly items?: readonly { readonly lead?: string | null; readonly text?: Rich | null }[] | null;
      }[]
    | null;
  readonly testimonial?: {
    readonly quote?: Rich | null;
    readonly name?: string | null;
    readonly role?: string | null;
    readonly company?: string | null;
  } | null;
}

export interface InsightSource {
  readonly title?: readonly string[] | null;
  readonly topic?: string | null;
  readonly excerpt?: Rich | null;
  readonly body?: Rich | null;
}

/** What is already in a document's For each audience tab. */
export interface Stored {
  readonly keep?: boolean | null;
  readonly source?: string | null;
}

const plain = (value: Rich | string | null | undefined) => toPlain(value).replace(/\s+/g, " ").trim();

/** A case study as Claude reads it: the record, the opening, part by part, and the client's words. */
export function projectText(project: ProjectSource) {
  const record = [
    project.scope && `What we did: ${project.scope}`,
    project.sector && `Sector: ${project.sector}`,
    project.location && `Where: ${project.location}`,
    project.disciplines?.length && `Disciplines: ${project.disciplines.join(", ")}`,
    ...(project.facts ?? []).map((fact) => fact.label && `${fact.label}: ${plain(fact.value)}`),
  ].filter(Boolean);
  const { testimonial } = project;
  return [
    `# ${project.name}`,
    plain(project.headline) || project.tagline,
    record.map((line) => `- ${line}`).join("\n"),
    plain(project.overview),
    ...(project.chapters ?? []).map((chapter) =>
      [
        `## ${[chapter.label, plain(chapter.heading)].filter(Boolean).join(": ")}`,
        plain(chapter.body),
        ...(chapter.items ?? []).map((item) => `- ${[item.lead, plain(item.text)].filter(Boolean).join(": ")}`),
      ]
        .filter(Boolean)
        .join("\n"),
    ),
    testimonial?.quote &&
      `What the client said: "${plain(testimonial.quote)}" (${[testimonial.name, testimonial.role, testimonial.company]
        .filter(Boolean)
        .join(", ")})`,
  ]
    .filter(Boolean)
    .join("\n\n");
}

/** An insight as Claude reads it. */
export function insightText(insight: InsightSource) {
  return [
    `# ${(insight.title ?? []).join(" ")}`,
    insight.topic && `Topic: ${insight.topic}`,
    plain(insight.excerpt),
    toPlain(insight.body),
  ]
    .filter(Boolean)
    .join("\n\n");
}

const audiencesText = (audiences: readonly Audience[]) =>
  audiences
    .map((audience) =>
      [
        `<audience slug="${audience.slug}">`,
        audience.name,
        plain(audience.body),
        plain(audience.summary),
        [(audience.challenge?.heading ?? []).join(" "), plain(audience.challenge?.deck)].filter(Boolean).join(" "),
        "</audience>",
      ]
        .filter(Boolean)
        .join("\n"),
    )
    .join("\n");

/**
 * What a document was last written from: its words, the audiences and the
 * briefs. When it changes, the document is due to be written again.
 */
export const sourceHash = (text: string, audiences: readonly Audience[]) =>
  createHash("sha256")
    .update(JSON.stringify([BRIEF_VERSION, text, audiences.map((one) => [one.slug, one.name])]))
    .digest("hex")
    .slice(0, 16);

/** Whether a document is due: not kept, and written from something else, or never. */
export const isDue = (stored: Stored | null | undefined, hash: string) => !stored?.keep && stored?.source !== hash;

/* ---- The briefs --------------------------------------------------------------- */

const voice = voicePrinciples
  .map((principle) => `- ${principle.name}: ${principle.statement}\n  Write: "${principle.yes}"\n  Not: "${principle.no}"`)
  .join("\n");
const mechanics = writingMechanics.map((mechanic) => `- ${mechanic.rule} ${mechanic.detail}`).join("\n");
const banned = bannedLanguage.map((word) => `- Not "${word.avoid}": ${word.instead}.`).join("\n");

const HOW = `## How the studio writes

${voice}

${mechanics}

${banned}`;

const PROJECT_BRIEF = `You write for the Ghost Savvy Studios website. The studio's readers are people accountable for public-facing systems: programme leads in government, heads of digital at universities, health services, nonprofit directors, founders. Each kind of organisation is one of the audiences in <audiences>.

You are given one case study. For every audience, write two things in the terms that kind of organisation uses for its own work:

- card: the line under the project's name on its card. One sentence, no full stop, at most ${CARD_MAX} characters. What the work did, said so that someone from that audience sees why it bears on them.
- summary: two or three sentences, at most 60 words, for the top of the case study: what the client needed, what was built, and what it changed.

Then list in suits the audiences whose own problems this work answers directly: usually one or two, none if it answers none.

## Rules

- Use only what the case study says. Never add a figure, an outcome, a client, a technology or a claim it does not make. Where it gives no result, describe the work, not an outcome.
- The client is the subject and the studio is the method: credit the client for what changed. Speak for the studio as "we" if you need to.
- Write for every audience, also one the work was not built for: then lead with the part of the work that carries over to them, without pretending it was built for them. Never say what the work is not, or what it does not hold or do.
- Never name the audience in the line or the summary, as in "For universities, …": the reader already knows who they are.
- Sentence case. No exclamation marks, no emoji, no adjectives that sell.

${HOW}`;

const INSIGHT_BRIEF = `You read for the Ghost Savvy Studios website. Each kind of organisation the studio serves is one of the audiences in <audiences>.

You are given one of the studio's insights. List in suits the audiences whose own problems this piece addresses directly: usually one or two, none if it addresses none. Judge by what the piece is about, not by who could read it.`;

/* ---- Asking ------------------------------------------------------------------- */

/** What Claude writes for a case study. */
export interface ProjectTailoring {
  readonly suits: readonly string[];
  readonly forAudience: readonly { readonly audience: string; readonly card: string; readonly summary: string }[];
}

/** What Claude writes for an insight. */
export interface InsightTailoring {
  readonly suits: readonly string[];
}

const projectSchema = (slugs: readonly string[]) => ({
  type: "object" as const,
  properties: {
    suits: { type: "array" as const, items: { type: "string" as const, enum: [...slugs] } },
    forAudience: {
      type: "array" as const,
      items: {
        type: "object" as const,
        properties: {
          audience: { type: "string" as const, enum: [...slugs] },
          card: { type: "string" as const },
          summary: { type: "string" as const },
        },
        required: ["audience", "card", "summary"],
        additionalProperties: false,
      },
    },
  },
  required: ["suits", "forAudience"],
  additionalProperties: false,
});

const insightSchema = (slugs: readonly string[]) => ({
  type: "object" as const,
  properties: { suits: { type: "array" as const, items: { type: "string" as const, enum: [...slugs] } } },
  required: ["suits"],
  additionalProperties: false,
});

async function ask(client: Anthropic, brief: string, schema: ReturnType<typeof insightSchema | typeof projectSchema>, content: string) {
  const response = await client.beta.messages.parse({
    model: MODEL,
    max_tokens: 16000,
    /* A decline is answered by the next model rather than nothing. */
    betas: ["server-side-fallback-2026-07-01"],
    fallbacks: "default",
    output_config: { effort: "medium", format: betaJSONSchemaOutputFormat(schema) },
    system: brief,
    messages: [{ role: "user", content }],
  });
  if (response.stop_reason === "refusal") throw new Error("Claude declined to write for this document.");
  if (response.stop_reason === "max_tokens" || !response.parsed_output) {
    throw new Error("Claude's answer was cut short. Try again.");
  }
  return response.parsed_output as unknown;
}

const tidy = (text: string) => text.replace(/\s+/g, " ").trim();

/** For each audience, a card line and a summary, and which it suits. */
export async function tailorProject(
  client: Anthropic,
  project: ProjectSource,
  audiences: readonly Audience[],
): Promise<ProjectTailoring> {
  const slugs = audiences.map((one) => one.slug);
  const out = (await ask(
    client,
    PROJECT_BRIEF,
    projectSchema(slugs),
    `<audiences>\n${audiencesText(audiences)}\n</audiences>\n\n<case_study>\n${projectText(project)}\n</case_study>`,
  )) as ProjectTailoring;
  const seen = new Set<string>();
  return {
    suits: [...new Set(out.suits.filter((slug) => slugs.includes(slug)))],
    forAudience: out.forAudience
      .filter((one) => slugs.includes(one.audience) && !seen.has(one.audience) && Boolean(seen.add(one.audience)))
      .map((one) => ({ audience: one.audience, card: tidy(one.card).replace(/\.$/, ""), summary: tidy(one.summary) })),
  };
}

/** Which audiences an insight speaks to. */
export async function tailorInsight(
  client: Anthropic,
  insight: InsightSource,
  audiences: readonly Audience[],
): Promise<InsightTailoring> {
  const slugs = audiences.map((one) => one.slug);
  const out = (await ask(
    client,
    INSIGHT_BRIEF,
    insightSchema(slugs),
    `<audiences>\n${audiencesText(audiences)}\n</audiences>\n\n<insight>\n${insightText(insight)}\n</insight>`,
  )) as InsightTailoring;
  return { suits: [...new Set(out.suits.filter((slug) => slugs.includes(slug)))] };
}

/* ---- As Sanity stores it ------------------------------------------------------ */

const key = () => randomUUID().replace(/-/g, "").slice(0, 12);

/** The For each audience field as the document stores it, from what Claude wrote. */
export function tailoredValue(
  written: ProjectTailoring | InsightTailoring,
  audiences: readonly Audience[],
  source: string,
) {
  const ref = (slug: string) => {
    const audience = audiences.find((one) => one.slug === slug);
    return audience ? { _type: "reference", _ref: audience._id } : null;
  };
  const per = "forAudience" in written ? written.forAudience : [];
  return {
    audiences: written.suits.flatMap((slug) => {
      const to = ref(slug);
      return to ? [{ ...to, _key: key() }] : [];
    }),
    ...("forAudience" in written
      ? {
          cards: per.map((one) => ({ _key: key(), audience: ref(one.audience), line: one.card })),
          summaries: per.map((one) => ({ _key: key(), audience: ref(one.audience), text: one.summary })),
        }
      : {}),
    keep: false,
    source,
    writtenAt: new Date().toISOString(),
  };
}
