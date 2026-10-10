/**
 * The things the studio publishes more of over time: projects, insights and
 * the Ghost family's stories. Each has a page of its own, at /work/[slug],
 * /insights/[slug] and /[family]/[slug].
 */

import { defineArrayMember, defineField, defineType } from "sanity";
import { families } from "../../../lib/links";
import { action, colour, lines, num, object, para, paras, phrase, picture, plain, text } from "../fields";

export const disciplines = ["Brand", "Digital", "Systems"] as const;

const slug = (source: string | ((doc: Record<string, unknown>) => string)) =>
  defineField({
    name: "slug",
    type: "slug",
    options: { source: source as never, maxLength: 96 },
    validation: (r) => r.required(),
  });

/** Long-form text: paragraphs, two heading levels, quotes and pictures. */
const body = defineField({
  name: "body",
  type: "array",
  of: [
    defineArrayMember({
      type: "block",
      styles: [
        { title: "Normal", value: "normal" },
        { title: "Heading", value: "h2" },
        { title: "Subheading", value: "h3" },
        { title: "Quote", value: "blockquote" },
      ],
      marks: {
        annotations: [
          defineArrayMember({
            name: "link",
            type: "object",
            title: "Link",
            fields: [
              defineField({
                name: "href",
                type: "url",
                validation: (r) =>
                  r.uri({ allowRelative: true, scheme: ["http", "https", "mailto"] }),
              }),
            ],
          }),
        ],
      },
    }),
    defineArrayMember({
      type: "image",
      options: { hotspot: true },
      fields: [
        defineField({ name: "alt", type: "string", title: "Alt text" }),
        defineField({ name: "caption", type: "string" }),
        defineField({
          name: "video",
          type: "r2Video",
          title: "Film",
          description: "Optional. An MP4 to play here instead, muted and looped.",
        }),
      ],
    }),
  ],
});

const plate = (name: string, o: { title?: string; description?: string; group?: string } = {}) =>
  defineField({ name, type: "media", ...o });

/**
 * A story told part by part: a project's case study, and a Ghost family
 * story. Each part is its words and then its pictures, and a stop on the bar
 * that runs along the page.
 */
const chapters = defineField({
  name: "chapters",
  type: "array",
  description: "The story, part by part. Each one is a stop on the bar that runs along the page.",
  of: [
    defineArrayMember({
      type: "object",
      name: "chapter",
      fields: [
        text("label", { description: "The stop on the bar, and the label beside the heading." }),
        phrase("heading"),
        paras("body"),
        text("listHeading", { required: false, description: "Over the list. What We Did if empty." }),
        defineField({
          name: "items",
          type: "array",
          description: "What we did, one per line. A lead is set in bold before the line.",
          of: [
            defineArrayMember({
              type: "object",
              fields: [text("lead", { required: false }), phrase("text")],
              preview: { select: { title: "text", subtitle: "lead" } },
            }),
          ],
        }),
        defineField({
          name: "media",
          type: "array",
          title: "Plates",
          description: "Set after the text, before the next part.",
          of: [defineArrayMember({ type: "mediaRow" })],
        }),
      ],
      preview: { select: { title: "label", subtitle: "heading" } },
    }),
  ],
});

export const project = defineType({
  name: "project",
  title: "Project",
  type: "document",
  groups: [
    { name: "card", title: "Card", default: true },
    { name: "story", title: "Case study" },
  ],
  fields: [
    text("name", { description: "The client, as they write it themselves.", group: "card" }),
    { ...slug("name"), group: "card" },
    text("scope", { description: "What the studio did, in three words or fewer.", group: "card" }),
    text("tagline", { description: "The job in one line.", group: "card" }),
    text("location", { group: "card" }),
    text("sector", { group: "card" }),
    defineField({
      name: "disciplines",
      type: "array",
      group: "card",
      of: [defineArrayMember({ type: "string" })],
      options: { list: [...disciplines], layout: "grid" },
      validation: (r) => r.min(1),
    }),
    colour("ground", { description: "The card's colour on /work, and behind the picture.", group: "card" }),
    picture("image", { required: true, description: "The card's picture or film.", group: "card" }),
    defineField({
      name: "fit",
      type: "string",
      title: "Fit on the card",
      group: "card",
      description:
        "Fill crops the picture or film to the card. Fit shows all of it, scaled down on the card's colour — set the colour to the film's background so it sits seamlessly.",
      options: {
        list: [
          { title: "Fill", value: "cover" },
          { title: "Fit", value: "contain" },
        ],
        layout: "radio",
        direction: "horizontal",
      },
      initialValue: "cover",
    }),
    plain("description", { required: false, description: "For search results.", group: "card" }),

    /* The case study, at /work/[slug]. Every part is optional: what is
       empty is left out, so a project reads as far as it is written. */
    plate("hero", { group: "story", description: "The plate at the top of the page." }),
    picture("logo", { description: "The client's mark, set small over the headline.", group: "story", video: false }),
    phrase("headline", { required: false, description: "The page's heading. The tagline is used if empty.", group: "story" }),
    defineField({
      name: "facts",
      type: "array",
      group: "story",
      description: "The record beside the headline: Client, Location, Industry, Partnership, Scope.",
      of: [
        defineArrayMember({
          type: "object",
          fields: [text("label"), phrase("value")],
          preview: { select: { title: "label", subtitle: "value" } },
        }),
      ],
    }),
    defineField({
      name: "tags",
      type: "array",
      group: "story",
      description: "The pills under the headline.",
      of: [defineArrayMember({ type: "string" })],
    }),
    paras("overview", { group: "story", description: "The opening. After the first few lines it folds behind Read more." }),
    defineField({
      name: "website",
      type: "url",
      group: "story",
      description: "The client's live site, for Visit site.",
    }),
    plate("feature", { group: "story", description: "The plate between the opening and the chapters." }),
    { ...chapters, group: "story" },
    object(
      "testimonial",
      [
        phrase("quote", {
          required: false,
          description: "The client's words, as they said them. The section shows at the foot of the page once this and the name are in.",
        }),
        text("name", { required: false, description: "As they sign it, e.g. Dr. Cindi A. Lewis." }),
        text("role", { required: false, description: "e.g. Chief Executive Officer A.g." }),
        text("company", { required: false, description: "The project's client if empty." }),
        picture("portrait", {
          required: false,
          video: false,
          description: "Shown in a circle beside the name: set the hotspot on the face. Their initials if empty.",
        }),
      ],
      { group: "story", title: "Client feedback", description: "What the client said about the work." },
    ),
    defineField({
      name: "more",
      type: "array",
      group: "story",
      title: "More work",
      description: "The two projects at the foot. The next two on /work if empty.",
      of: [defineArrayMember({ type: "reference", to: [{ type: "project" }] })],
      validation: (r) => r.max(2),
    }),
  ],
  preview: { select: { title: "name", subtitle: "scope", media: "image" } },
});

/**
 * One story from the Ghost family: an experiment from Ghost Labs, a cohort
 * of Ghost U, a project Ghost Gives gave away. Its card sits in the archive
 * on its family's page, and its own page at /[family]/[slug] tells it the
 * way a case study tells a project: the record and the claim, then part by
 * part, then what changed and who it changed it for.
 *
 * Every part of the page is optional, as a project's are: a story reads as
 * far as it is written.
 */
export const familyStory = defineType({
  name: "familyStory",
  title: "Story",
  type: "document",
  groups: [
    { name: "card", title: "Card", default: true },
    { name: "story", title: "Story" },
  ],
  fields: [
    defineField({
      name: "family",
      type: "string",
      group: "card",
      description: "Whose story it is: the archive it shows in, and where its page lives.",
      options: {
        list: families.map(({ slug, title }) => ({ title, value: slug })),
        layout: "radio",
        direction: "horizontal",
      },
      validation: (r) => r.required(),
    }),
    text("title", { description: "What it is called, e.g. Low Signal.", group: "card" }),
    { ...slug("title"), group: "card" },
    defineField({
      name: "date",
      type: "date",
      group: "card",
      description: "When it happened. Newest first in the archive; numbered oldest first, so the first story is 01.",
      validation: (r) => r.required(),
    }),
    para("summary", { description: "One or two sentences: the line under its name in the archive.", group: "card" }),
    colour("ground", { description: "The card's colour in the archive, and behind its picture.", group: "card" }),
    picture("image", { description: "The card's picture or film. Its colour if empty.", group: "card" }),
    plain("description", { required: false, description: "For search results. The summary is used if empty.", group: "card" }),

    /* The story, at /[family]/[slug]. */
    plate("hero", { group: "story", description: "The plate at the top of the page." }),
    defineField({
      name: "notes",
      type: "array",
      group: "story",
      description: "Up to two notes stuck to the top plate, the way the family page pins them round its claim.",
      of: [
        defineArrayMember({
          type: "object",
          fields: [text("text", { description: "Two or three words." }), colour()],
          preview: { select: { title: "text", subtitle: "ground" } },
        }),
      ],
      validation: (r) => r.max(2),
    }),
    phrase("headline", {
      required: false,
      description: "The page's heading: what happened, in a sentence. The summary is used if empty.",
      group: "story",
    }),
    defineField({
      name: "facts",
      type: "array",
      group: "story",
      description: "The record beside the headline, e.g. Partner, When, Who, Status.",
      of: [
        defineArrayMember({
          type: "object",
          fields: [text("label"), phrase("value")],
          preview: { select: { title: "label", subtitle: "value" } },
        }),
      ],
    }),
    defineField({
      name: "tags",
      type: "array",
      group: "story",
      description: "The pills under the headline.",
      of: [defineArrayMember({ type: "string" })],
    }),
    paras("overview", { group: "story", description: "The opening. After the first few lines it folds behind Read more." }),
    action("link", {
      required: false,
      group: "story",
      description: "Optional. A way out to the thing itself: the prototype, the partner's site, the showcase.",
    }),
    plate("feature", { group: "story", description: "The plate between the opening and the chapters." }),
    { ...chapters, group: "story" },
    object(
      "outcome",
      [
        text("label", { required: false, description: "Beside the figures. What changed if empty." }),
        phrase("heading", { required: false, description: "Over the figures. The label is used if empty." }),
        defineField({
          name: "items",
          type: "array",
          description: "Two or four read best.",
          of: [
            defineArrayMember({
              type: "object",
              fields: [
                text("value", { description: "The figure, set large, e.g. 212 or 3 weeks." }),
                text("label", { description: "What it counts, in a line." }),
              ],
              preview: { select: { title: "value", subtitle: "label" } },
            }),
          ],
        }),
      ],
      {
        group: "story",
        title: "What changed",
        description: "The result, in figures, after the chapters. Shows once it has one.",
      },
    ),
    object(
      "voice",
      [
        phrase("quote", {
          required: false,
          description: "Their words, as they said them. The section shows once this and the name are in.",
        }),
        text("name", { required: false, description: "As they sign it." }),
        text("role", { required: false, description: "e.g. Founder and head coach." }),
        text("company", { required: false, description: "Where they are from, e.g. the partner's name." }),
        picture("portrait", {
          required: false,
          video: false,
          description: "Shown in a circle beside the name: set the hotspot on the face. Their initials if empty.",
        }),
      ],
      {
        group: "story",
        title: "In their words",
        description: "What a partner, a participant or a tester said about it.",
      },
    ),
    defineField({
      name: "more",
      type: "array",
      group: "story",
      title: "More stories",
      description: "The two stories at the foot, from the same family. The next two in its archive if empty.",
      of: [
        defineArrayMember({
          type: "reference",
          to: [{ type: "familyStory" }],
          options: {
            /* Only this family's other stories. */
            filter: ({ document }) => ({
              filter: "family == $family && !(_id in [$id, 'drafts.' + $id])",
              params: {
                family: (document as { family?: string }).family ?? "",
                id: document._id.replace(/^drafts\./, ""),
              },
            }),
          },
        }),
      ],
      validation: (r) => r.max(2),
    }),
  ],
  orderings: [
    {
      title: "Newest first",
      name: "dateDesc",
      by: [{ field: "date", direction: "desc" }],
    },
  ],
  preview: {
    select: { title: "title", family: "family", date: "date", media: "image" },
    prepare: ({ title, family, date, media }) => ({
      title,
      subtitle: [families.find((f) => f.slug === family)?.title, date?.slice(0, 4)]
        .filter(Boolean)
        .join(" · "),
      media,
    }),
  },
});

/**
 * What an insight is about: a pill in the filter on /insights and the label
 * on its card. Editors add them as they need them; the filter shows the ones
 * with at least one insight, in this order.
 */
export const insightTopic = defineType({
  name: "insightTopic",
  title: "Topic",
  type: "document",
  fields: [
    text("title", { description: "As the filter and the cards show it, e.g. Strategy." }),
    num("order", {
      required: false,
      description: "Where the pill sits in the filter: lower comes first. Alphabetical when equal or empty.",
    }),
  ],
  orderings: [
    {
      title: "Filter order",
      name: "filterOrder",
      by: [
        { field: "order", direction: "asc" },
        { field: "title", direction: "asc" },
      ],
    },
  ],
  preview: {
    select: { title: "title", order: "order" },
    prepare: ({ title, order }) => ({
      title,
      subtitle: order === undefined ? undefined : `Position ${order}`,
    }),
  },
});

/**
 * One insight: its card on /insights and the home page's journal band, and
 * its own page at /insights/[slug]. Publishing one is all it takes for both
 * to appear; nothing on the site lists them by hand except the home band.
 *
 * Stored as `article`, the type's name since before it was called Insight:
 * a document's type cannot be renamed in place.
 */
export const article = defineType({
  name: "article",
  title: "Insight",
  type: "document",
  groups: [
    { name: "content", title: "Content", default: true },
    { name: "seo", title: "SEO" },
  ],
  fields: [
    lines("title", { description: "One entry per line, as the cards break it.", group: "content" }),
    { ...slug((doc) => ((doc.title as string[] | undefined) ?? []).join(" ")), group: "content" },
    defineField({
      name: "topic",
      type: "reference",
      to: [{ type: "insightTopic" }],
      group: "content",
      description: "Add a new one under Insights → Topics.",
      validation: (r) => r.required(),
    }),
    defineField({
      name: "publishedAt",
      title: "Published",
      type: "datetime",
      group: "content",
      description: "Newest first on /insights.",
      initialValue: () => new Date().toISOString(),
      validation: (r) => r.required(),
    }),
    para("excerpt", {
      description: "One or two sentences: why the piece is worth opening. Set under the title, and on its card.",
      group: "content",
    }),
    defineField({
      name: "cover",
      type: "object",
      group: "content",
      fields: [
        picture("image"),
        colour("ground", { description: "Shown until there is a picture, and behind it." }),
      ],
      initialValue: { ground: "#e7e6e1" },
    }),
    { ...body, group: "content" },
    defineField({ name: "seo", type: "seo", title: "SEO", group: "seo" }),
  ],
  orderings: [
    {
      title: "Newest first",
      name: "publishedDesc",
      by: [{ field: "publishedAt", direction: "desc" }],
    },
  ],
  preview: {
    select: {
      line1: "title.0",
      line2: "title.1",
      topic: "topic.title",
      publishedAt: "publishedAt",
      media: "cover.image",
    },
    prepare: ({ line1, line2, topic, publishedAt, media }) => ({
      title: [line1, line2].filter(Boolean).join(" "),
      subtitle: [topic, publishedAt && new Date(publishedAt).toLocaleDateString("en-GB", { dateStyle: "medium" })]
        .filter(Boolean)
        .join(" · "),
      media,
    }),
  },
});
