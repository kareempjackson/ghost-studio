/**
 * A message sent from the form on /contact.
 *
 * The site writes these, never an editor: what the sender typed is read-only
 * here, and the studio's part is the status and the notes. They are stored
 * at `enquiry.<id>`, and a dataset keeps any document whose id has a dot in
 * it private: readable in the Studio and with a token, never by the public
 * API the site reads from. See app/(site)/contact/actions.ts.
 */

import { defineArrayMember, defineField, defineType } from "sanity";

const delivery = (name: string, title: string) =>
  defineField({
    name,
    title,
    type: "string",
    readOnly: true,
    options: {
      list: [
        { title: "Sent", value: "sent" },
        { title: "Failed", value: "failed" },
        { title: "Not sent: email isn't set up", value: "skipped" },
      ],
    },
  });

export const enquiry = defineType({
  name: "enquiry",
  title: "Enquiry",
  type: "document",
  fields: [
    defineField({
      name: "status",
      type: "string",
      description: "Where the conversation is.",
      options: {
        list: [
          { title: "New", value: "new" },
          { title: "Replied", value: "replied" },
          { title: "Archived", value: "archived" },
        ],
        layout: "radio",
        direction: "horizontal",
      },
      initialValue: "new",
    }),
    defineField({
      name: "notes",
      type: "text",
      rows: 3,
      description: "For the studio only: who is answering, what was agreed.",
    }),
    defineField({ name: "receivedAt", title: "Received", type: "datetime", readOnly: true }),
    defineField({ name: "name", type: "string", readOnly: true }),
    defineField({ name: "email", type: "string", readOnly: true }),
    defineField({ name: "company", type: "string", readOnly: true }),
    defineField({
      name: "help",
      title: "Help with",
      type: "array",
      of: [defineArrayMember({ type: "string" })],
      readOnly: true,
    }),
    defineField({ name: "brief", title: "Message", type: "text", rows: 8, readOnly: true }),
    defineField({ name: "budget", type: "string", readOnly: true }),
    defineField({ name: "timing", type: "string", readOnly: true }),
    defineField({
      name: "delivery",
      type: "object",
      readOnly: true,
      description: "The emails sent when it arrived.",
      fields: [
        delivery("acknowledgement", "Confirmation to the sender"),
        delivery("notification", "Alert to the studio"),
        defineField({ name: "error", type: "string", readOnly: true }),
      ],
    }),
  ],
  orderings: [
    {
      title: "Newest first",
      name: "receivedDesc",
      by: [{ field: "receivedAt", direction: "desc" }],
    },
  ],
  preview: {
    select: { name: "name", company: "company", status: "status", receivedAt: "receivedAt" },
    prepare: ({ name, company, status, receivedAt }) => ({
      title: [name, company].filter(Boolean).join(" · ") || "Enquiry",
      subtitle: [
        status === "new" ? "● New" : status === "replied" ? "Replied" : status === "archived" ? "Archived" : null,
        receivedAt ? new Date(receivedAt).toLocaleString("en-GB", { dateStyle: "medium", timeStyle: "short" }) : null,
      ]
        .filter(Boolean)
        .join(" — "),
    }),
  },
});
