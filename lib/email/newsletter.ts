/**
 * The email a new subscriber is sent: a short letter on the same sheet as
 * the enquiry emails (enquiry.ts), saying what they've signed up for. Its
 * words are the Footer's (Welcome email in the Studio).
 */

import type { NewsletterCopy } from "@/sanity/types";
import { block, escape, FONT, INK, layout, type Email } from "./enquiry";

export function welcomeEmail(siteName: string, welcome: NonNullable<NewsletterCopy["welcome"]>): Email {
  const paragraphs = welcome.body
    .split(/\n\s*\n/)
    .map((p) => p.trim())
    .filter(Boolean);

  /* A letter with no sign-off written yet goes without one. */
  const signoff = welcome.signoff.length > 0;

  const html = layout(
    siteName,
    `
      ${paragraphs.map((p) => `<p style="margin:0 0 18px;font:15px/1.6 ${FONT};color:${INK};">${block(p)}</p>`).join("")}
      ${signoff ? `<p style="margin:18px 0 0;font:15px/1.6 ${FONT};color:${INK};">${welcome.signoff.map(escape).join("<br>")}</p>` : ""}
    `,
  );

  const text = [...paragraphs, ...(signoff ? [welcome.signoff.join("\n")] : [])].join("\n\n");

  return { subject: welcome.subject, html, text };
}
