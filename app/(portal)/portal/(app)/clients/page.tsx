import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowUpRight, Plus } from "lucide-react";
import { Suspense } from "react";
import {
  AvatarStack,
  Chip,
  DIVIDE,
  Empty,
  LABEL,
  META,
  OrgMark,
  PageHead,
  Pill,
  SkeletonCard,
  TITLE,
} from "../../../_components/ui";
import { listClients } from "@/lib/portal/data";
import { money, pad, when } from "@/lib/portal/format";
import { getViewer } from "@/lib/portal/viewer";

export const metadata: Metadata = { title: "Clients" };

const SHOWS = [
  { key: "current", label: "Current" },
  { key: "past", label: "Past" },
  { key: "all", label: "All" },
] as const;

const COLS = "lg:grid-cols-[minmax(0,2.3fr)_minmax(0,1.5fr)_minmax(0,1.1fr)_minmax(0,1fr)_minmax(0,1.4fr)_2rem]";

/**
 * Every client the studio has, current first: who they are, what's running,
 * who's in the portal (and who hasn't accepted yet), what they owe, and when
 * anything last happened. The studio's alone.
 */
export default function ClientsPage(props: PageProps<"/portal/clients">) {
  return (
    <Suspense fallback={<SkeletonCard className="mt-24 h-96" lines={6} />}>
      <Clients searchParams={props.searchParams} />
    </Suspense>
  );
}

async function Clients({ searchParams }: Pick<PageProps<"/portal/clients">, "searchParams">) {
  const { show: raw } = await searchParams;
  const show = SHOWS.find((s) => s.key === raw)?.key ?? "current";
  const viewer = await getViewer();
  const all = await listClients(viewer);
  if (!all) notFound();
  const rows = all.filter((r) => show === "all" || (show === "current" ? r.current : !r.current));
  const owed = all.reduce((n, r) => n + r.money.outstanding, 0);

  return (
    <div className="grid grid-cols-[minmax(0,1fr)] gap-5">
      <PageHead eyebrow={`${pad(all.length)} clients · ${money(owed)} outstanding`} title="Clients">
        <Pill tone="ink" href="/portal/clients/new">
          <Plus aria-hidden className="size-4" strokeWidth={1.75} />
          New client
        </Pill>
      </PageHead>

      <nav aria-label="Show" className="gs-rise gs-card flex w-max gap-0.5 rounded-pill p-1 [--i:1]">
        {SHOWS.map((s) => (
          <Link
            key={s.key}
            href={`/portal/clients?show=${s.key}`}
            aria-current={s.key === show ? "page" : undefined}
            className={`gs-press inline-flex h-8 items-center rounded-pill px-3.5 ${LABEL} ${s.key === show ? "gs-ink" : "text-ink-800 hover:bg-ink-950/[0.04]"}`}
          >
            {s.label}
          </Link>
        ))}
      </nav>

      <section aria-label="Clients" className="gs-rise gs-card rounded-[1.75rem] px-3 py-2 [--i:2] sm:px-5">
        <div className={`hidden gap-6 px-3 pt-4 pb-3 lg:grid ${COLS}`}>
          {["Client", "Projects", "People", "Outstanding", "Last activity", ""].map((h) => (
            <span key={h} className={`${LABEL} text-tertiary`}>
              {h}
            </span>
          ))}
        </div>
        {rows.length ? (
          <ul className={DIVIDE}>
            {rows.map(({ org, projects, contacts, invited, money: m, last }) => (
              <li key={org.id}>
                <Link
                  href={`/portal/clients/${org.slug}`}
                  className={`group -mx-1 grid grid-cols-[minmax(0,1fr)_auto] items-center gap-x-6 gap-y-3 rounded-[1.25rem] px-4 py-4 transition-colors hover:bg-ink-950/[0.025] ${COLS}`}
                >
                  <span className="flex min-w-0 items-center gap-3.5">
                    <OrgMark org={org} />
                    <span className="grid min-w-0 gap-0.5">
                      <span className={`truncate ${TITLE} transition-colors group-hover:text-accent`}>{org.name}</span>
                      <span className={`truncate ${META} text-[0.75rem]`}>{org.website}</span>
                    </span>
                  </span>

                  <span className="hidden flex-wrap gap-1.5 lg:flex">
                    {projects.slice(0, 2).map((p) => (
                      <Chip key={p.id} colour={p.chip}>
                        {p.code}
                      </Chip>
                    ))}
                    {projects.length > 2 ? <Chip>+{projects.length - 2}</Chip> : null}
                  </span>

                  <span className="hidden items-center gap-2 lg:flex">
                    <AvatarStack people={contacts} max={3} ring="#ffffff" />
                    {invited ? <span className={`${META} text-[0.75rem]`}>{invited} invited</span> : null}
                  </span>

                  <span className="grid justify-items-end gap-0.5 lg:justify-items-start">
                    <span className="text-[0.875rem] font-medium tabular-nums">{m.outstanding ? money(m.outstanding) : "—"}</span>
                    {m.overdue ? (
                      <span className="flex items-center gap-1.5 text-[0.75rem] text-signal-700 tabular-nums">
                        <span aria-hidden className="size-1.5 rounded-full bg-alert" />
                        {money(m.overdue)} late
                      </span>
                    ) : (
                      <span className={`${META} text-[0.75rem]`}>{m.outstanding ? "On time" : "Settled"}</span>
                    )}
                  </span>

                  <span className="hidden min-w-0 lg:grid lg:gap-0.5">
                    <span className="truncate text-[0.8125rem] text-secondary">
                      {last ? (
                        <>
                          <span className="text-primary">{last.actor.name.split(" ")[0]}</span> {last.verb} {last.object}
                        </>
                      ) : (
                        "Nothing yet"
                      )}
                    </span>
                    {last ? <span className={`${META} text-[0.75rem]`}>{when(last.at)}</span> : null}
                  </span>

                  <ArrowUpRight
                    aria-hidden
                    className="hidden size-4 justify-self-end text-ink-300 transition-all duration-300 group-hover:translate-x-px group-hover:-translate-y-px group-hover:text-primary lg:block"
                    strokeWidth={1.5}
                  />
                </Link>
              </li>
            ))}
          </ul>
        ) : (
          <div className="py-4">
            <Empty title="No clients here." body="Past clients show up here once all their projects are complete." />
          </div>
        )}
      </section>
    </div>
  );
}
