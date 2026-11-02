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
  metaTitle,
  num,
  object,
  para,
  picture,
  plain,
  socialImage,
  text,
} from "../fields";
import { isToken, LINE_MAX, tokensIn, TOKENS } from "../../../lib/moments";
import { REGIONS } from "../../../lib/region";

const single = (title: string) => ({ prepare: () => ({ title }) });

/* ---- Moments: what the home page says to the visitor reading it ------------ */

const TIMES = [
  { title: "Morning, 5 am to noon", value: "morning" },
  { title: "Afternoon, noon to 5 pm", value: "afternoon" },
  { title: "Evening, 5 pm to 10 pm", value: "evening" },
  { title: "Night, 10 pm to 5 am", value: "night" },
];

const words = (name: string, title: string, description: string) =>
  defineField({
    name,
    title,
    type: "array",
    of: [defineArrayMember({ type: "string" })],
    options: { layout: "tags" },
    description,
  });

const choice = (name: string, title: string, list: { title: string; value: string }[], description: string) =>
  defineField({
    name,
    title,
    type: "string",
    options: { list, layout: "radio", direction: "horizontal" },
    description,
  });

/** The longest a greeting in the document runs, for measuring a line with {greeting} in it. */
const longestGreeting = (document: unknown) =>
  Object.values((document as { moments?: { greetings?: Record<string, unknown> } })?.moments?.greetings ?? {})
    .filter((value): value is string => typeof value === "string")
    .reduce((longest, value) => (value.length > longest.length ? value : longest), TOKENS.greeting as string);

const momentLines = defineField({
  name: "lines",
  type: "array",
  of: [defineArrayMember({ type: "string" })],
  description:
    "One or two lines, set where the motto is. Words in braces are filled in: {greeting} (Good evening, by their clock, as set above), {studioTime} (the studio's time, e.g. 9:40 pm), {lastVisit} (the day they were last here, e.g. 14 October), {new} (what has gone up since, e.g. two projects and one insight) and {region} (where they are, e.g. the Caribbean). A moment whose words can't all be filled in for a visitor is skipped.",
  validation: (r) => [
    r.required().min(1).max(2),
    r.custom((lines?: string[]) => {
      const unknown = [...new Set((lines ?? []).flatMap(tokensIn).filter((name) => !isToken(name)))];
      return unknown.length ? `Not a word that can be filled in: ${unknown.map((name) => `{${name}}`).join(", ")}.` : true;
    }),
    r
      .custom((lines: string[] | undefined, context) => {
        const greeting = longestGreeting(context.document);
        const long = (lines ?? []).find(
          (line) =>
            line.replace(/\{(\w+)\}/g, (whole, name: string) =>
              name === "greeting" ? greeting : isToken(name) ? TOKENS[name] : whole,
            ).length > LINE_MAX,
        );
        return long ? `“${long}” can run past ${LINE_MAX} characters once filled in: wider than the motto.` : true;
      })
      .warning(),
  ],
});

const moments = object(
  "moments",
  [
    object(
      "greetings",
      [
        text("morning", { required: false, description: "5 am to noon." }),
        text("afternoon", { required: false, description: "Noon to 5 pm." }),
        text("evening", { required: false, description: "5 pm to 10 pm." }),
        text("night", {
          required: false,
          description: "10 pm to 5 am. “Good evening” reads better than “Good night”, which is a goodbye.",
        }),
      ],
      { description: "What {greeting} says, by the visitor's own clock." },
    ),
    text("newLabel", {
      required: false,
      title: "New mark",
      description:
        "The mark on a case study or an insight that has gone up since a returning visitor was last here, and they haven't read. No mark if empty.",
    }),
    list(
      "items",
      [
        text("title", { description: "What the moment is for: for you, and for the analytics. Not shown on the site." }),
        object(
          "when",
          [
            defineField({
              name: "times",
              title: "Time of day",
              type: "array",
              of: [defineArrayMember({ type: "string" })],
              options: { list: TIMES },
              description: "By their own clock. None ticked: any time.",
            }),
            choice("days", "Days", [{ title: "Weekends", value: "weekend" }, { title: "Weekdays", value: "weekday" }], "Empty: any day."),
            choice(
              "visit",
              "Visit",
              [{ title: "First visit", value: "first" }, { title: "Returning", value: "returning" }],
              "A new visit begins after half an hour away. Empty: either.",
            ),
            num("away", {
              required: false,
              title: "Away for at least (days)",
              description: "Days since they were last here. Returning visitors only.",
            }),
            num("visits", { required: false, title: "Visits, at least", description: "This one included." }),
            defineField({
              name: "fresh",
              title: "Something is new",
              type: "boolean",
              description: "Only when a case study or an insight has gone up since they were last here, and they haven't read it.",
            }),
            words(
              "campaigns",
              "Campaigns",
              "The utm_campaign on the link they came in on, any of these: health, for a link ending ?utm_campaign=health. For a link you send a prospect.",
            ),
            words(
              "sources",
              "Came from",
              "A word in the link's utm_source, or in the address of the site that sent them, any of these: linkedin.",
            ),
            defineField({
              name: "regions",
              title: "Where they are",
              type: "array",
              of: [defineArrayMember({ type: "string" })],
              options: { list: REGIONS.map(({ title, value }) => ({ title, value })) },
              description: "From the country their connection is in; never closer than that. None ticked: anywhere.",
            }),
            defineField({
              name: "interest",
              title: "Work for who they are",
              type: "boolean",
              description:
                "Only when we know which audience they are (from the site guide, the box above Selected work, or what they have read) and Selected work has work for them, which it then shows first.",
            }),
            defineField({
              name: "audiences",
              title: "Who they are",
              type: "array",
              of: [defineArrayMember({ type: "reference", to: [{ type: "audience" }] })],
              description: "Only for visitors taken to be one of these audiences. None: anyone.",
            }),
            defineField({
              name: "local",
              title: "Work from where they are",
              type: "boolean",
              description:
                "Only when Selected work has a project from their country or region (Project › Region), which it then shows first.",
            }),
            defineField({
              name: "gap",
              title: "Hours apart",
              type: "boolean",
              description: "Only when their clock is two hours or more from the studio's (Site settings › Studio time zone).",
            }),
          ],
          { description: "Every condition that is set must hold. With none set, the moment always holds." },
        ),
        momentLines,
        defineField({
          name: "leadWith",
          title: "Lead with",
          type: "array",
          of: [defineArrayMember({ type: "reference", to: [{ type: "project" }] })],
          description:
            "Optional. Projects Selected work shows first while this moment is said, in this order, taking the places of the last in the selection. For a link you send a prospect.",
        }),
      ],
      {
        title: "In order",
        description: "Tried from the top: the first whose conditions all hold, and whose words can all be filled in, is said. Drag to reorder.",
        preview: { select: { title: "title", subtitle: "lines.0" } },
      },
    ),
  ],
  {
    description:
      "What the home page says in the motto's place to a visitor it knows something about: their time of day, that they're back and what is new since, the link they came in on, where they are. Worked out in their browser; nothing about them is stored here. With nothing to say, the motto stays.",
    collapsed: true,
  },
);

export const homePage = defineType({
  name: "homePage",
  title: "Home page",
  type: "document",
  fields: [
    metaTitle({
      description:
        "The home page's title in search results and the browser tab, exactly as written: the site's name is not added. The site's name alone if empty.",
    }),
    plain("description", {
      required: false,
      title: "Meta description",
      description:
        "The line under the title in search results and on share cards, 120 to 160 characters. The site's description if empty.",
    }),
    socialImage({
      description:
        "Optional. The picture on share cards: LinkedIn, X, Slack, iMessage. Cropped to 1200 × 630 around the hotspot. Empty, the brand card is used.",
    }),
    object("hero", [
      defineField({
        name: "video",
        type: "r2Video",
        description: "The reel. MP4, muted and looped.",
      }),
      picture("poster", { description: "Shown before the reel plays.", video: false }),
      text("showreelLabel", { title: "Showreel button" }),
      text("showreelMark", { title: "Showreel caption" }),
    ]),
    object("claim", [
      lines("cover", { description: "The claim, one line per row. The break is part of the design." }),
      lines("motto", { description: "Set opposite the claim, one sentence per line." }),
    ]),
    object(
      "describe",
      [
        text("label", { description: "Over the box, e.g. Describe your project." }),
        text("placeholder", { description: "In the box until they type." }),
        text("submit", { description: "The button's words, read out by screen readers." }),
        text("working", { description: "While the work is read." }),
        text("result", { description: "Over the work it found." }),
        text("clear", { description: "Back to the selection." }),
        text("guide", { description: "Takes what they typed to the site guide." }),
        text("busy", { description: "When too many searches arrive at once." }),
        text("limit", { description: "When they have searched their day's worth." }),
        text("error", { description: "When it couldn't search." }),
      ],
      {
        title: "Describe your project",
        description:
          "The box at the head of Selected work: a visitor says what they are working on, and Claude brings up the closest work. Hidden until it has its words.",
        collapsed: true,
      },
    ),
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
    moments,
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
        para("statement", { description: "Each paragraph, or Shift+Enter, is a line break on the card." }),
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
        plain("art", { required: false, description: "What the picture should show. Not on the site." }),
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
      [
        para("quote"),
        text("name"),
        text("role"),
        text("company"),
        defineField({
          name: "project",
          title: "Their project",
          type: "reference",
          to: [{ type: "project" }],
          description:
            "Optional. The work they are speaking of: a visitor of the audience it was for (Tailor with AI) sees this quote first.",
        }),
        picture("portrait", {
          required: false,
          video: false,
          description: "Shown in a circle beside the name: set the hotspot on the face. Their initials if empty.",
        }),
      ],
      { preview: { select: { title: "name", subtitle: "company", media: "portrait" } } },
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
