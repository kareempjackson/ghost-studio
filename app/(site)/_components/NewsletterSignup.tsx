"use client";

import { useEffect, useId, useRef, useState, useTransition, type FormEvent } from "react";
import { ArrowPill } from "./ArrowPill";
import { useChrome } from "./ChromeProvider";
import { subscribe } from "./subscribe";

/** Loose on purpose: whether the address is real is the mail server's call. */
const LOOKS_LIKE_EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** Until the Footer says it in its own words. */
const FAILED = "That didn't go through. Try again in a moment.";

/**
 * The newsletter sign-up, in the footer's top-left corner.
 *
 * One field and one control, in the brand's own shapes: the address is typed
 * into a hairline aperture, and the vermilion arrow pill — the site's one
 * call to action on a dark band — sits inside its far end to send it. The
 * outline is the only thing that moves when the field is in use. Under it, the one line of small
 * print a sign-up owes: what the address is for and how to take it back.
 *
 * Sent, the address is kept in the Studio (Newsletter), goes on the studio's
 * list, and its owner gets a welcome (./subscribe.ts). The line under the
 * field says how it went.
 */
export function NewsletterSignup() {
  const {
    footer: { newsletter },
  } = useChrome();
  const id = useId();
  const [value, setValue] = useState("");
  const [website, setWebsite] = useState("");
  const [status, setStatus] = useState<"idle" | "invalid" | "done" | "failed">("idle");
  const [sending, startSending] = useTransition();
  const startedAt = useRef(0);

  /* Set on the client, once the form is shown, not when it was rendered. */
  useEffect(() => {
    startedAt.current = Date.now();
  }, []);

  function onSubmit(event: FormEvent) {
    event.preventDefault();
    if (sending) return;
    const address = value.trim();
    if (!LOOKS_LIKE_EMAIL.test(address)) {
      setStatus("invalid");
      return;
    }
    startSending(async () => {
      const result = await subscribe({
        email: address,
        website,
        startedAt: startedAt.current,
        page: window.location.pathname,
      }).catch(() => ({ ok: false as const }));
      if (!result.ok) {
        setStatus("failed");
        return;
      }
      setValue("");
      setStatus("done");
    });
  }

  const message =
    status === "invalid"
      ? newsletter.invalid
      : status === "failed"
        ? (newsletter.failed ?? FAILED)
        : status === "done"
          ? newsletter.done
          : null;

  return (
    <form
      onSubmit={onSubmit}
      noValidate
      aria-labelledby={`${id}-heading`}
      aria-busy={sending}
      className="relative max-w-[30rem]"
    >
      <p
        id={`${id}-heading`}
        className="text-[1.375rem] leading-[1.2] tracking-[-0.03em] text-white lg:text-[1.625rem]"
      >
        {newsletter.heading}
      </p>

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

      <div className="mt-6 flex h-14 items-center gap-3 rounded-pill border border-white/15 pr-2 pl-6 transition-colors duration-300 focus-within:border-white/60 hover:border-white/30 focus-within:hover:border-white/60">
        <label htmlFor={`${id}-email`} className="sr-only">
          {newsletter.inputLabel}
        </label>
        <input
          id={`${id}-email`}
          type="email"
          name="email"
          autoComplete="email"
          inputMode="email"
          required
          value={value}
          onChange={(event) => {
            setValue(event.target.value);
            if (status !== "idle") setStatus("idle");
          }}
          placeholder={newsletter.placeholder}
          aria-invalid={status === "invalid"}
          aria-describedby={`${id}-note${message ? ` ${id}-message` : ""}`}
          className="min-w-0 flex-1 bg-transparent text-[1rem] leading-none tracking-[-0.01em] text-white caret-[#eb5b32] outline-none placeholder:text-ink-500 lg:text-[1.0625rem]"
        />
        <ArrowPill submit disabled={sending} tone="signal" size="sm" className="flex shrink-0">
          {newsletter.action}
        </ArrowPill>
      </div>

      <p
        id={`${id}-note`}
        className="mt-4 text-[0.8125rem] leading-[1.55] text-ink-400"
      >
        {newsletter.note.before}{" "}
        <a
          href={newsletter.note.link.href}
          className="text-ink-300 underline decoration-ink-500 underline-offset-[3px] transition-colors duration-200 hover:text-white hover:decoration-white"
        >
          {newsletter.note.link.label}
        </a>
        . {newsletter.note.after}
      </p>
      <p
        id={`${id}-message`}
        role="status"
        className={`mt-2 text-[0.8125rem] leading-[1.5] ${
          status === "invalid" || status === "failed" ? "text-[#f2875f]" : "text-ink-400"
        }`}
      >
        {message}
      </p>
    </form>
  );
}
