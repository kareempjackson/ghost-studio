"use client";

import { useId, useState, type FormEvent } from "react";
import { MAX_QUESTION, type MatchReply } from "@/lib/guide/protocol";
import { track } from "@/lib/track";
import { noteInterest } from "@/lib/visitor";
import type { Describe as Words } from "@/sanity/types";
import { guide } from "./guide/store";
import { ARROW } from "./guide/styles";
import { showMatched, useMatched } from "./moment";

type Status = "idle" | "working" | "found" | "busy" | "limit" | "error";

const QUIET =
  "text-ink-950 underline underline-offset-4 transition-colors duration-200 hover:text-accent focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink-950";

/**
 * Describe your project: one line at the head of Selected work. The visitor
 * says what they are working on, Claude reads the work for the closest
 * (app/api/guide/match), and the grid below leads with it, each card saying
 * why. What they typed goes no further than that one search; what comes
 * back is the work, and which of the site's audiences and needs they seem
 * to be, which the rest of the site then follows (lib/interest.ts). From
 * there the site guide can take it on, with the same words.
 */
export function Describe({ describe }: { describe: Words }) {
  const id = useId();
  const [text, setText] = useState("");
  const [asked, setAsked] = useState("");
  const [status, setStatus] = useState<Status>("idle");
  const matched = useMatched();

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    const question = text.replace(/\s+/g, " ").trim();
    if (!question || status === "working") return;
    setAsked(question);
    setStatus("working");
    track("match_asked", { characters: question.length });
    try {
      const response = await fetch("/api/guide/match", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question }),
      });
      const reply = (await response.json()) as MatchReply;
      if ("error" in reply) {
        setStatus(reply.error === "busy" || reply.error === "limit" ? reply.error : "error");
        return;
      }
      if (reply.audience || reply.need) {
        noteInterest({ from: "box", ...(reply.audience ? { audience: reply.audience } : {}), ...(reply.need ? { need: reply.need } : {}) });
        track("interest_noted", { from: "box", audience: reply.audience ?? "", need: reply.need?.key ?? "" });
      }
      showMatched({ slugs: reply.picks.map((pick) => pick.slug), why: Object.fromEntries(reply.picks.map((pick) => [pick.slug, pick.why])) });
      setStatus(reply.picks.length ? "found" : "error");
    } catch {
      setStatus("error");
    }
  }

  const toGuide = (
    <button type="button" onClick={() => guide.openWith(asked, location.pathname)} className={QUIET}>
      {describe.guide}
    </button>
  );
  const trouble = status === "busy" ? describe.busy : status === "limit" ? describe.limit : status === "error" ? describe.error : null;

  return (
    <div className="mt-14 max-w-[46rem] lg:mt-20">
      <form onSubmit={onSubmit} role="search" aria-labelledby={`${id}-label`}>
        <label
          id={`${id}-label`}
          htmlFor={`${id}-input`}
          className="font-label text-[0.75rem] leading-none tracking-[0.06em] text-primary uppercase"
        >
          {describe.label}
        </label>
        <div className="mt-4 flex items-center gap-3 border-b border-ink-300 pb-3 transition-colors duration-200 focus-within:border-ink-950">
          <input
            id={`${id}-input`}
            value={text}
            onChange={(event) => setText(event.target.value)}
            maxLength={MAX_QUESTION}
            autoComplete="off"
            placeholder={describe.placeholder}
            className="min-w-0 flex-1 bg-transparent text-[1.125rem] leading-[1.3] tracking-[-0.02em] text-ink-950 outline-none placeholder:text-ink-400 lg:text-[1.5rem]"
          />
          <button
            type="submit"
            disabled={status === "working" || !text.trim()}
            aria-label={describe.submit}
            className="grid size-10 shrink-0 place-items-center rounded-pill bg-ink-950 text-white transition-colors duration-200 hover:bg-ink-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink-950 disabled:bg-ink-300 lg:size-11"
          >
            <svg
              aria-hidden
              viewBox="0 0 16 16"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.25"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="size-4"
            >
              <path d={ARROW} />
            </svg>
          </button>
        </div>
      </form>

      <div aria-live="polite" className="mt-4 min-h-[1.5rem] text-[0.9375rem] leading-[1.5] tracking-[-0.01em] text-ink-600">
        {status === "working" && <p className="motion-safe:animate-pulse">{describe.working}</p>}
        {status === "found" && matched && (
          <p className="flex flex-wrap gap-x-5 gap-y-2">
            <span>{describe.result}</span>
            {toGuide}
            <button
              type="button"
              onClick={() => {
                showMatched(null);
                setStatus("idle");
              }}
              className={QUIET}
            >
              {describe.clear}
            </button>
          </p>
        )}
        {trouble && (
          <p className="flex flex-wrap gap-x-5 gap-y-2">
            <span>{trouble}</span>
            {toGuide}
          </p>
        )}
      </div>
    </div>
  );
}
