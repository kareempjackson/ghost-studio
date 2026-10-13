/**
 * The parts every portal email is built from. Like the enquiry emails
 * (enquiry.ts): plain HTML, tables and inline styles, because that is what
 * mail clients read — plus a text version of everything.
 *
 * The look is the portal's, translated for mail: the warm grey desk, one
 * white card, DM Sans where the client can load it (Apple Mail, iOS) and
 * Helvetica where it can't, Arial capitals for labels, one black pill for
 * the one thing to do. Colour stays in small dots and tints.
 *
 * Images need full addresses and PNG or JPEG: Gmail shows no SVG. `base` is
 * the address the portal is served from.
 */

export interface Email {
  readonly subject: string;
  /** The line inboxes show after the subject. */
  readonly preheader: string;
  readonly html: string;
  readonly text: string;
}

export const C = {
  desk: "#f0efed",
  card: "#ffffff",
  ink: "#0e0d0b",
  body: "#2b2925",
  muted: "#78746c",
  faint: "#9a958c",
  rule: "#ebe9e5",
  well: "#f6f5f3",
  acid: "#dfe95f",
  acidBg: "#f3f8c2",
  acidInk: "#3a3e0e",
  signal: "#eb5b32",
  signalBg: "#fdeeeb",
  signalInk: "#b4321b",
} as const;

const TEXT = "'DM Sans', 'Helvetica Neue', Helvetica, Arial, sans-serif";
const LABEL = "Arial, Helvetica, sans-serif";

export const esc = (value: string) =>
  value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#39;");

/** Line breaks kept, as typed. */
export const lines = (value: string) => esc(value).replace(/\r?\n/g, "<br>");

/* -------------------------------------------------------------------------- */
/*  Pieces                                                                    */
/* -------------------------------------------------------------------------- */

/** Small capitals: what an email is about, a field's name. */
export const label = (text: string, color: string = C.muted) =>
  `<p style="margin:0;font:400 11px/1 ${LABEL};letter-spacing:0.1em;text-transform:uppercase;color:${color};">${esc(text)}</p>`;

/** The headline: large, light, set close. */
export const heading = (text: string) =>
  `<h1 class="gs-h1" style="margin:14px 0 0;font:300 32px/1.08 ${TEXT};letter-spacing:-0.035em;color:${C.ink};">${esc(text)}</h1>`;

export const para = (html: string, opts: { muted?: boolean; size?: number; top?: number } = {}) =>
  `<p style="margin:${opts.top ?? 16}px 0 0;font:400 ${opts.size ?? 15}px/1.6 ${TEXT};color:${opts.muted ? C.muted : C.body};">${html}</p>`;

/** The one thing to do: a black pill with an arrow. */
export const button = (text: string, href: string) => `
  <table role="presentation" cellpadding="0" cellspacing="0" style="margin:28px 0 0;">
    <tr>
      <td style="border-radius:999px;background:${C.ink};">
        <a href="${esc(href)}" style="display:inline-block;padding:15px 22px 15px 24px;font:400 12px/1 ${LABEL};letter-spacing:0.1em;text-transform:uppercase;color:#ffffff;text-decoration:none;border-radius:999px;">${esc(text)}&nbsp;&nbsp;&rarr;</a>
      </td>
    </tr>
  </table>`;

/** A quiet link under the button, for the second thing. */
export const textLink = (text: string, href: string) =>
  `<p style="margin:14px 0 0;font:400 13px/1.5 ${TEXT};"><a href="${esc(href)}" style="color:${C.muted};text-decoration:underline;">${esc(text)}</a></p>`;

/** A status, as the portal shows one: a dot and a word on a tint. */
export function chip(text: string, tone: "quiet" | "acid" | "signal" | "ink" = "quiet") {
  const tones = {
    quiet: [C.well, C.body, C.faint],
    acid: [C.acidBg, C.acidInk, "#9ca622"],
    signal: [C.signalBg, C.signalInk, C.signal],
    ink: [C.ink, "#ffffff", "#ffffff"],
  } as const;
  const [bg, fg, dot] = tones[tone];
  return `<span style="display:inline-block;padding:6px 10px;border-radius:999px;background:${bg};font:400 10px/1 ${LABEL};letter-spacing:0.1em;text-transform:uppercase;color:${fg};white-space:nowrap;"><span style="display:inline-block;width:6px;height:6px;border-radius:6px;background:${dot};margin-right:6px;vertical-align:1px;"></span>${esc(text)}</span>`;
}

/** Someone's words, set off by a rule. */
export const quote = (text: string, cite?: string) => `
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:20px 0 0;">
    <tr>
      <td style="border-left:2px solid ${C.rule};padding:2px 0 2px 16px;">
        <p style="margin:0;font:400 15px/1.6 ${TEXT};color:${C.ink};">${lines(text)}</p>
        ${cite ? `<p style="margin:6px 0 0;font:400 13px/1.4 ${TEXT};color:${C.muted};">${esc(cite)}</p>` : ""}
      </td>
    </tr>
  </table>`;

/** A sunk panel on the card, for a block of detail. */
export const well = (html: string, top = 24) => `
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:${top}px 0 0;">
    <tr><td style="background:${C.well};border-radius:14px;padding:18px 20px;">${html}</td></tr>
  </table>`;

/** Label and value, row under row, hairlines between. */
export const rows = (pairs: readonly (readonly [string, string])[], top = 20) => `
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:${top}px 0 0;">
    ${pairs
      .map(
        ([k, v], n) => `
      <tr>
        <td style="padding:12px 0;${n ? `border-top:1px solid ${C.rule};` : ""}font:400 11px/1.4 ${LABEL};letter-spacing:0.1em;text-transform:uppercase;color:${C.muted};width:40%;vertical-align:top;">${esc(k)}</td>
        <td style="padding:12px 0;${n ? `border-top:1px solid ${C.rule};` : ""}font:400 14px/1.4 ${TEXT};color:${C.ink};text-align:right;vertical-align:top;">${v}</td>
      </tr>`,
      )
      .join("")}
  </table>`;

/** A person, as their initials on a disc. */
export function initials(name: string, side: "studio" | "client" | "contractor" = "studio", size = 28) {
  const [bg, fg] = side === "studio" ? [C.ink, "#ffffff"] : side === "client" ? ["#efe2c6", C.ink] : ["#dedbd4", "#2b2925"];
  const text = name
    .split(/\s+/)
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
  return `<span style="display:inline-block;width:${size}px;height:${size}px;line-height:${size}px;border-radius:${size}px;background:${bg};color:${fg};text-align:center;font:400 ${Math.round(size * 0.34)}px/${size}px ${LABEL};letter-spacing:0.06em;">${esc(text)}</span>`;
}

/** A picture of the work, edge to edge of the card's column, on its project's ground. */
export const picture = (src: string, alt: string, ground: string) => `
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:24px 0 0;">
    <tr><td style="background:${ground};border-radius:14px;overflow:hidden;line-height:0;"><img src="${esc(src)}" alt="${esc(alt)}" width="488" style="display:block;width:100%;height:auto;border-radius:14px;"></td></tr>
  </table>`;

/** Progress as a row of segments: done, now, still to come. */
export function progress(segments: readonly ("done" | "now" | "next")[], top = 18) {
  const colour = { done: C.acid, now: C.ink, next: C.rule };
  return `
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:${top}px 0 0;">
    <tr>
      ${segments.map((s, n) => `<td style="height:6px;background:${colour[s]};border-radius:6px;font-size:0;line-height:0;">&nbsp;</td>${n < segments.length - 1 ? `<td style="width:4px;font-size:0;">&nbsp;</td>` : ""}`).join("")}
    </tr>
  </table>`;
}

/** A large figure: a sum, set light. */
export const figure = (text: string, color: string = C.ink) =>
  `<p style="margin:20px 0 0;font:300 44px/1 ${TEXT};letter-spacing:-0.04em;color:${color};">${esc(text)}</p>`;

/* -------------------------------------------------------------------------- */
/*  The page                                                                  */
/* -------------------------------------------------------------------------- */

/**
 * Every email's frame: the mark, the card, and a foot that says why it came
 * and — when it's from a thread — that replying goes straight back in.
 */
export function layout({
  base,
  preheader,
  body,
  replyable = false,
  why,
  settings = true,
}: {
  base: string;
  preheader: string;
  body: string;
  /** Replies to it land in the project's thread. */
  replyable?: boolean;
  /** "You're on Northwind rebrand." */
  why: string;
  settings?: boolean;
}) {
  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <meta name="color-scheme" content="light only">
    <meta name="supported-color-schemes" content="light">
    <title>Ghost Savvy Studios</title>
    <link href="https://fonts.googleapis.com/css2?family=DM+Sans:opsz,wght@9..40,300;9..40,400;9..40,500&display=swap" rel="stylesheet">
    <style>
      @media (max-width: 600px) {
        .gs-card { padding: 30px 22px !important; border-radius: 18px !important; }
        .gs-h1 { font-size: 28px !important; }
        .gs-outer { padding: 16px 10px !important; }
      }
    </style>
  </head>
  <body style="margin:0;padding:0;background:${C.desk};-webkit-font-smoothing:antialiased;">
    <div style="display:none;max-height:0;overflow:hidden;opacity:0;color:${C.desk};">${esc(preheader)}&#847;&zwnj;&nbsp;&#847;&zwnj;&nbsp;&#847;&zwnj;&nbsp;</div>
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${C.desk};">
      <tr>
        <td align="center" class="gs-outer" style="padding:36px 16px;">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:568px;">
            <tr>
              <td style="padding:0 8px 22px;">
                <img src="${esc(base)}/email/ghost-mark@2x.png" alt="Ghost Savvy Studios" width="115" height="28" style="display:block;width:115px;height:28px;border:0;">
              </td>
            </tr>
            <tr>
              <td class="gs-card" style="background:${C.card};border-radius:22px;padding:40px 40px 40px;">
                ${body}
              </td>
            </tr>
            <tr>
              <td style="padding:24px 12px 0;">
                ${replyable ? `<p style="margin:0 0 10px;font:400 13px/1.5 ${TEXT};color:${C.body};">Reply to this email and it goes straight into the project&rsquo;s thread.</p>` : ""}
                <p style="margin:0;font:400 12px/1.6 ${TEXT};color:${C.faint};">${esc(why)}${settings ? ` <a href="${esc(base)}/portal/settings" style="color:${C.faint};text-decoration:underline;">Change what we email you</a>.` : ""}</p>
                <p style="margin:14px 0 0;font:400 10px/1 ${LABEL};letter-spacing:0.1em;text-transform:uppercase;color:${C.faint};">Ghost Savvy Studios</p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;
}

/** The plain-text version: blocks with a blank line between, the link written out. */
export const plain = (...blocks: readonly (string | false | undefined)[]) => blocks.filter(Boolean).join("\n\n");
