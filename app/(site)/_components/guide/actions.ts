"use server";

import { getGuideCatalogue } from "@/sanity/content";
import type { GuideCatalogue } from "@/sanity/types";

export interface GuideLoad {
  readonly catalogue: GuideCatalogue;
  /** Whether the guide can answer questions: false without ANTHROPIC_API_KEY, when it offers the shortlist and the brief alone. */
  readonly canAsk: boolean;
}

/**
 * What the site guide's panel needs before its first question: the audiences,
 * needs, work and cards its shortlist is drawn from. Read once a tab, when the
 * pill first shows, so the shortlist is there the moment the panel opens.
 */
export async function loadGuide(): Promise<GuideLoad> {
  return {
    catalogue: await getGuideCatalogue(),
    canAsk: Boolean(process.env.ANTHROPIC_API_KEY),
  };
}
