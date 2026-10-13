"use client";

import Link from "next/link";
import { Check, Paperclip, Trash2, UserPlus, Undo2 } from "lucide-react";
import { useState } from "react";
import { when } from "@/lib/portal/format";
import type { InboundEmail } from "@/lib/portal/types";
import { Chip, Empty, LABEL, META, Pill, TITLE } from "../ui";

export interface TriageEmail extends InboundEmail {
  readonly guess?: { readonly name: string; readonly colour: string };
  readonly candidates: readonly { readonly slug: string; readonly code: string; readonly name: string; readonly chip: string; readonly org: string; readonly likely: boolean }[];
}

type Outcome = { kind: "filed"; project: string } | { kind: "discarded" };

/**
 * Mail that came in without a thread to land in. Each one shows who it's
 * from and where it probably belongs — the sender's domain points to a
 * client, so their projects come first — and goes there in one press, or
 * away. Undo is right there until the page is left.
 */
export function TriageList({ emails }: { emails: readonly TriageEmail[] }) {
  const [done, setDone] = useState<Record<string, Outcome>>({});
  const [more, setMore] = useState<Record<string, boolean>>({});
  const left = emails.filter((e) => !done[e.id]).length;

  if (!emails.length) return <Empty title="All sorted." body="Mail that comes in without a thread lands here." />;

  return (
    <section aria-label="Email to sort" className="gs-rise gs-card rounded-[1.75rem] p-3 [--i:2] sm:p-4">
      <p className={`px-3 pt-2 pb-3 ${META} text-[0.8125rem]`}>
        {left ? `${left} to sort. Filing one moves it into that project's thread, where the client's reply will go too.` : "All sorted. Nicely done."}
      </p>
      <ul className="grid gap-2">
        {emails.map((e) => {
          const outcome = done[e.id];
          const likely = e.candidates.filter((c) => c.likely);
          const shown = more[e.id] ? e.candidates : likely.length ? likely : e.candidates.slice(0, 3);
          return (
            <li key={e.id} className={`rounded-[1.375rem] transition-all duration-500 ${outcome ? "bg-ink-950/[0.02]" : "bg-ink-950/[0.03] ring-1 ring-inset ring-ink-950/[0.04]"}`}>
              {outcome ? (
                <div className="flex items-center justify-between gap-3 px-4 py-3">
                  <span className="flex min-w-0 items-center gap-2.5 text-[0.8125rem]">
                    <span className={`grid size-6 place-items-center rounded-full ${outcome.kind === "filed" ? "bg-acid-300" : "bg-ink-950/[0.08]"}`}>
                      {outcome.kind === "filed" ? <Check aria-hidden className="size-3.5" strokeWidth={2.25} /> : <Trash2 aria-hidden className="size-3" strokeWidth={1.75} />}
                    </span>
                    <span className="truncate text-secondary">
                      <span className="text-primary">{e.subject}</span> {outcome.kind === "filed" ? `filed to ${outcome.project}` : "discarded"}
                    </span>
                  </span>
                  <button
                    type="button"
                    onClick={() => setDone((d) => Object.fromEntries(Object.entries(d).filter(([k]) => k !== e.id)))}
                    className="gs-press inline-flex h-7 shrink-0 items-center gap-1.5 rounded-pill px-3 text-[0.75rem] font-medium text-secondary hover:bg-white hover:text-primary"
                  >
                    <Undo2 aria-hidden className="size-3.5" strokeWidth={1.5} />
                    Undo
                  </button>
                </div>
              ) : (
                <div className="grid gap-4 p-4 sm:p-5">
                  <div className="flex items-start gap-3.5">
                    <span className="grid size-9 shrink-0 place-items-center rounded-full bg-ink-200 font-label text-[0.625rem] text-ink-800">
                      {e.fromName
                        .split(/\s+/)
                        .map((w) => w[0])
                        .join("")
                        .slice(0, 2)
                        .toUpperCase()}
                    </span>
                    <span className="grid min-w-0 flex-1 gap-1">
                      <span className="flex flex-wrap items-center gap-x-2 gap-y-0.5">
                        <span className="text-[0.8125rem] font-medium">{e.fromName}</span>
                        <span className={`${META} text-[0.75rem]`}>{e.fromEmail}</span>
                        <span className={`ml-auto ${META} text-[0.6875rem]`}>{when(e.at)}</span>
                      </span>
                      <span className={`${TITLE} text-[0.9375rem]`}>{e.subject}</span>
                      <span className="text-[0.8125rem] leading-[1.5] text-secondary">{e.snippet}</span>
                      <span className="mt-1 flex flex-wrap items-center gap-2">
                        {e.guess ? <Chip colour={e.guess.colour}>Looks like {e.guess.name}</Chip> : <Chip tone="outline">Not a client yet</Chip>}
                        {e.attachments ? (
                          <span className={`inline-flex items-center gap-1 ${META} text-[0.75rem]`}>
                            <Paperclip aria-hidden className="size-3" strokeWidth={1.5} />
                            {e.attachments} attachment{e.attachments === 1 ? "" : "s"}
                          </span>
                        ) : null}
                      </span>
                    </span>
                  </div>
                  <div className="flex flex-wrap items-center gap-1.5 border-t border-ink-950/[0.06] pt-4">
                    <span className={`mr-1 ${LABEL} text-tertiary`}>File to</span>
                    {shown.map((c) => (
                      <button
                        key={c.slug}
                        type="button"
                        onClick={() => setDone((d) => ({ ...d, [e.id]: { kind: "filed", project: c.name } }))}
                        className="gs-press gs-card inline-flex h-8 items-center gap-2 rounded-pill px-3 text-[0.75rem] font-medium hover:bg-ink-50"
                      >
                        <span className="size-2 rounded-[0.1875rem]" style={{ backgroundColor: c.chip }} aria-hidden />
                        {c.name}
                        <span className="text-tertiary">{c.code}</span>
                      </button>
                    ))}
                    {!more[e.id] && shown.length < e.candidates.length ? (
                      <button
                        type="button"
                        onClick={() => setMore((m) => ({ ...m, [e.id]: true }))}
                        className="gs-press h-8 rounded-pill px-3 text-[0.75rem] font-medium text-secondary hover:bg-white hover:text-primary"
                      >
                        Other project
                      </button>
                    ) : null}
                    <span className="ml-auto flex items-center gap-1">
                      {!e.guess ? (
                        <Pill tone="canvas" href="/portal/clients/new" className="h-8 px-3 text-[0.75rem]">
                          <UserPlus aria-hidden className="size-3.5" strokeWidth={1.5} />
                          New client
                        </Pill>
                      ) : null}
                      <button
                        type="button"
                        onClick={() => setDone((d) => ({ ...d, [e.id]: { kind: "discarded" } }))}
                        className="gs-press inline-flex h-8 items-center gap-1.5 rounded-pill px-3 text-[0.75rem] font-medium text-tertiary hover:bg-white hover:text-primary"
                      >
                        <Trash2 aria-hidden className="size-3.5" strokeWidth={1.5} />
                        Discard
                      </button>
                    </span>
                  </div>
                </div>
              )}
            </li>
          );
        })}
      </ul>
      <p className={`px-3 pt-4 pb-2 ${META} text-[0.75rem]`}>
        Forward anything else to the studio inbox and it lands here. <Link href="/portal/settings" className="underline decoration-ink-300 underline-offset-2 hover:text-primary">How mail works</Link>
      </p>
    </section>
  );
}
