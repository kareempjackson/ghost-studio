"use client";

import { useEffect } from "react";
import { noteTags } from "@/lib/visitor";

/**
 * Notes, in the visitor's browser, the audiences the page they are reading
 * was written for (Tailor with AI): two pages sharing one is taken as what
 * they are looking for (lib/interest.ts). Draws nothing.
 */
export function NoteTags({
  kind,
  slug,
  audiences,
}: {
  kind: "work" | "insights";
  slug: string;
  /** The audiences' slugs. */
  audiences: readonly string[];
}) {
  const tags = audiences.join(" ");
  useEffect(() => {
    if (tags) noteTags(kind, slug, tags.split(" "));
  }, [kind, slug, tags]);
  return null;
}
