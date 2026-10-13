"use client";

import Image from "next/image";
import Link from "next/link";
import { Download, FileText, LayoutGrid, List } from "lucide-react";
import { useState } from "react";
import type { FileRow } from "@/lib/portal/data";
import { bytes, day } from "@/lib/portal/format";
import { Avatar, DIVIDE, Empty, IconButton, LABEL, META, TITLE } from "../ui";

type Source = "all" | FileRow["from"];

/**
 * Every file in a project in one place, wherever it came from — a version
 * up for review, a message — as pictures or as a list. Each one opens where
 * it lives, or downloads.
 */
export function FileBrowser({ files, ground }: { files: readonly FileRow[]; ground: string }) {
  const [source, setSource] = useState<Source>("all");
  const [view, setView] = useState<"grid" | "list">("grid");
  const tabs: { key: Source; label: string }[] = [
    { key: "all", label: "All" },
    { key: "Review", label: "From reviews" },
    { key: "Message", label: "From messages" },
  ];
  const shown = files.filter((f) => source === "all" || f.from === source);
  const isImage = (f: FileRow) => f.mime.startsWith("image/");

  return (
    <div className="grid gap-5">
      <div className="gs-rise flex flex-wrap items-center justify-between gap-3 [--i:1]">
        <div role="tablist" aria-label="Source" className="gs-card flex gap-0.5 rounded-pill p-1">
          {tabs
            .filter((t) => t.key === "all" || files.some((f) => f.from === t.key))
            .map((t) => (
              <button
                key={t.key}
                role="tab"
                type="button"
                aria-selected={source === t.key}
                onClick={() => setSource(t.key)}
                className={`gs-press inline-flex h-8 items-center gap-2 rounded-pill px-3.5 ${LABEL} ${source === t.key ? "gs-ink" : "text-ink-800 hover:bg-ink-950/[0.04]"}`}
              >
                {t.label}
                <span className={`grid h-4 min-w-4 place-items-center rounded-full px-1 text-[0.5625rem] tracking-normal ${source === t.key ? "bg-white/15" : "bg-ink-950/[0.06]"}`}>
                  {files.filter((f) => t.key === "all" || f.from === t.key).length}
                </span>
              </button>
            ))}
        </div>
        <div role="group" aria-label="View" className="gs-card flex gap-0.5 rounded-pill p-1">
          <IconButton label="Grid" tone="clear" size="sm" active={view === "grid"} pressed={view === "grid"} onClick={() => setView("grid")}>
            <LayoutGrid aria-hidden className="size-3.5" strokeWidth={1.5} />
          </IconButton>
          <IconButton label="List" tone="clear" size="sm" active={view === "list"} pressed={view === "list"} onClick={() => setView("list")}>
            <List aria-hidden className="size-3.5" strokeWidth={1.5} />
          </IconButton>
        </div>
      </div>

      {!shown.length ? (
        <Empty title="No files yet." body="Files from reviews and messages collect here." />
      ) : view === "grid" ? (
        <ul className="grid gap-4 sm:grid-cols-2 lg:gap-5 xl:grid-cols-4">
          {shown.map((f, n) => (
            <li key={`${f.id}-${n}`} className="gs-rise" style={{ "--i": n + 2 } as React.CSSProperties}>
              <div className="group gs-card grid gap-3 rounded-[1.5rem] p-2 pb-4">
                <Link
                  href={f.href}
                  className="relative block aspect-[4/3] overflow-hidden rounded-[1.125rem]"
                  style={{ backgroundColor: ground, boxShadow: "inset 0 0 0 1px rgb(14 13 11 / 0.05)" }}
                >
                  {isImage(f) ? (
                    <Image src={f.src} alt="" fill unoptimized className="object-cover" />
                  ) : (
                    <span className="grid size-full place-items-center">
                      <FileText aria-hidden className="size-8 text-ink-400" strokeWidth={1.25} />
                    </span>
                  )}
                </Link>
                <div className="flex items-start justify-between gap-2 px-2">
                  <span className="grid min-w-0 gap-0.5">
                    <span className={`truncate ${TITLE} text-[0.8125rem]`}>{f.name}</span>
                    <span className={`truncate ${META} text-[0.6875rem]`}>
                      {f.context} · {bytes(f.size)}
                    </span>
                  </span>
                  <a
                    href={f.src}
                    download={f.name}
                    aria-label={`Download ${f.name}`}
                    className="gs-press grid size-8 shrink-0 place-items-center rounded-full text-ink-600 hover:bg-ink-950/[0.05] hover:text-primary"
                  >
                    <Download aria-hidden className="size-3.5" strokeWidth={1.5} />
                  </a>
                </div>
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <section className="gs-rise gs-card rounded-[1.75rem] px-3 py-2 [--i:2] sm:px-5">
          <ul className={DIVIDE}>
            {shown.map((f, n) => (
              <li key={`${f.id}-${n}`} className="flex items-center gap-4 px-2 py-3">
                <span className="relative h-10 w-14 shrink-0 overflow-hidden rounded-[0.625rem]" style={{ backgroundColor: ground }}>
                  {isImage(f) ? <Image src={f.src} alt="" fill unoptimized className="object-cover" /> : null}
                </span>
                <Link href={f.href} className="grid min-w-0 flex-1 gap-0.5 transition-colors hover:text-accent">
                  <span className={`truncate ${TITLE} text-[0.8125rem]`}>{f.name}</span>
                  <span className={`truncate ${META} text-[0.75rem]`}>{f.context}</span>
                </Link>
                <span className="hidden items-center gap-2 sm:flex">
                  <Avatar person={f.by} size="xs" />
                  <span className={`${META} text-[0.75rem]`}>{f.by.name.split(" ")[0]}</span>
                </span>
                <span className={`hidden w-16 text-right ${META} text-[0.75rem] tabular-nums md:block`}>{day(f.at)}</span>
                <span className={`w-14 text-right ${META} text-[0.75rem] tabular-nums`}>{bytes(f.size)}</span>
                <a
                  href={f.src}
                  download={f.name}
                  aria-label={`Download ${f.name}`}
                  className="gs-press grid size-8 shrink-0 place-items-center rounded-full text-ink-600 hover:bg-ink-950/[0.05] hover:text-primary"
                >
                  <Download aria-hidden className="size-3.5" strokeWidth={1.5} />
                </a>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
