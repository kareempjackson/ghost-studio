"use client";

import Link from "next/link";
import { Check, Lock, LogOut, Mail } from "lucide-react";
import { useEffect, useState } from "react";
import type { Person, Role } from "@/lib/portal/types";
import { Field } from "../clients/ClientActions";
import { Avatar, Card, CardHead, LABEL, META, Pill } from "../ui";

type Cadence = "now" | "daily" | "off";
const CADENCES: readonly { key: Cadence; label: string }[] = [
  { key: "now", label: "Right away" },
  { key: "daily", label: "Daily" },
  { key: "off", label: "Off" },
];

/** What each role can be told about, with the setting most people want. */
const EVENTS: Record<Role, readonly { key: string; label: string; hint: string; initial: Cadence }[]> = {
  client: [
    { key: "review", label: "Work to review", hint: "When the studio sends you something to approve.", initial: "now" },
    { key: "messages", label: "Messages", hint: "Replies from the studio. You can always answer by email.", initial: "now" },
    { key: "milestones", label: "Milestones", hint: "When one is done, or its date moves.", initial: "daily" },
    { key: "invoices", label: "Invoices", hint: "New invoices, and a reminder before one is due.", initial: "now" },
    { key: "notes", label: "Meeting notes", hint: "When notes are shared with you.", initial: "daily" },
  ],
  studio: [
    { key: "decisions", label: "Client decisions", hint: "Approvals, change requests and rejections.", initial: "now" },
    { key: "submitted", label: "Work submitted", hint: "When a contractor puts work up for review.", initial: "now" },
    { key: "messages", label: "Messages", hint: "From clients and contractors, here or by email.", initial: "now" },
    { key: "payments", label: "Payments", hint: "Money in, invoices overdue, contractor invoices.", initial: "daily" },
    { key: "sort", label: "Email to sort", hint: "Mail that came in without a thread.", initial: "daily" },
  ],
  contractor: [
    { key: "feedback", label: "Feedback on your work", hint: "Comments and decisions from the studio.", initial: "now" },
    { key: "messages", label: "Messages", hint: "From the studio, in your projects' internal threads.", initial: "now" },
    { key: "paid", label: "Invoices paid", hint: "When the studio settles one of yours.", initial: "now" },
  ],
};

/**
 * Your account: who you are in the portal, what you'd like to hear about
 * and how often, and the way out. The email address is fixed — it's how
 * you sign in — so the studio changes it, not you.
 */
export function SettingsForm({ person, role, org }: { person: Person; role: Role; org?: string }) {
  const [name, setName] = useState(person.name);
  const [title, setTitle] = useState(person.title);
  const [prefs, setPrefs] = useState<Record<string, Cadence>>(() => Object.fromEntries(EVENTS[role].map((e) => [e.key, e.initial])));
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (!saved) return;
    const t = setTimeout(() => setSaved(false), 2600);
    return () => clearTimeout(t);
  }, [saved]);

  return (
    <div className="grid grid-cols-[minmax(0,1fr)] items-start gap-4 lg:grid-cols-12 lg:gap-5">
      <Card i={1} className="grid gap-6 lg:col-span-5">
        <CardHead title="You" meta={org ? `${org} · in the portal since ${person.invitedAt?.slice(0, 4) ?? "2026"}` : "Ghost Savvy Studios"} />
        <div className="flex items-center gap-4">
          <Avatar person={{ name: name || person.name, role }} size="xl" />
          <div className="grid gap-1">
            <span className="text-[0.9375rem] font-medium tracking-[-0.015em]">{name || person.name}</span>
            <span className={`${META} text-[0.75rem]`}>{title}</span>
          </div>
        </div>
        <div className="grid gap-4">
          <Field label="Name" value={name} onChange={setName} />
          <Field label="Role" value={title} onChange={setTitle} />
          <div className="grid gap-2">
            <span className={`${LABEL} text-tertiary`}>Email</span>
            <span className="flex h-11 items-center gap-2 rounded-[0.875rem] bg-ink-950/[0.02] px-4 text-[0.875rem] text-secondary ring-1 ring-inset ring-ink-950/[0.06]">
              <Lock aria-hidden className="size-3.5 text-ink-400" strokeWidth={1.5} />
              {person.email}
            </span>
            <span className={`${META} text-[0.75rem]`}>It&rsquo;s how you sign in. Ask the studio if it needs to change.</span>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Pill tone="ink" onClick={() => setSaved(true)}>
            {saved ? <Check aria-hidden className="size-4" strokeWidth={2} /> : null}
            {saved ? "Saved" : "Save"}
          </Pill>
          {saved ? <span className={`${META} text-[0.75rem]`}>Prototype: not kept.</span> : null}
        </div>
      </Card>

      <div className="grid gap-4 lg:col-span-7 lg:gap-5">
        <Card i={2} className="grid gap-4">
          <CardHead title="Email me about" meta="Right away, once a day in a single summary, or not at all." />
          <ul className="grid">
            {EVENTS[role].map((e) => (
              <li key={e.key} className="flex flex-col gap-3 border-t border-ink-950/[0.06] py-4 first:border-t-0 sm:flex-row sm:items-center sm:justify-between">
                <span className="grid gap-0.5">
                  <span className="text-[0.8125rem] font-medium">{e.label}</span>
                  <span className={`${META} text-[0.75rem]`}>{e.hint}</span>
                </span>
                <span role="radiogroup" aria-label={e.label} className="flex w-max shrink-0 gap-0.5 rounded-pill bg-ink-950/[0.045] p-0.5">
                  {CADENCES.map((c) => (
                    <button
                      key={c.key}
                      type="button"
                      role="radio"
                      aria-checked={prefs[e.key] === c.key}
                      onClick={() => setPrefs((p) => ({ ...p, [e.key]: c.key }))}
                      className={`gs-press h-7 rounded-pill px-3 text-[0.75rem] font-medium ${prefs[e.key] === c.key ? "gs-ink" : "text-secondary hover:text-primary"}`}
                    >
                      {c.label}
                    </button>
                  ))}
                </span>
              </li>
            ))}
          </ul>
        </Card>

        {role === "studio" ? (
          <Card i={3} className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="grid gap-1">
              <span className="text-[0.8125rem] font-medium">The emails the portal sends</span>
              <span className={`${META} text-[0.75rem]`}>Every one, filled in and rendered as clients, contractors and the studio receive them.</span>
            </div>
            <Pill tone="canvas" href="/portal/dev/emails" className="shrink-0">
              <Mail aria-hidden className="size-4" strokeWidth={1.5} />
              See them
            </Pill>
          </Card>
        ) : null}

        <Card i={4} className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="grid gap-1">
            <span className="text-[0.8125rem] font-medium">Signed in on this device</span>
            <span className={`${META} text-[0.75rem]`}>With a link sent to {person.email}. There&rsquo;s no password to change.</span>
          </div>
          <Link
            href="/portal/login"
            className="gs-press inline-flex h-9 shrink-0 items-center gap-1.5 rounded-pill px-4 text-[0.8125rem] font-medium text-secondary hover:bg-ink-950/[0.05] hover:text-primary"
          >
            <LogOut aria-hidden className="size-4" strokeWidth={1.5} />
            Sign out
          </Link>
        </Card>
      </div>
    </div>
  );
}
