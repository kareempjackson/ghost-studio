"use client";

import { useChrome } from "./ChromeProvider";
import { useInterest } from "./moment";

/**
 * The For you mark (Site settings › For you mark), on what fits what the
 * visitor seems to be looking for (lib/interest.ts): the way of working
 * their need leads to, or something written for the audience they are.
 * Nothing until the page is up, and nothing for anyone the site knows
 * nothing about.
 */
export function ForYouMark({
  track,
  audiences,
  className,
}: {
  /** The way of working this is: build, engage or integrate. */
  track?: string;
  /** The audiences this was written for, as slugs. */
  audiences?: readonly string[];
  className?: string;
}) {
  const { forYouLabel } = useChrome().settings;
  const interest = useInterest();
  const fits =
    (track && interest?.need?.track === track) ||
    (audiences && interest?.audience && audiences.includes(interest.audience.slug));
  if (!forYouLabel || !fits) return null;
  return <span className={className}>{forYouLabel}</span>;
}

/**
 * A case study's 30-second summary for the audience the visitor is, written
 * by Tailor with AI (lib/tailor.ts), under the For you mark. Nothing for
 * anyone else, so the page is prerendered without it.
 */
export function ForYouSummary({ summaries }: { summaries: readonly { readonly audience: string; readonly text: string }[] }) {
  const { forYouLabel } = useChrome().settings;
  const audience = useInterest()?.audience?.slug;
  const summary = audience && summaries.find((one) => one.audience === audience)?.text;
  if (!forYouLabel || !summary) return null;
  return (
    <aside className="mt-10 max-w-[38rem] rounded-[0.75rem] bg-[#f0efed] p-6 lg:mt-12 lg:p-8">
      <p className="font-label text-[0.6875rem] leading-none tracking-[0.06em] text-ink-500 uppercase">{forYouLabel}</p>
      <p className="mt-4 text-[1.0625rem] leading-[1.5] tracking-[-0.01em] text-ink-950 lg:text-[1.1875rem]">{summary}</p>
    </aside>
  );
}
