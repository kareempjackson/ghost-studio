import { defineArrayMember, defineField, defineType } from "sanity";
import { R2VideoInput } from "../components/R2VideoInput";
import { colour, href, picture, text } from "./fields";

const linkAnnotation = defineArrayMember({
  name: "link",
  type: "object",
  title: "Link",
  fields: [href()],
});

/**
 * Copy in the full editor: paragraphs, three levels of heading, quotes,
 * bulleted and numbered lists (Tab to nest), and bold, italic, underline,
 * strikethrough, code and links. Sizes are relative on the site, so a
 * heading in a card's copy is a heading at the card's size.
 * Rendered by app/(site)/_components/Rich.tsx.
 */
export const richTextType = defineType({
  name: "richText",
  title: "Rich text",
  type: "array",
  of: [
    defineArrayMember({
      type: "block",
      styles: [
        { title: "Normal", value: "normal" },
        { title: "Heading 2", value: "h2" },
        { title: "Heading 3", value: "h3" },
        { title: "Heading 4", value: "h4" },
        { title: "Quote", value: "blockquote" },
      ],
      lists: [
        { title: "Bulleted list", value: "bullet" },
        { title: "Numbered list", value: "number" },
      ],
      marks: {
        decorators: [
          { title: "Bold", value: "strong" },
          { title: "Italic", value: "em" },
          { title: "Underline", value: "underline" },
          { title: "Strikethrough", value: "strike-through" },
          { title: "Code", value: "code" },
        ],
        annotations: [linkAnnotation],
      },
    }),
  ],
});

/**
 * Copy that sits in a heading or inside a line: the words and their marks,
 * no headings or lists, which could not be set there. Each paragraph is a
 * line break on the site.
 */
export const inlineTextType = defineType({
  name: "inlineText",
  title: "Inline rich text",
  type: "array",
  of: [
    defineArrayMember({
      type: "block",
      styles: [{ title: "Normal", value: "normal" }],
      lists: [],
      marks: {
        decorators: [
          { title: "Bold", value: "strong" },
          { title: "Italic", value: "em" },
          { title: "Underline", value: "underline" },
          { title: "Strikethrough", value: "strike-through" },
        ],
        annotations: [linkAnnotation],
      },
    }),
  ],
});

/** A labelled way on: a button or a link. */
export const actionType = defineType({
  name: "action",
  title: "Action",
  type: "object",
  fields: [text("label"), href()],
  preview: { select: { title: "label", subtitle: "href" } },
});

/**
 * One plate: a picture or a looping film, on a ground that shows until it is
 * in. The shape is the plate's, so a placeholder sits at the size the
 * picture will; the picture is cropped to it, never squeezed.
 */
export const mediaType = defineType({
  name: "media",
  title: "Plate",
  type: "object",
  fields: [
    picture("image", { description: "The picture, or the film's first frame.", video: false }),
    defineField({
      name: "video",
      type: "r2Video",
      description: "Optional. An MP4, played muted and looped over the picture.",
    }),
    colour("ground", { required: false, description: "Shows until the picture is in, e.g. #132a28." }),
    defineField({
      name: "aspect",
      type: "string",
      title: "Shape",
      options: {
        list: [
          { title: "Landscape (3:2)", value: "landscape" },
          { title: "Wide (16:9)", value: "wide" },
          { title: "Portrait (4:5)", value: "portrait" },
        ],
        layout: "radio",
        direction: "horizontal",
      },
      initialValue: "landscape",
    }),
  ],
  preview: {
    select: { media: "image", ground: "ground", aspect: "aspect", video: "video.filename" },
    prepare: ({ media, ground, aspect, video }) => ({
      title: video ? `Film: ${video}` : media ? "Picture" : `Placeholder ${ground ?? ""}`.trim(),
      subtitle: aspect,
      media,
    }),
  },
});

/**
 * A film, kept in Cloudflare R2 rather than Sanity's asset store (see
 * lib/r2.ts). Sanity holds where it plays from and what it was; the input
 * does the upload, so the fields are only ever written by it.
 */
export const r2VideoType = defineType({
  name: "r2Video",
  title: "Film",
  type: "object",
  fields: [
    defineField({ name: "url", type: "url", readOnly: true }),
    defineField({ name: "key", type: "string", readOnly: true }),
    defineField({ name: "filename", type: "string", readOnly: true }),
    defineField({ name: "mimeType", type: "string", readOnly: true }),
    defineField({ name: "size", type: "number", readOnly: true }),
  ],
  components: { input: R2VideoInput },
  preview: { select: { title: "filename", subtitle: "url" } },
});

/** A row of plates: one across the page, or two side by side. */
export const mediaRowType = defineType({
  name: "mediaRow",
  title: "Row",
  type: "object",
  fields: [
    defineField({
      name: "items",
      type: "array",
      of: [defineArrayMember({ type: "media" })],
      validation: (r) => r.min(1).max(2),
    }),
  ],
  preview: {
    select: { items: "items" },
    prepare: ({ items }) => ({
      title: (items?.length ?? 0) === 2 ? "Two side by side" : "One across",
    }),
  },
});

export const objectTypes = [richTextType, inlineTextType, actionType, r2VideoType, mediaType, mediaRowType];
