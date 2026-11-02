"use client";

import { useId, useState, type FormEvent } from "react";
import { MAX_QUESTION, type MatchReply } from "@/lib/guide/protocol";
import { track } from "@/lib/track";
import { noteInterest } from "@/lib/visitor";
import type { Describe as Words } from "@/sanity/types";
import { guide } from "./guide/store";
import { ArrowPill } from "./ArrowPill";
import { showMatched, useMatched } from "./moment";
import { MONO } from "./SectionHead";

type Status = "idle" | "working" | "found" | "busy" | "limit" | "error";

/* As the newsletter's small print links: quiet, underlined, ink on hover. */
const QUIET =
  "text-ink-950 underline decoration-ink-300 underline-offset-[3px] transition-colors duration-200 hover:text-accent hover:decoration-current focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink-950";

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
    /* Set as the head of a band: its name in the margin, the field from
       three-eighths across, where every band's heading starts (SectionHead). */
    <div className="mt-20 grid gap-y-6 lg:mt-28 lg:grid-cols-[minmax(0,3fr)_minmax(0,5fr)] lg:gap-x-8">
      <label id={`${id}-label`} htmlFor={`${id}-input`} className={`${MONO} text-ink-500 lg:pt-[1.3rem]`}>
        {describe.label}
      </label>
      <div>
        {/* The newsletter's field on the paper ground: one pill holding the
            words and the control. On a phone the control drops under it. */}
        <form
          onSubmit={onSubmit}
          role="search"
          aria-labelledby={`${id}-label`}
          className="flex flex-col items-start gap-3 sm:h-14 sm:flex-row sm:items-center sm:rounded-pill sm:border sm:border-ink-200 sm:pr-2 sm:pl-6 sm:transition-colors sm:duration-300 sm:focus-within:border-ink-950 sm:hover:border-ink-400 sm:focus-within:hover:border-ink-950"
        >
          <input
            id={`${id}-input`}
            value={text}
            onChange={(event) => setText(event.target.value)}
            maxLength={MAX_QUESTION}
            autoComplete="off"
            placeholder={describe.placeholder}
            className="h-14 w-full min-w-0 shrink-0 rounded-pill border border-ink-200 bg-transparent px-6 text-[1rem] leading-none tracking-[-0.01em] text-ink-950 caret-[#eb5b32] outline-none transition-colors duration-300 placeholder:text-ink-500 focus:border-ink-950 sm:h-auto sm:flex-1 sm:shrink sm:rounded-none sm:border-0 sm:px-0 lg:text-[1.0625rem]"
          />
          <ArrowPill submit size="sm" disabled={status === "working"} className="inline-flex shrink-0">
            {describe.submit}
          </ArrowPill>
        </form>

        <div aria-live="polite" className="mt-4 min-h-[1.25rem] text-[0.8125rem] leading-[1.55] text-ink-600 sm:pl-6">
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
    </div>
  );
}
