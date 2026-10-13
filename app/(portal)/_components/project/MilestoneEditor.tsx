"use client";

import { Pencil, Plus } from "lucide-react";
import { useEffect, useState } from "react";
import type { MilestoneStatus } from "@/lib/portal/types";
import { Field } from "../clients/ClientActions";
import { Sheet } from "../Sheet";
import { IconButton, LABEL, Pill } from "../ui";

const STATUSES: readonly { key: MilestoneStatus; label: string }[] = [
  { key: "upcoming", label: "Upcoming" },
  { key: "in_progress", label: "In progress" },
  { key: "in_review", label: "In review" },
  { key: "done", label: "Done" },
];

/**
 * The studio's way to shape a project's milestones: add one, or change one's
 * name, date or state. In the prototype the sheet says it saved; nothing is.
 */
export function MilestoneEditor({
  mode,
  initial,
  next,
}: {
  mode: "add" | "edit";
  initial?: { title: string; summary: string; dueOn: string; status: MilestoneStatus; position: number };
  /** The number a new milestone would take. */
  next?: number;
}) {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState(initial?.title ?? "");
  const [summary, setSummary] = useState(initial?.summary ?? "");
  const [due, setDue] = useState(initial?.dueOn ?? "");
  const [status, setStatus] = useState<MilestoneStatus>(initial?.status ?? "upcoming");
  const [toast, setToast] = useState("");

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(""), 3000);
    return () => clearTimeout(t);
  }, [toast]);

  const n = String(initial?.position ?? next ?? 1).padStart(2, "0");

  return (
    <>
      {mode === "add" ? (
        <Pill tone="ink" onClick={() => setOpen(true)}>
          <Plus aria-hidden className="size-4" strokeWidth={1.75} />
          Add milestone
        </Pill>
      ) : (
        <IconButton label={`Edit ${initial?.title}`} tone="clear" size="sm" onClick={() => setOpen(true)}>
          <Pencil aria-hidden className="size-3.5" strokeWidth={1.5} />
        </IconButton>
      )}
      <Sheet
        open={open}
        onClose={() => setOpen(false)}
        eyebrow={`Milestone ${n}`}
        title={mode === "add" ? "New milestone" : "Edit milestone"}
        footer={
          <>
            <Pill tone="ghost" onClick={() => setOpen(false)}>
              Cancel
            </Pill>
            <Pill
              tone="ink"
              disabled={!title.trim() || !due}
              onClick={() => {
                setOpen(false);
                setToast(mode === "add" ? `Milestone ${n} added. (Prototype: not saved.)` : "Saved. (Prototype: not kept.)");
              }}
            >
              {mode === "add" ? "Add milestone" : "Save"}
            </Pill>
          </>
        }
      >
        <div className="grid gap-5">
          <Field label="Name" value={title} onChange={setTitle} placeholder="Guidelines" />
          <label className="grid gap-2">
            <span className={`${LABEL} text-tertiary`}>What it delivers</span>
            <textarea
              rows={3}
              value={summary}
              onChange={(e) => setSummary(e.target.value)}
              placeholder="The book: rules, templates and files."
              className="resize-none rounded-[1rem] bg-ink-950/[0.035] px-4 py-3 text-[0.875rem] leading-[1.55] outline-none transition-shadow placeholder:text-ink-400 focus-visible:bg-white focus-visible:shadow-[0_0_0_1px_rgb(14_13_11/0.14)]"
            />
          </label>
          <Field label="Due" type="date" value={due} onChange={setDue} hint="The client sees this date on their home and the milestone strip." />
          <fieldset className="grid gap-2.5">
            <legend className={`mb-2.5 ${LABEL} text-tertiary`}>Where it stands</legend>
            <div className="flex w-max gap-0.5 rounded-pill bg-ink-950/[0.045] p-1">
              {STATUSES.map((s) => (
                <button
                  key={s.key}
                  type="button"
                  aria-pressed={status === s.key}
                  onClick={() => setStatus(s.key)}
                  className={`gs-press h-8 rounded-pill px-3 text-[0.75rem] font-medium ${status === s.key ? "gs-ink" : "text-secondary hover:text-primary"}`}
                >
                  {s.label}
                </button>
              ))}
            </div>
          </fieldset>
        </div>
      </Sheet>
      {toast ? (
        <p role="status" className="gs-rise fixed bottom-6 left-1/2 z-50 -translate-x-1/2 rounded-pill bg-ink-950 px-5 py-3 text-[0.8125rem] font-medium whitespace-nowrap text-white shadow-float">
          {toast}
        </p>
      ) : null}
    </>
  );
}
