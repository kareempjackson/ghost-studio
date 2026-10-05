/**
 * The two things the studio publishes more of over time: projects and
 * articles. Each has a page of its own, at /work/[slug] and /journal/[slug].
 */

import { defineArrayMember, defineField, defineType } from "sanity";
import { colour, lines, para, picture, text } from "../fields";

export const disciplines = ["Brand", "Digital", "Systems"] as const;
export const topics = ["Strategy", "Design", "Engineering"] as const;

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
      ],
    }),
  ],
});

/** Lines of text, each its own entry: paragraphs, or the items of a list. */
const paragraphs = (name: string, o: { title?: string; description?: string; group?: string } = {}) =>
  defineField({
    name,
    type: "array",
    of: [defineArrayMember({ type: "text", rows: 3 })],
    ...o,
  });

const plate = (name: string, o: { title?: string; description?: string; group?: string } = {}) =>
  defineField({ name, type: "media", ...o });

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
    picture("image", { required: true, description: "Cropped near-square on the cards.", group: "card" }),
    para("description", { required: false, description: "For search results.", group: "card" }),

    /* The case study, at /work/[slug]. Every part is optional: what is
       empty is left out, so a project reads as far as it is written. */
    plate("hero", { group: "story", description: "The plate at the top of the page." }),
    picture("logo", { description: "The client's mark, set small over the headline.", group: "story" }),
    para("headline", { required: false, description: "The page's heading. The tagline is used if empty.", group: "story" }),
    defineField({
      name: "facts",
      type: "array",
      group: "story",
      description: "The record beside the headline: Client, Location, Industry, Partnership, Scope.",
      of: [
        defineArrayMember({
          type: "object",
          fields: [text("label"), para("value")],
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
    paragraphs("overview", { group: "story", description: "The opening. After the first few lines it folds behind Read more." }),
    defineField({
      name: "website",
      type: "url",
      group: "story",
      description: "The client's live site, for Visit site.",
    }),
    plate("feature", { group: "story", description: "The plate between the opening and the chapters." }),
    defineField({
      name: "chapters",
      type: "array",
      group: "story",
      description: "The story, part by part. Each one is a stop on the bar that runs along the page.",
      of: [
        defineArrayMember({
          type: "object",
          name: "chapter",
          fields: [
            text("label", { description: "The stop on the bar, and the label beside the heading." }),
            para("heading"),
            paragraphs("body"),
            text("listHeading", { required: false, description: "Over the list. What We Did if empty." }),
            defineField({
              name: "items",
              type: "array",
              description: "What we did, one per line. A lead is set in bold before the line.",
              of: [
                defineArrayMember({
                  type: "object",
                  fields: [text("lead", { required: false }), para("text")],
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
    }),
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

export const article = defineType({
  name: "article",
  title: "Article",
  type: "document",
  fields: [
    lines("title", { description: "One entry per line, as the cards break it." }),
    slug((doc) => ((doc.title as string[] | undefined) ?? []).join(" ")),
    defineField({
      name: "topic",
      type: "string",
      options: { list: [...topics], layout: "radio" },
      validation: (r) => r.required(),
    }),
    defineField({ name: "publishedAt", type: "datetime" }),
    para("excerpt", { description: "One or two sentences: why the piece is worth opening." }),
    defineField({
      name: "cover",
      type: "object",
      fields: [
        picture("image"),
        colour("ground", { description: "Shown until there is a picture, and behind it." }),
      ],
    }),
    para("description", { required: false, description: "For search results. The excerpt is used if empty." }),
    body,
  ],
  preview: {
    select: { line1: "title.0", line2: "title.1", subtitle: "topic", media: "cover.image" },
    prepare: ({ line1, line2, subtitle, media }) => ({
      title: [line1, line2].filter(Boolean).join(" "),
      subtitle,
      media,
    }),
  },
});
