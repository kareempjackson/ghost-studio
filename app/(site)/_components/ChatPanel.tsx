"use client";

import { stegaClean } from "next-sanity";
import { useId, useRef, useState, type FormEvent } from "react";
import { useChrome } from "./ChromeProvider";
import { Rich } from "./Rich";

const FIELD =
  "w-full rounded-[0.625rem] bg-ink-200/70 px-4 py-3 text-[0.9375rem] leading-[1.4] tracking-[-0.01em] text-ink-950 placeholder:text-ink-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink-950";
const LABEL = "block text-[0.875rem] leading-none text-ink-950";

/** The draft, as a letter the visitor can send themselves. */
function mailtoHref(
  email: string,
  topic: string,
  name: string,
  message: string,
) {
  const subject = `${stegaClean(topic)}${name ? ` — ${name}` : ""}`;
  return `mailto:${email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(message)}`;
}

/**
 * The chat window: a header, an opening line, and the three things the studio
 * needs to answer anyone — what it is about, who is asking, and what they
 * want.
 *
 * Nothing is wired to a chat service or an inbox, so the form does not
 * pretend to send. It composes what was typed and hands it back as an email
 * the visitor sends themselves, and it says so in as many words. When a
 * service is connected, `onSubmit` is the one thing that changes.
 */
export function ChatPanel({ onClose }: { onClose: () => void }) {
  const {
    settings: { email },
    chat,
  } = useChrome();
  const [topic, setTopic] = useState<string>(chat.topics[0] ?? "");
  const [name, setName] = useState("");
  const [message, setMessage] = useState("");
  const [sent, setSent] = useState(false);
  const firstFieldRef = useRef<HTMLInputElement>(null);
  const id = useId();

  function onSubmit(event: FormEvent) {
    event.preventDefault();
    setSent(true);
  }

  return (
    <div className="flex max-h-[min(46rem,calc(100svh-7.5rem))] w-[min(26rem,calc(100vw-2rem))] flex-col overflow-hidden rounded-[1.25rem] bg-[#f3f2f0] shadow-[0_30px_80px_-24px_rgb(14_13_11/0.45)]">
      <header className="flex items-start gap-4 bg-[#111] px-5 pt-5 pb-6 text-white">
        <span
          aria-hidden
          className="grid size-11 shrink-0 place-items-center rounded-full bg-white text-[1.25rem] font-bold text-ink-950"
        >
          G
        </span>
        <div className="flex-1">
          <h2
            id={`${id}-title`}
            className="text-[1.25rem] leading-[1.15] font-medium tracking-[-0.03em]"
          >
            {chat.heading}
          </h2>
          <p className="mt-3 font-label text-[0.625rem] leading-none tracking-[0.06em] text-ink-400 uppercase">
            {chat.status}
          </p>
        </div>
        <button
          type="button"
          onClick={onClose}
          aria-label={chat.closeLabel}
          className="grid size-9 shrink-0 place-items-center rounded-full bg-white/15 text-white transition-colors duration-200 hover:bg-white hover:text-ink-950"
        >
          <svg
            aria-hidden
            viewBox="0 0 16 16"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            className="size-3.5"
          >
            <path d="m4 4 8 8M12 4l-8 8" />
          </svg>
        </button>
      </header>

      <div className="flex-1 overflow-y-auto px-5 py-5">
        <div className="rounded-[0.625rem] bg-ink-200/70 px-4 py-3.5 text-[0.9375rem] leading-[1.45] tracking-[-0.01em] text-ink-950">
          <Rich value={chat.intro} />
        </div>

        {sent ? (
          <div className="mt-6">
            <p className="font-label text-[0.6875rem] leading-none tracking-[0.06em] text-ink-500 uppercase">
              {chat.ready.label}
            </p>
            <dl className="mt-4 space-y-3 text-[0.9375rem] leading-[1.45] text-ink-950">
              <div>
                <dt className="text-ink-500">{chat.ready.about}</dt>
                <dd>{topic}</dd>
              </div>
              {name && (
                <div>
                  <dt className="text-ink-500">{chat.ready.from}</dt>
                  <dd>{name}</dd>
                </div>
              )}
              <div>
                <dt className="text-ink-500">{chat.ready.message}</dt>
                <dd className="whitespace-pre-line">
                  {message || chat.ready.empty}
                </dd>
              </div>
            </dl>
            <a
              href={mailtoHref(email, topic, name, message)}
              className="mt-6 inline-flex h-12 items-center rounded-pill bg-ink-950 px-6 font-label text-[0.75rem] leading-none tracking-[0.08em] text-white uppercase transition-colors duration-200 hover:bg-ink-800"
            >
              {chat.ready.send}
            </a>
            <button
              type="button"
              onClick={() => setSent(false)}
              className="mt-4 block text-[0.875rem] text-ink-600 underline underline-offset-4 hover:text-ink-950"
            >
              {chat.ready.edit}
            </button>
          </div>
        ) : (
          <form onSubmit={onSubmit} className="mt-5">
            <fieldset>
              <legend className="sr-only">{chat.topicsLabel}</legend>
              <div className="flex flex-wrap gap-2">
                {chat.topics.map((option) => {
                  const on = option === topic;
                  return (
                    <button
                      key={option}
                      type="button"
                      onClick={() => setTopic(option)}
                      aria-pressed={on}
                      className={`rounded-pill border px-3.5 py-2 font-label text-[0.625rem] leading-none tracking-[0.06em] uppercase transition-colors duration-200 ${
                        on
                          ? "border-ink-950 bg-ink-950 text-white"
                          : "border-ink-300 text-ink-950 hover:border-ink-950"
                      }`}
                    >
                      {option}
                    </button>
                  );
                })}
              </div>
            </fieldset>

            <div className="mt-5 space-y-4">
              <div className="space-y-2">
                <label className={LABEL} htmlFor={`${id}-name`}>
                  {chat.name.label}
                </label>
                <input
                  ref={firstFieldRef}
                  id={`${id}-name`}
                  name="name"
                  autoComplete="name"
                  placeholder={chat.name.placeholder}
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  className={FIELD}
                />
              </div>

              <div className="space-y-2">
                <label className={LABEL} htmlFor={`${id}-email`}>
                  {chat.email.label}
                </label>
                <input
                  id={`${id}-email`}
                  name="email"
                  type="email"
                  autoComplete="email"
                  placeholder={chat.email.placeholder}
                  className={FIELD}
                />
              </div>

              <div className="space-y-2">
                <label className={LABEL} htmlFor={`${id}-message`}>
                  {chat.message.label}
                </label>
                <textarea
                  id={`${id}-message`}
                  name="message"
                  rows={3}
                  placeholder={chat.message.placeholder}
                  value={message}
                  onChange={(event) => setMessage(event.target.value)}
                  className={`${FIELD} resize-none`}
                />
              </div>
            </div>

            <button
              type="submit"
              className="group mt-6 inline-flex h-12 items-center gap-5 rounded-pill bg-ink-950 pr-1 pl-5 font-label text-[0.75rem] leading-none tracking-[0.08em] text-white uppercase transition-colors duration-200 hover:bg-ink-800"
            >
              {chat.preview}
              <span
                aria-hidden
                className="grid size-10 shrink-0 place-items-center rounded-pill border border-white/40"
              >
                <svg
                  viewBox="0 0 16 16"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.25"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="size-4 transition-transform duration-300 ease-out group-hover:translate-x-0.5"
                >
                  <path d="M3 8h10M9 4l4 4-4 4" />
                </svg>
              </span>
            </button>
          </form>
        )}

        <p className="mt-6 font-label text-[0.625rem] leading-[1.6] tracking-[0.04em] text-ink-600 uppercase">
          {chat.note}
        </p>
        <a
          href={`mailto:${email}`}
          className="mt-2.5 inline-block text-[0.875rem] text-ink-950 underline underline-offset-4 hover:text-ink-600"
        >
          {chat.contact} {email}
        </a>
      </div>
    </div>
  );
}
