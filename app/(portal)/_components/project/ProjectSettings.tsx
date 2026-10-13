"use client";

import { Archive, Check, Plus, X } from "lucide-react";
import { useEffect, useState } from "react";
import type { Person, ProjectStatus } from "@/lib/portal/types";
import { CopyField, Field } from "../clients/ClientActions";
import { Avatar, Card, CardHead, Chip, LABEL, META, Pill, TITLE } from "../ui";

const STATUSES: readonly { key: ProjectStatus; label: string }[] = [
  { key: "proposal", label: "Proposal" },
  { key: "active", label: "Active" },
  { key: "paused", label: "Paused" },
  { key: "complete", label: "Complete" },
];
const COLOURS = ["#eedf4e", "#f2875f", "#8fa8f7", "#63cdab", "#c6a8f0", "#f1b8c6", "#d7e23f", "#9ad0e8"];
const ROLE_NAME = { lead: "Lead", studio: "Studio", contractor: "Contractor", client: "Client" } as const;
type MemberRole = keyof typeof ROLE_NAME;

/**
 * A project's settings, the studio's alone: its name, state and colour, who's
 * on it (and so who sees it), and its reply address. Nothing is saved in the
 * prototype; the bar at the foot says what would be.
 */
export function ProjectSettings({
  project,
  members: initial,
  others,
  reply,
}: {
  project: { name: string; code: string; status: ProjectStatus; targetOn: string; chip: string; summary: string; org: string };
  members: readonly { person: Person; role: MemberRole }[];
  others: readonly Person[];
  reply: string;
}) {
  const [name, setName] = useState(project.name);
  const [summary, setSummary] = useState(project.summary);
  const [status, setStatus] = useState(project.status);
  const [target, setTarget] = useState(project.targetOn);
  const [chip, setChip] = useState(project.chip);
  const [members, setMembers] = useState([...initial]);
  const [adding, setAdding] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (!saved) return;
    const t = setTimeout(() => setSaved(false), 2600);
    return () => clearTimeout(t);
  }, [saved]);

  const dirty =
    name !== project.name || summary !== project.summary || status !== project.status || target !== project.targetOn || chip !== project.chip || members.length !== initial.length;
  const addable = others.filter((p) => !members.some((m) => m.person.id === p.id));

  return (
    <div className="grid grid-cols-[minmax(0,1fr)] items-start gap-4 pb-20 lg:grid-cols-12 lg:gap-5">
      <Card i={1} className="grid gap-5 lg:col-span-7">
        <CardHead title="Project" meta={`${project.code} · ${project.org}`} />
        <Field label="Name" value={name} onChange={setName} />
        <label className="grid gap-2">
          <span className={`${LABEL} text-tertiary`}>Summary</span>
          <textarea
            rows={3}
            value={summary}
            onChange={(e) => setSummary(e.target.value)}
            className="resize-none rounded-[1rem] bg-ink-950/[0.035] px-4 py-3 text-[0.875rem] leading-[1.55] outline-none transition-shadow focus-visible:bg-white focus-visible:shadow-[0_0_0_1px_rgb(14_13_11/0.14)]"
          />
        </label>
        <div className="grid gap-5 sm:grid-cols-2">
          <fieldset className="grid gap-2.5">
            <legend className={`mb-2.5 ${LABEL} text-tertiary`}>Status</legend>
            <div className="flex w-max max-w-full flex-wrap gap-0.5 rounded-[1.25rem] bg-ink-950/[0.045] p-1 sm:rounded-pill">
              {STATUSES.map((s) => (
                <button
                  key={s.key}
                  type="button"
                  aria-pressed={status === s.key}
                  onClick={() => setStatus(s.key)}
                  className={`gs-press h-7 rounded-pill px-3 text-[0.75rem] font-medium ${status === s.key ? "gs-ink" : "text-secondary hover:text-primary"}`}
                >
                  {s.label}
                </button>
              ))}
            </div>
          </fieldset>
          <Field label="Target date" type="date" value={target} onChange={setTarget} />
        </div>
        <fieldset className="grid gap-2.5">
          <legend className={`mb-2.5 ${LABEL} text-tertiary`}>Colour</legend>
          <div className="flex flex-wrap gap-2.5">
            {COLOURS.map((c) => (
              <label key={c} className="cursor-pointer">
                <input type="radio" name="chip" checked={chip === c} onChange={() => setChip(c)} className="peer sr-only" />
                <span
                  className="gs-press block size-8 rounded-full ring-offset-2 ring-offset-white peer-checked:ring-2 peer-checked:ring-ink-950 peer-focus-visible:ring-2 peer-focus-visible:ring-focus"
                  style={{ backgroundColor: c, boxShadow: "inset 0 0 0 1px rgb(14 13 11 / 0.08)" }}
                />
                <span className="sr-only">{c}</span>
              </label>
            ))}
          </div>
        </fieldset>
      </Card>

      <div className="grid gap-4 lg:col-span-5 lg:gap-5">
        <Card i={2} className="grid gap-4">
          <CardHead title="People" meta="Who's on it is who sees it">
            <Pill tone="canvas" onClick={() => setAdding((a) => !a)} className="h-8 px-3 text-[0.75rem]">
              <Plus aria-hidden className="size-3.5" strokeWidth={1.75} />
              Add
            </Pill>
          </CardHead>
          {adding ? (
            <div className="grid gap-1.5 rounded-[1.125rem] bg-ink-950/[0.03] p-2">
              {addable.length ? (
                addable.map((p) => (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => {
                      setMembers((ms) => [...ms, { person: p, role: p.role === "studio" ? "studio" : p.role }]);
                      setAdding(false);
                    }}
                    className="gs-press flex items-center gap-3 rounded-[0.875rem] p-2 text-left hover:bg-white"
                  >
                    <Avatar person={p} size="sm" />
                    <span className="grid min-w-0 flex-1">
                      <span className="truncate text-[0.8125rem] font-medium">{p.name}</span>
                      <span className={`truncate ${META} text-[0.6875rem]`}>{p.title}</span>
                    </span>
                    <Chip>{ROLE_NAME[p.role]}</Chip>
                  </button>
                ))
              ) : (
                <p className={`p-2 ${META} text-[0.8125rem]`}>Everyone who could be is already on it.</p>
              )}
            </div>
          ) : null}
          <ul className="grid">
            {members.map(({ person, role }) => (
              <li key={person.id} className="flex items-center gap-3 border-t border-ink-950/[0.06] py-2.5 first:border-t-0">
                <Avatar person={person} size="md" />
                <span className="grid min-w-0 flex-1 gap-0.5">
                  <span className={`truncate ${TITLE} text-[0.8125rem]`}>{person.name}</span>
                  <span className={`truncate ${META} text-[0.6875rem]`}>{person.email}</span>
                </span>
                <Chip tone={role === "lead" ? "ink" : "quiet"}>{ROLE_NAME[role]}</Chip>
                {role !== "lead" ? (
                  <button
                    type="button"
                    aria-label={`Take ${person.name} off the project`}
                    onClick={() => setMembers((ms) => ms.filter((m) => m.person.id !== person.id))}
                    className="gs-press grid size-7 place-items-center rounded-full text-tertiary hover:bg-ink-950/[0.05] hover:text-primary"
                  >
                    <X aria-hidden className="size-3.5" strokeWidth={1.75} />
                  </button>
                ) : (
                  <span className="size-7" />
                )}
              </li>
            ))}
          </ul>
        </Card>

        <Card i={3} className="grid gap-4">
          <CardHead title="Mail" meta="Replies to the portal's emails land in this project's thread" />
          <CopyField label="Reply address" value={reply} />
        </Card>

        <Card i={4} className="flex items-center justify-between gap-4">
          <span className="grid gap-0.5">
            <span className="text-[0.8125rem] font-medium">Archive</span>
            <span className={`${META} text-[0.75rem]`}>Hide it from everyone&rsquo;s lists. Nothing is deleted.</span>
          </span>
          <Pill tone="ghost" className="text-signal-700 hover:bg-signal-50 hover:text-signal-800">
            <Archive aria-hidden className="size-4" strokeWidth={1.5} />
            Archive
          </Pill>
        </Card>
      </div>

      {dirty || saved ? (
        <div className="gs-rise fixed inset-x-0 bottom-5 z-40 flex justify-center px-4">
          <div className="flex items-center gap-4 rounded-pill bg-ink-950 py-2 pr-2 pl-5 text-white shadow-float">
            <span className="text-[0.8125rem]">{saved ? "Saved. (Prototype: not kept.)" : "Unsaved changes"}</span>
            {!saved ? (
              <button
                type="button"
                onClick={() => setSaved(true)}
                className="gs-press inline-flex h-8 items-center gap-1.5 rounded-pill bg-white px-3.5 text-[0.75rem] font-medium text-ink-950 hover:bg-ink-100"
              >
                <Check aria-hidden className="size-3.5" strokeWidth={2} />
                Save
              </button>
            ) : null}
          </div>
        </div>
      ) : null}
    </div>
  );
}
