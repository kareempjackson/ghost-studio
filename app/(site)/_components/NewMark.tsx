"use client";

import { useVisitor } from "./moment";

/**
 * The mark on a case study or an insight that has gone up since a returning
 * visitor was last here, and that they haven't read (lib/visitor.ts). Nothing
 * for a first visit, nothing until the page is up, and nothing without the
 * words for it (Home page › Moments › New mark).
 */
export function NewMark({
  label,
  kind,
  slug,
  at,
  className,
}: {
  label: string | null;
  kind: "project" | "article";
  slug: string;
  /** When it went up. */
  at: string | null | undefined;
  className?: string;
}) {
  const visitor = useVisitor();
  if (!label || !at || !visitor || visitor.visits < 2 || !visitor.previous) return null;
  if (!(Date.parse(at) > Date.parse(visitor.previous))) return null;
  const read = kind === "project" ? visitor.read.work : visitor.read.insights;
  if (read.some((one) => one.slug === slug)) return null;
  return <span className={className}>{label}</span>;
}
