/**
 * Brings the words round the newsletter sign-up up to date, now that it
 * keeps addresses rather than opening the visitor's mail app.
 *
 *   npm run migrate:newsletter -- --dry   # list what would change
 *   npm run migrate:newsletter
 *
 * The Footer (published, and any draft of it):
 * - adds the new lines from sanity/seed/content/footer.ts — the message when
 *   a sign-up fails, and the welcome email — only where they're empty;
 * - replaces the "done" message only if it is still the old one about the
 *   mail app, so a line an editor has rewritten stays theirs;
 * - drops the old mail app subject line, which nothing reads any more.
 *
 * The privacy policy (published, and any draft): the sentences that said the
 * sign-up opens your mail app, that Resend only sends the contact form's
 * emails, and how to stop the newsletter, are each replaced only where they
 * still read exactly as seeded; a line for the newsletter's address is added
 * under them; and its "last updated" date moves, if anything changed.
 *
 * Each document is patched against the revision it was read at: one edited
 * meanwhile makes the run fail without writing it; run it again.
 *
 * Needs SANITY_API_WRITE_TOKEN, read from .env.local.
 */

import { randomUUID } from "node:crypto";
import { createClient } from "next-sanity";
import { footer } from "../seed/content/footer";
import { legalDocuments } from "../seed/content/legal";

const dry = process.argv.includes("--dry");

const token = process.env.SANITY_API_WRITE_TOKEN;
const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET;
if (!token || !projectId || !dataset) {
  console.error(
    "Set NEXT_PUBLIC_SANITY_PROJECT_ID, NEXT_PUBLIC_SANITY_DATASET and SANITY_API_WRITE_TOKEN in .env.local.",
  );
  process.exit(1);
}

const client = createClient({
  projectId,
  dataset,
  token,
  apiVersion: process.env.NEXT_PUBLIC_SANITY_API_VERSION || "2026-10-01",
  useCdn: false,
});

const OLD_DONE = "Your mail app has the request ready. Send it and you're on the list.";

/** Old words → new, as the privacy policy's spans hold them. */
const PRIVACY: readonly (readonly [string, string])[] = [
  [
    " anything you include when you write to us. The chat window and the newsletter sign-up both open a message in your own email app, so what you send that way reaches us as an email.",
    " anything you include when you write to us. The chat window opens a message in your own email app, so what you send that way reaches us as an email.",
  ],
  [
    ", which delivers the emails sent when you use the contact form.",
    ", which delivers the emails sent when you use the contact form, and keeps our newsletter’s list of subscribers and sends each issue.",
  ],
  [
    "You can stop the newsletter whenever you like by replying to any issue or emailing us.",
    "You can stop the newsletter whenever you like with the unsubscribe link in any issue, or by emailing us.",
  ],
];

type Span = { _type: string; _key: string; text?: string; marks?: string[] };
type Block = { _type: string; _key: string; children?: Span[]; [k: string]: unknown };
type Section = { _key: string; id?: string; list?: Block[]; paragraphs?: Block[] };

const key = () => randomUUID().replace(/-/g, "").slice(0, 12);

async function migrateFooter(id: string) {
  const doc = await client.getDocument<{ _rev: string; newsletter?: Record<string, unknown> }>(id);
  if (!doc) return;
  const n = doc.newsletter ?? {};
  const set: Record<string, unknown> = {};
  const changes: string[] = [];

  if (!n.failed) {
    set["newsletter.failed"] = footer.newsletter.failed;
    changes.push("adds the failed message");
  }
  if (!n.welcome) {
    set["newsletter.welcome"] = { ...footer.newsletter.welcome, signoff: [...footer.newsletter.welcome.signoff] };
    changes.push("adds the welcome email");
  }
  if (n.done === OLD_DONE) {
    set["newsletter.done"] = footer.newsletter.done;
    changes.push("rewrites the done message");
  }
  const unset = "subject" in n ? ["newsletter.subject"] : [];
  if (unset.length) changes.push("drops the mail app subject line");

  if (!changes.length) {
    console.log(`${id}: up to date.`);
    return;
  }
  console.log(`${id}: ${changes.join("; ")}.`);
  if (dry) return;
  await client.patch(id).ifRevisionId(doc._rev).set(set).unset(unset).commit();
}

async function migratePrivacy(id: string) {
  const doc = await client.getDocument<{ _rev: string; sections?: Section[] }>(id);
  if (!doc?.sections) return;
  const sections = structuredClone(doc.sections);
  const changes: string[] = [];

  for (const section of sections) {
    for (const block of [...(section.list ?? []), ...(section.paragraphs ?? [])]) {
      for (const span of block.children ?? []) {
        for (const [from, to] of PRIVACY) {
          if (span.text === from || span.text?.includes(from)) {
            span.text = span.text.replace(from, to);
            changes.push(`rewrites “${from.trim().slice(0, 48)}…”`);
          }
        }
      }
    }
  }

  /* The newsletter's own line, under Email, in the same shape as its neighbours. */
  const given = sections.find((s) => s.id === "information-you-give-us");
  const has = given?.list?.some((b) => b.children?.some((c) => c.text?.startsWith("The newsletter")));
  const at = given?.list?.findIndex((b) => b.children?.[0]?.text === "Email:") ?? -1;
  if (given?.list && !has && at >= 0) {
    const like = given.list[at];
    const [bold, rest] = like.children ?? [];
    given.list.splice(at + 1, 0, {
      ...like,
      _key: key(),
      children: [
        { ...bold, _key: key(), text: "The newsletter:" },
        { ...rest, _key: key(), text: " your email address, if you sign up for it." },
      ],
    });
    changes.push("adds a line for the newsletter's address");
  }

  if (!changes.length) {
    console.log(`${id}: up to date.`);
    return;
  }
  console.log(`${id}: ${changes.join("; ")}; dated ${legalDocuments.privacy.updated}.`);
  if (dry) return;
  await client
    .patch(id)
    .ifRevisionId(doc._rev)
    .set({ sections, updated: legalDocuments.privacy.updated })
    .commit();
}

async function main() {
  for (const id of ["footer", "drafts.footer"]) await migrateFooter(id);
  for (const id of ["legalPage-privacy", "drafts.legalPage-privacy"]) await migratePrivacy(id);
  if (dry) console.log("\n--dry: nothing written.");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
