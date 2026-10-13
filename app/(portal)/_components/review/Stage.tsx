"use client";

import Image from "next/image";
import { ArrowLeft, Columns2, Download, MapPin, Maximize2, ZoomIn, ZoomOut } from "lucide-react";
import type { MouseEvent } from "react";
import { day, pad } from "@/lib/portal/format";
import { stageChip } from "@/lib/portal/stage";
import type { FileRef, Person, Stage as StageName, Version } from "@/lib/portal/types";
import { Chip, IconButton, LABEL } from "../ui";
import type { PinnedComment, ReviewProps } from "./types";

/**
 * The work itself, on the canvas: a toolbar of round tools across the top,
 * the picture with its pins, and the versions along the foot.
 *
 * With the pin tool on, a click anywhere on the work drops a pin there and
 * opens a comment for it. Pins sit at fractions of the picture, so they stay
 * on their spot through any zoom.
 */
export function Stage({
  props,
  stage,
  versions,
  version,
  onVersion,
  file,
  onFile,
  comments,
  draft,
  onDraft,
  active,
  onActive,
  zoom,
  onZoom,
  pinMode,
  onPinMode,
  compare,
  onCompare,
  canPin,
  people,
}: {
  props: ReviewProps;
  stage: StageName;
  versions: readonly Version[];
  version: Version;
  onVersion: (index: number) => void;
  file: FileRef;
  onFile: (index: number) => void;
  comments: readonly PinnedComment[];
  draft: { x: number; y: number } | null;
  onDraft: (pin: { x: number; y: number }) => void;
  active: string | null;
  onActive: (id: string | null) => void;
  zoom: number;
  onZoom: (zoom: number) => void;
  pinMode: boolean;
  onPinMode: (on: boolean) => void;
  compare: boolean;
  onCompare: (on: boolean) => void;
  canPin: boolean;
  people: ReadonlyMap<string, Person>;
}) {
  const { item, project, milestone, viewer } = props;
  const chip = stageChip(stage, viewer.role, item.submittedBy === viewer.personId);
  const index = versions.indexOf(version);
  const previous = index > 0 ? versions[index - 1] : undefined;
  const by = people.get(version.createdBy);

  const drop = (event: MouseEvent<HTMLDivElement>) => {
    if (!pinMode || !canPin) return;
    const box = event.currentTarget.getBoundingClientRect();
    onDraft({
      x: Math.min(Math.max((event.clientX - box.left) / box.width, 0.02), 0.98),
      y: Math.min(Math.max((event.clientY - box.top) / box.height, 0.04), 0.98),
    });
  };

  return (
    <div className="gs-rise gs-card rounded-[1.75rem] p-2.5 sm:p-3">
      <div className="flex flex-wrap items-center justify-between gap-3 p-2 pb-3">
        <div className="flex min-w-0 items-center gap-3">
          <IconButton label="All reviews" href={`/portal/projects/${project.slug}/reviews`} tone="canvas">
            <ArrowLeft aria-hidden className="size-[1.125rem]" strokeWidth={1.5} />
          </IconButton>
          <div className="grid min-w-0 gap-1.5">
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-[1.0625rem] leading-none font-medium tracking-[-0.02em]">{item.title}</h2>
              <Chip tone="ink">v{pad(version.number)}</Chip>
              <Chip tone={chip.tone}>{chip.label}</Chip>
            </div>
            <p className="truncate text-[0.75rem] tracking-[-0.005em] text-tertiary">
              {milestone ? `${pad(milestone.position)} ${milestone.title} · ` : ""}
              {file.name}
            </p>
          </div>
        </div>

        <div role="toolbar" aria-label="View the work" className="flex items-center gap-0.5 rounded-pill bg-ink-950/[0.04] p-1">
          {canPin ? (
            <IconButton label={pinMode ? "Pinning on" : "Pin a comment"} tone="clear" active={pinMode} pressed={pinMode} onClick={() => onPinMode(!pinMode)}>
              <MapPin aria-hidden className="size-4" strokeWidth={1.5} />
            </IconButton>
          ) : null}
          <IconButton label="Zoom out" tone="clear" onClick={() => onZoom(Math.max(0.5, zoom - 0.25))}>
            <ZoomOut aria-hidden className="size-4" strokeWidth={1.5} />
          </IconButton>
          <span className="w-10 text-center text-[0.6875rem] text-secondary tabular-nums" aria-live="polite">
            {Math.round(zoom * 100)}%
          </span>
          <IconButton label="Zoom in" tone="clear" onClick={() => onZoom(Math.min(3, zoom + 0.25))}>
            <ZoomIn aria-hidden className="size-4" strokeWidth={1.5} />
          </IconButton>
          <IconButton label="Fit to screen" tone="clear" onClick={() => onZoom(1)}>
            <Maximize2 aria-hidden className="size-4" strokeWidth={1.5} />
          </IconButton>
          {previous ? (
            <IconButton label={`Compare with v${pad(previous.number)}`} tone="clear" active={compare} pressed={compare} onClick={() => onCompare(!compare)}>
              <Columns2 aria-hidden className="size-4" strokeWidth={1.5} />
            </IconButton>
          ) : null}
          <a
            href={file.src}
            download={file.name}
            aria-label={`Download ${file.name}`}
            title="Download"
            className="gs-press grid size-9 place-items-center rounded-full text-ink-700 hover:bg-ink-950/[0.05] hover:text-primary"
          >
            <Download aria-hidden className="size-4" strokeWidth={1.5} />
          </a>
        </div>
      </div>

      <div className="relative max-h-[72vh] overflow-auto rounded-[1.25rem]" style={{ backgroundColor: project.ground, boxShadow: "inset 0 0 0 1px rgb(14 13 11 / 0.05)" }}>
        {compare && previous ? (
          <div className="grid gap-2 p-2 sm:grid-cols-2">
            {[previous, version].map((v) => (
              <figure key={v.id} className="grid gap-2">
                <div className="overflow-hidden rounded-[0.875rem]">
                  <Image src={v.files[0].src} alt={`${item.title}, version ${v.number}`} width={1600} height={1000} unoptimized className="block h-auto w-full" />
                </div>
                <figcaption className={`${LABEL} px-1 text-ink-700`}>
                  v{pad(v.number)} · {day(v.createdAt)}
                </figcaption>
              </figure>
            ))}
          </div>
        ) : (
          <div style={{ width: `${zoom * 100}%` }} className="mx-auto transition-[width] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]">
            <div
              onClick={drop}
              className={`relative ${pinMode && canPin ? "cursor-crosshair" : ""}`}
            >
              <Image
                src={file.src}
                alt={`${item.title}, version ${version.number}: ${file.name}`}
                width={file.width ?? 1600}
                height={file.height ?? 1000}
                unoptimized
                draggable={false}
                className="block h-auto w-full select-none"
              />
              {comments.map((c) =>
                c.pin && c.number ? (
                  <Pin
                    key={c.id}
                    x={c.pin.x}
                    y={c.pin.y}
                    label={`${c.number}`}
                    tone={active === c.id ? "active" : c.resolved ? "resolved" : c.visibility === "internal" ? "internal" : "open"}
                    onFocus={() => onActive(c.id)}
                    onBlur={() => onActive(null)}
                    name={`Comment ${c.number}`}
                  />
                ) : null,
              )}
              {draft ? <Pin x={draft.x} y={draft.y} label="+" tone="draft" name="New comment" /> : null}
            </div>
          </div>
        )}
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 p-2 pt-3">
        <div role="group" aria-label="Versions" className="flex items-center gap-1">
          {versions.map((v, n) => (
            <button
              key={v.id}
              type="button"
              aria-pressed={v.id === version.id}
              onClick={() => onVersion(n)}
              className={`gs-press h-8 rounded-pill px-3 ${LABEL} ${v.id === version.id ? "gs-ink" : "bg-ink-950/[0.045] hover:bg-ink-950/[0.08]"}`}
            >
              v{pad(v.number)}
            </button>
          ))}
        </div>
        {version.files.length > 1 && !compare ? (
          <div role="group" aria-label="Files in this version" className="flex items-center gap-2">
            {version.files.map((f, n) => (
              <button
                key={f.id}
                type="button"
                aria-pressed={f.id === file.id}
                onClick={() => onFile(n)}
                className={`gs-press flex items-center gap-2 rounded-[0.75rem] p-1 pr-3 ${f.id === file.id ? "gs-ink" : "bg-ink-950/[0.045] hover:bg-ink-950/[0.08]"}`}
              >
                <span className="relative h-7 w-11 overflow-hidden rounded-[0.5rem]">
                  <Image src={f.src} alt="" fill unoptimized className="object-cover" />
                </span>
                <span className={LABEL}>{f.name.replace(/\.[a-z]+$/, "")}</span>
              </button>
            ))}
          </div>
        ) : null}
        <p className="text-[0.75rem] text-tertiary">
          {version.sharedAt ? `Sent ${day(version.sharedAt)}` : `Uploaded ${day(version.createdAt)}`}
          {by ? ` · ${by.name}` : ""}
        </p>
      </div>
    </div>
  );
}

const PIN_TONES = {
  open: "bg-ink-950 text-white",
  internal: "bg-white text-ink-950",
  resolved: "bg-acid-300 text-ink-950",
  active: "bg-alert text-white",
  draft: "bg-alert text-white animate-pulse",
} as const;

/** A comment's pin: a disc with one square corner, and the corner is the spot. */
function Pin({
  x,
  y,
  label,
  tone,
  name,
  onFocus,
  onBlur,
}: {
  x: number;
  y: number;
  label: string;
  tone: keyof typeof PIN_TONES;
  name: string;
  onFocus?: () => void;
  onBlur?: () => void;
}) {
  return (
    <button
      type="button"
      aria-label={name}
      onClick={(e) => e.stopPropagation()}
      onMouseEnter={onFocus}
      onMouseLeave={onBlur}
      onFocus={onFocus}
      onBlur={onBlur}
      style={{ left: `${x * 100}%`, top: `${y * 100}%` }}
      className={`absolute grid size-7 origin-bottom-left -translate-y-full place-items-center rounded-full rounded-bl-[0.25rem] font-label text-[0.6875rem] ring-2 ring-white transition-colors duration-300 ${PIN_TONES[tone]}`}
    >
      {label}
    </button>
  );
}
