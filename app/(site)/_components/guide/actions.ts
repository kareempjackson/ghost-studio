"use server";

import { canAsk } from "@/lib/guide/limit";
import { getGuideCatalogue } from "@/sanity/content";
import type { GuideCatalogue } from "@/sanity/types";

export interface GuideLoad {
  readonly catalogue: GuideCatalogue;
  /** Whether the guide can answer questions (lib/guide/limit.ts): when not, it offers the shortlist and the brief alone. */
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
    canAsk,
  };
}
