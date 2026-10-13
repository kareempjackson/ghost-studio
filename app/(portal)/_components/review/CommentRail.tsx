"use client";

import { ArrowUp, Check, Lock, RotateCcw } from "lucide-react";
import { useState, type FormEvent, type Ref } from "react";
import { bytes, day, pad, when } from "@/lib/portal/format";
import type { Decision, Person, Role, Version } from "@/lib/portal/types";
import { Avatar, Chip, IconButton, LABEL } from "../ui";
import type { PinnedComment, ReviewProps } from "./types";

export type Tab = "comments" | "activity" | "details";

/**
 * The column beside the work: what people said about it, what happened to
 * it, and what it is. Comments lead, and a comment and its pin light up
 * together, so it's always clear which spot a note is about.
 *
 * The client never sees internal notes; the studio sees them marked with a
 * lock, and chooses for each comment whether the client will see it.
 */
export function CommentRail({
  props,
  version,
  versions,
  comments,
  decisions,
  people,
  active,
  onActive,
  resolved,
  onResolve,
  draft,
  draftNumber,
  onClearDraft,
  onPost,
  canComment,
  tab,
  onTab,
  composerRef,
}: {
    props: ReviewProps;
    version: Version;
    versions: readonly Version[];
    comments: readonly PinnedComment[];
    decisions: readonly Decision[];
    people: ReadonlyMap<string, Person>;
    active: string | null;
    onActive: (id: string | null) => void;
    resolved: ReadonlySet<string>;
    onResolve: (id: string) => void;
    draft: { x: number; y: number } | null;
    draftNumber: number;
    onClearDraft: () => void;
    onPost: (body: string, visibility: "client" | "internal") => void;
    canComment: boolean;
    tab: Tab;
    onTab: (tab: Tab) => void;
    composerRef: Ref<HTMLTextAreaElement>;
}) {
  const role = props.viewer.role;
  const open = comments.filter((c) => !resolved.has(c.id));
  const done = comments.filter((c) => resolved.has(c.id));
  const tabs: { id: Tab; label: string; count?: number }[] = [
    { id: "comments", label: "Comments", count: open.length },
    { id: "activity", label: "Activity" },
    { id: "details", label: "Details" },
  ];

  return (
    <aside
      aria-label="About this work"
      className="gs-rise gs-card flex flex-col rounded-[1.75rem] [--i:1] lg:sticky lg:top-[5.25rem] lg:max-h-[calc(100dvh-6.25rem)]"
    >
      <div role="tablist" aria-label="Review" className="flex gap-6 border-b border-ink-950/[0.06] px-6 pt-5">
        {tabs.map((t) => (
          <button
            key={t.id}
            role="tab"
            type="button"
            aria-selected={tab === t.id}
            onClick={() => onTab(t.id)}
            className={`-mb-px flex items-center gap-2 border-b-[1.5px] pb-3.5 text-[0.8125rem] font-medium tracking-[-0.01em] transition-colors ${tab === t.id ? "border-ink-950 text-primary" : "border-transparent text-tertiary hover:text-primary"}`}
          >
            {t.label}
            {t.count ? (
              <span className="grid h-[1.125rem] min-w-[1.125rem] place-items-center rounded-full bg-ink-950/[0.06] px-1 font-label text-[0.5625rem]">{t.count}</span>
            ) : null}
          </button>
        ))}
      </div>

      <div role="tabpanel" className="min-h-[16rem] flex-1 overflow-y-auto px-6 py-5">
        {tab === "comments" ? (
          <div className="grid gap-4">
            {open.length ? (
              open.map((c) => (
                <CommentCard
                  key={c.id}
                  comment={c}
                  people={people}
                  role={role}
                  me={props.viewer.personId}
                  active={active === c.id}
                  onActive={onActive}
                  onResolve={canComment ? () => onResolve(c.id) : undefined}
                />
              ))
            ) : (
              <p className="rounded-[1.125rem] bg-ink-950/[0.03] p-5 text-[0.8125rem] leading-[1.5] text-secondary">
                {canComment
                  ? `Nothing open on v${pad(version.number)}. Click the work to pin a comment to a spot.`
                  : `Nothing open on v${pad(version.number)}.`}
              </p>
            )}
            {done.length ? (
              <details className="group rounded-[1.125rem] bg-ink-950/[0.03]">
                <summary className={`flex cursor-pointer list-none items-center justify-between px-4 py-3 ${LABEL} text-tertiary`}>
                  Resolved · {pad(done.length)}
                  <span className="transition-transform group-open:rotate-45">+</span>
                </summary>
                <div className="grid gap-4 px-4 pb-4">
                  {done.map((c) => (
                    <CommentCard
                      key={c.id}
                      comment={c}
                      people={people}
                      role={role}
                      me={props.viewer.personId}
                      active={active === c.id}
                      onActive={onActive}
                      onResolve={canComment ? () => onResolve(c.id) : undefined}
                      resolved
                    />
                  ))}
                </div>
              </details>
            ) : null}
          </div>
        ) : tab === "activity" ? (
          <History versions={versions} decisions={decisions} people={people} role={role} org={props.org} />
        ) : (
          <Details props={props} version={version} people={people} />
        )}
      </div>

      {tab === "comments" && canComment ? (
        <Composer
          inputRef={composerRef}
          role={role}
          version={version.number}
          draft={draft}
          draftNumber={draftNumber}
          onClearDraft={onClearDraft}
          onPost={onPost}
        />
      ) : null}
    </aside>
  );
}

function CommentCard({
  comment: c,
  people,
  role,
  me,
  active,
  onActive,
  onResolve,
  resolved = false,
}: {
  comment: PinnedComment;
  people: ReadonlyMap<string, Person>;
  role: Role;
  me: string;
  active: boolean;
  onActive: (id: string | null) => void;
  onResolve?: () => void;
  resolved?: boolean;
}) {
  const author = people.get(c.authorId);
  return (
    <article
      onMouseEnter={() => onActive(c.id)}
      onMouseLeave={() => onActive(null)}
      className={`grid gap-2.5 rounded-[1.125rem] p-3.5 transition-colors duration-300 ${active ? "bg-signal-50" : resolved ? "bg-white" : "bg-ink-950/[0.03]"}`}
    >
      <header className="flex items-center gap-2.5">
        {c.number ? (
          <span
            className={`grid size-[1.375rem] shrink-0 place-items-center rounded-full rounded-bl-[0.2rem] font-label text-[0.5625rem] ${active ? "bg-alert text-white" : resolved ? "bg-acid-300" : c.visibility === "internal" ? "bg-white ring-1 ring-ink-950/20" : "bg-ink-950 text-white"}`}
          >
            {c.number}
          </span>
        ) : null}
        {author ? <Avatar person={author} size="xs" /> : null}
        <span className="truncate text-[0.8125rem] font-medium tracking-[-0.01em]">{c.authorId === me ? "You" : author?.name}</span>
        <span className={`ml-auto shrink-0 ${LABEL} text-tertiary`}>{when(c.at)}</span>
      </header>
      <p className="text-[0.875rem] leading-[1.55] tracking-[-0.005em]">{c.body}</p>
      {c.replies?.length ? (
        <div className="grid gap-3 border-l border-ink-950/[0.1] pl-3.5">
          {c.replies.map((r) => {
            const by = people.get(r.authorId);
            return (
              <div key={r.id} className="grid gap-1.5">
                <span className="flex items-center gap-2">
                  {by ? <Avatar person={by} size="xs" /> : null}
                  <span className="text-[0.75rem] font-medium">{r.authorId === me ? "You" : by?.name}</span>
                  <span className={`${LABEL} text-tertiary`}>{when(r.at)}</span>
                </span>
                <p className="text-[0.8125rem] leading-[1.5] text-secondary">{r.body}</p>
              </div>
            );
          })}
        </div>
      ) : null}
      {(c.visibility === "internal" && role !== "client") || onResolve ? (
        <footer className="flex items-center justify-between gap-2">
          {c.visibility === "internal" && role !== "client" ? (
            <Chip tone="outline">
              <Lock aria-hidden className="size-3" strokeWidth={1.5} />
              Internal
            </Chip>
          ) : (
            <span />
          )}
          {onResolve ? (
            <button
              type="button"
              onClick={onResolve}
              className={`gs-press inline-flex items-center gap-1.5 rounded-pill px-2.5 py-1.5 ${LABEL} text-tertiary hover:bg-white hover:text-primary`}
            >
              {resolved ? <RotateCcw aria-hidden className="size-3" strokeWidth={1.5} /> : <Check aria-hidden className="size-3" strokeWidth={1.5} />}
              {resolved ? "Reopen" : "Resolve"}
            </button>
          ) : null}
        </footer>
      ) : null}
    </article>
  );
}

function Composer({
  role,
  version,
  draft,
  draftNumber,
  onClearDraft,
  onPost,
  inputRef,
}: {
  role: Role;
  version: number;
  draft: { x: number; y: number } | null;
  draftNumber: number;
  onClearDraft: () => void;
  onPost: (body: string, visibility: "client" | "internal") => void;
  inputRef: Ref<HTMLTextAreaElement>;
}) {
  const [body, setBody] = useState("");
  const [visibility, setVisibility] = useState<"client" | "internal">(role === "contractor" ? "internal" : "client");

  const submit = (event?: FormEvent) => {
    event?.preventDefault();
    if (!body.trim()) return;
    onPost(body.trim(), role === "client" ? "client" : visibility);
    setBody("");
  };

  return (
    <form onSubmit={submit} className="border-t border-ink-950/[0.06] p-3">
      {draft ? (
        <div className="mb-2 flex items-center gap-2 px-1">
          <Chip tone="signal">Pin {draftNumber}</Chip>
          <button type="button" onClick={onClearDraft} className={`${LABEL} text-tertiary transition-colors hover:text-primary`}>
            Remove pin
          </button>
        </div>
      ) : null}
      <div className="rounded-[1.25rem] bg-ink-950/[0.035] p-1.5 transition-shadow focus-within:bg-white focus-within:shadow-[0_0_0_1px_rgb(14_13_11/0.12)]">
        <label htmlFor="review-comment" className="sr-only">
          Comment
        </label>
        <textarea
          id="review-comment"
          ref={inputRef}
          rows={2}
          value={body}
          onChange={(e) => setBody(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) submit();
          }}
          placeholder={draft ? "What about this spot?" : `Comment on v${pad(version)}, or click the work to pin one`}
          className="block w-full resize-none bg-transparent px-3 py-2 text-[0.875rem] leading-[1.5] outline-none placeholder:text-ink-400"
        />
        <div className="flex items-center justify-between gap-2 pr-0.5 pl-1.5">
          {role === "studio" ? (
            <div role="group" aria-label="Who sees this" className="flex gap-1">
              {(["client", "internal"] as const).map((v) => (
                <button
                  key={v}
                  type="button"
                  aria-pressed={visibility === v}
                  onClick={() => setVisibility(v)}
                  className={`gs-press inline-flex h-7 items-center gap-1.5 rounded-pill px-2.5 ${LABEL} ${visibility === v ? "gs-ink" : "text-tertiary hover:text-primary"}`}
                >
                  {v === "internal" ? <Lock aria-hidden className="size-3" strokeWidth={1.5} /> : null}
                  {v === "client" ? "Client sees" : "Internal"}
                </button>
              ))}
            </div>
          ) : (
            <span className={`${LABEL} text-tertiary`}>{role === "client" ? "The studio sees this" : "Internal · studio only"}</span>
          )}
          <IconButton label="Post comment" active size="sm" onClick={() => submit()}>
            <ArrowUp aria-hidden className="size-4" strokeWidth={1.75} />
          </IconButton>
        </div>
      </div>
    </form>
  );
}

/** Each version, when it went to the client, and every decision on it. */
function History({
  versions,
  decisions,
  people,
  role,
  org,
}: {
  versions: readonly Version[];
  decisions: readonly Decision[];
  people: ReadonlyMap<string, Person>;
  role: Role;
  org: string;
}) {
  const name = (id: string) => people.get(id)?.name.split(" ")[0] ?? "Someone";
  const events = versions.flatMap((v) => {
    const list: { at: string; text: string; quote?: string; tone: "quiet" | "acid" | "signal" | "ink" }[] = [
      { at: v.createdAt, text: `v${pad(v.number)} uploaded by ${name(v.createdBy)}`, quote: v.note, tone: "quiet" },
    ];
    if (v.sharedAt) list.push({ at: v.sharedAt, text: role === "client" ? `v${pad(v.number)} sent to you` : `v${pad(v.number)} sent to ${org}`, tone: "ink" });
    for (const d of decisions.filter((d) => v.decisions.some((x) => x.id === d.id) || d.id.startsWith(`local-${v.id}`))) {
      const who = name(d.reviewerId);
      const what =
        d.decision === "approved"
          ? d.stage === "internal" ? `${who} approved it for the client` : `${who} approved v${pad(v.number)}`
          : d.decision === "rejected" ? `${who} rejected v${pad(v.number)}` : `${who} asked for changes`;
      list.push({ at: d.at, text: what, quote: d.reason, tone: d.decision === "approved" ? "acid" : d.decision === "rejected" ? "ink" : "signal" });
    }
    return list;
  });
  events.sort((a, b) => b.at.localeCompare(a.at));
  const dots = { quiet: "bg-ink-300", acid: "bg-acid-400", signal: "bg-alert", ink: "bg-ink-950" };

  return (
    <ol className="grid">
      {events.map((e, n) => (
        <li key={n} className="relative grid grid-cols-[1rem_1fr] gap-3 pb-5">
          {n < events.length - 1 ? <span aria-hidden className="absolute top-4 bottom-0 left-[0.3125rem] w-px bg-edge-subtle" /> : null}
          <span aria-hidden className={`mt-1.5 size-2.5 rounded-full ${dots[e.tone]}`} />
          <div className="grid gap-1.5">
            <p className="text-[0.8125rem] font-medium tracking-[-0.01em]">{e.text}</p>
            {e.quote ? <p className="text-[0.8125rem] leading-[1.5] text-secondary">&ldquo;{e.quote}&rdquo;</p> : null}
            <p className={`${LABEL} text-tertiary`}>{day(e.at)}</p>
          </div>
        </li>
      ))}
    </ol>
  );
}

function Details({ props, version, people }: { props: ReviewProps; version: Version; people: ReadonlyMap<string, Person> }) {
  const { item, milestone } = props;
  const rows: [string, string][] = [
    ["Milestone", milestone ? `${pad(milestone.position)} ${milestone.title}` : "None"],
    ["Submitted by", people.get(item.submittedBy)?.name ?? ""],
    ["Due", item.dueOn ? day(item.dueOn) : "No date"],
  ];
  return (
    <div className="grid gap-6">
      <p className="text-[0.8125rem] leading-[1.55] text-secondary">{item.summary}</p>
      <dl className="grid">
        {rows.map(([k, v]) => (
          <div key={k} className="flex justify-between gap-4 border-b border-ink-950/[0.06] py-3">
            <dt className={`${LABEL} text-tertiary`}>{k}</dt>
            <dd className="text-right text-[0.8125rem]">{v}</dd>
          </div>
        ))}
      </dl>
      <div className="grid gap-2">
        <p className={`${LABEL} text-tertiary`}>Note on v{pad(version.number)}</p>
        <p className="text-[0.8125rem] leading-[1.55]">{version.note}</p>
      </div>
      <div className="grid gap-2">
        <p className={`${LABEL} text-tertiary`}>Files</p>
        <ul className="grid gap-1.5">
          {version.files.map((f) => (
            <li key={f.id}>
              <a href={f.src} download={f.name} className="flex items-center justify-between gap-3 rounded-[0.875rem] bg-ink-950/[0.035] px-4 py-3 text-[0.8125rem] transition-colors hover:bg-ink-950/[0.06]">
                <span className="truncate">{f.name}</span>
                <span className={`${LABEL} text-tertiary`}>{bytes(f.size)}</span>
              </a>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
