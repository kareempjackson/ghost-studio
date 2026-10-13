"use client";

import { Upload } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { TODAY, pad } from "@/lib/portal/format";
import type { Comment, Decision, Stage as StageName } from "@/lib/portal/types";
import { Sheet } from "../Sheet";
import { LABEL, Pill } from "../ui";
import { CommentRail, type Tab } from "./CommentRail";
import { DecisionBar } from "./DecisionBar";
import { Stage } from "./Stage";
import type { PinnedComment, ReviewProps } from "./types";

/**
 * The review screen: the work on the left with its decision under it, and
 * the conversation about it on the right.
 *
 * Everything that changes here is held in this component for the prototype
 * — a new comment, a resolved one, a decision — and is gone on reload. With
 * the backend each of these becomes a server action.
 */
export function ReviewWorkspace(props: ReviewProps) {
  const { item, viewer, people: peopleList } = props;
  const people = useMemo(() => new Map(peopleList.map((p) => [p.id, p])), [peopleList]);
  const versions = item.versions;
  const latest = versions[versions.length - 1];

  const [versionIndex, setVersionIndex] = useState(versions.length - 1);
  const [fileIndex, setFileIndex] = useState(0);
  const [stage, setStage] = useState<StageName>(item.stage);
  const [history, setHistory] = useState<StageName[]>([]);
  const [added, setAdded] = useState<Record<string, Comment[]>>({});
  const [decisions, setDecisions] = useState<(Decision & { versionId: string })[]>([]);
  const [resolved, setResolved] = useState<Set<string>>(
    () => new Set(versions.flatMap((v) => v.comments.filter((c) => c.resolved).map((c) => c.id))),
  );
  const [draft, setDraft] = useState<{ x: number; y: number } | null>(null);
  const [active, setActive] = useState<string | null>(null);
  const [zoom, setZoom] = useState(1);
  const [compare, setCompare] = useState(false);
  const [tab, setTab] = useState<Tab>("comments");
  const [sheet, setSheet] = useState<null | "changes" | "reject" | "upload">(null);
  const [reason, setReason] = useState("");
  const [toast, setToast] = useState("");
  const composer = useRef<HTMLTextAreaElement>(null);

  const version = versions[versionIndex];
  const file = version.files[Math.min(fileIndex, version.files.length - 1)];
  const isLatest = version.id === latest.id;
  const canComment = stage !== "rejected" && (viewer.role !== "client" || Boolean(version.sharedAt));
  const [pinMode, setPinMode] = useState(canComment && isLatest);

  /* Pins are numbered in the order they were left, per version and per file. */
  const comments: PinnedComment[] = useMemo(() => {
    const all = [...version.comments, ...(added[version.id] ?? [])].sort((a, b) => a.at.localeCompare(b.at));
    let n = 0;
    return all.map((c) => ({ ...c, resolved: resolved.has(c.id), number: c.pin ? ++n : undefined }));
  }, [version, added, resolved]);

  const allDecisions = useMemo(
    () => [...versions.flatMap((v) => v.decisions), ...decisions],
    [versions, decisions],
  );
  const lastOnLatest = [...latest.decisions, ...decisions.filter((d) => d.versionId === latest.id)]
    .filter((d) => (stage === "internal_changes" ? d.stage === "internal" : true))
    .sort((a, b) => a.at.localeCompare(b.at))
    .at(-1);

  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => setToast(""), 3600);
    return () => clearTimeout(timer);
  }, [toast]);

  const name = (id: string) => people.get(id)?.name.split(" ")[0] ?? "Someone";
  const now = () => new Date(Date.parse(TODAY) + (performance.now() | 0)).toISOString();

  const decide = (next: StageName, decision: Decision["decision"], note?: string) => {
    setHistory((h) => [...h, stage]);
    setStage(next);
    setDecisions((d) => [
      ...d,
      {
        id: `local-${latest.id}-${d.length}`,
        versionId: latest.id,
        reviewerId: viewer.personId,
        stage: viewer.role === "client" ? "client" : "internal",
        decision,
        reason: note,
        at: now(),
      },
    ]);
  };

  const undo = () => {
    setStage(history.at(-1) ?? item.stage);
    setHistory((h) => h.slice(0, -1));
    setDecisions((d) => d.slice(0, -1));
  };

  const post = (body: string, visibility: "client" | "internal") => {
    const comment: Comment = {
      id: `local-c-${Date.now()}`,
      authorId: viewer.personId,
      body,
      at: now(),
      visibility,
      pin: draft ?? undefined,
    };
    setAdded((a) => ({ ...a, [version.id]: [...(a[version.id] ?? []), comment] }));
    setDraft(null);
  };

  const dropPin = (pin: { x: number; y: number }) => {
    setDraft(pin);
    setTab("comments");
    requestAnimationFrame(() => composer.current?.focus());
  };

  const submitSheet = () => {
    if (sheet === "changes") {
      decide(viewer.role === "client" ? "changes_requested" : "internal_changes", "changes_requested", reason.trim() || undefined);
      setToast(viewer.role === "client" ? "Sent to the studio, with your comments." : `Sent back to ${name(item.submittedBy)}.`);
    } else if (sheet === "reject") {
      if (!reason.trim()) return;
      decide("rejected", "rejected", reason.trim());
      setToast("Rejected. The studio has your reason.");
    } else if (sheet === "upload") {
      setToast(`v${pad(latest.number + 1)} uploaded. (Prototype: files aren't kept yet.)`);
    }
    setSheet(null);
    setReason("");
  };

  const openPins = comments.filter((c) => c.pin && !c.resolved && c.visibility === "client").length;
  const reviewer = lastOnLatest ? { ...lastOnLatest, reviewer: name(lastOnLatest.reviewerId) } : undefined;

  return (
    <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_23rem] lg:gap-5 xl:grid-cols-[minmax(0,1fr)_25rem]">
      <div className="grid min-w-0 content-start gap-4 lg:gap-5">
        <Stage
          props={props}
          stage={stage}
          versions={versions}
          version={version}
          onVersion={(n) => {
            setVersionIndex(n);
            setFileIndex(0);
            setDraft(null);
            setCompare(false);
          }}
          file={file}
          onFile={setFileIndex}
          comments={comments}
          draft={draft}
          onDraft={dropPin}
          active={active}
          onActive={setActive}
          zoom={zoom}
          onZoom={setZoom}
          pinMode={pinMode}
          onPinMode={setPinMode}
          compare={compare}
          onCompare={setCompare}
          canPin={canComment}
          people={people}
        />
        <DecisionBar
          role={viewer.role}
          mine={item.submittedBy === viewer.personId}
          stage={stage}
          version={version}
          latest={latest}
          title={item.title}
          submitter={name(item.submittedBy)}
          clientName={props.clientName}
          lastDecision={reviewer}
          canUndo={decisions.length > 0}
          onApprove={() => {
            decide("approved", "approved");
            setToast("Approved. The studio has been told.");
          }}
          onChanges={() => setSheet("changes")}
          onReject={() => setSheet("reject")}
          onSend={() => {
            decide("client_review", "approved");
            setToast(`Sent to ${props.clientName}. They'll get an email with a link.`);
          }}
          onNudge={() => setToast(`Reminder sent to ${props.clientName}.`)}
          onUpload={() => setSheet("upload")}
          onLatest={() => setVersionIndex(versions.length - 1)}
          onUndo={undo}
        />
      </div>

      <CommentRail
        props={props}
        version={version}
        versions={versions}
        comments={comments}
        decisions={allDecisions}
        people={people}
        active={active}
        onActive={setActive}
        resolved={resolved}
        onResolve={(id) =>
          setResolved((r) => {
            const next = new Set(r);
            if (next.has(id)) next.delete(id);
            else next.add(id);
            return next;
          })
        }
        draft={draft}
        draftNumber={comments.filter((c) => c.pin).length + 1}
        onClearDraft={() => setDraft(null)}
        onPost={post}
        canComment={canComment}
        tab={tab}
        onTab={setTab}
        composerRef={composer}
      />

      <Sheet
        open={sheet !== null}
        onClose={() => {
          setSheet(null);
          setReason("");
        }}
        eyebrow={`${item.title} · v${pad(latest.number)}`}
        title={sheet === "reject" ? "Reject this version" : sheet === "upload" ? `Upload v${pad(latest.number + 1)}` : "Request changes"}
        footer={
          <>
            <Pill tone="ghost" onClick={() => setSheet(null)}>
              Cancel
            </Pill>
            <Pill tone={sheet === "reject" ? "alert" : "ink"} onClick={submitSheet} disabled={sheet === "reject" && !reason.trim()}>
              {sheet === "reject" ? `Reject v${pad(latest.number)}` : sheet === "upload" ? "Upload" : viewer.role === "client" ? "Send to the studio" : `Send to ${name(item.submittedBy)}`}
            </Pill>
          </>
        }
      >
        {sheet === "upload" ? (
          <div className="grid gap-4">
            <label className="grid cursor-pointer place-items-center gap-3 rounded-[1.25rem] border border-dashed border-ink-950/15 bg-ink-950/[0.02] px-6 py-12 text-center transition-colors hover:bg-ink-950/[0.04]">
              <span className="gs-card grid size-11 place-items-center rounded-full">
                <Upload aria-hidden className="size-5" strokeWidth={1.5} />
              </span>
              <span className="text-[0.875rem] font-medium tracking-[-0.01em]">Drop files here, or browse</span>
              <span className={`${LABEL} text-tertiary`}>Images, video, PDF · up to 1 GB each</span>
              <input type="file" multiple className="sr-only" />
            </label>
            <Field label="Note for this version" value={reason} onChange={setReason} placeholder="What changed, and what to look at." />
          </div>
        ) : (
          <div className="grid gap-4">
            {sheet === "reject" ? (
              <p className="rounded-[1rem] bg-signal-50 p-4 text-[0.8125rem] leading-[1.5] text-signal-800">
                Rejecting closes this piece of work. If you&rsquo;d like the studio to keep going, request changes instead.
              </p>
            ) : openPins ? (
              <p className="rounded-[1rem] bg-ink-950/[0.035] p-4 text-[0.8125rem] leading-[1.5]">
                Your {openPins} pinned {openPins === 1 ? "comment goes" : "comments go"} with this.
              </p>
            ) : null}
            <Field
              label={sheet === "reject" ? "Why are you rejecting it?" : "What should change?"}
              value={reason}
              onChange={setReason}
              placeholder={sheet === "reject" ? "A sentence is plenty." : "Anything the pins don't already say."}
              required={sheet === "reject"}
            />
          </div>
        )}
      </Sheet>

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

function Field({
  label,
  value,
  onChange,
  placeholder,
  required,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  required?: boolean;
}) {
  return (
    <label className="grid gap-2">
      <span className={`${LABEL} text-tertiary`}>
        {label}
        {required ? " *" : ""}
      </span>
      <textarea
        rows={5}
        value={value}
        required={required}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="resize-none rounded-[1.125rem] bg-ink-950/[0.035] px-4 py-3 text-[0.875rem] leading-[1.5] outline-none transition-shadow placeholder:text-ink-400 focus-visible:bg-white focus-visible:shadow-[0_0_0_1px_rgb(14_13_11/0.14)]"
      />
    </label>
  );
}
