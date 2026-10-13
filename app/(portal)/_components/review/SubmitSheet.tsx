"use client";

import { Check, FileText, Link2, Upload, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { bytes, pad } from "@/lib/portal/format";
import type { Role } from "@/lib/portal/types";
import { Field } from "../clients/ClientActions";
import { Sheet } from "../Sheet";
import { LABEL, META, Pill } from "../ui";

export interface SubmitProject {
  readonly slug: string;
  readonly code: string;
  readonly name: string;
  readonly chip: string;
  readonly client: string;
  readonly milestones: readonly { readonly id: string; readonly position: number; readonly title: string }[];
}

interface Upload {
  name: string;
  size: number;
  progress: number;
}

/**
 * Putting work up for review: which project and milestone it's for, the
 * files (each with its own progress), a link if it lives elsewhere, and a
 * note on what to look at.
 *
 * A contractor's work always goes to the studio first. The studio chooses:
 * look at it internally, or send it straight to the client.
 *
 * In the prototype the files never leave the browser; progress is drawn.
 */
export function SubmitSheet({
  open,
  onClose,
  role,
  projects,
  onDone,
}: {
  open: boolean;
  onClose: () => void;
  role: Role;
  projects: readonly SubmitProject[];
  onDone: (message: string) => void;
}) {
  const [slug, setSlug] = useState(projects[0]?.slug ?? "");
  const [title, setTitle] = useState("");
  const [milestone, setMilestone] = useState(projects[0]?.milestones[0]?.id ?? "");
  const [files, setFiles] = useState<Upload[]>([]);
  const [link, setLink] = useState("");
  const [note, setNote] = useState("");
  const [route, setRoute] = useState<"studio" | "client">(role === "studio" ? "client" : "studio");
  const input = useRef<HTMLInputElement>(null);
  const project = projects.find((p) => p.slug === slug) ?? projects[0];

  /* Progress for each file, drawn: a few steps a second until it's in. */
  useEffect(() => {
    if (!files.some((f) => f.progress < 100)) return;
    const t = setInterval(() => {
      setFiles((fs) => fs.map((f) => (f.progress < 100 ? { ...f, progress: Math.min(100, f.progress + 8 + Math.random() * 18) } : f)));
    }, 180);
    return () => clearInterval(t);
  }, [files]);

  const add = (list: FileList | null) => {
    if (!list) return;
    setFiles((fs) => [...fs, ...Array.from(list).map((f) => ({ name: f.name, size: f.size, progress: 0 }))]);
    if (!title && list[0]) setTitle(list[0].name.replace(/\.[a-z0-9]+$/i, "").replace(/[-_]+/g, " "));
  };

  const ready = title.trim() && (files.length > 0 || link.trim()) && files.every((f) => f.progress >= 100);

  const reset = () => {
    setTitle("");
    setFiles([]);
    setLink("");
    setNote("");
  };

  return (
    <Sheet
      open={open}
      onClose={onClose}
      eyebrow={project ? `${project.code} · ${project.name}` : "Submit"}
      title="Submit work"
      footer={
        <>
          <Pill tone="ghost" onClick={onClose}>
            Cancel
          </Pill>
          <Pill
            tone="ink"
            disabled={!ready}
            onClick={() => {
              onDone(
                route === "client"
                  ? `Sent to ${project?.client ?? "the client"}. They'll get an email with a link.`
                  : role === "contractor"
                    ? "Submitted. The studio will review it first."
                    : "Up for studio review.",
              );
              reset();
              onClose();
            }}
          >
            {route === "client" ? "Send to client" : "Submit for studio review"}
          </Pill>
        </>
      }
    >
      <div className="grid gap-6">
        {projects.length > 1 ? (
          <fieldset className="grid gap-2.5">
            <legend className={`mb-2.5 ${LABEL} text-tertiary`}>Project</legend>
            <div className="flex flex-wrap gap-1.5">
              {projects.map((p) => (
                <button
                  key={p.slug}
                  type="button"
                  aria-pressed={p.slug === slug}
                  onClick={() => {
                    setSlug(p.slug);
                    setMilestone(p.milestones[0]?.id ?? "");
                  }}
                  className={`gs-press inline-flex h-8 items-center gap-2 rounded-pill px-3 text-[0.75rem] font-medium ${p.slug === slug ? "gs-ink" : "bg-ink-950/[0.045] hover:bg-ink-950/[0.08]"}`}
                >
                  <span className="size-2 rounded-[0.1875rem]" style={{ backgroundColor: p.chip }} aria-hidden />
                  {p.name}
                </button>
              ))}
            </div>
          </fieldset>
        ) : null}

        {/* Files ------------------------------------------------------------ */}
        <div className="grid gap-2.5">
          <span className={`${LABEL} text-tertiary`}>Files</span>
          <label
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => {
              e.preventDefault();
              add(e.dataTransfer.files);
            }}
            className="grid cursor-pointer place-items-center gap-2.5 rounded-[1.25rem] border border-dashed border-ink-950/15 bg-ink-950/[0.02] px-6 py-9 text-center transition-colors hover:bg-ink-950/[0.04]"
          >
            <span className="gs-card grid size-10 place-items-center rounded-full">
              <Upload aria-hidden className="size-4" strokeWidth={1.5} />
            </span>
            <span className="text-[0.8125rem] font-medium">Drop files here, or browse</span>
            <span className={`${META} text-[0.75rem]`}>Images, video and PDF, up to 1 GB each</span>
            <input ref={input} type="file" multiple className="sr-only" onChange={(e) => add(e.target.files)} />
          </label>
          {files.length ? (
            <ul className="grid gap-1.5">
              {files.map((f, n) => (
                <li key={`${f.name}-${n}`} className="grid gap-2 rounded-[1rem] bg-ink-950/[0.03] p-3">
                  <span className="flex items-center gap-3">
                    <FileText aria-hidden className="size-4 shrink-0 text-ink-500" strokeWidth={1.5} />
                    <span className="min-w-0 flex-1 truncate text-[0.8125rem] font-medium">{f.name}</span>
                    <span className={`${META} text-[0.6875rem] tabular-nums`}>
                      {f.progress >= 100 ? bytes(f.size) : `${Math.floor(f.progress)}%`}
                    </span>
                    {f.progress >= 100 ? (
                      <Check aria-label="Uploaded" className="size-3.5 text-acid-700" strokeWidth={2.25} />
                    ) : null}
                    <button
                      type="button"
                      aria-label={`Remove ${f.name}`}
                      onClick={() => setFiles((fs) => fs.filter((_, k) => k !== n))}
                      className="gs-press grid size-6 place-items-center rounded-full text-tertiary hover:bg-white hover:text-primary"
                    >
                      <X aria-hidden className="size-3" strokeWidth={2} />
                    </button>
                  </span>
                  <span className="h-1 overflow-hidden rounded-pill bg-ink-950/[0.06]">
                    <span
                      className={`block h-full rounded-pill transition-[width] duration-200 ${f.progress >= 100 ? "bg-acid-400" : "bg-ink-950"}`}
                      style={{ width: `${f.progress}%` }}
                    />
                  </span>
                </li>
              ))}
            </ul>
          ) : null}
        </div>

        <Field label="Title" value={title} onChange={setTitle} placeholder="Primary logo" />

        {project?.milestones.length ? (
          <fieldset className="grid gap-2.5">
            <legend className={`mb-2.5 ${LABEL} text-tertiary`}>Milestone</legend>
            <div className="flex flex-wrap gap-1.5">
              {project.milestones.map((m) => (
                <button
                  key={m.id}
                  type="button"
                  aria-pressed={m.id === milestone}
                  onClick={() => setMilestone(m.id)}
                  className={`gs-press inline-flex h-8 items-center gap-2 rounded-pill px-3 text-[0.75rem] font-medium ${m.id === milestone ? "gs-ink" : "bg-ink-950/[0.045] hover:bg-ink-950/[0.08]"}`}
                >
                  <span className={`${LABEL} ${m.id === milestone ? "text-white/60" : "text-tertiary"}`}>{pad(m.position)}</span>
                  {m.title}
                </button>
              ))}
            </div>
          </fieldset>
        ) : null}

        <label className="grid gap-2">
          <span className={`${LABEL} text-tertiary`}>Link (optional)</span>
          <span className="flex items-center gap-2 rounded-[0.875rem] bg-ink-950/[0.035] pl-3.5 transition-shadow focus-within:bg-white focus-within:shadow-[0_0_0_1px_rgb(14_13_11/0.14)]">
            <Link2 aria-hidden className="size-4 text-ink-400" strokeWidth={1.5} />
            <input
              value={link}
              onChange={(e) => setLink(e.target.value)}
              placeholder="figma.com/… or a staging site"
              className="h-11 min-w-0 flex-1 bg-transparent pr-4 text-[0.875rem] outline-none placeholder:text-ink-400"
            />
          </span>
        </label>

        <label className="grid gap-2">
          <span className={`${LABEL} text-tertiary`}>What to look at</span>
          <textarea
            rows={3}
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="What changed since the last version, and what you'd like eyes on."
            className="resize-none rounded-[1rem] bg-ink-950/[0.035] px-4 py-3 text-[0.875rem] leading-[1.55] outline-none transition-shadow placeholder:text-ink-400 focus-visible:bg-white focus-visible:shadow-[0_0_0_1px_rgb(14_13_11/0.14)]"
          />
        </label>

        {/* Where it goes ------------------------------------------------------ */}
        {role === "studio" ? (
          <fieldset className="grid gap-2">
            <legend className={`mb-2.5 ${LABEL} text-tertiary`}>Where it goes</legend>
            {(
              [
                ["client", `Straight to ${project?.client ?? "the client"}`, "They get an email with a link to review it."],
                ["studio", "Studio review first", "Nobody outside the studio sees it until it's sent."],
              ] as const
            ).map(([key, label, hint]) => (
              <label
                key={key}
                className={`gs-press flex cursor-pointer items-start gap-3 rounded-[1rem] p-3.5 ring-1 ring-inset transition-colors ${route === key ? "bg-white ring-ink-950/25" : "ring-ink-950/[0.06] hover:bg-ink-950/[0.02]"}`}
              >
                <input type="radio" name="route" checked={route === key} onChange={() => setRoute(key)} className="mt-0.5 size-4 accent-ink-950" />
                <span className="grid gap-0.5">
                  <span className="text-[0.8125rem] font-medium">{label}</span>
                  <span className={`${META} text-[0.75rem]`}>{hint}</span>
                </span>
              </label>
            ))}
          </fieldset>
        ) : (
          <p className="rounded-[1rem] bg-ink-950/[0.035] p-4 text-[0.8125rem] leading-[1.55] text-secondary">
            Your work goes to the studio first. They&rsquo;ll review it, and send it on to the client when it&rsquo;s ready.
          </p>
        )}
      </div>
    </Sheet>
  );
}
