import { defineArrayMember, defineField, defineType } from "sanity";
import { colour, href, picture, text } from "./fields";

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
    picture("image", { description: "The picture, or the film's first frame." }),
    defineField({
      name: "video",
      type: "file",
      options: { accept: "video/mp4" },
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
    select: { media: "image", ground: "ground", aspect: "aspect", video: "video.asset.originalFilename" },
    prepare: ({ media, ground, aspect, video }) => ({
      title: video ? `Film: ${video}` : media ? "Picture" : `Placeholder ${ground ?? ""}`.trim(),
      subtitle: aspect,
      media,
    }),
  },
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

export const objectTypes = [actionType, mediaType, mediaRowType];
