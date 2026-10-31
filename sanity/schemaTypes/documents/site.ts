/**
 * What every page carries: the address, the header and menu, the orange
 * band and the footer, and the chat window. One document each.
 */

import { defineArrayMember, defineField, defineType } from "sanity";
import {
  action,
  colour,
  href,
  lines,
  list,
  object,
  para,
  plain,
  text,
} from "../fields";

const link = [text("label"), href()];

export const siteSettings = defineType({
  name: "siteSettings",
  title: "Site settings",
  type: "document",
  fields: [
    text("title", {
      description:
        "The site's name: after the page's name in the title of every page without a search title of its own, and on share cards.",
    }),
    plain("description", { description: "The default description for search results, for a page without one." }),
    defineField({
      name: "googleSiteVerification",
      type: "string",
      title: "Google Search Console code",
      description:
        "Optional. Proves the site is yours to Google Search Console: add the site as a URL-prefix property, choose the HTML tag method, and paste the tag's content value here. Not needed when the site is verified by DNS or through the Google tag.",
    }),
    defineField({
      name: "email",
      type: "string",
      description: "The studio's address: the contact page, the footer, the chat and the forms all use it.",
      validation: (r) => r.required().email(),
    }),
    list(
      "social",
      [
        defineField({
          name: "id",
          type: "string",
          title: "Network",
          options: { list: ["instagram", "linkedin"] },
          description: "Picks the icon.",
          validation: (r) => r.required(),
        }),
        ...link,
      ],
      { preview: { select: { title: "label", subtitle: "href" } } },
    ),
    action("headerAction", {
      title: "Header action",
      description: "The button at the right of the header.",
    }),
  ],
  preview: { prepare: () => ({ title: "Site settings" }) },
});

export const navigation = defineType({
  name: "navigation",
  title: "Navigation",
  type: "document",
  fields: [
    list(
      "items",
      [
        ...link,
        defineField({
          name: "inHeader",
          type: "boolean",
          title: "In the header",
          description: "Also set inline in the header on wide screens.",
          initialValue: false,
        }),
        defineField({
          name: "audiences",
          type: "boolean",
          title: "Open onto the audiences",
          description:
            "Lists the audiences from the Who we serve page under this item, so the menu and the page cannot disagree.",
          initialValue: false,
        }),
        object(
          "intro",
          [text("label", { required: false }), text("deck", { required: false })],
          { description: "A heading and a line over the routes when the item opens.", collapsed: true },
        ),
        list("children", link, {
          description: "Routes under this one. The item becomes a toggle in the menu.",
          preview: { select: { title: "label", subtitle: "href" } },
        }),
      ],
      {
        title: "Routes",
        description: "In order. The menu numbers them by position.",
        preview: { select: { title: "label", subtitle: "href" } },
      },
    ),
    object("ventures", [
      text("label"),
      list("links", [...link, colour("ground"), colour("ink")], {
        preview: { select: { title: "label", subtitle: "href" } },
      }),
    ]),
    text("contactLabel", { description: "The menu's bottom corner." }),
    text("featureLabel", { description: "Over the one piece of work the menu carries." }),
    defineField({
      name: "feature",
      type: "reference",
      title: "Featured project",
      to: [{ type: "project" }],
      description:
        "The project on the menu's card, shown with its card picture or film. The first project in the home page's Selected work if empty.",
    }),
    text("openLabel", { description: "The menu button, for screen readers." }),
  ],
  preview: { prepare: () => ({ title: "Navigation" }) },
});

export const footer = defineType({
  name: "footer",
  title: "Footer",
  type: "document",
  fields: [
    object("contactBand", [text("eyebrow"), lines("heading"), action()], {
      title: "Contact band",
      description: "The orange band at the foot of most pages.",
    }),
    object("explore", [
      text("label"),
      list("links", link, { preview: { select: { title: "label", subtitle: "href" } } }),
    ]),
    object("newsletter", [
      text("heading"),
      text("placeholder"),
      text("inputLabel", { description: "The field's name, for screen readers." }),
      text("action"),
      object("note", [
        text("before"),
        object("link", link),
        text("after"),
      ]),
      text("done", { description: "Once the address is on the list." }),
      text("invalid", { description: "When what was typed isn't an email address." }),
      text("failed", { description: "When the address couldn't be added: try again." }),
      object(
        "welcome",
        [
          text("subject"),
          plain("body", { description: "The letter. A blank line starts a new paragraph." }),
          lines("signoff"),
        ],
        {
          title: "Welcome email",
          description: "Sent to each new subscriber, the moment they sign up.",
        },
      ),
    ]),
    list("legal", link, { preview: { select: { title: "label", subtitle: "href" } } }),
    text("top", { description: "The back-to-top link." }),
  ],
  preview: { prepare: () => ({ title: "Footer" }) },
});

const field = (name: string) => object(name, [text("label"), text("placeholder")]);

/** The kinds of page the panel can open on, for the questions it offers there. */
export const STARTER_PLACES = [
  { title: "Any page", value: "any" },
  { title: "Home", value: "home" },
  { title: "A case study", value: "work" },
  { title: "An insight", value: "insights" },
  { title: "Services and the tracks", value: "services" },
  { title: "Who we serve", value: "audiences" },
  { title: "Our approach", value: "approach" },
];

/**
 * The site guide: the pill in the corner and the panel it opens. Two
 * questions narrow the work to a shortlist, the guide answers in its own
 * words from what the site says (app/api/guide), and a brief goes to the
 * studio as an enquiry, as the contact form's do.
 *
 * Stored as `chat`, the type's name since it was a chat window: a document's
 * type cannot be renamed in place.
 */
export const chat = defineType({
  name: "chat",
  title: "Site guide",
  type: "document",
  groups: [
    { name: "panel", title: "Panel", default: true },
    { name: "shortlist", title: "Shortlist" },
    { name: "ask", title: "Questions" },
    { name: "brief", title: "Brief" },
  ],
  fields: [
    object(
      "launcher",
      [text("open"), text("close"), text("label", { description: "For screen readers." })],
      { group: "panel" },
    ),
    text("heading", { group: "panel" }),
    text("disclosure", {
      group: "panel",
      description: "Under the heading: what the guide is, in a line. Say that its answers are written by AI.",
    }),
    para("intro", { group: "panel", description: "Over the two questions." }),
    text("closeLabel", { group: "panel", description: "For screen readers." }),
    object(
      "picker",
      [
        text("audienceLabel", { description: "Over the audiences, which are the ones on Who we serve." }),
        text("other", { description: "The chip after the audiences, for anyone else." }),
        text("needLabel"),
        list(
          "needs",
          [
            text("label"),
            defineField({
              name: "track",
              type: "reference",
              to: [{ type: "trackPage" }],
              description: "The way of working this points to: its terms are shortlisted.",
              validation: (r) => r.required(),
            }),
            defineField({
              name: "discipline",
              type: "reference",
              weak: true,
              to: [{ type: "discipline" }],
              description: "Optional. Work of this kind is shortlisted first.",
            }),
            defineField({
              name: "topic",
              type: "reference",
              weak: true,
              to: [{ type: "insightTopic" }],
              description: "Optional. An insight on this topic is shortlisted; the newest one if empty.",
            }),
          ],
          { preview: { select: { title: "label", subtitle: "track.title" } } },
        ),
        text("unsure", {
          description: "The last need, for someone who doesn't know yet. It shortlists the first phase of Our approach.",
        }),
        text("skip", { description: "The way past the two questions, straight to asking." }),
        text("resultLabel", { description: "Over the shortlist." }),
        object("kinds", [text("work"), text("track"), text("insight"), text("page")], {
          description: "The label on each kind of card.",
        }),
        text("audienceLink", {
          description: "{audience}: the audience's name. The link to its page under the shortlist.",
        }),
        text("restart"),
      ],
      { group: "shortlist" },
    ),
    defineField({
      name: "exclude",
      title: "Never recommend",
      type: "array",
      group: "shortlist",
      description:
        "Work the guide never shortlists or points to: demo projects, or anything not ready to be shown off.",
      /* Weak, so a project on the list can still be deleted: the demo work is meant to be. */
      of: [defineArrayMember({ type: "reference", weak: true, to: [{ type: "project" }] })],
    }),
    list(
      "starters",
      [
        defineField({
          name: "where",
          type: "string",
          options: { list: STARTER_PLACES },
          validation: (r) => r.required(),
        }),
        lines("prompts", { description: "One question per line, as the visitor would ask it." }),
      ],
      {
        group: "ask",
        description:
          "Questions offered as chips, by the kind of page the panel is opened on. Any page is used where nothing else matches.",
        preview: { select: { title: "where", subtitle: "prompts.0" } },
      },
    ),
    object(
      "ask",
      [
        text("placeholder"),
        text("send", { description: "For screen readers: the arrow." }),
        text("reading", { description: "While an answer is being written." }),
        text("you", { description: "For screen readers: before each of the visitor's messages." }),
        text("guide", { description: "For screen readers: before each answer." }),
        text("error", { description: "When an answer could not be written." }),
        text("busy", { description: "When too many questions arrive at once." }),
        text("limit", { description: "When a conversation has run as long as it can." }),
      ],
      { group: "ask" },
    ),
    object(
      "brief",
      [
        text("open", { description: "The link at the foot of the panel." }),
        text("review", { description: "Under an answer that drafted a brief: the way to it." }),
        text("heading"),
        para("lead"),
        field("name"),
        field("email"),
        field("company"),
        field("summary"),
        text("optional", { description: "After an optional field's label." }),
        text("send"),
        text("sending"),
        text("sent", { description: "{email}: the sender's address." }),
        text("failed", { description: "{email}: the studio's address." }),
        text("note", { description: "Under the button: what happens to the conversation." }),
        text("back"),
      ],
      { group: "brief" },
    ),
  ],
  preview: { prepare: () => ({ title: "Site guide" }) },
});
