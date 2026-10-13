"use client";

import { ArrowLeft, Check, Lock, PenLine, Plus, Share2, Users } from "lucide-react";
import { useEffect, useState } from "react";
import { dayLong, due } from "@/lib/portal/format";
import type { ActionItem, MeetingNote, Person, Role } from "@/lib/portal/types";
import { Avatar, Card, CardHead, Chip, DISPLAY, IconButton, LABEL, META, Pill } from "../ui";
import { Prose } from "./Prose";

/**
 * One meeting's notes: the write-up on the left, set for reading, and on
 * the right who can see it and what everyone agreed to do.
 *
 * The studio and contractors can edit; anyone can tick off what's theirs.
 * The studio decides whether the client reads it. Nothing here is saved in
 * the prototype.
 */
export function NoteWorkspace({
  note,
  people,
  viewer,
  backHref,
  isNew = false,
}: {
  note: MeetingNote;
  people: readonly Person[];
  viewer: { personId: string; role: Role };
  backHref: string;
  isNew?: boolean;
}) {
  const byId = new Map(people.map((p) => [p.id, p]));
  const canEdit = viewer.role !== "client";
  const [editing, setEditing] = useState(isNew);
  const [title, setTitle] = useState(note.title);
  const [body, setBody] = useState(note.body);
  const [visibility, setVisibility] = useState(note.visibility);
  const [actions, setActions] = useState<ActionItem[]>([...note.actions]);
  const [draft, setDraft] = useState("");
  const [assignee, setAssignee] = useState(viewer.personId);
  const [toast, setToast] = useState("");

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(""), 3200);
    return () => clearTimeout(t);
  }, [toast]);

  const attendees = note.attendeeIds.map((id) => byId.get(id)).filter((p): p is Person => Boolean(p));
  const assignable = people.filter((p) => viewer.role !== "client" || p.role !== "contractor");
  const open = actions.filter((a) => !a.done).length;

  return (
    <div className="grid grid-cols-[minmax(0,1fr)] items-start gap-4 lg:grid-cols-12 lg:gap-5">
      {/* The write-up ------------------------------------------------------- */}
      <Card i={1} className="grid gap-7 lg:col-span-8 lg:p-10">
        <div className="flex items-center justify-between gap-3">
          <IconButton label="All notes" href={backHref} tone="canvas">
            <ArrowLeft aria-hidden className="size-4" strokeWidth={1.5} />
          </IconButton>
          {canEdit ? (
            <div role="group" aria-label="Mode" className="flex gap-0.5 rounded-pill bg-ink-950/[0.045] p-1">
              {(["Read", "Edit"] as const).map((m) => (
                <button
                  key={m}
                  type="button"
                  aria-pressed={(m === "Edit") === editing}
                  onClick={() => setEditing(m === "Edit")}
                  className={`gs-press inline-flex h-7 items-center gap-1.5 rounded-pill px-3 text-[0.75rem] font-medium ${(m === "Edit") === editing ? "gs-ink" : "text-secondary hover:text-primary"}`}
                >
                  {m === "Edit" ? <PenLine aria-hidden className="size-3.5" strokeWidth={1.5} /> : null}
                  {m}
                </button>
              ))}
            </div>
          ) : null}
        </div>

        <header className="grid gap-4">
          <p className={`${LABEL} text-tertiary`}>{dayLong(note.metOn)}</p>
          {editing ? (
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="What was the meeting?"
              aria-label="Title"
              className={`${DISPLAY} w-full bg-transparent text-[2.25rem] outline-none placeholder:text-ink-300 lg:text-[2.75rem]`}
            />
          ) : (
            <h1 className={`${DISPLAY} text-[2.25rem] lg:text-[2.75rem]`}>{title}</h1>
          )}
          <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
            <span className="flex items-center">
              {attendees.map((p, n) => (
                <Avatar key={p.id} person={p} size="sm" ring="#ffffff" className={n ? "-ml-1.5" : ""} />
              ))}
            </span>
            <span className={`${META} text-[0.8125rem]`}>
              {attendees.map((p) => p.name.split(" ")[0]).join(", ")}
              {note.guests.length ? `, with ${note.guests.join(", ")}` : ""}
            </span>
          </div>
        </header>

        <div className="border-t border-ink-950/[0.06] pt-7">
          {editing ? (
            <div className="grid gap-3">
              <textarea
                value={body}
                onChange={(e) => setBody(e.target.value)}
                rows={16}
                placeholder={"What happened, in a few lines.\n\n## What we agreed\n- …"}
                aria-label="Notes"
                className="min-h-[22rem] w-full resize-y rounded-[1.25rem] bg-ink-950/[0.03] px-5 py-4 font-mono text-[0.8125rem] leading-[1.75] outline-none transition-shadow placeholder:text-ink-400 focus-visible:bg-white focus-visible:shadow-[0_0_0_1px_rgb(14_13_11/0.12)]"
              />
              <div className="flex items-center justify-between gap-3">
                <span className={`${META} text-[0.75rem]`}>&ldquo;## &rdquo; for a heading, &ldquo;- &rdquo; for a list, **bold** for emphasis.</span>
                <Pill
                  tone="ink"
                  onClick={() => {
                    setEditing(false);
                    setToast(isNew ? "Note saved. (Prototype: not kept.)" : "Saved. (Prototype: not kept.)");
                  }}
                >
                  <Check aria-hidden className="size-4" strokeWidth={2} />
                  Save
                </Pill>
              </div>
            </div>
          ) : body.trim() ? (
            <Prose body={body} />
          ) : (
            <p className={META}>Nothing written yet.</p>
          )}
        </div>
      </Card>

      {/* Who sees it, and what's to do -------------------------------------- */}
      <div className="grid gap-4 lg:sticky lg:top-[5rem] lg:col-span-4 lg:gap-5">
        <Card i={2} className="grid gap-4">
          <CardHead title="Who sees this" meta={visibility === "shared" ? "The client reads it in their portal" : "The studio and contractors only"} />
          {viewer.role === "studio" ? (
            <div className="grid gap-3">
              <div role="group" aria-label="Visibility" className="flex w-max gap-0.5 rounded-pill bg-ink-950/[0.045] p-1">
                {(
                  [
                    ["shared", "Shared", Users],
                    ["internal", "Internal", Lock],
                  ] as const
                ).map(([key, label, Icon]) => (
                  <button
                    key={key}
                    type="button"
                    aria-pressed={visibility === key}
                    onClick={() => setVisibility(key)}
                    className={`gs-press inline-flex h-8 items-center gap-1.5 rounded-pill px-3.5 text-[0.75rem] font-medium ${visibility === key ? "gs-ink" : "text-secondary hover:text-primary"}`}
                  >
                    <Icon aria-hidden className="size-3.5" strokeWidth={1.5} />
                    {label}
                  </button>
                ))}
              </div>
              {visibility === "shared" ? (
                <Pill tone="canvas" onClick={() => setToast("Sent to the client by email, with a link to the note.")} className="justify-self-start">
                  <Share2 aria-hidden className="size-4" strokeWidth={1.5} />
                  Email it to the client
                </Pill>
              ) : null}
            </div>
          ) : (
            <Chip tone={visibility === "shared" ? "quiet" : "outline"} dot={false}>
              {visibility === "shared" ? <Users aria-hidden className="size-3" strokeWidth={1.5} /> : <Lock aria-hidden className="size-3" strokeWidth={1.5} />}
              {visibility === "shared" ? (viewer.role === "client" ? "Shared with you" : "Shared with the client") : "Internal"}
            </Chip>
          )}
        </Card>

        <Card i={3} className="grid gap-4">
          <CardHead title="Action items" meta={open ? `${open} open of ${actions.length}` : "All done"} />
          <ul className="grid gap-1">
            {actions.map((a) => {
              const who = byId.get(a.assigneeId);
              const mine = a.assigneeId === viewer.personId;
              return (
                <li key={a.id}>
                  <label className={`group -mx-2 flex cursor-pointer items-start gap-3 rounded-[0.875rem] p-2 transition-colors hover:bg-ink-950/[0.025] ${a.done ? "text-tertiary" : ""}`}>
                    <input
                      type="checkbox"
                      checked={a.done}
                      onChange={() => setActions((xs) => xs.map((x) => (x.id === a.id ? { ...x, done: !x.done } : x)))}
                      className="peer sr-only"
                    />
                    <span
                      aria-hidden
                      className={`mt-0.5 grid size-[1.125rem] shrink-0 place-items-center rounded-[0.375rem] ring-1 ring-inset transition-colors peer-focus-visible:ring-2 peer-focus-visible:ring-focus ${a.done ? "bg-acid-300 ring-acid-400" : "bg-white ring-ink-950/20 group-hover:ring-ink-950/40"}`}
                    >
                      {a.done ? <Check className="size-3" strokeWidth={2.5} /> : null}
                    </span>
                    <span className="grid min-w-0 flex-1 gap-1">
                      <span className={`text-[0.8125rem] leading-[1.45] ${a.done ? "line-through decoration-ink-300" : ""}`}>{a.text}</span>
                      <span className="flex items-center gap-2">
                        {who ? <Avatar person={who} size="xs" /> : null}
                        <span className={`${META} text-[0.6875rem] ${mine && !a.done ? "font-medium text-primary" : ""}`}>
                          {mine ? "You" : who?.name.split(" ")[0]}
                          {a.dueOn && !a.done ? ` · ${due(a.dueOn)}` : ""}
                        </span>
                      </span>
                    </span>
                  </label>
                </li>
              );
            })}
          </ul>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (!draft.trim()) return;
              setActions((xs) => [...xs, { id: `local-${xs.length}`, text: draft.trim(), assigneeId: assignee, done: false }]);
              setDraft("");
            }}
            className="grid gap-2 border-t border-ink-950/[0.06] pt-4"
          >
            <span className="flex items-center gap-2 rounded-[0.875rem] bg-ink-950/[0.035] py-1 pr-1 pl-3 transition-shadow focus-within:bg-white focus-within:shadow-[0_0_0_1px_rgb(14_13_11/0.12)]">
              <input
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                placeholder="Add an action"
                aria-label="New action"
                className="h-8 min-w-0 flex-1 bg-transparent text-[0.8125rem] outline-none placeholder:text-ink-400"
              />
              <IconButton label="Add action" active size="sm" submit>
                <Plus aria-hidden className="size-3.5" strokeWidth={2} />
              </IconButton>
            </span>
            <span className="flex flex-wrap items-center gap-1">
              <span className={`mr-1 ${META} text-[0.6875rem]`}>For</span>
              {assignable.map((p) => (
                <button
                  key={p.id}
                  type="button"
                  aria-pressed={assignee === p.id}
                  onClick={() => setAssignee(p.id)}
                  className={`gs-press h-6 rounded-pill px-2.5 text-[0.6875rem] font-medium ${assignee === p.id ? "gs-ink" : "bg-ink-950/[0.045] text-secondary hover:text-primary"}`}
                >
                  {p.id === viewer.personId ? "Me" : p.name.split(" ")[0]}
                </button>
              ))}
            </span>
          </form>
        </Card>
      </div>

      {toast ? (
        <p role="status" className="gs-rise fixed bottom-6 left-1/2 z-50 -translate-x-1/2 rounded-pill bg-ink-950 px-5 py-3 text-[0.8125rem] font-medium whitespace-nowrap text-white shadow-float">
          {toast}
        </p>
      ) : null}
    </div>
  );
}
