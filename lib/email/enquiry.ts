/**
 * The two emails an enquiry sends: the confirmation to whoever wrote in,
 * and the alert to the studio. Plain HTML, laid out with tables and inline
 * styles because that is what mail clients read, with a text version of
 * each for the clients that read nothing else.
 *
 * The confirmation's words are the Contact page's (Confirmation email in the
 * Studio); both recap the message under the form's own labels. Everything a
 * visitor typed is escaped before it goes anywhere near the HTML.
 */

import type { EnquiryCopy } from "@/sanity/types";

export interface Enquiry {
  readonly name: string;
  readonly email: string;
  readonly company: string;
  readonly help: readonly string[];
  readonly brief: string;
  readonly budget: string;
  readonly timing: string;
}

export interface Email {
  readonly subject: string;
  readonly html: string;
  readonly text: string;
}

const INK = "#0e0d0b";
const MUTED = "#6b6862";
const RULE = "#e7e6e1";
const FONT = "Helvetica, Arial, sans-serif";

const escape = (value: string) =>
  value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");

/** Line breaks kept, as the sender typed them. */
const block = (value: string) => escape(value).replace(/\r?\n/g, "<br>");

const fill = (template: string, values: Record<string, string>) =>
  template.replace(/\{(\w+)\}/g, (whole, key: string) => values[key] ?? whole);

/** What they sent, under the form's labels; empty answers are left out. */
function recap(copy: EnquiryCopy, enquiry: Enquiry) {
  const { form } = copy;
  return [
    [form.name.label, enquiry.name],
    [form.email.label, enquiry.email],
    [form.company.label, enquiry.company],
    [form.help.label, enquiry.help.join(", ")],
    [form.brief.label, enquiry.brief],
    [form.budget.label, enquiry.budget],
    [form.timing.label, enquiry.timing],
  ].filter(([, value]) => value) as [string, string][];
}

function recapHtml(rows: [string, string][]) {
  return rows
    .map(
      ([label, value]) => `
        <tr>
          <td style="padding:14px 0;border-top:1px solid ${RULE};font:13px/1.4 ${FONT};color:${MUTED};vertical-align:top;width:38%;">${escape(label)}</td>
          <td style="padding:14px 0 14px 16px;border-top:1px solid ${RULE};font:15px/1.5 ${FONT};color:${INK};vertical-align:top;">${block(value)}</td>
        </tr>`,
    )
    .join("");
}

const recapText = (rows: [string, string][]) =>
  rows.map(([label, value]) => `${label}\n${value}`).join("\n\n");

/** The page every email is set on: a white sheet, the studio's name at the top. */
function layout(siteName: string, inner: string) {
  return `<!doctype html>
<html lang="en">
  <head><meta charset="utf-8"><meta name="viewport" content="width=device-width"><title>${escape(siteName)}</title></head>
  <body style="margin:0;padding:0;background:#f3f2f0;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f3f2f0;">
      <tr>
        <td align="center" style="padding:32px 16px;">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;background:#ffffff;border-radius:12px;">
            <tr>
              <td style="padding:36px 36px 8px;font:600 12px/1 ${FONT};letter-spacing:0.08em;text-transform:uppercase;color:${INK};">${escape(siteName)}</td>
            </tr>
            <tr><td style="padding:20px 36px 36px;">${inner}</td></tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;
}

/** The confirmation, to whoever wrote in. */
export function acknowledgementEmail(copy: EnquiryCopy, enquiry: Enquiry): Email {
  const { acknowledgement: ack } = copy;
  const first = enquiry.name.split(/\s+/)[0] ?? enquiry.name;
  const greeting = fill(ack.greeting, { name: first });
  const paragraphs = ack.body
    .split(/\n\s*\n/)
    .map((p) => p.trim())
    .filter(Boolean);
  const rows = recap(copy, enquiry);

  const html = layout(
    copy.siteName,
    `
      <p style="margin:0 0 18px;font:15px/1.6 ${FONT};color:${INK};">${escape(greeting)}</p>
      ${paragraphs.map((p) => `<p style="margin:0 0 18px;font:15px/1.6 ${FONT};color:${INK};">${block(p)}</p>`).join("")}
      <p style="margin:18px 0 0;font:15px/1.6 ${FONT};color:${INK};">${ack.signoff.map(escape).join("<br>")}</p>
      <p style="margin:36px 0 8px;font:600 11px/1 ${FONT};letter-spacing:0.08em;text-transform:uppercase;color:${MUTED};">${escape(ack.recapLabel)}</p>
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0">${recapHtml(rows)}</table>
    `,
  );

  const text = [
    greeting,
    ...paragraphs,
    ack.signoff.join("\n"),
    `— ${ack.recapLabel.toUpperCase()}`,
    recapText(rows),
  ].join("\n\n");

  return { subject: ack.subject, html, text };
}

/** The alert, to the studio. Replying to it answers the sender. */
export function notificationEmail(copy: EnquiryCopy, enquiry: Enquiry, studioLink: string | null): Email {
  const rows = recap(copy, enquiry);
  const who = [enquiry.name, enquiry.company].filter(Boolean).join(", ");
  const subject = `New enquiry: ${who}`;

  const html = layout(
    copy.siteName,
    `
      <p style="margin:0 0 6px;font:22px/1.25 ${FONT};color:${INK};">New enquiry from ${escape(who)}</p>
      <p style="margin:0 0 28px;font:14px/1.5 ${FONT};color:${MUTED};">Reply to this email to answer ${escape(enquiry.name)} directly.</p>
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0">${recapHtml(rows)}</table>
      ${
        studioLink
          ? `<p style="margin:28px 0 0;"><a href="${escape(studioLink)}" style="display:inline-block;padding:12px 20px;border-radius:999px;background:${INK};color:#ffffff;font:600 12px/1 ${FONT};letter-spacing:0.08em;text-transform:uppercase;text-decoration:none;">Open in the Studio</a></p>`
          : ""
      }
    `,
  );

  const text = [
    `New enquiry from ${who}`,
    `Reply to this email to answer ${enquiry.name} directly.`,
    recapText(rows),
    studioLink ? `Open in the Studio: ${studioLink}` : "",
  ]
    .filter(Boolean)
    .join("\n\n");

  return { subject, html, text };
}
