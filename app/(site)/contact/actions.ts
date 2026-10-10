"use server";

import { randomUUID } from "node:crypto";
import { stegaClean } from "next-sanity";
import { Resend } from "resend";
import { acknowledgementEmail, notificationEmail, type Email, type Enquiry } from "@/lib/email/enquiry";
import { absoluteUrl } from "@/lib/site";
import { getEnquiryCopy } from "@/sanity/content";
import { writeClient } from "@/sanity/lib/write";

/** What the form posts: its fields, the honeypot, and when it was opened. */
export interface EnquiryInput {
  readonly name: string;
  readonly email: string;
  readonly company: string;
  readonly help: readonly string[];
  readonly brief: string;
  readonly budget: string;
  readonly timing: string;
  /** Hidden from people; a bot fills it. */
  readonly website: string;
  /** When the form was first shown, in ms: a person takes longer than a bot. */
  readonly startedAt: number;
}

export type EnquiryResult = { readonly ok: true } | { readonly ok: false };

/** Faster than this from opening the form to sending it, and it was not a person. */
const MIN_FILL_MS = 2500;
/** At most this many messages from one address in the window. */
const LIMIT = 3;
const WINDOW_MS = 10 * 60 * 1000;

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** One line, trimmed and cut to length: nothing a header could be split on. */
const line = (value: unknown, max: number) =>
  typeof value === "string" ? value.replace(/\s+/g, " ").trim().slice(0, max) : "";

/** A message: line breaks kept, trimmed and cut to length. */
const prose = (value: unknown, max: number) =>
  typeof value === "string" ? value.replace(/\r\n?/g, "\n").trim().slice(0, max) : "";

/**
 * The form on /contact. The message is stored in Sanity as an enquiry, the
 * sender is sent a confirmation, and the studio an alert it can reply to.
 *
 * It counts as received if it was stored or the studio was told: either way
 * someone will see it. Emails go through Resend (RESEND_API_KEY), from
 * CONTACT_FROM or the studio's address; without a key the enquiry is still
 * stored and marked as not emailed. A bot, caught by the honeypot or by
 * sending too fast, is told it worked and nothing is kept.
 */
export async function sendEnquiry(input: EnquiryInput): Promise<EnquiryResult> {
  if (line(input.website, 200) || !(Date.now() - Number(input.startedAt) >= MIN_FILL_MS)) {
    return { ok: true };
  }

  const copy = stegaClean(await getEnquiryCopy());
  const options = new Set(copy.form.help.options);
  const budgets = new Set(copy.form.budget.options);

  const budget = line(input.budget, 80);
  const enquiry: Enquiry = {
    name: line(input.name, 120),
    email: line(input.email, 254).toLowerCase(),
    company: line(input.company, 160),
    help: (Array.isArray(input.help) ? input.help : [])
      .map((option) => line(stegaClean(option), 80))
      .filter((option) => options.has(option))
      .slice(0, 12),
    brief: prose(input.brief, 5000),
    budget: budgets.has(budget) ? budget : "",
    timing: line(input.timing, 120),
  };
  if (!enquiry.name || !EMAIL.test(enquiry.email)) return { ok: false };

  /* Stored first, so a failed email never loses a message. */
  const id = `enquiry.${randomUUID()}`;
  let stored = false;
  if (writeClient) {
    try {
      const recent = await writeClient.fetch<number>(
        `count(*[_type == "enquiry" && email == $email && receivedAt > $since])`,
        { email: enquiry.email, since: new Date(Date.now() - WINDOW_MS).toISOString() },
      );
      if (recent >= LIMIT) return { ok: false };

      await writeClient.create({
        _id: id,
        _type: "enquiry",
        status: "new",
        receivedAt: new Date().toISOString(),
        ...enquiry,
        help: [...enquiry.help],
      });
      stored = true;
    } catch (error) {
      console.error("[contact] could not store the enquiry", error);
    }
  } else {
    console.error("[contact] SANITY_API_FORM_TOKEN is not set: the enquiry was not stored");
  }

  const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;
  const from = process.env.CONTACT_FROM || `${copy.siteName} <${copy.studioEmail}>`;
  let failure: string | undefined;

  const send = async (email: Email, to: string, replyTo: string, key: string) => {
    if (!resend) return "skipped" as const;
    try {
      const { error } = await resend.emails.send(
        { from, to, replyTo, subject: email.subject, html: email.html, text: email.text },
        { idempotencyKey: `${id}/${key}` },
      );
      if (!error) return "sent" as const;
      failure = `${key}: ${error.message}`;
      console.error(`[contact] the ${key} email failed`, error);
    } catch (error) {
      failure = `${key}: ${error instanceof Error ? error.message : String(error)}`;
      console.error(`[contact] the ${key} email failed`, error);
    }
    return "failed" as const;
  };

  const [acknowledgement, notification] = await Promise.all([
    send(acknowledgementEmail(copy, enquiry), enquiry.email, copy.studioEmail, "acknowledgement"),
    send(
      notificationEmail(copy, enquiry, stored ? absoluteUrl(`/studio/structure/enquiries;${id}`) : null),
      copy.studioEmail,
      enquiry.email,
      "notification",
    ),
  ]);

  if (stored && writeClient) {
    await writeClient
      .patch(id)
      .set({ delivery: { acknowledgement, notification, ...(failure ? { error: failure } : {}) } })
      .commit()
      .catch((error) => console.error("[contact] could not record the emails' delivery", error));
  }

  return stored || notification === "sent" ? { ok: true } : { ok: false };
}
