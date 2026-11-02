/**
 * Where a lead came from, as the site wrote it with an enquiry or a sign-up
 * (lib/attribution.ts): the campaign tags on the link they followed, the site
 * that sent them, and the page they landed on. Read-only: the site writes it.
 */

import { defineField } from "sanity";

const field = (name: string, title: string, description?: string) =>
  defineField({ name, title, type: "string", readOnly: true, description });

export const touch = (name: string, title: string, description: string) =>
  defineField({
    name,
    title,
    type: "object",
    readOnly: true,
    description,
    options: { collapsible: true, collapsed: false },
    fields: [
      field("source", "Source", "utm_source: the platform, e.g. linkedin."),
      field("medium", "Medium", "utm_medium: the kind of link, e.g. social or email."),
      field("campaign", "Campaign", "utm_campaign: e.g. 2026-11-engage-launch."),
      field("content", "Content", "utm_content: which link in a post or email."),
      field("term", "Term", "utm_term: the search words, for paid search."),
      field("referrer", "Referred by", "The page on another site that linked here."),
      field("landingPage", "Landed on"),
      defineField({ name: "at", title: "When", type: "datetime", readOnly: true }),
    ],
  });

/** Source and medium, or else the site that sent them, for a list's subtitle. */
export function cameFrom(touch?: { source?: string; medium?: string; referrer?: string }): string | null {
  if (touch?.source) return [touch.source, touch.medium].filter(Boolean).join(" / ");
  try {
    return touch?.referrer ? new URL(touch.referrer).host.replace(/^www\./, "") : null;
  } catch {
    return null;
  }
}
