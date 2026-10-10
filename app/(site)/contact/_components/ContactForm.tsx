"use client";

import { useEffect, useId, useRef, useState, useTransition, type FormEvent } from "react";
import type { ContactPage } from "@/sanity/types";
import { Rich } from "../../_components/Rich";
import { sendEnquiry } from "../actions";

/**
 * No rule around a field: the white fill is what says where to type, and on
 * a ground this light that is enough. Focus is the one state that still has
 * to be unmissable, so it is a ring rather than a colour change — a keyboard
 * needs to see where it is, and nothing else here moves.
 */
const FIELD =
  "w-full rounded-[0.5rem] border-0 bg-white px-4 py-3.5 text-[0.9375rem] leading-[1.4] tracking-[-0.01em] text-ink-950 transition-colors duration-200 outline-none placeholder:text-ink-400 focus-visible:ring-2 focus-visible:ring-ink-950 focus-visible:ring-offset-2 focus-visible:ring-offset-surface-subtle";
const LABEL = "block text-[0.875rem] leading-none text-ink-950";
const OPTIONAL = "mt-1.5 block text-[0.8125rem] leading-none text-ink-500";

/**
 * The form on `/contact`.
 *
 * It sends the message to the studio: the server action stores it in Sanity
 * as an enquiry and emails the sender a confirmation (see ../actions.ts).
 * Sent, the fields give way to a line saying where the confirmation went;
 * if it could not be sent, what was typed stays, with the studio's address
 * to write to instead.
 *
 * Two quiet guards against bots, both invisible to people: a field only a
 * script would fill, and the time since the form was shown.
 */
export function ContactForm({
  form,
  email,
}: {
  form: ContactPage["form"];
  /** The studio's own inbox: the way in if the form cannot send. */
  email: string;
}) {
  const id = useId();
  const [name, setName] = useState("");
  const [from, setFrom] = useState("");
  const [company, setCompany] = useState("");
  const [help, setHelp] = useState<readonly string[]>([]);
  const [brief, setBrief] = useState("");
  const [budget, setBudget] = useState("");
  const [timing, setTiming] = useState("");
  const [website, setWebsite] = useState("");
  const [status, setStatus] = useState<"idle" | "sent" | "failed">("idle");
  const [sentTo, setSentTo] = useState("");
  const [sending, startSending] = useTransition();
  const startedAt = useRef(0);
  const confirmation = useRef<HTMLParagraphElement>(null);

  /* Set on the client, after the form is shown, not when it was rendered. */
  useEffect(() => {
    startedAt.current = Date.now();
  }, []);

  /* Sent, the confirmation takes the fields' place: put focus on it so a
     screen reader starts there, rather than on a control that has gone. */
  useEffect(() => {
    if (status === "sent") confirmation.current?.focus();
  }, [status]);

  const toggle = (option: string) =>
    setHelp((current) =>
      current.includes(option)
        ? current.filter((one) => one !== option)
        : [...current, option],
    );

  function onSubmit(event: FormEvent) {
    event.preventDefault();
    if (sending) return;
    startSending(async () => {
      const result = await sendEnquiry({
        name,
        email: from,
        company,
        help,
        brief,
        budget,
        timing,
        website,
        startedAt: startedAt.current,
      }).catch(() => ({ ok: false as const }));
      if (!result.ok) {
        setStatus("failed");
        return;
      }
      setSentTo(from);
      setStatus("sent");
      setName("");
      setFrom("");
      setCompany("");
      setHelp([]);
      setBrief("");
      setBudget("");
      setTiming("");
    });
  }

  function another() {
    startedAt.current = Date.now();
    setStatus("idle");
  }

  return (
    <form
      onSubmit={onSubmit}
      aria-labelledby={`${id}-heading`}
      className="relative rounded-[1rem] bg-surface-subtle p-6 sm:p-8 lg:p-10"
    >
      <p className="font-label text-[0.6875rem] leading-none tracking-[0.06em] text-ink-500 uppercase">
        {form.label}
      </p>
      <h2
        id={`${id}-heading`}
        className="mt-6 text-[1.5rem] leading-[1.15] font-normal tracking-[-0.03em] text-ink-950 lg:text-[1.75rem]"
      >
        {form.heading}
      </h2>

      {status === "sent" ? (
        <div className="mt-8">
          <p
            ref={confirmation}
            tabIndex={-1}
            className="max-w-[30rem] text-[1.0625rem] leading-[1.5] tracking-[-0.01em] text-ink-950 outline-none"
          >
            {(form.sent ?? "").replace("{email}", sentTo)}
          </p>
          <button
            type="button"
            onClick={another}
            className="mt-6 text-[0.875rem] text-ink-600 underline underline-offset-4 transition-colors duration-200 hover:text-ink-950"
          >
            {form.another}
          </button>
        </div>
      ) : (
      <>
      {/* Only a bot fills this: it is off the page, out of the tab order and
          hidden from assistive tech. */}
      <div aria-hidden className="absolute -left-[9999px] h-px w-px overflow-hidden">
        <label htmlFor={`${id}-website`}>Website</label>
        <input
          id={`${id}-website`}
          name="website"
          type="text"
          tabIndex={-1}
          autoComplete="off"
          value={website}
          onChange={(event) => setWebsite(event.target.value)}
        />
      </div>

      <div className="mt-8 grid gap-5 sm:grid-cols-2">
        <div>
          <label className={LABEL} htmlFor={`${id}-name`}>
            {form.name.label}
          </label>
          <input
            id={`${id}-name`}
            name="name"
            autoComplete="name"
            required
            placeholder={form.name.placeholder}
            value={name}
            onChange={(event) => setName(event.target.value)}
            className={`${FIELD} mt-3`}
          />
        </div>
        <div>
          <label className={LABEL} htmlFor={`${id}-email`}>
            {form.email.label}
          </label>
          <input
            id={`${id}-email`}
            name="email"
            type="email"
            autoComplete="email"
            required
            placeholder={form.email.placeholder}
            value={from}
            onChange={(event) => setFrom(event.target.value)}
            className={`${FIELD} mt-3`}
          />
        </div>
      </div>

      <div className="mt-5">
        <label className={LABEL} htmlFor={`${id}-company`}>
          {form.company.label}
          <span className={OPTIONAL}>{form.optional}</span>
        </label>
        <input
          id={`${id}-company`}
          name="company"
          autoComplete="organization"
          placeholder={form.company.placeholder}
          value={company}
          onChange={(event) => setCompany(event.target.value)}
          className={`${FIELD} mt-3`}
        />
      </div>

      <fieldset className="mt-6">
        <legend className={LABEL}>{form.help.label}</legend>
        <div className="mt-3 flex flex-wrap gap-2">
          {form.help.options.map((option) => {
            const on = help.includes(option);
            return (
              <button
                key={option}
                type="button"
                onClick={() => toggle(option)}
                aria-pressed={on}
                className={`rounded-pill px-4 py-2.5 text-[0.875rem] leading-none transition-colors duration-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink-950 ${
                  on
                    ? "bg-ink-950 text-white"
                    : "bg-white text-ink-950 hover:bg-ink-100"
                }`}
              >
                {option}
              </button>
            );
          })}
        </div>
      </fieldset>

      <div className="mt-6">
        <label className={LABEL} htmlFor={`${id}-brief`}>
          {form.brief.label}
        </label>
        <textarea
          id={`${id}-brief`}
          name="brief"
          rows={4}
          placeholder={form.brief.placeholder}
          value={brief}
          onChange={(event) => setBrief(event.target.value)}
          className={`${FIELD} mt-3 resize-y`}
        />
      </div>

      <div className="mt-6 grid gap-5 sm:grid-cols-2">
        <div>
          <label className={LABEL} htmlFor={`${id}-budget`}>
            {form.budget.label}
            <span className={OPTIONAL}>{form.optional}</span>
          </label>
          <select
            id={`${id}-budget`}
            name="budget"
            value={budget}
            onChange={(event) => setBudget(event.target.value)}
            className={`${FIELD} mt-3 appearance-none bg-[url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="none" stroke="%230e0d0b" stroke-width="1.4" stroke-linecap="round"><path d="M4 6.5 8 10.5l4-4"/></svg>')] bg-[length:1rem] bg-[right_1rem_center] bg-no-repeat pr-11`}
          >
            <option value="">{form.budget.placeholder}</option>
            {form.budget.options.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className={LABEL} htmlFor={`${id}-timing`}>
            {form.timing.label}
            <span className={OPTIONAL}>{form.optional}</span>
          </label>
          <input
            id={`${id}-timing`}
            name="timing"
            placeholder={form.timing.placeholder}
            value={timing}
            onChange={(event) => setTiming(event.target.value)}
            className={`${FIELD} mt-3`}
          />
        </div>
      </div>

      {/* The pill, as a button: the same shape as every other call on the
          site, but it submits rather than navigates. */}
      <button
        type="submit"
        disabled={sending}
        aria-disabled={sending}
        className="gs-pill gs-pill-signal group relative mt-8 inline-flex h-11 items-center rounded-pill font-label text-[0.8125rem] leading-none tracking-[0.08em] uppercase transition-[colors,opacity] duration-300 disabled:cursor-progress disabled:opacity-70"
      >
        <span className="block pr-12 pl-5 transition-[padding] duration-400 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:pr-5 group-hover:pl-12">
          {sending ? form.sending || form.action : form.action}
        </span>
        <span
          aria-hidden
          className="gs-pill-disc absolute top-1/2 right-1 grid size-9 -translate-y-1/2 place-items-center rounded-pill transition-[right,background-color] duration-400 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:right-[calc(100%-2.5rem)]"
        >
          <svg
            viewBox="0 0 16 16"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.25"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="size-3.5"
          >
            <path d="M3 8h10M9 4l4 4-4 4" />
          </svg>
        </span>
      </button>

      </>
      )}

      <div
        aria-live="polite"
        className={`mt-6 text-[0.8125rem] leading-[1.5] ${status === "failed" ? "text-ink-950" : "text-ink-500"}`}
      >
        {status === "failed" ? (
          <p>{(form.failed ?? "").replace("{email}", email)}</p>
        ) : status === "idle" ? (
          <Rich value={form.note} />
        ) : null}
      </div>
    </form>
  );
}
