"use client";

import { useId, useState, type FormEvent } from "react";
import { email, footer } from "@/lib/footer";
import { ArrowPill } from "./ArrowPill";

const { newsletter } = footer;

/** Loose on purpose: the mail app is the real check. */
const LOOKS_LIKE_EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * The newsletter sign-up, in the footer's top-left corner.
 *
 * One field and one control, in the brand's own shapes: the address is typed
 * into a hairline aperture, and the vermilion arrow pill — the site's one
 * call to action on a dark band — sits inside its far end to send it. The
 * outline is the only thing that moves when the field is in use. Under it, the one line of small
 * print a sign-up owes: what the address is for and how to take it back.
 *
 * Nothing is posted. Like the contact form, it hands a pre-written request to
 * the visitor's own mail app; when a mailing list is connected, `onSubmit` is
 * the one thing that changes.
 */
export function NewsletterSignup() {
  const id = useId();
  const [value, setValue] = useState("");
  const [status, setStatus] = useState<"idle" | "invalid" | "done">("idle");

  function onSubmit(event: FormEvent) {
    event.preventDefault();
    const address = value.trim();
    if (!LOOKS_LIKE_EMAIL.test(address)) {
      setStatus("invalid");
      return;
    }
    const body = `Please add ${address} to the Ghost Savvy newsletter.`;
    window.location.href = `mailto:${email}?subject=${encodeURIComponent(
      newsletter.subject,
    )}&body=${encodeURIComponent(body)}`;
    setStatus("done");
  }

  const message =
    status === "invalid"
      ? newsletter.invalid
      : status === "done"
        ? newsletter.done
        : null;

  return (
    <form
      onSubmit={onSubmit}
      noValidate
      aria-labelledby={`${id}-heading`}
      className="max-w-[30rem]"
    >
      <p
        id={`${id}-heading`}
        className="text-[1.375rem] leading-[1.2] tracking-[-0.03em] text-white lg:text-[1.625rem]"
      >
        {newsletter.heading}
      </p>

      <div className="mt-6 flex h-14 items-center gap-3 rounded-pill border border-white/15 pr-2 pl-6 transition-colors duration-300 focus-within:border-white/60 hover:border-white/30 focus-within:hover:border-white/60">
        <label htmlFor={`${id}-email`} className="sr-only">
          Email address
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
        <ArrowPill submit tone="signal" size="sm" className="flex shrink-0">
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
          status === "invalid" ? "text-[#f2875f]" : "text-ink-400"
        }`}
      >
        {message}
      </p>
    </form>
  );
}
