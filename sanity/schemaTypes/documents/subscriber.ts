/**
 * An address signed up to the newsletter in the footer.
 *
 * The site writes these, never an editor, as it does enquiries: stored at
 * `subscriber.<id>`, private to the Studio and to a token, never read by the
 * public API. The id comes from the address, so signing up twice is still
 * one subscriber. See app/(site)/_components/subscribe.ts.
 *
 * The mailing list itself is Resend's: an issue is sent from there, and
 * Resend keeps who has unsubscribed. This is the studio's record of who
 * signed up, when and where, and whether they reached the list.
 */

import { defineField, defineType } from "sanity";

const status = (name: string, title: string, list: { title: string; value: string }[]) =>
  defineField({ name, title, type: "string", readOnly: true, options: { list } });

export const subscriber = defineType({
  name: "subscriber",
  title: "Subscriber",
  type: "document",
  fields: [
    defineField({ name: "email", type: "string", readOnly: true }),
    defineField({ name: "subscribedAt", title: "Signed up", type: "datetime", readOnly: true }),
    defineField({
      name: "page",
      title: "Signed up on",
      type: "string",
      readOnly: true,
      description: "The page they were reading.",
    }),
    status("list", "Mailing list", [
      { title: "On the list", value: "added" },
      { title: "Failed: not on the list", value: "failed" },
      { title: "Not added: email isn't set up", value: "skipped" },
    ]),
    status("welcome", "Welcome email", [
      { title: "Sent", value: "sent" },
      { title: "Failed", value: "failed" },
      { title: "Not sent: none written (Footer → Newsletter)", value: "unwritten" },
      { title: "Not sent: email isn't set up", value: "skipped" },
    ]),
    defineField({ name: "error", type: "string", readOnly: true }),
  ],
  orderings: [
    {
      title: "Newest first",
      name: "subscribedDesc",
      by: [{ field: "subscribedAt", direction: "desc" }],
    },
  ],
  preview: {
    select: { email: "email", subscribedAt: "subscribedAt", list: "list" },
    prepare: ({ email, subscribedAt, list }) => ({
      title: email || "Subscriber",
      subtitle: [
        list === "failed" ? "● Not on the list" : list === "skipped" ? "● Not added" : null,
        subscribedAt
          ? new Date(subscribedAt).toLocaleString("en-GB", { dateStyle: "medium", timeStyle: "short" })
          : null,
      ]
        .filter(Boolean)
        .join(" — "),
    }),
  },
});
