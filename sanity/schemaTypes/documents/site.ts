/**
 * What every page carries: the address, the header and menu, the orange
 * band and the footer, and the chat window. One document each.
 */

import { defineField, defineType } from "sanity";
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
    text("title", { description: "The site's name, after every page title." }),
    plain("description", { description: "The default description for search results." }),
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
      text("subject", { description: "The subject line of the sign-up email." }),
      object("note", [
        text("before"),
        object("link", link),
        text("after"),
      ]),
      text("done"),
      text("invalid"),
    ]),
    list("legal", link, { preview: { select: { title: "label", subtitle: "href" } } }),
    text("top", { description: "The back-to-top link." }),
  ],
  preview: { prepare: () => ({ title: "Footer" }) },
});

export const chat = defineType({
  name: "chat",
  title: "Chat",
  type: "document",
  fields: [
    object("launcher", [
      text("open"),
      text("close"),
      text("label", { description: "For screen readers." }),
    ]),
    text("heading"),
    text("status"),
    para("intro"),
    lines("topics", { description: "The chips at the top. The first is chosen to begin with." }),
    text("topicsLabel", { description: "For screen readers." }),
    object("name", [text("label"), text("placeholder")]),
    object("email", [text("label"), text("placeholder")]),
    object("message", [text("label"), text("placeholder")]),
    text("preview", { description: "The submit button." }),
    object("ready", [
      text("label"),
      text("about"),
      text("from"),
      text("message"),
      text("empty"),
      text("send"),
      text("edit"),
    ]),
    text("note"),
    text("contact", { description: "Set before the email address at the foot." }),
    text("closeLabel", { description: "For screen readers." }),
  ],
  preview: { prepare: () => ({ title: "Chat" }) },
});
