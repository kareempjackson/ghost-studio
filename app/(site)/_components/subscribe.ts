"use server";

import { stegaClean } from "next-sanity";
import { Resend } from "resend";
import { welcomeEmail } from "@/lib/email/newsletter";
import { getNewsletterCopy } from "@/sanity/content";

/** What the sign-up posts: the address, the honeypot, and when the form was shown. */
export interface SubscribeInput {
  readonly email: string;
  /** Hidden from people; a bot fills it. */
  readonly website: string;
  /** When the form was first shown, in ms: a person takes longer than a bot. */
  readonly startedAt: number;
}

export type SubscribeResult = { readonly ok: true } | { readonly ok: false };

/** Faster than this from showing the form to sending it, and it was not a person. */
const MIN_FILL_MS = 1500;

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * The footer's newsletter sign-up. The address goes on the studio's list,
 * which is Resend's contacts (RESEND_API_KEY): add it to the segment
 * RESEND_NEWSLETTER_SEGMENT_ID names, when one does, and that segment is
 * what an issue is broadcast to. Broadcasts carry their own unsubscribe
 * link, and Resend keeps who has used it.
 *
 * A new subscriber is sent the welcome email (the Footer's, in the Studio),
 * from CONTACT_FROM or the studio's address. Someone already on the list is
 * told it worked and sent nothing; someone who had unsubscribed is put back
 * on and welcomed again. A bot, caught by the honeypot or by sending too
 * fast, is told it worked and nothing is kept.
 */
export async function subscribe(input: SubscribeInput): Promise<SubscribeResult> {
  const website = typeof input.website === "string" ? input.website.trim() : "";
  if (website || !(Date.now() - Number(input.startedAt) >= MIN_FILL_MS)) return { ok: true };

  const email = typeof input.email === "string" ? input.email.trim().toLowerCase().slice(0, 254) : "";
  if (!EMAIL.test(email)) return { ok: false };

  if (!process.env.RESEND_API_KEY) {
    console.error("[newsletter] RESEND_API_KEY is not set: the address was not added");
    return { ok: false };
  }
  const resend = new Resend(process.env.RESEND_API_KEY);
  const segmentId = process.env.RESEND_NEWSLETTER_SEGMENT_ID;

  let contactId: string;
  try {
    /* A new address is a 404 here, which Resend's client logs: that's expected. */
    const found = await resend.contacts.get({ email });
    if (found.data) {
      if (!found.data.unsubscribed) {
        if (segmentId) await resend.contacts.segments.add({ email, segmentId });
        return { ok: true };
      }
      const { error } = await resend.contacts.update({ email, unsubscribed: false });
      if (error) throw error;
      if (segmentId) await resend.contacts.segments.add({ email, segmentId });
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
    return { ok: false };
  }

  /* On the list now, whatever happens to the welcome. */
  try {
    const copy = stegaClean(await getNewsletterCopy());
    if (!copy.welcome) {
      console.error("[newsletter] no welcome email in the Studio (Footer → Newsletter): none sent");
      return { ok: true };
    }
    const message = welcomeEmail(copy.siteName, copy.welcome);
    const { error } = await resend.emails.send(
      {
        from: process.env.CONTACT_FROM || `${copy.siteName} <${copy.studioEmail}>`,
        to: email,
        replyTo: copy.studioEmail,
        subject: message.subject,
        html: message.html,
        text: message.text,
      },
      { idempotencyKey: `newsletter-welcome/${contactId}` },
    );
    if (error) console.error("[newsletter] the welcome email failed", error);
  } catch (error) {
    console.error("[newsletter] the welcome email failed", error);
  }

  return { ok: true };
}
