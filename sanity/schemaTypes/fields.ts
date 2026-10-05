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

export const para = (name: string, o: Opts = {}) =>
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

/** A list of paragraphs or items, each its own entry. */
export const paras = (name: string, o: Opts = {}) =>
  defineField({
    name,
    type: "array",
    of: [defineArrayMember({ type: "text", rows: 3 })],
    ...o,
  });

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

/** A picture with its alt text. Optional unless `required`. */
export const picture = (name: string, o: Opts = {}) =>
  defineField({
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
    ],
    ...o,
    validation: (o.required ? (r: ImageRule) => r.required() : undefined) as never,
  });

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

/** Title and description for search engines and the browser tab. */
export const seo = () => [
  text("title", { description: "The browser tab and search title." }),
  para("description", { description: "One or two sentences for search results." }),
];
