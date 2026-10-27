"use server";

import { createHash } from "node:crypto";
import { stegaClean } from "next-sanity";
import { Resend } from "resend";
import { welcomeEmail } from "@/lib/email/newsletter";
import { getNewsletterCopy } from "@/sanity/content";
import { writeClient } from "@/sanity/lib/write";

/** What the sign-up posts: the address, the honeypot, and when the form was shown. */
export interface SubscribeInput {
  readonly email: string;
  /** Hidden from people; a bot fills it. */
  readonly website: string;
  /** When the form was first shown, in ms: a person takes longer than a bot. */
  readonly startedAt: number;
  /** The page it was sent from, e.g. /work. */
  readonly page?: string;
}

export type SubscribeResult = { readonly ok: true } | { readonly ok: false };

/** Faster than this from showing the form to sending it, and it was not a person. */
const MIN_FILL_MS = 1500;

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** How far a sign-up got onto the list, and its welcome, as the Studio records them. */
type Listed = "added" | "failed" | "skipped";
type Welcome = "sent" | "failed" | "unwritten" | "skipped";

/** What went wrong, from an Error or a Resend error object. */
const message = (error: unknown) =>
  error instanceof Error ? error.message : ((error as { message?: string } | null)?.message ?? String(error));

/**
 * The footer's newsletter sign-up.
 *
 * The address is stored first, in Sanity, as a subscriber (Newsletter in the
 * Studio), so it is never lost to a mail service that is down. Then it goes
 * on the studio's list, which is Resend's contacts (RESEND_API_KEY): added
 * to the segment RESEND_NEWSLETTER_SEGMENT_ID names, when one does, and that
 * segment is what an issue is broadcast to. Broadcasts carry their own
 * unsubscribe link, and Resend keeps who has used it.
 *
 * A new subscriber is sent the welcome email (the Footer's, in the Studio),
 * from CONTACT_FROM or the studio's address: once, so someone already on the
 * list is sent nothing more, unless their record says their welcome never
 * went. Someone who had unsubscribed is put back on and welcomed again. The
 * subscriber's record says how each step went.
 * A bot, caught by the honeypot or by sending too fast, is told it worked
 * and nothing is kept.
 *
 * It counts as signed up if it was stored or is on the list.
 */
export async function subscribe(input: SubscribeInput): Promise<SubscribeResult> {
  const website = typeof input.website === "string" ? input.website.trim() : "";
  if (website || !(Date.now() - Number(input.startedAt) >= MIN_FILL_MS)) return { ok: true };

  const email = typeof input.email === "string" ? input.email.trim().toLowerCase().slice(0, 254) : "";
  if (!EMAIL.test(email)) return { ok: false };
  const page =
    typeof input.page === "string" && input.page.startsWith("/") ? input.page.slice(0, 200) : undefined;

  /* One record per address, signing up again or not: its id is the address's. */
  const id = `subscriber.${createHash("sha256").update(email).digest("hex").slice(0, 32)}`;
  let stored = false;
  /* Whether this address has had its welcome; unknown without a record. */
  let welcomed: boolean | undefined;
  if (writeClient) {
    try {
      const existing = await writeClient.getDocument<{ welcome?: Welcome }>(id);
      await writeClient.createIfNotExists({
        _id: id,
        _type: "subscriber",
        email,
        subscribedAt: new Date().toISOString(),
        ...(page ? { page } : {}),
      });
      stored = true;
      /* Known only once it can be recorded too, so a welcome never repeats. */
      welcomed = existing?.welcome === "sent";
    } catch (error) {
      console.error("[newsletter] could not store the address", error);
    }
  } else {
    console.error("[newsletter] SANITY_API_FORM_TOKEN is not set: the address was not stored");
  }

  const { listed, welcome, failure } = await addToList(email, welcomed);

  if (stored && writeClient) {
    /* A welcome is only recorded when one was tried; an old error goes once all is well. */
    const patch = writeClient
      .patch(id)
      .set({ list: listed, ...(welcome ? { welcome } : {}), ...(failure ? { error: failure } : {}) });
    await (failure ? patch : patch.unset(["error"]))
      .commit()
      .catch((error) => console.error("[newsletter] could not record how the sign-up went", error));
  }

  return stored || listed === "added" ? { ok: true } : { ok: false };
}

/**
 * Puts the address on Resend's list and, when it is new there or coming
 * back, sends the welcome. Someone already on the list is sent it only if
 * their record says it never went (`welcomed` false); with no record to
 * ask, they are sent nothing.
 */
async function addToList(
  email: string,
  welcomed: boolean | undefined,
): Promise<{ listed: Listed; welcome?: Welcome; failure?: string }> {
  if (!process.env.RESEND_API_KEY) {
    console.error("[newsletter] RESEND_API_KEY is not set: the address was not added to the list");
    return { listed: "skipped", welcome: "skipped" };
  }
  const resend = new Resend(process.env.RESEND_API_KEY);
  const segmentId = process.env.RESEND_NEWSLETTER_SEGMENT_ID;

  let contactId: string;
  try {
    /* A new address is a 404 here, which Resend's client logs: that's expected. */
    const found = await resend.contacts.get({ email });
    if (found.data) {
      const returning = found.data.unsubscribed;
      if (returning) {
        const { error } = await resend.contacts.update({ email, unsubscribed: false });
        if (error) throw error;
      }
      if (segmentId) await resend.contacts.segments.add({ email, segmentId });
      if (!returning && welcomed !== false) return { listed: "added" };
      contactId = found.data.id;
    } else if (found.error?.name === "not_found" || found.error?.statusCode === 404) {
      const { data, error } = await resend.contacts.create({
        email,
        unsubscribed: false,
        ...(segmentId ? { segments: [{ id: segmentId }] } : {}),
      });
      if (error) throw error;
      contactId = data.id;
    } else {
      throw found.error;
    }
  } catch (error) {
    console.error("[newsletter] could not add the address", error);
    return { listed: "failed", failure: `list: ${message(error)}` };
  }

  /* On the list now, whatever happens to the welcome. */
  try {
    const copy = stegaClean(await getNewsletterCopy());
    if (!copy.welcome) {
      console.error("[newsletter] no welcome email in the Studio (Footer → Newsletter): none sent");
      return { listed: "added", welcome: "unwritten" };
    }
    const letter = welcomeEmail(copy.siteName, copy.welcome);
    const { error } = await resend.emails.send(
      {
        from: process.env.CONTACT_FROM || `${copy.siteName} <${copy.studioEmail}>`,
        to: email,
        replyTo: copy.studioEmail,
        subject: letter.subject,
        html: letter.html,
        text: letter.text,
      },
      { idempotencyKey: `newsletter-welcome/${contactId}` },
    );
    if (!error) return { listed: "added", welcome: "sent" };
    console.error("[newsletter] the welcome email failed", error);
    return { listed: "added", welcome: "failed", failure: `welcome: ${error.message}` };
  } catch (error) {
    console.error("[newsletter] the welcome email failed", error);
    return { listed: "added", welcome: "failed", failure: `welcome: ${message(error)}` };
  }
}
