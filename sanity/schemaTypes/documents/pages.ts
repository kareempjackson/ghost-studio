/**
 * The site's own pages. Each route with a design of its own is one document;
 * the routes that share a template (the three tracks, the three family
 * pages, the legal pages) are one type with a fixed slug each.
 */

import { defineArrayMember, defineField, defineType } from "sanity";
import {
  action,
  colour,
  href,
  lines,
  list,
  num,
  object,
  para,
  paras,
  picture,
  phrase,
  plain,
  seo,
  text,
} from "../fields";

const single = (title: string) => ({ prepare: () => ({ title }) });

const cover = [text("eyebrow"), lines("heading"), para("summary"), action()];

const step = [text("title"), para("body")];
const stepPreview = { preview: { select: { title: "title", subtitle: "body" } } };

/** Fixed slugs: the route reads its document by this, so it is not editable. */
const fixedSlug = (options: string[]) =>
  defineField({
    name: "slug",
    type: "string",
    options: { list: options },
    readOnly: ({ document }) => Boolean(document?._createdAt),
    validation: (r) => r.required(),
  });

export const aboutPage = defineType({
  name: "aboutPage",
  title: "About",
  type: "document",
  fields: [
    ...seo(),
    ...cover,
    object("who", [text("label"), text("heading"), para("deck"), paras("body")]),
    object("team", [
      text("label"),
      lines("heading"),
      para("deck"),
      text("portraitLabel", { description: "Shown in a plate with no portrait yet." }),
      list(
        "members",
        [text("name"), text("role"), picture("portrait"), colour()],
        { preview: { select: { title: "name", subtitle: "role", media: "portrait" } } },
      ),
    ]),
    object("expect", [text("label"), text("heading"), list("items", step, stepPreview)]),
    object("family", [
      text("label"),
      lines("heading"),
      list("members", [text("name"), lines("statement"), href()], {
        preview: { select: { title: "name", subtitle: "href" } },
      }),
    ]),
  ],
  preview: single("About"),
});

export const servicesPage = defineType({
  name: "servicesPage",
  title: "Services page",
  type: "document",
  fields: [
    ...seo(),
    ...cover,
    object("ways", [text("label"), text("heading"), para("deck")]),
    object("disciplines", [text("label"), text("heading"), para("deck")]),
    object("method", [
      text("label"),
      lines("heading"),
      paras("copy"),
      action(),
      object("network", [
        plain("alt"),
        list(
          "nodes",
          [
            num("x"),
            num("y"),
            num("r", { title: "Radius" }),
            picture("image", { description: "The portrait in this node." }),
          ],
          { description: "Positions are in the plate's own 1436 × 756 units." },
        ),
      ]),
    ]),
  ],
  preview: single("Services page"),
});

export const whoWeServePage = defineType({
  name: "whoWeServePage",
  title: "Who we serve",
  type: "document",
  fields: [
    ...seo(),
    ...cover,
    object("audiences", [
      text("label"),
      lines("heading"),
      para("deck"),
      defineField({
        name: "items",
        type: "array",
        description: "In order. Each one is also a link in the menu, under Who we serve.",
        of: [defineArrayMember({ type: "reference", to: [{ type: "audience" }] })],
        validation: (r) => r.min(1),
      }),
    ]),
  ],
  preview: single("Who we serve"),
});

/**
 * One kind of client: its card on /who-we-serve, and its own page at
 * /who-we-serve/[slug]. The page goes live once it has a challenge; until
 * then the card stands alone and links to its place on the list.
 */
export const audience = defineType({
  name: "audience",
  title: "Audience",
  type: "document",
  fields: [
    lines("name", { description: "One entry per line, as the card breaks it." }),
    defineField({
      name: "slug",
      type: "slug",
      options: {
        source: ((doc: Record<string, unknown>) =>
          ((doc.name as string[] | undefined) ?? []).join(" ")) as never,
        maxLength: 96,
      },
      validation: (r) => r.required(),
    }),
    para("body", { description: "The line on the card." }),
    plain("description", { required: false, description: "For search results. The summary is used if empty." }),
    lines("heading", { required: false, description: "The page's cover, one entry per line." }),
    para("summary", { required: false, description: "Under the audience's name, beside the cover." }),
    action("action", { required: false, description: "The way on from the cover." }),
    object("plate", [picture("image"), colour("ground", { required: false })], {
      description: "The picture under the cover, edge to edge.",
    }),
    object(
      "challenge",
      [text("label", { required: false }), lines("heading", { required: false }), para("deck", { required: false })],
      { description: "Fill this in to publish the audience's page." },
    ),
    object("practice", [
      text("label", { required: false }),
      lines("heading", { required: false }),
      list("items", [text("title", { required: false }), para("body")], {
        preview: { select: { title: "title", subtitle: "body" } },
      }),
    ], { title: "In practice" }),
    object("outputs", [
      text("label", { required: false }),
      lines("heading", { required: false }),
      lines("items", { required: false, description: "What the team leaves with, one per line." }),
    ], { title: "What you leave with" }),
  ],
  preview: {
    select: { line1: "name.0", line2: "name.1", subtitle: "body" },
    prepare: ({ line1, line2, subtitle }) => ({
      title: [line1, line2].filter(Boolean).join(" "),
      subtitle,
    }),
  },
});

export const workPage = defineType({
  name: "workPage",
  title: "Work page",
  type: "document",
  fields: [
    ...seo(),
    lines("heading"),
    lines("summary"),
    defineField({
      name: "projects",
      type: "array",
      description:
        "The order of the projects on /work. Any project not listed here still shows, after these, newest first.",
      of: [defineArrayMember({ type: "reference", to: [{ type: "project" }] })],
    }),
    text("all", { description: "The pill that clears the filter." }),
    text("previewLabel", { description: "Stands in for a project's missing picture." }),
    text("empty"),
    object("close", [text("eyebrow"), lines("heading"), action()]),
    object(
      "caseStudy",
      [
        text("back", { description: "The way back to /work, over the record." }),
        text("overview", { description: "Over the opening." }),
        text("readMore"),
        text("readLess"),
        text("visit", { description: "The link to the client's live site." }),
        text("listHeading", { description: "Over each part's list, unless the part sets its own." }),
        text("partsLabel", { description: "The bar of parts, for screen readers." }),
        text("feedbackLabel", {
          required: false,
          title: "Client feedback label",
          description: "Beside a project's testimonial, e.g. Client feedback.",
        }),
        text("feedbackHeading", {
          required: false,
          title: "Client feedback heading",
          description: "Over the quote, e.g. In their words.",
        }),
        object("more", [text("label"), text("heading"), action()], {
          title: "More work",
          description: "The two projects at the foot of every case study.",
        }),
      ],
      {
        title: "Case studies",
        description: "The words every project's page shares.",
      },
    ),
  ],
  preview: single("Work page"),
});

export const insightsPage = defineType({
  name: "insightsPage",
  title: "Insights page",
  type: "document",
  fields: [
    ...seo(),
    text("eyebrow"),
    lines("heading"),
    para("summary"),
    text("status", { required: false, description: "Set after the topic on every card, e.g. Sample article." }),
    text("all"),
    text("filterLabel"),
    text("empty"),
  ],
  preview: single("Insights page"),
});

const formField = (name: string) => object(name, [text("label"), text("placeholder")]);

export const contactPage = defineType({
  name: "contactPage",
  title: "Contact page",
  type: "document",
  fields: [
    ...seo(),
    text("eyebrow"),
    lines("heading"),
    paras("summary"),
    object("start", [text("label"), text("copy"), text("copied")]),
    object("base", [text("label"), lines("lines")]),
    object("next", [text("label"), lines("steps")]),
    object("form", [
      text("label"),
      text("heading"),
      text("optional"),
      formField("name"),
      formField("email"),
      formField("company"),
      object("help", [
        text("label"),
        lines("options", { description: "Match the service names so ?need= links preselect one." }),
      ]),
      formField("brief"),
      object("budget", [text("label"), text("placeholder"), lines("options")]),
      formField("timing"),
      text("action"),
      para("note"),
      text("handed"),
      text("again"),
    ]),
  ],
  preview: single("Contact page"),
});

export const trackPage = defineType({
  name: "trackPage",
  title: "Track page",
  type: "document",
  fields: [
    fixedSlug(["build", "engage", "integrate"]),
    ...seo(),
    ...cover,
    object("plate", [picture("image"), colour("ground", { required: false })]),
    object("terms", [text("price"), text("minimum"), action("compare")]),
    object("who", [text("label"), lines("heading"), para("deck")]),
    object("shape", [text("label"), text("heading"), list("items", step, stepPreview)]),
    object("process", [text("label"), lines("heading"), list("items", step, stepPreview)]),
    object("questions", [
      text("label"),
      text("heading"),
      list("items", [text("question"), para("answer")], {
        preview: { select: { title: "question" } },
      }),
    ]),
    object("others", [text("label")]),
  ],
  preview: { select: { title: "title", subtitle: "slug" } },
});

export const familyPage = defineType({
  name: "familyPage",
  title: "Family page",
  type: "document",
  fields: [
    fixedSlug(["ghost-labs", "ghost-u", "ghost-gives"]),
    ...seo(),
    object("cover", [
      lines("heading"),
      para("summary"),
      action(),
      list("notes", [text("text"), colour()], {
        description: "Two notes: one high on the left, one lower and further in.",
        preview: { select: { title: "text" } },
      }),
      picture("card"),
    ]),
    object("archive", [
      text("label"),
      lines("heading"),
      para("deck"),
      list("items", [...step, colour()], stepPreview),
    ]),
    object("ask", [text("label"), lines("heading"), para("summary"), action()]),
    object("family", [text("label"), lines("heading")]),
  ],
  preview: { select: { title: "title", subtitle: "slug" } },
});

export const legalPage = defineType({
  name: "legalPage",
  title: "Legal page",
  type: "document",
  fields: [
    fixedSlug(["privacy", "terms", "cookies"]),
    ...seo(),
    text("updated"),
    para("intro"),
    text("contentsLabel", { description: "Over the table of contents." }),
    list(
      "sections",
      [
        defineField({
          name: "id",
          type: "string",
          description: "The anchor, so a section can be linked to.",
          validation: (r) => r.required().regex(/^[a-z0-9-]+$/),
        }),
        text("title"),
        paras("paragraphs"),
        paras("list", { description: "Optional bullet points after the paragraphs, one per paragraph." }),
      ],
      { preview: { select: { title: "title", subtitle: "id" } } },
    ),
  ],
  preview: { select: { title: "title", subtitle: "slug" } },
});

export const approachPage = defineType({
  name: "approachPage",
  title: "Our approach",
  type: "document",
  fields: [
    ...seo(),
    ...cover,
    object("plate", [picture("image"), colour("ground", { required: false })], {
      description: "The picture under the cover, edge to edge. The ground shows until it is in.",
    }),
    object("start", [text("label"), text("heading"), para("deck"), para("body")], {
      title: "Starting point",
    }),
    object("phases", [
      text("label"),
      lines("heading"),
      text("itemLabel", { description: "Set before each card's number, e.g. Phase → PHASE 01." }),
      text("pageEyebrow", {
        description: "Starts the eyebrow on each phase's own page, e.g. Clarity Engineering → CLARITY ENGINEERING / PHASE 01.",
      }),
      defineField({
        name: "items",
        type: "array",
        description: "In order: the cards, and the phase pages, are numbered by position.",
        of: [defineArrayMember({ type: "reference", to: [{ type: "phase" }] })],
        validation: (r) => r.min(1),
      }),
    ]),
  ],
  preview: single("Our approach"),
});

/**
 * One phase of Clarity Engineering: its card on /our-approach, and its own
 * page at /our-approach/[slug]. The page goes live once it has a purpose;
 * until then the card stands alone.
 */
export const phase = defineType({
  name: "phase",
  title: "Phase",
  type: "document",
  fields: [
    text("title"),
    defineField({
      name: "slug",
      type: "slug",
      options: { source: "title", maxLength: 96 },
      validation: (r) => r.required(),
    }),
    text("question", { description: "The question the phase exists to answer." }),
    picture("image", { description: "The card's picture on /our-approach." }),
    plain("description", { required: false, description: "For search results. The question is used if empty." }),
    lines("heading", {
      required: false,
      description: "The page's cover, one entry per line. The title is used if empty.",
    }),
    action("action", { required: false, description: "The way on from the cover." }),
    object("plate", [picture("image"), colour("ground", { required: false })], {
      description: "The picture under the cover, edge to edge.",
    }),
    object(
      "purpose",
      [text("label", { required: false }), phrase("heading", { required: false }), para("deck", { required: false })],
      { description: "Fill this in to publish the phase's page." },
    ),
    object("practice", [
      text("label", { required: false }),
      text("heading", { required: false }),
      list("items", [text("title"), para("body")], {
        preview: { select: { title: "title", subtitle: "body" } },
      }),
    ], { title: "In practice" }),
    object("outputs", [
      text("label", { required: false }),
      lines("heading", { required: false }),
      text("deck", { required: false }),
      lines("items", { required: false, description: "What the team leaves with, one per line." }),
    ], { title: "What you leave with" }),
  ],
  preview: { select: { title: "title", subtitle: "question", media: "image" } },
});
