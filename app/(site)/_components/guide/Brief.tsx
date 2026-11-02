"use client";

import { useEffect, useId, useRef, useState, useTransition, type FormEvent } from "react";
import { readAttribution } from "@/lib/attribution";
import { replayUrl } from "@/lib/track";
import type { Chat, GuideCatalogue } from "@/sanity/types";
import { sendEnquiry } from "../../contact/actions";
import { Rich } from "../Rich";
import { guide, transcriptOf, type GuideState } from "./store";
import { ARROW, FIELD, LABEL, QUIET } from "./styles";

/**
 * The brief: the way from the guide to a person at the studio.
 *
 * What the guide drafted, for the visitor to check, with the name and email
 * the studio needs to answer. It goes through the contact form's own action
 * (../../contact/actions.ts), so it is stored and emailed the same way, with
 * the conversation that led to it. Contact details are asked for here and
 * nowhere else in the panel.
 */
export function Brief({
  chat,
  state,
  catalogue,
  studioEmail,
}: {
  chat: Chat;
  state: GuideState;
  catalogue: GuideCatalogue | null;
  studioEmail: string;
}) {
  const { brief } = chat;
  const id = useId();
  const [name, setName] = useState("");
  const [from, setFrom] = useState("");
  const [company, setCompany] = useState("");
  const [summary, setSummary] = useState(state.draft?.summary ?? "");
  const [website, setWebsite] = useState("");
  const [status, setStatus] = useState<"idle" | "sent" | "failed">("idle");
  const [sentTo, setSentTo] = useState("");
  const [sending, startSending] = useTransition();
  const heading = useRef<HTMLHeadingElement>(null);

  /* Opened, and sent: start a screen reader at the top of what changed. */
  useEffect(() => {
    heading.current?.focus();
  }, [status]);

  function onSubmit(event: FormEvent) {
    event.preventDefault();
    if (sending) return;
    startSending(async () => {
      const result = await sendEnquiry({
        name,
        email: from,
        company,
        help: state.draft?.help ?? [],
        brief: summary,
        budget: "",
        timing: "",
        website,
        /* Counted from when the panel was first opened: the visitor has been here a while. */
        startedAt: state.openedAt,
        source: "guide",
        transcript: transcriptOf(state, catalogue),
        attribution: readAttribution(),
        replayUrl: replayUrl(),
      }).catch(() => ({ ok: false as const }));
      if (!result.ok) {
        setStatus("failed");
        return;
      }
      setSentTo(from);
      setStatus("sent");
      guide.sent();
    });
  }

  const back = (
    <button type="button" onClick={() => guide.show("guide")} className={QUIET}>
      {brief.back}
    </button>
  );

  if (status === "sent") {
    return (
      <div>
        <h3
          ref={heading}
          tabIndex={-1}
          className="text-[1.25rem] leading-[1.2] font-medium tracking-[-0.03em] text-ink-950 outline-none"
        >
          {brief.heading}
        </h3>
        <p className="mt-4 text-[0.9375rem] leading-[1.5] text-ink-950">{brief.sent.replace("{email}", sentTo)}</p>
        <div className="mt-6">{back}</div>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} aria-labelledby={`${id}-heading`}>
      {back}
      <h3
        ref={heading}
        id={`${id}-heading`}
        tabIndex={-1}
        className="mt-5 text-[1.25rem] leading-[1.2] font-medium tracking-[-0.03em] text-ink-950 outline-none"
      >
        {brief.heading}
      </h3>
      <div className="mt-3 text-[0.9375rem] leading-[1.45] tracking-[-0.01em] text-ink-700">
        <Rich value={brief.lead} />
      </div>

      <div className="mt-6 space-y-4">
        <div className="space-y-2">
          <label className={LABEL} htmlFor={`${id}-summary`}>
            {brief.summary.label}
          </label>
          <textarea
            id={`${id}-summary`}
            name="brief"
            rows={5}
            required
            value={summary}
            onChange={(event) => setSummary(event.target.value)}
            placeholder={brief.summary.placeholder}
            className={`${FIELD} resize-none`}
          />
        </div>
        <div className="space-y-2">
          <label className={LABEL} htmlFor={`${id}-name`}>
            {brief.name.label}
          </label>
          <input
            id={`${id}-name`}
            name="name"
            required
            autoComplete="name"
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder={brief.name.placeholder}
            className={FIELD}
          />
        </div>
        <div className="space-y-2">
          <label className={LABEL} htmlFor={`${id}-email`}>
            {brief.email.label}
          </label>
          <input
            id={`${id}-email`}
            name="email"
            type="email"
            required
            autoComplete="email"
            value={from}
            onChange={(event) => setFrom(event.target.value)}
            placeholder={brief.email.placeholder}
            className={FIELD}
          />
        </div>
        <div className="space-y-2">
          <label className={LABEL} htmlFor={`${id}-company`}>
            {brief.company.label} <span className="text-ink-500">{brief.optional}</span>
          </label>
          <input
            id={`${id}-company`}
            name="company"
            autoComplete="organization"
            value={company}
            onChange={(event) => setCompany(event.target.value)}
            placeholder={brief.company.placeholder}
            className={FIELD}
          />
        </div>
        {/* Only a script fills this: hidden from people and from screen readers. */}
        <div aria-hidden className="absolute -left-[9999px] h-px w-px overflow-hidden">
          <label htmlFor={`${id}-website`}>Website</label>
          <input
            id={`${id}-website`}
            name="website"
            tabIndex={-1}
            autoComplete="off"
            value={website}
            onChange={(event) => setWebsite(event.target.value)}
          />
        </div>
      </div>

      {status === "failed" && (
        <p role="alert" className="mt-5 text-[0.875rem] leading-[1.45] text-ink-950">
          {brief.failed.replace("{email}", studioEmail)}
        </p>
      )}

      <button
        type="submit"
        disabled={sending}
        className="group mt-6 inline-flex h-12 items-center gap-5 rounded-pill bg-ink-950 pr-1 pl-5 font-label text-[0.75rem] leading-none tracking-[0.08em] text-white uppercase transition-colors duration-200 hover:bg-ink-800 disabled:bg-ink-600"
      >
        {sending ? brief.sending : brief.send}
        <span aria-hidden className="grid size-10 shrink-0 place-items-center rounded-pill border border-white/40">
          <svg
            viewBox="0 0 16 16"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.25"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="size-4 transition-transform duration-300 ease-out group-hover:translate-x-0.5"
          >
            <path d={ARROW} />
          </svg>
        </span>
      </button>
      <p className="mt-4 font-label text-[0.625rem] leading-[1.6] tracking-[0.04em] text-ink-600 uppercase">
        {brief.note}
      </p>
    </form>
  );
}
