/**
 * The shapes every document repeats, as field builders.
 *
 * The site's content was written as typed objects before it lived here, and
 * the schemas keep those shapes field for field: a heading is a list of
 * lines because the comps break headings by hand, an action is a label and
 * an href, and a picture that has not been shot yet is a colour. Keeping the
 * shapes is what lets the components read Sanity without being rewritten.
 */

import { defineArrayMember, defineField, type ArrayRule, type ImageRule } from "sanity";

type Opts = {
  title?: string;
  description?: string;
  /** The tab the field sits on, where the document has tabs. */
  group?: string;
  hidden?: boolean;
  required?: boolean;
};

const req = (o: Opts) =>
  o.required === false ? undefined : (r: { required: () => unknown }) => r.required();

export const text = (name: string, o: Opts = {}) =>
  defineField({ name, type: "string", ...o, validation: req(o) as never });

/** Required, for rich text: at least one block with words in it. */
const hasWords = (o: Opts) =>
  (o.required === false
    ? undefined
    : (r: ArrayRule<unknown[]>) =>
        r.custom((blocks?: { children?: { text?: string }[] }[]) =>
          blocks?.some((b) => b.children?.some((c) => c.text?.trim())) ? true : "Required",
        )) as never;

/**
 * Copy, in the full rich text editor: paragraphs, headings, quotes, lists,
 * and bold, italic, underline, strikethrough, code and links.
 */
export const para = (name: string, o: Opts = {}) =>
  defineField({ name, type: "richText", ...o, validation: hasWords(o) });

/**
 * Copy set in a heading or inside a line, in the inline editor: bold,
 * italic, underline, strikethrough and links, but no headings or lists.
 */
export const phrase = (name: string, o: Opts = {}) =>
  defineField({ name, type: "inlineText", ...o, validation: hasWords(o) });

/**
 * Text that must stay plain: what goes in a <meta> tag or an alt attribute,
 * or a note that never reaches the site.
 */
export const plain = (name: string, o: Opts = {}) =>
  defineField({ name, type: "text", rows: 3, ...o, validation: req(o) as never });

export const num = (name: string, o: Opts = {}) =>
  defineField({ name, type: "number", ...o, validation: req(o) as never });

/** One entry per line, as the design breaks it. */
export const lines = (name: string, o: Opts = {}) =>
  defineField({
    name,
    type: "array",
    of: [defineArrayMember({ type: "string" })],
    description: o.description ?? "One entry per line, as the design breaks it.",
    ...o,
    validation: (o.required === false ? undefined : (r: ArrayRule<unknown[]>) => r.min(1)) as never,
  });

/** A run of paragraphs, in the full rich text editor. */
export const paras = (name: string, o: Opts = {}) =>
  defineField({ name, type: "richText", ...o });

/** Where a link goes: a path (/contact), an anchor (#team), or a full URL. */
export const href = (name = "href", o: Opts = {}) =>
  defineField({
    name,
    type: "string",
    description: o.description ?? "A path like /contact, an anchor like #team, or a full URL.",
    ...o,
    validation: (r) =>
      r.required().custom((value?: string) =>
        !value || /^(\/|#|https?:\/\/|mailto:)/.test(value)
          ? true
          : "Start with /, #, https:// or mailto:",
      ),
  });

export const action = (name = "action", o: Opts = {}) =>
  defineField({ name, type: "action", ...o, validation: req(o) as never });

/** A hex colour: what shows until a picture is in, or behind it after. */
export const colour = (name = "ground", o: Opts = {}) =>
  defineField({
    name,
    type: "string",
    description: o.description ?? "A hex colour, e.g. #e4e9f7.",
    ...o,
    validation: (r) =>
      (o.required === false ? r : r.required()).regex(/^#[0-9a-fA-F]{3,8}$/, {
        name: "hex colour",
      }),
  });

/**
 * A picture with its alt text, and optionally a film to play in its place.
 * The film runs muted and looped over the picture, which is its first frame
 * and what shows to anyone who has asked for less motion. Required means a
 * picture or a film. `video: false` for the few slots that must stay still:
 * a logo, or a poster whose film lives beside it.
 */
export const picture = (name: string, o: Opts & { video?: boolean } = {}) => {
  const { video = true, ...rest } = o;
  return defineField({
    name,
    type: "image",
    options: { hotspot: true },
    fields: [
      defineField({
        name: "alt",
        type: "string",
        title: "Alt text",
        description: "Leave empty only when the picture is decorative.",
      }),
      ...(video
        ? [
            defineField({
              name: "video",
              type: "r2Video",
              title: "Film",
              description:
                "Optional. An MP4 to play here instead, muted and looped. The picture is its first frame.",
            }),
          ]
        : []),
    ],
    ...rest,
    validation: (rest.required
      ? (r: ImageRule) =>
          r.custom((value?: { asset?: unknown; video?: { url?: string } }) =>
            value?.asset || value?.video?.url ? true : "Add a picture or a film.",
          )
      : undefined) as never,
  });
};

export const object = (
  name: string,
  fields: ReturnType<typeof defineField>[],
  o: Opts & { collapsed?: boolean } = {},
) =>
  defineField({
    name,
    type: "object",
    fields,
    options: { collapsible: true, collapsed: o.collapsed ?? false },
    ...o,
  });

export const list = (
  name: string,
  fields: ReturnType<typeof defineField>[],
  o: Opts & { preview?: { select: Record<string, string> } } = {},
) =>
  defineField({
    name,
    type: "array",
    of: [
      defineArrayMember({
        type: "object",
        fields,
        preview: o.preview,
      }),
    ],
    ...o,
  });

/*
 * What search engines and share cards say about a page. Every page-like
 * document carries the same four: a meta title, a meta description, a social
 * image and a way out of search results.
 */

type SeoOpts = { group?: string; description?: string };

/** The whole title in search results and the browser tab, exactly as written. */
export const metaTitle = (o: SeoOpts = {}) =>
  defineField({
    name: "metaTitle",
    type: "string",
    title: "Meta title",
    description:
      "Optional. The title in search results and the browser tab, exactly as written: the site's name is not added, so end with it if you want it there. Empty, the page's name and the site's are used, e.g. “About us — Ghost Savvy Studios”.",
    validation: (r) => r.max(60).warning("Search results cut titles at around 60 characters."),
    ...o,
  });

/** The picture on share cards, and what it shows for those who can't see it. */
export const socialImage = (o: SeoOpts = {}) =>
  defineField({
    name: "ogImage",
    type: "image",
    title: "Social image",
    description:
      "Optional. The picture on share cards: LinkedIn, X, Slack, iMessage. Cropped to 1200 × 630 around the hotspot. Empty, the page's own picture or the brand card with its name is used.",
    options: { hotspot: true },
    fields: [
      defineField({
        name: "alt",
        type: "string",
        title: "Alt text",
        description: "What the picture shows, for people who can't see it. Empty, the page's name is used.",
      }),
    ],
    ...o,
  });

/** Out of search results and the sitemap, still live at its address. */
export const noindex = (o: SeoOpts = {}) =>
  defineField({
    name: "noindex",
    type: "boolean",
    title: "Hide from search engines",
    description:
      "Keeps the page out of Google and other search results, and out of the sitemap. It stays live for anyone with the link.",
    initialValue: false,
    ...o,
  });

/** A page's name, then everything search engines and share cards read. */
export const seo = () => [
  text("title", {
    description:
      "The page's name: its share card's label, and what search engines and agents read it as. With the site's name after it, the meta title too, unless one is set below.",
  }),
  metaTitle(),
  plain("description", {
    title: "Meta description",
    description: "The line under the title in search results and on share cards: one or two sentences, 120 to 160 characters.",
  }),
  socialImage(),
  noindex(),
];
