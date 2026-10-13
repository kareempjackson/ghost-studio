"use client";

import { Upload } from "lucide-react";
import { useEffect, useState } from "react";
import type { ItemCard } from "@/lib/portal/data";
import { waitsOn } from "@/lib/portal/stage";
import type { Role } from "@/lib/portal/types";
import { LABEL, Pill } from "../ui";
import { ReviewGrid } from "./ReviewGrid";
import { SubmitSheet, type SubmitProject } from "./SubmitSheet";

type Key = "all" | "you" | "client" | "changes" | "done";

/**
 * Work in review, by where it stands. The tabs are the questions people
 * ask — what's waiting on me, what's with the client, what came back, what's
 * done — each with its count, and only the ones with anything in them.
 */
export function ReviewBoard({
  items,
  role,
  showProject,
  projects,
  openSubmit = false,
}: {
  items: readonly ItemCard[];
  role: Role;
  showProject: boolean;
  /** Where work can be submitted; empty for clients. */
  projects: readonly SubmitProject[];
  openSubmit?: boolean;
}) {
  const [tab, setTab] = useState<Key>("all");
  const [sheet, setSheet] = useState(openSubmit && projects.length > 0);
  const [toast, setToast] = useState("");

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(""), 3600);
    return () => clearTimeout(t);
  }, [toast]);

  const tabs: { key: Key; label: string; test: (i: ItemCard) => boolean }[] = [
    { key: "all", label: "All", test: () => true },
    { key: "you", label: "Waiting on you", test: (i) => waitsOn(i.stage, role, i.mine) },
    { key: "client", label: "With client", test: (i) => role !== "client" && i.stage === "client_review" },
    { key: "changes", label: "Changes", test: (i) => i.stage === "changes_requested" || i.stage === "internal_changes" },
    { key: "done", label: "Approved", test: (i) => i.stage === "approved" },
  ];
  const counted = tabs.map((t) => ({ ...t, n: items.filter(t.test).length })).filter((t) => t.key === "all" || t.n > 0);
  const active = counted.find((t) => t.key === tab) ?? counted[0];
  const shown = items.filter(active.test);

  return (
    <div className="grid grid-cols-[minmax(0,1fr)] gap-5">
      <div className="gs-rise flex min-w-0 flex-wrap items-center justify-between gap-3 [--i:1]">
        <div role="tablist" aria-label="Stage" className="gs-card gs-no-bar flex max-w-full gap-0.5 overflow-x-auto rounded-pill p-1">
          {counted.map((t) => (
            <button
              key={t.key}
              role="tab"
              type="button"
              aria-selected={t.key === active.key}
              onClick={() => setTab(t.key)}
              className={`gs-press inline-flex h-8 shrink-0 items-center gap-2 rounded-pill px-3.5 ${LABEL} ${t.key === active.key ? "gs-ink" : "text-ink-800 hover:bg-ink-950/[0.04]"}`}
            >
              {t.label}
              <span
                className={`grid h-4 min-w-4 place-items-center rounded-full px-1 text-[0.5625rem] tracking-normal ${t.key === active.key ? "bg-white/15" : t.key === "you" ? "bg-alert text-white" : "bg-ink-950/[0.06]"}`}
              >
                {t.n}
              </span>
            </button>
          ))}
        </div>
        {projects.length ? (
          <Pill tone="ink" onClick={() => setSheet(true)}>
            <Upload aria-hidden className="size-4" strokeWidth={1.5} />
            Submit work
          </Pill>
        ) : null}
      </div>

      <ReviewGrid items={shown} role={role} showProject={showProject} />

      {projects.length ? <SubmitSheet open={sheet} onClose={() => setSheet(false)} role={role} projects={projects} onDone={setToast} /> : null}

      {toast ? (
        <p
          role="status"
          className="gs-rise fixed bottom-6 left-1/2 z-50 -translate-x-1/2 rounded-pill bg-ink-950 px-5 py-3 text-[0.8125rem] font-medium whitespace-nowrap text-white shadow-float"
        >
          {toast}
        </p>
      ) : null}
    </div>
  );
}
