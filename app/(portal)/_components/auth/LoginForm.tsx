"use client";

import Link from "next/link";
import { Mail } from "lucide-react";
import { useEffect, useId, useState, type FormEvent } from "react";
import { ArrowPill } from "@/app/(site)/_components/ArrowPill";
import { pad } from "@/lib/portal/format";
import { LABEL, Pill } from "../ui";

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
/** How long before another link can be asked for. */
const WAIT = 30;

/**
 * The only way in: an email address, then a link in the inbox. No password.
 *
 * It says the same thing whoever types an address — "check your inbox" —
 * so the page never confirms who has an account. In the prototype nothing
 * is sent; the link it would send is offered underneath instead.
 */
export function LoginForm({ initialEmail = "" }: { initialEmail?: string }) {
  const id = useId();
  const [email, setEmail] = useState(initialEmail);
  const [state, setState] = useState<"idle" | "sending" | "sent">("idle");
  const [error, setError] = useState("");
  const [wait, setWait] = useState(0);

  useEffect(() => {
    if (!wait) return;
    const timer = setTimeout(() => setWait((w) => w - 1), 1000);
    return () => clearTimeout(timer);
  }, [wait]);

  const send = () => {
    setState("sending");
    setTimeout(() => {
      setState("sent");
      setWait(WAIT);
    }, 900);
  };

  const onSubmit = (event: FormEvent) => {
    event.preventDefault();
    if (!EMAIL.test(email.trim())) {
      setError("That doesn't look like an email address.");
      return;
    }
    setError("");
    send();
  };

  if (state === "sent") {
    return (
      <div role="status" className="grid gap-5 rounded-[1.5rem] bg-ink-950/[0.035] p-6 sm:p-7">
        <span className="grid size-11 place-items-center rounded-full bg-acid-300">
          <Mail aria-hidden className="size-5" strokeWidth={1.5} />
        </span>
        <div className="grid gap-2">
          <p className="text-[1.25rem] leading-[1.15] font-medium tracking-[-0.025em]">Check your inbox.</p>
          <p className="text-[0.875rem] leading-[1.55] text-secondary">
            If <span className="text-primary">{email.trim()}</span> has a portal, a sign-in link is on its way.
            It works once, for the next hour.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Pill tone="white" disabled={wait > 0} onClick={send}>
            {wait > 0 ? `Send again in 0:${pad(wait)}` : "Send it again"}
          </Pill>
          <Pill tone="ghost" onClick={() => setState("idle")}>
            Use a different email
          </Pill>
        </div>
        <Link
          href="/portal/auth/confirm"
          className={`${LABEL} justify-self-start border-b border-ink-300 pb-1 text-tertiary transition-colors hover:border-ink-950 hover:text-primary`}
        >
          Prototype: open the link it sends
        </Link>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} noValidate className="grid gap-3">
      <label htmlFor={id} className={`${LABEL} text-tertiary`}>
        Email
      </label>
      <div className="flex flex-col gap-1.5 rounded-[1.75rem] bg-ink-950/[0.04] p-1.5 transition-shadow focus-within:bg-white focus-within:shadow-[0_0_0_1px_rgb(14_13_11/0.14)] sm:flex-row sm:items-center sm:rounded-pill">
        <input
          id={id}
          type="email"
          name="email"
          autoComplete="email"
          inputMode="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@company.com"
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? `${id}-error` : undefined}
          className="h-11 min-w-0 flex-1 bg-transparent px-4 text-[0.9375rem] tracking-[-0.01em] outline-none placeholder:text-ink-400"
        />
        <ArrowPill submit tone="ink" className="flex w-full justify-between sm:inline-flex sm:w-auto">
          {state === "sending" ? "Sending" : "Send me a link"}
        </ArrowPill>
      </div>
      <p id={`${id}-error`} role="alert" className="min-h-5 text-[0.875rem] text-signal-700">
        {error}
      </p>
    </form>
  );
}
