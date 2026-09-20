"use client";

import { useId, useState, type FormEvent } from "react";
import { contact } from "@/lib/contact";
import { email } from "@/lib/footer";

const { form } = contact;

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
 * The letter, as the visitor would have written it themselves.
 *
 * Empty lines are dropped rather than sent as blank headings: a draft that
 * opens with three unanswered labels reads as a form, and the point of
 * handing it over as mail is that it reads as a letter.
 */
function draft(state: {
  name: string;
  from: string;
  company: string;
  help: readonly string[];
  brief: string;
  budget: string;
  timing: string;
}) {
  const lines: string[] = [];
  if (state.brief) lines.push(state.brief, "");
  if (state.help.length) lines.push(`Help with: ${state.help.join(", ")}`);
  if (state.budget) lines.push(`Budget: ${state.budget}`);
  if (state.timing) lines.push(`Timing: ${state.timing}`);
  if (state.company) lines.push(`Company: ${state.company}`);
  if (state.name || state.from) {
    lines.push("", [state.name, state.from].filter(Boolean).join(" — "));
  }

  const subject = state.name ? `A project — ${state.name}` : "A project";
  return `mailto:${email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(
    lines.join("\n"),
  )}`;
}

/**
 * The form on `/contact`.
 *
 * It composes what was typed into a draft and hands it to the visitor's own
 * mail app; nothing is posted, and the note under the button says so. When an
 * inbox is connected, `onSubmit` is the one thing that changes — every field
 * here is already named for the record it would post.
 *
 * The draft is opened by setting `location.href` rather than by making the
 * button a link, because the link's `href` would otherwise be stale by
 * exactly one keystroke.
 */
export function ContactForm() {
  const id = useId();
  const [name, setName] = useState("");
  const [from, setFrom] = useState("");
  const [company, setCompany] = useState("");
  const [help, setHelp] = useState<readonly string[]>([]);
  const [brief, setBrief] = useState("");
  const [budget, setBudget] = useState("");
  const [timing, setTiming] = useState("");
  const [handed, setHanded] = useState(false);

  const toggle = (option: string) =>
    setHelp((current) =>
      current.includes(option)
        ? current.filter((one) => one !== option)
        : [...current, option],
    );

  function onSubmit(event: FormEvent) {
    event.preventDefault();
    window.location.href = draft({
      name,
      from,
      company,
      help,
      brief,
      budget,
      timing,
    });
    setHanded(true);
  }

  return (
    <form
      onSubmit={onSubmit}
      aria-labelledby={`${id}-heading`}
      className="rounded-[1rem] bg-surface-subtle p-6 sm:p-8 lg:p-10"
    >
      <p className="font-mono text-[0.6875rem] leading-none tracking-[0.06em] text-ink-500 uppercase">
        {form.label}
      </p>
      <h2
        id={`${id}-heading`}
        className="mt-6 text-[1.5rem] leading-[1.15] font-normal tracking-[-0.03em] text-ink-950 lg:text-[1.75rem]"
      >
        {form.heading}
      </h2>

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
        className="gs-pill gs-pill-signal group relative mt-8 inline-flex h-11 items-center rounded-pill font-mono text-[0.8125rem] leading-none tracking-[0.08em] uppercase transition-colors duration-300"
      >
        <span className="block pr-12 pl-5 transition-[padding] duration-400 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:pr-5 group-hover:pl-12">
          {form.action}
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

      <p
        aria-live="polite"
        className="mt-6 text-[0.8125rem] leading-[1.5] text-ink-500"
      >
        {handed ? `${form.handed} ${form.again}` : form.note}
      </p>
    </form>
  );
}
