import type { Metadata } from "next";
import Link from "next/link";
import { Check } from "lucide-react";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { MilestoneEditor } from "../../../../../_components/project/MilestoneEditor";
import { Card, Chip, Figure, LABEL, META, ProgressBar, SkeletonCard, TITLE } from "../../../../../_components/ui";
import { getMilestones } from "@/lib/portal/data";
import { day, daysUntil, due, money, pad } from "@/lib/portal/format";
import { stageChip } from "@/lib/portal/stage";
import { getViewer } from "@/lib/portal/viewer";

export const metadata: Metadata = { title: "Milestones" };

const STATUS = {
  done: { label: "Done", tone: "acid" },
  in_progress: { label: "In progress", tone: "ink" },
  in_review: { label: "In review", tone: "signal" },
  upcoming: { label: "Upcoming", tone: "outline" },
} as const;

/**
 * A project as a numbered line from first to last milestone: what each one
 * delivers, the work in it and where that stands, and — for the studio and
 * the client — the invoice that goes with it.
 */
export default function MilestonesPage({ params }: PageProps<"/portal/projects/[project]/milestones">) {
  return (
    <Suspense fallback={<SkeletonCard className="h-96" lines={6} />}>
      {params.then(({ project }) => (
        <Milestones slug={project} />
      ))}
    </Suspense>
  );
}

async function Milestones({ slug }: { slug: string }) {
  const viewer = await getViewer();
  const data = await getMilestones(slug, viewer);
  if (!data) notFound();
  const { project, rows } = data;
  const done = rows.filter((r) => r.milestone.status === "done").length;
  const current = rows.find((r) => r.milestone.status !== "done")?.milestone;
  const left = daysUntil(project.targetOn);

  return (
    <div className="grid gap-4 lg:gap-5">
      <Card i={1} className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end">
        <div className="grid gap-5">
          <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
            <Figure value={pad(done)} unit={`/ ${pad(rows.length)} complete`} size="lg" />
          </div>
          <div className="grid gap-2.5">
            <ProgressBar
              label={`${done} of ${rows.length} milestones complete`}
              segments={rows.map((r) => ({
                share: 1,
                tone: r.milestone.status === "done" ? "acid" : r.milestone.id === current?.id ? "ink" : "hatch",
              }))}
            />
            <div className="grid" style={{ gridTemplateColumns: `repeat(${rows.length}, minmax(0, 1fr))` }}>
              {rows.map((r) => (
                <span key={r.milestone.id} className={`truncate text-[0.6875rem] ${r.milestone.id === current?.id ? "font-medium text-primary" : "text-tertiary"}`}>
                  {r.milestone.title}
                </span>
              ))}
            </div>
          </div>
        </div>
        <div className="flex items-end gap-6 lg:justify-end">
          <div className="grid gap-1 lg:text-right">
            <span className={`${LABEL} text-tertiary`}>{project.status === "complete" ? "Delivered" : "Target"}</span>
            <span className="text-[1rem] font-medium tracking-[-0.015em]">{day(project.targetOn)}</span>
            <span className={`${META} text-[0.75rem]`}>{project.status === "complete" ? "Complete" : left > 0 ? `${left} days to go` : "Due"}</span>
          </div>
          {viewer.role === "studio" ? <MilestoneEditor mode="add" next={rows.length + 1} /> : null}
        </div>
      </Card>

      <ol className="grid">
        {rows.map(({ milestone: m, items, invoice }, n) => {
          const isCurrent = m.id === current?.id;
          const status = STATUS[m.status];
          return (
            <li key={m.id} className="gs-rise relative grid grid-cols-[2.75rem_minmax(0,1fr)] gap-3 pb-4 sm:grid-cols-[3.5rem_minmax(0,1fr)] sm:gap-4 lg:pb-5" style={{ "--i": n + 2 } as React.CSSProperties}>
              {n < rows.length - 1 ? (
                <span
                  aria-hidden
                  className={`absolute top-12 bottom-0 left-[1.375rem] w-px sm:left-[1.75rem] ${m.status === "done" ? "bg-acid-400" : "bg-ink-950/[0.1]"}`}
                />
              ) : null}
              <span
                aria-hidden
                className={`relative mt-5 grid size-11 place-items-center justify-self-center rounded-full font-label text-[0.6875rem] sm:size-12 ${
                  m.status === "done"
                    ? "bg-acid-300 text-ink-950"
                    : isCurrent
                      ? "gs-ink"
                      : "gs-card text-tertiary"
                }`}
              >
                {m.status === "done" ? <Check className="size-4" strokeWidth={2.25} /> : pad(m.position)}
              </span>

              <section aria-labelledby={`ms-${m.id}`} className={`gs-card grid gap-4 rounded-[1.75rem] p-5 sm:p-6 ${m.status === "upcoming" ? "opacity-90" : ""}`}>
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="grid gap-1">
                    <span className={`${LABEL} text-tertiary`}>Milestone {pad(m.position)}</span>
                    <h2 id={`ms-${m.id}`} className={`${TITLE} text-[1.125rem]`}>
                      {m.title}
                    </h2>
                    <p className={META}>{m.summary}</p>
                  </div>
                  <div className="flex items-center gap-1.5">
                    {m.status === "done" ? (
                      <Chip tone="acid" dot>
                        Done {day(m.completedOn ?? m.dueOn)}
                      </Chip>
                    ) : (
                      <>
                        <Chip tone={status.tone} dot>
                          {status.label}
                        </Chip>
                        <Chip tone={daysUntil(m.dueOn) < 7 && daysUntil(m.dueOn) >= 0 ? "signal" : "quiet"} dot={false}>
                          {day(m.dueOn)} · {due(m.dueOn)}
                        </Chip>
                      </>
                    )}
                    {viewer.role === "studio" ? (
                      <MilestoneEditor mode="edit" initial={{ title: m.title, summary: m.summary, dueOn: m.dueOn, status: m.status, position: m.position }} />
                    ) : null}
                  </div>
                </div>

                {items.length || invoice ? (
                  <div className="grid gap-2 border-t border-ink-950/[0.06] pt-4 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-start sm:gap-6">
                    {items.length ? (
                      <ul className="grid gap-1">
                        {items.map((item) => {
                          const chip = stageChip(item.stage, viewer.role, item.mine);
                          return (
                            <li key={item.id}>
                              <Link href={item.href} className="group -mx-2 flex items-center justify-between gap-3 rounded-[0.875rem] px-2 py-1.5 transition-colors hover:bg-ink-950/[0.03]">
                                <span className="truncate text-[0.8125rem] transition-colors group-hover:text-accent">
                                  {item.title} <span className="text-tertiary">v{pad(item.version)}</span>
                                </span>
                                <Chip tone={chip.tone}>{chip.label}</Chip>
                              </Link>
                            </li>
                          );
                        })}
                      </ul>
                    ) : (
                      <span className={`${META} text-[0.8125rem]`}>No work in review yet.</span>
                    )}
                    {invoice ? (
                      <Link
                        href={`/portal/projects/${slug}/payments`}
                        className="flex items-center gap-3 rounded-[1rem] bg-ink-950/[0.03] px-3.5 py-2.5 transition-colors hover:bg-ink-950/[0.055]"
                      >
                        <span className="grid gap-0.5">
                          <span className="text-[0.75rem] font-medium tabular-nums">{invoice.number}</span>
                          <span className={`${META} text-[0.6875rem] tabular-nums`}>{money(invoice.amount)}</span>
                        </span>
                        <Chip tone={invoice.balance === 0 ? "acid" : invoice.overdue ? "signal" : "quiet"}>
                          {invoice.balance === 0 ? "Paid" : invoice.overdue ? "Overdue" : "Sent"}
                        </Chip>
                      </Link>
                    ) : null}
                  </div>
                ) : null}
              </section>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
