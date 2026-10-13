/**
 * Every email the portal sends, as functions from what happened to
 * { subject, preheader, html, text }. Sending is one call to Resend with the
 * result; replies come back through the project's reply address (see
 * lib/portal/mail.ts), so anything sent from a thread says so in its foot.
 *
 * The words follow the studio's voice: say what happened, say what to do,
 * stop. One button per email. Never a password.
 */

import {
  C,
  type Email,
  button,
  chip,
  esc,
  figure,
  heading,
  initials,
  label,
  layout,
  lines,
  para,
  picture,
  plain,
  progress,
  quote,
  rows,
  textLink,
  well,
} from "./kit";

interface Base {
  /** Where the portal is served from: links and images are made absolute from it. */
  readonly base: string;
  /** The recipient's first name. */
  readonly first: string;
}

interface ProjectRef {
  readonly name: string;
  readonly code: string;
  readonly ground: string;
}

type Side = "studio" | "client" | "contractor";

const eyebrow = (p: ProjectRef) => label(`${p.code} · ${p.name}`);

/* -------------------------------------------------------------------------- */
/*  Getting in                                                                */
/* -------------------------------------------------------------------------- */

/** The sign-in link. Nothing else in it, so it's never mistaken for anything else. */
export function magicLink({ base, first, email, link }: Base & { email: string; link: string }): Email {
  const subject = "Your link to the portal";
  const preheader = "It signs you in once, for the next hour.";
  const html = layout({
    base,
    preheader,
    settings: false,
    why: `Someone asked to sign in to the Ghost Savvy portal as ${email}. If it wasn't you, ignore this; nothing happens without the link.`,
    body: `
      ${label("Client portal")}
      ${heading(`Here's your way in, ${first}.`)}
      ${para("Press the button to sign in. The link works once, for the next hour, and only from this email.")}
      ${button("Sign in", link)}
      ${para(`Or paste this into your browser:<br><span style="color:${C.muted};word-break:break-all;">${esc(link)}</span>`, { size: 12, top: 24, muted: true })}
    `,
  });
  return {
    subject,
    preheader,
    html,
    text: plain(`Here's your way in, ${first}.`, "The link works once, for the next hour.", `Sign in: ${link}`, `If you didn't ask to sign in as ${email}, ignore this email.`),
  };
}

/** The invitation, for someone new to the portal. Mirrors the preview drawn in the new-client flow. */
export function invite({
  base,
  first,
  client,
  project,
  lead,
  note,
  link,
}: Base & { client: string; project?: string; lead: string; note?: string; link: string }): Email {
  const place = project || client;
  const subject = `You're invited to ${place}`;
  const preheader = `${lead} has set up a space for ${client} on the Ghost Savvy portal.`;
  const html = layout({
    base,
    preheader,
    settings: false,
    why: `You're getting this because ${lead.split(" ")[0]} invited you to the Ghost Savvy portal.`,
    body: `
      ${label("Client portal")}
      ${heading(`Welcome to ${place}.`)}
      ${para(`Hi ${esc(first)}, ${esc(lead)} has set up a space for ${esc(client)} on the Ghost Savvy portal. It&rsquo;s where you&rsquo;ll review work as it&rsquo;s ready, follow each milestone, talk with the studio, and find every invoice.`)}
      ${note ? quote(note, `— ${lead}`) : ""}
      ${button("Enter the portal", link)}
      ${para("No password. This link signs you in once; you can ask for a fresh one any time from the sign-in page.", { size: 13, top: 20, muted: true })}
    `,
  });
  return {
    subject,
    preheader,
    html,
    text: plain(
      `Welcome to ${place}.`,
      `Hi ${first}, ${lead} has set up a space for ${client} on the Ghost Savvy portal: review work, follow milestones, talk with the studio and find every invoice.`,
      note && `"${note}" — ${lead}`,
      `Enter the portal: ${link}`,
      "No password. The link signs you in once.",
    ),
  };
}

/* -------------------------------------------------------------------------- */
/*  Reviews                                                                   */
/* -------------------------------------------------------------------------- */

/** To the client: work is ready for them. The picture leads, because it's the point. */
export function reviewRequested({
  base,
  first,
  project,
  item,
  version,
  note,
  sender,
  thumb,
  dueOn,
  link,
}: Base & { project: ProjectRef; item: string; version: string; note: string; sender: string; thumb: string; dueOn?: string; link: string }): Email {
  const subject = `${item} ${version} is ready for your review`;
  const preheader = note;
  const html = layout({
    base,
    preheader,
    replyable: true,
    why: `You're getting this because you're on ${project.name}, ${first}.`,
    body: `
      ${eyebrow(project)}
      ${heading(`${item} ${version} is ready for you.`)}
      ${picture(thumb, `${item}, ${version}`, project.ground)}
      ${quote(note, `— ${sender}`)}
      ${dueOn ? rows([["Your decision by", esc(dueOn)]], 24) : ""}
      ${button(`Review ${version}`, link)}
      ${para("Approve it, ask for changes, or pin a comment to the exact spot you mean.", { size: 13, top: 14, muted: true })}
    `,
  });
  return {
    subject,
    preheader,
    html,
    text: plain(`${item} ${version} is ready for your review (${project.name}).`, `"${note}" — ${sender}`, dueOn && `Your decision by ${dueOn}.`, `Review it: ${link}`),
  };
}

/** To the studio: a client decided. What they said comes first; the pins follow. */
export function decisionMade({
  base,
  first,
  reviewer,
  project,
  item,
  version,
  decision,
  reason,
  comments,
  link,
}: Base & {
  reviewer: string;
  project: ProjectRef;
  item: string;
  version: string;
  decision: "approved" | "changes_requested" | "rejected";
  reason?: string;
  comments: readonly { readonly n: number; readonly body: string }[];
  link: string;
}): Email {
  const who = reviewer.split(" ")[0];
  const verb = decision === "approved" ? "approved" : decision === "rejected" ? "rejected" : "asked for changes on";
  const subject = `${who} ${verb} ${item} ${version}`;
  const preheader = reason ?? (decision === "approved" ? "Nothing more needed from the client." : `${comments.length} pinned comments.`);
  const html = layout({
    base,
    preheader,
    why: `You're getting this because you're on ${project.name}, ${first}.`,
    body: `
      ${eyebrow(project)}
      <p style="margin:18px 0 0;">${chip(decision === "approved" ? "Approved" : decision === "rejected" ? "Rejected" : "Changes requested", decision === "approved" ? "acid" : decision === "rejected" ? "ink" : "signal")}</p>
      ${heading(`${who} ${verb} ${item} ${version}.`)}
      ${reason ? quote(reason, `— ${reviewer}`) : ""}
      ${
        comments.length
          ? well(
              `${label(`${comments.length} pinned ${comments.length === 1 ? "comment" : "comments"}`)}
               <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:10px 0 0;">
                 ${comments
                   .map(
                     (c) => `
                   <tr>
                     <td style="width:30px;padding:8px 0;vertical-align:top;"><span style="display:inline-block;width:20px;height:20px;line-height:20px;border-radius:20px 20px 20px 4px;background:${C.ink};color:#fff;text-align:center;font:400 10px/20px Arial,sans-serif;">${c.n}</span></td>
                     <td style="padding:8px 0;font:400 14px/1.55 'DM Sans',Helvetica,Arial,sans-serif;color:${C.ink};vertical-align:top;">${lines(c.body)}</td>
                   </tr>`,
                   )
                   .join("")}
               </table>`,
            )
          : ""
      }
      ${button(decision === "approved" ? "See it" : "Open the review", link)}
    `,
  });
  return {
    subject,
    preheader,
    html,
    text: plain(`${who} ${verb} ${item} ${version} (${project.name}).`, reason && `"${reason}"`, ...comments.map((c) => `${c.n}. ${c.body}`), `Open the review: ${link}`),
  };
}

/** To the studio: a contractor put work up. The client hasn't seen it. */
export function workSubmitted({
  base,
  first,
  contractor,
  project,
  item,
  version,
  note,
  thumb,
  link,
}: Base & { contractor: string; project: ProjectRef; item: string; version: string; note: string; thumb: string; link: string }): Email {
  const who = contractor.split(" ")[0];
  const subject = `${who} sent ${item} ${version} for studio review`;
  const preheader = note;
  const html = layout({
    base,
    preheader,
    why: `You're getting this because you lead ${project.name}, ${first}.`,
    body: `
      ${eyebrow(project)}
      <p style="margin:18px 0 0;">${chip("Studio review", "signal")}</p>
      ${heading(`${who} sent ${item} ${version}.`)}
      ${para("The client hasn't seen it. Send it on, or ask for changes first.", { muted: true })}
      ${picture(thumb, `${item}, ${version}`, project.ground)}
      ${quote(note, `— ${contractor}`)}
      ${button("Review it", link)}
    `,
  });
  return { subject, preheader, html, text: plain(`${who} sent ${item} ${version} for studio review (${project.name}).`, `"${note}"`, "The client hasn't seen it.", `Review it: ${link}`) };
}

/** To a contractor: the studio wants another pass. */
export function changesForYou({
  base,
  first,
  reviewer,
  project,
  item,
  version,
  next,
  reason,
  comments,
  link,
}: Base & {
  reviewer: string;
  project: ProjectRef;
  item: string;
  version: string;
  next: string;
  reason: string;
  comments: readonly string[];
  link: string;
}): Email {
  const who = reviewer.split(" ")[0];
  const subject = `Changes on ${item}: ${reason}`;
  const preheader = `${who} would like ${next} before it goes to the client.`;
  const html = layout({
    base,
    preheader,
    replyable: true,
    why: `You're getting this because you submitted ${item} on ${project.name}, ${first}.`,
    body: `
      ${eyebrow(project)}
      <p style="margin:18px 0 0;">${chip("Changes for you", "signal")}</p>
      ${heading(`${who} would like a ${next}.`)}
      ${quote(reason, `— ${reviewer}, on ${item} ${version}`)}
      ${comments.length ? well(`${label("Also noted")}${comments.map((c) => para(lines(c), { size: 14, top: 10 })).join("")}`) : ""}
      ${button(`Upload ${next}`, link)}
    `,
  });
  return { subject, preheader, html, text: plain(`${who} would like a ${next} of ${item} (${project.name}).`, `"${reason}"`, ...comments, `Upload it: ${link}`) };
}

/* -------------------------------------------------------------------------- */
/*  Conversation                                                              */
/* -------------------------------------------------------------------------- */

/** New messages someone hasn't read, gathered into one email. Replying answers in the thread. */
export function newMessages({
  base,
  first,
  project,
  messages,
  link,
}: Base & {
  project: ProjectRef;
  messages: readonly { readonly author: string; readonly side: Side; readonly at: string; readonly body: string }[];
  link: string;
}): Email {
  const authors = [...new Set(messages.map((m) => m.author.split(" ")[0]))];
  const subject = messages.length === 1 ? `${authors[0]} wrote on ${project.name}` : `${messages.length} new messages on ${project.name}`;
  const preheader = messages[0]?.body ?? "";
  const html = layout({
    base,
    preheader,
    replyable: true,
    why: `You're getting this because you're on ${project.name} and hadn't read these yet, ${first}.`,
    body: `
      ${eyebrow(project)}
      ${heading(messages.length === 1 ? `${authors[0]} wrote.` : `${authors.join(" and ")} wrote.`)}
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:24px 0 0;">
        ${messages
          .map(
            (m, n) => `
          <tr>
            <td style="width:40px;padding:${n ? 18 : 0}px 0 0;vertical-align:top;">${initials(m.author, m.side)}</td>
            <td style="padding:${n ? 18 : 0}px 0 0;vertical-align:top;">
              <p style="margin:2px 0 6px;font:500 13px/1.3 'DM Sans',Helvetica,Arial,sans-serif;color:${C.ink};">${esc(m.author)} <span style="font-weight:400;color:${C.faint};">&nbsp;${esc(m.at)}</span></p>
              <table role="presentation" cellpadding="0" cellspacing="0"><tr><td style="background:${C.well};border-radius:4px 16px 16px 16px;padding:12px 16px;font:400 14px/1.55 'DM Sans',Helvetica,Arial,sans-serif;color:${C.ink};">${lines(m.body)}</td></tr></table>
            </td>
          </tr>`,
          )
          .join("")}
      </table>
      ${button("Open the thread", link)}
    `,
  });
  return {
    subject,
    preheader,
    html,
    text: plain(...messages.map((m) => `${m.author}, ${m.at}:\n${m.body}`), `Reply to this email, or open the thread: ${link}`),
  };
}

/** Meeting notes, shared with the client: the gist, and what's theirs to do. */
export function notesShared({
  base,
  first,
  project,
  title,
  metOn,
  excerpt,
  actions,
  link,
}: Base & { project: ProjectRef; title: string; metOn: string; excerpt: string; actions: readonly { readonly text: string; readonly due?: string }[]; link: string }): Email {
  const subject = `Notes: ${title}`;
  const preheader = excerpt;
  const html = layout({
    base,
    preheader,
    replyable: true,
    why: `You're getting this because you were at the meeting, ${first}.`,
    body: `
      ${eyebrow(project)}
      ${heading(title)}
      ${para(esc(metOn), { size: 13, top: 8, muted: true })}
      ${para(esc(excerpt))}
      ${
        actions.length
          ? well(`${label("On your list")}
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:8px 0 0;">
                ${actions
                  .map(
                    (a) => `
                  <tr>
                    <td style="width:26px;padding:9px 0;vertical-align:top;"><span style="display:inline-block;width:14px;height:14px;border-radius:4px;border:1px solid #c2beb6;background:#fff;"></span></td>
                    <td style="padding:8px 0;font:400 14px/1.5 'DM Sans',Helvetica,Arial,sans-serif;color:${C.ink};">${esc(a.text)}${a.due ? `<span style="color:${C.muted};">&nbsp;&middot;&nbsp;${esc(a.due)}</span>` : ""}</td>
                  </tr>`,
                  )
                  .join("")}
              </table>`)
          : ""
      }
      ${button("Read the notes", link)}
    `,
  });
  return { subject, preheader, html, text: plain(`${title} (${metOn})`, excerpt, ...actions.map((a) => `[ ] ${a.text}${a.due ? ` (${a.due})` : ""}`), `Read the notes: ${link}`) };
}

/* -------------------------------------------------------------------------- */
/*  Milestones                                                                */
/* -------------------------------------------------------------------------- */

export function milestoneComplete({
  base,
  first,
  project,
  position,
  total,
  title,
  summary,
  segments,
  next,
  link,
}: Base & {
  project: ProjectRef;
  position: string;
  total: string;
  title: string;
  summary: string;
  segments: readonly ("done" | "now" | "next")[];
  next?: { readonly title: string; readonly due: string };
  link: string;
}): Email {
  const subject = `${title} is done`;
  const preheader = next ? `Next: ${next.title}, due ${next.due}.` : "That's the last milestone.";
  const html = layout({
    base,
    preheader,
    replyable: true,
    why: `You're getting this because you're on ${project.name}, ${first}.`,
    body: `
      ${eyebrow(project)}
      <p style="margin:18px 0 0;">${chip("Milestone complete", "acid")}</p>
      ${heading(`${title} is done.`)}
      ${para(esc(summary), { muted: true })}
      <p style="margin:26px 0 0;font:300 40px/1 'DM Sans',Helvetica,Arial,sans-serif;letter-spacing:-0.04em;color:${C.ink};">${esc(position)}<span style="font-size:16px;letter-spacing:0;color:${C.faint};">&nbsp;/ ${esc(total)}</span></p>
      ${progress(segments)}
      ${next ? rows([["Next", esc(next.title)], ["Due", esc(next.due)]], 22) : ""}
      ${button("See the project", link)}
    `,
  });
  return { subject, preheader, html, text: plain(`${title} is done (${project.name}). ${position} of ${total}.`, next && `Next: ${next.title}, due ${next.due}.`, `See the project: ${link}`) };
}

/* -------------------------------------------------------------------------- */
/*  Money                                                                     */
/* -------------------------------------------------------------------------- */

export function invoiceIssued({
  base,
  first,
  project,
  number,
  label: what,
  amount,
  issued,
  dueOn,
  link,
}: Base & { project: ProjectRef; number: string; label: string; amount: string; issued: string; dueOn: string; link: string }): Email {
  const subject = `Invoice ${number} from Ghost Savvy Studios`;
  const preheader = `${amount} for ${what}, due ${dueOn}.`;
  const html = layout({
    base,
    preheader,
    replyable: true,
    why: `You're getting this because you look after invoices for ${project.name}, ${first}.`,
    body: `
      ${eyebrow(project)}
      ${heading(`Invoice ${number}`)}
      ${figure(amount)}
      ${rows(
        [
          ["For", esc(what)],
          ["Issued", esc(issued)],
          ["Due", esc(dueOn)],
        ],
        24,
      )}
      ${button("View the invoice", link)}
      ${para("The PDF is attached, with our account details for wire or ACH.", { size: 13, top: 14, muted: true })}
    `,
  });
  return { subject, preheader, html, text: plain(`Invoice ${number} from Ghost Savvy Studios`, `${amount} for ${what} (${project.name}).`, `Issued ${issued}, due ${dueOn}.`, `View it: ${link}`, "The PDF is attached.") };
}

/** A late invoice, said kindly: what's left, since when, and the easy way to ask a question. */
export function invoiceOverdue({
  base,
  first,
  project,
  number,
  label: what,
  balance,
  dueOn,
  late,
  link,
}: Base & { project: ProjectRef; number: string; label: string; balance: string; dueOn: string; late: string; link: string }): Email {
  const subject = `A reminder about ${number}`;
  const preheader = `${balance} is still open on ${number}, due ${dueOn}.`;
  const html = layout({
    base,
    preheader,
    replyable: true,
    why: `You're getting this because you look after invoices for ${project.name}, ${first}.`,
    body: `
      ${eyebrow(project)}
      <p style="margin:18px 0 0;">${chip(late, "signal")}</p>
      ${heading(`A gentle note about ${number}.`)}
      ${para(`Hi ${esc(first)}, ${esc(balance)} is still open on ${esc(number)} for ${esc(what)}. It was due on ${esc(dueOn)}. If it&rsquo;s already on its way, thank you, and please ignore this.`)}
      ${figure(balance, C.signalInk)}
      ${button("View the invoice", link)}
      ${para("Something not right with it? Just reply.", { size: 13, top: 14, muted: true })}
    `,
  });
  return { subject, preheader, html, text: plain(`Hi ${first}, ${balance} is still open on ${number} for ${what}, due ${dueOn}.`, "If it's already on its way, thank you, and please ignore this.", `View it: ${link}`) };
}

/** To the studio: a contractor billed it. */
export function contractorInvoice({
  base,
  first,
  contractor,
  project,
  number,
  label: what,
  amount,
  dueOn,
  link,
}: Base & { contractor: string; project: ProjectRef; number: string; label: string; amount: string; dueOn: string; link: string }): Email {
  const who = contractor.split(" ")[0];
  const subject = `${who} sent invoice ${number}`;
  const preheader = `${amount} for ${what}, due ${dueOn}.`;
  const html = layout({
    base,
    preheader,
    why: `You're getting this because you run payments for the studio, ${first}.`,
    body: `
      ${eyebrow(project)}
      ${heading(`${who} sent ${number}.`)}
      ${figure(amount)}
      ${rows(
        [
          ["From", esc(contractor)],
          ["For", esc(what)],
          ["Due", esc(dueOn)],
        ],
        24,
      )}
      ${button("Open it", link)}
      ${textLink("Mark it paid from the invoice when it's settled.", link)}
    `,
  });
  return { subject, preheader, html, text: plain(`${who} sent invoice ${number}: ${amount} for ${what} (${project.name}), due ${dueOn}.`, `Open it: ${link}`) };
}
