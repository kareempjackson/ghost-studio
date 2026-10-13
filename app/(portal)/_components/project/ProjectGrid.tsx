"use client";

import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { useState } from "react";
import { pad } from "@/lib/portal/format";
import type { ProjectStatus as Status } from "@/lib/portal/types";
import { Chip, Count, DISPLAY, LABEL, META, ProgressBar, ProjectStatus, TITLE } from "../ui";

export interface PlateData {
  readonly slug: string;
  readonly code: string;
  readonly name: string;
  readonly summary: string;
  readonly status: Status;
  readonly ground: string;
  readonly chip: string;
  readonly org: string;
  readonly done: number;
  readonly total: number;
  readonly current?: number;
  readonly next?: string;
  readonly waiting: number;
}

const FILTERS: readonly { label: string; status?: Status }[] = [
  { label: "All" },
  { label: "Active", status: "active" },
  { label: "Proposal", status: "proposal" },
  { label: "Complete", status: "complete" },
];

/**
 * Every project as a plate on its own ground — the site's project cards,
 * carrying their state: the code, where the milestones stand, and a
 * vermilion count when something in it waits on the viewer.
 */
export function ProjectGrid({ plates }: { plates: readonly PlateData[] }) {
  const [filter, setFilter] = useState<Status | undefined>();
  const shown = plates.filter((p) => !filter || p.status === filter);
  const available = FILTERS.filter((f) => !f.status || plates.some((p) => p.status === f.status));

  return (
    <div className="grid gap-5">
      {available.length > 2 ? (
        <div role="group" aria-label="Filter projects" className="gs-card flex w-max gap-0.5 rounded-pill p-1">
          {available.map((f) => (
            <button
              key={f.label}
              type="button"
              aria-pressed={filter === f.status}
              onClick={() => setFilter(f.status)}
              className={`gs-press h-8 rounded-pill px-3.5 ${LABEL} ${filter === f.status ? "gs-ink" : "text-ink-800 hover:bg-ink-950/[0.04]"}`}
            >
              {f.label}
            </button>
          ))}
        </div>
      ) : null}
      <ul className="grid gap-4 sm:grid-cols-2 lg:gap-5 xl:grid-cols-3">
        {shown.map((p, n) => (
          <li key={p.slug} className="gs-rise" style={{ "--i": n } as React.CSSProperties}>
            <ProjectPlate plate={p} />
          </li>
        ))}
      </ul>
    </div>
  );
}

export function ProjectPlate({ plate: p }: { plate: PlateData }) {
  return (
    <Link href={`/portal/projects/${p.slug}`} className="group block">
      <div
        className="relative flex aspect-[5/4] flex-col justify-between overflow-hidden rounded-[1.75rem] p-6 text-ink-950 lg:p-7"
        style={{ backgroundColor: p.ground }}
      >
        <div className="flex items-center justify-between gap-2">
          <Chip colour={p.chip} className="bg-white">{p.code}</Chip>
          <div className="flex items-center gap-1.5">
            {p.waiting ? <Count n={p.waiting} /> : null}
            <span className="rounded-pill bg-white">
              <ProjectStatus status={p.status} />
            </span>
          </div>
        </div>
        <p className={`${DISPLAY} max-w-[11ch] text-[2.25rem] lg:text-[2.625rem]`}>{p.name}.</p>
        <div className="flex items-end justify-between gap-6">
          <div className="grid flex-1 gap-2.5">
            <span className="text-[0.75rem] tracking-[-0.005em] text-ink-700">
              {p.next ? `${pad(p.current ?? 0)} / ${pad(p.total)} · ${p.next}` : `${pad(p.done)} / ${pad(p.total)} · Complete`}
            </span>
            <ProgressBar
              label={`${p.done} of ${p.total} milestones complete`}
              segments={[
                { share: p.done, tone: "acid" },
                { share: p.next ? 1 : 0, tone: "ink" },
                { share: p.total - p.done - (p.next ? 1 : 0), tone: "canvas" },
              ]}
              className="max-w-[13rem] [&>span]:bg-white/55 [&>span:first-child]:bg-acid-300"
            />
          </div>
          <span
            aria-hidden
            className="grid size-10 shrink-0 place-items-center rounded-full bg-white shadow-card transition-colors duration-300 group-hover:bg-ink-950 group-hover:text-white"
          >
            <ArrowUpRight className="size-4 transition-transform duration-300 group-hover:translate-x-px group-hover:-translate-y-px" strokeWidth={1.5} />
          </span>
        </div>
      </div>
      <div className="mt-4 grid gap-1 px-1.5">
        <p className={`${TITLE} transition-colors group-hover:text-accent`}>{p.org}</p>
        <p className={`line-clamp-2 ${META}`}>{p.summary}</p>
      </div>
    </Link>
  );
}
