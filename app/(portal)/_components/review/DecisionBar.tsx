"use client";

import { Bell, Check, RotateCcw, Send, Upload } from "lucide-react";
import type { ReactNode } from "react";
import { day, pad } from "@/lib/portal/format";
import type { Decision, Role, Stage, Version } from "@/lib/portal/types";
import { LABEL, PILL } from "../ui";

const ON_INK = {
  ghost: `${PILL} text-white/70 hover:bg-white/10 hover:text-white`,
  soft: `${PILL} bg-white/10 text-white ring-1 ring-inset ring-white/10 hover:bg-white/16`,
  acid: `${PILL} bg-acid-300 text-ink-950 hover:bg-acid-200`,
};
const ON_LIGHT = {
  ink: `${PILL} bg-ink-950 text-white hover:bg-ink-800`,
  white: `${PILL} bg-white text-primary hover:bg-ink-100`,
  canvas: `${PILL} bg-canvas text-primary hover:bg-canvas-deep`,
  ghost: `${PILL} text-secondary hover:bg-black/5 hover:text-primary`,
};

const TONES = {
  ink: "bg-ink-950 text-white",
  acid: "bg-acid-100 text-ink-950 ring-1 ring-inset ring-acid-300/70",
  white: "gs-card",
  signal: "bg-signal-50 ring-1 ring-inset ring-signal-100",
};

/**
 * What happens next to this piece of work, and the buttons that make it
 * happen — different for each person and each stage.
 *
 * When the decision is the viewer's, the bar turns black and the choice is
 * laid out in order of weight: reject (quiet), request changes, approve (in
 * acid, the colour the portal gives to "done"). Once made, the bar takes the
 * colour of the outcome.
 */
export function DecisionBar({
  role,
  mine,
  stage,
  version,
  latest,
  title,
  submitter,
  clientName,
  lastDecision,
  canUndo,
  onApprove,
  onChanges,
  onReject,
  onSend,
  onNudge,
  onUpload,
  onLatest,
  onUndo,
}: {
  role: Role;
  /** The viewer submitted this work. */
  mine: boolean;
  stage: Stage;
  version: Version;
  latest: Version;
  title: string;
  submitter: string;
  clientName: string;
  lastDecision?: Decision & { reviewer: string };
  canUndo: boolean;
  onApprove: () => void;
  onChanges: () => void;
  onReject: () => void;
  onSend: () => void;
  onNudge: () => void;
  onUpload: () => void;
  onLatest: () => void;
  onUndo: () => void;
}) {
  const v = `v${pad(latest.number)}`;
  const next = `v${pad(latest.number + 1)}`;
  const reason = lastDecision?.reason ? `“${lastDecision.reason}”` : "";

  let bar: { tone: keyof typeof TONES; eyebrow: string; message: ReactNode; actions?: ReactNode };

  if (version.id !== latest.id) {
    bar = {
      tone: "white",
      eyebrow: "An earlier version",
      message: `You're looking at v${pad(version.number)}. Decisions are made on ${v}.`,
      actions: (
        <button type="button" onClick={onLatest} className={ON_LIGHT.ink}>
          Go to {v}
        </button>
      ),
    };
  } else if (stage === "approved") {
    bar = {
      tone: "acid",
      eyebrow: "Approved",
      message:
        role === "client"
          ? `You approved ${v}${lastDecision ? ` on ${day(lastDecision.at)}` : ""}. The studio has it from here.`
          : `${lastDecision?.reviewer ?? clientName} approved ${v}${lastDecision ? ` on ${day(lastDecision.at)}` : ""}.`,
      actions: canUndo ? (
        <button type="button" onClick={onUndo} className={ON_LIGHT.ghost}>
          <RotateCcw aria-hidden className="size-4" strokeWidth={1.5} />
          Undo
        </button>
      ) : undefined,
    };
  } else if (stage === "rejected") {
    bar = {
      tone: "ink",
      eyebrow: "Rejected",
      message: `${role === "client" ? "You" : (lastDecision?.reviewer ?? clientName)} rejected ${v}. ${reason}`,
      actions: canUndo ? (
        <button type="button" onClick={onUndo} className={ON_INK.ghost}>
          <RotateCcw aria-hidden className="size-4" strokeWidth={1.5} />
          Undo
        </button>
      ) : undefined,
    };
  } else if (role === "client") {
    bar =
      stage === "client_review"
        ? {
            tone: "ink",
            eyebrow: "Your decision",
            message: `${title} ${v} is ready for you.`,
            actions: (
              <>
                <button type="button" onClick={onReject} className={ON_INK.ghost}>
                  Reject
                </button>
                <button type="button" onClick={onChanges} className={ON_INK.soft}>
                  Request changes
                </button>
                <button type="button" onClick={onApprove} className={ON_INK.acid}>
                  <Check aria-hidden className="size-4" strokeWidth={2} />
                  Approve {v}
                </button>
              </>
            ),
          }
        : {
            tone: "signal",
            eyebrow: "Changes requested",
            message: `You asked for changes${lastDecision ? ` on ${day(lastDecision.at)}` : ""}${reason ? `: ${reason}` : "."} The studio is on ${next}.`,
            actions: canUndo ? (
              <button type="button" onClick={onUndo} className={ON_LIGHT.ghost}>
                <RotateCcw aria-hidden className="size-4" strokeWidth={1.5} />
                Undo
              </button>
            ) : undefined,
          };
  } else if (stage === "internal_review") {
    bar =
      role === "studio"
        ? {
            tone: "ink",
            eyebrow: "Studio review",
            message: `${submitter} sent ${v} for review. The client hasn't seen it.`,
            actions: (
              <>
                <button type="button" onClick={onChanges} className={ON_INK.soft}>
                  Request changes
                </button>
                <button type="button" onClick={onSend} className={ON_INK.acid}>
                  <Send aria-hidden className="size-4" strokeWidth={1.5} />
                  Send to {clientName}
                </button>
              </>
            ),
          }
        : { tone: "white", eyebrow: "In studio review", message: `The studio is reviewing ${v}. You'll hear here first.` };
  } else if (stage === "internal_changes") {
    bar =
      role === "contractor" && mine
        ? {
            tone: "signal",
            eyebrow: "Changes for you",
            message: `${lastDecision?.reviewer ?? "The studio"} asked for changes${reason ? `: ${reason}` : "."}`,
            actions: (
              <button type="button" onClick={onUpload} className={ON_LIGHT.ink}>
                <Upload aria-hidden className="size-4" strokeWidth={1.5} />
                Upload {next}
              </button>
            ),
          }
        : { tone: "white", eyebrow: "Revising", message: `Waiting on ${submitter}'s ${next}.` };
  } else if (stage === "client_review") {
    bar = {
      tone: "white",
      eyebrow: "With the client",
      message: `With ${clientName}${latest.sharedAt ? ` since ${day(latest.sharedAt)}` : ""}.`,
      actions:
        role === "studio" ? (
          <button type="button" onClick={onNudge} className={ON_LIGHT.canvas}>
            <Bell aria-hidden className="size-4" strokeWidth={1.5} />
            Send a reminder
          </button>
        ) : undefined,
    };
  } else {
    bar = {
      tone: "signal",
      eyebrow: "Changes requested",
      message: `${lastDecision?.reviewer ?? clientName} asked for changes${reason ? `: ${reason}` : "."}`,
      actions:
        role === "studio" ? (
          <button type="button" onClick={onUpload} className={ON_LIGHT.ink}>
            <Upload aria-hidden className="size-4" strokeWidth={1.5} />
            Upload {next}
          </button>
        ) : undefined,
    };
  }

  return (
    <section
      aria-label="Decision"
      className={`gs-rise flex flex-col gap-4 rounded-[1.75rem] p-5 transition-colors duration-500 [--i:2] sm:flex-row sm:items-center sm:justify-between sm:px-6 ${TONES[bar.tone]}`}
    >
      <div className="grid gap-1.5" aria-live="polite">
        <p className={`${LABEL} ${bar.tone === "ink" ? "text-white/55" : "text-ink-600"}`}>{bar.eyebrow}</p>
        <p className="max-w-[52ch] text-[0.9375rem] leading-[1.4] font-medium tracking-[-0.015em]">{bar.message}</p>
      </div>
      {bar.actions ? <div className="flex flex-wrap items-center gap-2">{bar.actions}</div> : null}
    </section>
  );
}
