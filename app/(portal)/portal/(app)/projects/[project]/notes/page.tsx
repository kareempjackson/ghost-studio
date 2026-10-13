import type { Metadata } from "next";
import Link from "next/link";
import { Lock, Plus } from "lucide-react";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { excerpt } from "../../../../../_components/notes/Prose";
import { Avatar, Card, CardHead, Chip, DIVIDE, Empty, LABEL, META, Pill, SkeletonCard, TITLE } from "../../../../../_components/ui";
import { listNotes, person } from "@/lib/portal/data";
import { dateNumber, due } from "@/lib/portal/format";
import { getViewer } from "@/lib/portal/viewer";

export const metadata: Metadata = { title: "Notes" };

/**
 * Every meeting on the project, newest first: when, who was there, the gist,
 * and how much is still to do. Beside it, everything anyone still owes from
 * those meetings.
 */
export default function NotesPage({ params }: PageProps<"/portal/projects/[project]/notes">) {
  return (
    <Suspense fallback={<SkeletonCard className="h-96" lines={6} />}>
      {params.then(({ project }) => (
        <Notes slug={project} />
      ))}
    </Suspense>
  );
}

const MONTH = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

async function Notes({ slug }: { slug: string }) {
  const viewer = await getViewer();
  const data = await listNotes(slug, viewer);
  if (!data) notFound();
  const { notes } = data;
  const base = `/portal/projects/${slug}/notes`;
  const open = notes.flatMap((n) => n.actions.filter((a) => !a.done).map((a) => ({ ...a, note: n })));

  return (
    <div className="grid grid-cols-[minmax(0,1fr)] gap-4 lg:grid-cols-12 lg:gap-5">
      <Card i={1} className="lg:col-span-8" aria-labelledby="nt-list">
        <CardHead id="nt-list" title="Meeting notes" meta={`${notes.length} ${notes.length === 1 ? "meeting" : "meetings"}`}>
          {viewer.role !== "client" ? (
            <Pill tone="ink" href={`${base}/new`}>
              <Plus aria-hidden className="size-4" strokeWidth={1.75} />
              New note
            </Pill>
          ) : null}
        </CardHead>
        {notes.length ? (
          <ul className={`mt-3 ${DIVIDE}`}>
            {notes.map((n) => (
              <li key={n.id}>
                <Link href={`${base}/${n.id}`} className="group -mx-2 flex gap-4 rounded-[1.25rem] px-2 py-4 transition-colors hover:bg-ink-950/[0.02]">
                  <span className="grid h-14 w-12 shrink-0 place-items-center content-center rounded-[0.875rem] bg-ink-950/[0.035]">
                    <span className="font-display text-[1.375rem] leading-none font-light tabular-nums">{dateNumber(n.metOn)}</span>
                    <span className={`${LABEL} mt-1 text-[0.5rem] text-tertiary`}>{MONTH[new Date(n.metOn).getUTCMonth()]}</span>
                  </span>
                  <span className="grid min-w-0 flex-1 gap-1.5">
                    <span className="flex flex-wrap items-center gap-2">
                      <span className={`${TITLE} transition-colors group-hover:text-accent`}>{n.title}</span>
                      {n.visibility === "internal" ? (
                        <Chip tone="outline" dot={false}>
                          <Lock aria-hidden className="size-3" strokeWidth={1.5} />
                          Internal
                        </Chip>
                      ) : null}
                    </span>
                    <span className={`line-clamp-2 ${META} text-[0.8125rem] leading-[1.5]`}>{excerpt(n.body)}</span>
                    <span className="mt-1 flex items-center gap-3">
                      <span className="flex items-center">
                        {n.attendees.map((p, k) => (
                          <Avatar key={p.id} person={p} size="xs" ring="#ffffff" className={k ? "-ml-1.5" : ""} />
                        ))}
                      </span>
                      {n.open ? <Chip tone="signal">{n.open} open</Chip> : <Chip tone="acid">Done</Chip>}
                    </span>
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        ) : (
          <div className="mt-5">
            <Empty title="No notes yet." body="Notes from each meeting land here, with what everyone agreed to do." />
          </div>
        )}
      </Card>

      <Card i={2} className="lg:sticky lg:top-[5rem] lg:col-span-4" aria-labelledby="nt-open">
        <CardHead id="nt-open" title="Still to do" meta={open.length ? `${open.length} from ${new Set(open.map((o) => o.note.id)).size} meetings` : "Nothing outstanding"} />
        <ul className="mt-4 grid gap-1">
          {open.map((a) => {
            const who = person(a.assigneeId);
            const mine = a.assigneeId === viewer.person.id;
            return (
              <li key={`${a.note.id}-${a.id}`}>
                <Link href={`${base}/${a.note.id}`} className="-mx-2 flex items-start gap-3 rounded-[0.875rem] p-2 transition-colors hover:bg-ink-950/[0.025]">
                  <span aria-hidden className="mt-0.5 size-[1.125rem] shrink-0 rounded-[0.375rem] bg-white ring-1 ring-inset ring-ink-950/20" />
                  <span className="grid min-w-0 flex-1 gap-1">
                    <span className="text-[0.8125rem] leading-[1.45]">{a.text}</span>
                    <span className={`${META} text-[0.6875rem] ${mine ? "font-medium text-primary" : ""}`}>
                      {mine ? "You" : who.name.split(" ")[0]}
                      {a.dueOn ? ` · ${due(a.dueOn)}` : ""} · {a.note.title}
                    </span>
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      </Card>
    </div>
  );
}
