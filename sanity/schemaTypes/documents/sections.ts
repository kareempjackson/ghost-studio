/**
 * The bands the home page is made of, and the ones other pages borrow:
 * one document each, so a band reads the same wherever it is set.
 */

import { defineArrayMember, defineField, defineType } from "sanity";
import {
  action,
  colour,
  lines,
  list,
  num,
  object,
  para,
  picture,
  text,
} from "../fields";

const single = (title: string) => ({ prepare: () => ({ title }) });

export const homePage = defineType({
  name: "homePage",
  title: "Home page",
  type: "document",
  fields: [
    object("hero", [
      defineField({
        name: "video",
        type: "file",
        options: { accept: "video/mp4" },
        description: "The reel. MP4, muted and looped.",
      }),
      picture("poster", { description: "Shown before the reel plays." }),
      text("showreelLabel", { title: "Showreel button" }),
      text("showreelMark", { title: "Showreel caption" }),
    ]),
    object("claim", [
      lines("cover", { description: "The claim, one line per row. The break is part of the design." }),
      lines("motto", { description: "Set opposite the claim, one sentence per line." }),
    ]),
    object("methodology", [text("heading"), para("difference")]),
    object("selectedWork", [
      text("tag"),
      defineField({
        name: "projects",
        type: "array",
        of: [defineArrayMember({ type: "reference", to: [{ type: "project" }] })],
        validation: (r) => r.min(1),
      }),
      action("action", { description: "The way through to all the work." }),
    ], { title: "Selected work" }),
    object("journal", [
      text("eyebrow"),
      text("heading"),
      object("featured", [
        defineField({
          name: "article",
          type: "reference",
          to: [{ type: "article" }],
          validation: (r) => r.required(),
        }),
        text("label"),
        text("action"),
        picture("image", { description: "Overrides the article's cover here." }),
      ]),
      defineField({
        name: "entries",
        type: "array",
        of: [defineArrayMember({ type: "reference", to: [{ type: "article" }] })],
      }),
    ]),
  ],
  preview: single("Home page"),
});

export const pointOfView = defineType({
  name: "pointOfView",
  title: "Point of view",
  type: "document",
  fields: [
    text("eyebrow"),
    lines("heading"),
    lines("deck"),
    action(),
    list(
      "cards",
      [
        text("label"),
        para("statement", { description: "Each new line here is a line break on the card." }),
        text("action"),
        colour(),
        num("tilt", { description: "Resting tilt, in degrees." }),
      ],
      { preview: { select: { title: "label", subtitle: "action" } } },
    ),
  ],
  preview: single("Point of view"),
});

export const processSection = defineType({
  name: "process",
  title: "Process",
  type: "document",
  fields: [
    text("mark", { description: "The line at the foot of every plate." }),
    list(
      "steps",
      [
        text("title"),
        text("short", { description: "The step in one word." }),
        text("question"),
        para("body"),
        lines("outputs", { description: "What the step produces." }),
        defineField({
          name: "icon",
          type: "string",
          options: { list: ["target", "merge", "layers", "cycle"] },
          validation: (r) => r.required(),
        }),
      ],
      { preview: { select: { title: "title", subtitle: "question" } } },
    ),
  ],
  preview: single("Process"),
});

export const services = defineType({
  name: "services",
  title: "Services",
  type: "document",
  fields: [
    text("eyebrow"),
    text("cta", { description: "One label for every card on the home page." }),
    list(
      "items",
      [
        defineField({
          name: "slug",
          type: "string",
          description: "The anchor on /services and the ?need= on /contact.",
          validation: (r) => r.required().regex(/^[a-z0-9-]+$/),
        }),
        text("name"),
        text("promise"),
        lines("capabilities"),
        text("action"),
      ],
      { preview: { select: { title: "name", subtitle: "promise" } } },
    ),
  ],
  preview: single("Services"),
});

export const engagement = defineType({
  name: "engagement",
  title: "Ways to work together",
  type: "document",
  fields: [
    text("chip"),
    text("title"),
    text("subtitle"),
    picture("image", { required: true }),
    list(
      "models",
      [
        defineField({
          name: "slug",
          type: "string",
          options: { list: ["build", "engage", "integrate"] },
          validation: (r) => r.required(),
        }),
        text("name"),
        text("kind"),
        para("copy"),
        para("audience"),
        text("terms"),
        action(),
      ],
      { preview: { select: { title: "name", subtitle: "kind" } } },
    ),
  ],
  preview: single("Ways to work together"),
});

export const sectors = defineType({
  name: "sectors",
  title: "Sectors",
  type: "document",
  fields: [
    text("eyebrow"),
    list(
      "items",
      [
        text("slug"),
        text("name"),
        para("work"),
        picture("image", { required: true, description: "Decorative: the row's text carries the meaning." }),
        para("art", { required: false, description: "What the picture should show. Not on the site." }),
      ],
      { preview: { select: { title: "name", subtitle: "work", media: "image" } } },
    ),
  ],
  preview: single("Sectors"),
});

export const testimonials = defineType({
  name: "testimonials",
  title: "Testimonials",
  type: "document",
  fields: [
    text("eyebrow"),
    text("heading"),
    lines("deck"),
    text("label"),
    list(
      "items",
      [para("quote"), text("name"), text("role"), text("company")],
      { preview: { select: { title: "name", subtitle: "company" } } },
    ),
    object("controls", [
      text("previous"),
      text("next"),
      text("previousLabel", { description: "For screen readers." }),
      text("nextLabel", { description: "For screen readers." }),
    ]),
  ],
  preview: single("Testimonials"),
});

export const studioStrip = defineType({
  name: "studioStrip",
  title: "Studio strip",
  type: "document",
  fields: [
    text("label"),
    picture("tee"),
    object("principle", [text("label"), lines("statement"), text("source")]),
    picture("tote"),
  ],
  preview: single("Studio strip"),
});
