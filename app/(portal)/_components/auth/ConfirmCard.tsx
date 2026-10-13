"use client";

import Link from "next/link";
import { Clock } from "lucide-react";
import { useState } from "react";
import { ArrowPill } from "@/app/(site)/_components/ArrowPill";
import { Mark } from "@/app/(site)/_components/Mark";
import { Chip, DISPLAY, LABEL, Pill } from "../ui";

export type ConfirmMode = "sign-in" | "invite" | "expired";

/**
 * Where the emailed link lands. The link alone doesn't sign anyone in: the
 * button does. Mail scanners open links before people do, and a link that
 * signed in on opening would be spent by the scanner. Pressing the button is
 * the person, so the link is still theirs.
 */
export function ConfirmCard({ mode }: { mode: ConfirmMode }) {
  const [resent, setResent] = useState(false);

  return (
    <div className="gs-rise gs-card grid w-full max-w-[34rem] gap-10 rounded-[2rem] p-7 sm:p-11">
      <div className="flex items-center justify-between">
        <Mark className="size-24 shrink-0" decorative />
        <Chip>Client portal</Chip>
      </div>

      {mode === "expired" ? (
        <>
          <div className="grid gap-5">
            <span className="grid size-12 place-items-center rounded-full bg-signal-50 text-signal-700">
              <Clock aria-hidden className="size-5" strokeWidth={1.5} />
            </span>
            <h1 className={`${DISPLAY} text-[2.25rem] sm:text-[2.75rem]`}>This link has expired.</h1>
            <p className="text-[0.9375rem] leading-[1.55] text-secondary">
              Sign-in links work once, for an hour. We&rsquo;ll send a fresh one to{" "}
              <span className="text-primary">dana@northwindcoffee.com</span>.
            </p>
          </div>
          {resent ? (
            <p role="status" className="rounded-[1.25rem] bg-ink-950/[0.035] p-5 text-[0.875rem]">
              Sent. Check your inbox for a new link.
            </p>
          ) : (
            <div className="flex flex-wrap items-center gap-2">
              <Pill tone="ink" onClick={() => setResent(true)}>
                Send a fresh link
              </Pill>
              <Pill tone="ghost" href="/portal/login">
                Use a different email
              </Pill>
            </div>
          )}
        </>
      ) : (
        <>
          <div className="grid gap-5">
            <p className={`${LABEL} text-tertiary`}>
              {mode === "invite" ? "Invited by Kareem Jackson" : "Signing in as dana@northwindcoffee.com"}
            </p>
            <h1 className={`${DISPLAY} text-[2.25rem] sm:text-[2.75rem]`}>
              {mode === "invite" ? (
                <>
                  <span className="block">Welcome to</span>
                  <span className="block">Northwind rebrand.</span>
                </>
              ) : (
                "Welcome back, Dana."
              )}
            </h1>
            <p className="text-[0.9375rem] leading-[1.55] text-secondary">
              {mode === "invite"
                ? "This is where you'll review work, follow milestones, talk with the studio and find every invoice. One press and you're in."
                : "One press and you're in. This link works once."}
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-4">
            <ArrowPill href={mode === "invite" ? "/portal/welcome" : "/portal"}>Enter the portal</ArrowPill>
            <Link href="/portal/login" className="text-[0.875rem] text-tertiary transition-colors hover:text-primary">
              Not you?
            </Link>
          </div>
        </>
      )}
    </div>
  );
}
