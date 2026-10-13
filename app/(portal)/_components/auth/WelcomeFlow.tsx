"use client";

import { BellRing, Layers, MessageCircle, Receipt } from "lucide-react";
import { useState } from "react";
import { ArrowPill } from "@/app/(site)/_components/ArrowPill";
import { Mark } from "@/app/(site)/_components/Mark";
import { Field } from "../clients/ClientActions";
import { DISPLAY, LABEL, META } from "../ui";

const TILES = [
  { Icon: Layers, title: "Review", body: "See work the moment it's ready. Pin a comment to the exact spot, then approve or ask for changes." },
  { Icon: BellRing, title: "Follow", body: "Every milestone and its date, and what's waiting on whom." },
  { Icon: MessageCircle, title: "Talk", body: "One thread with the studio. Reply here, or just reply to the email." },
  { Icon: Receipt, title: "Pay", body: "Every invoice, what's due and what's settled, in one place." },
];

const PACES = [
  { key: "now", title: "As it happens", body: "An email for each new thing." },
  { key: "daily", title: "Once a day", body: "One summary each morning." },
  { key: "needed", title: "Only what needs me", body: "Approvals and invoices, nothing else." },
] as const;

/**
 * The first screen after an invitation: a hello, a chance to fix how your
 * name reads, how often to hear from the portal, and what's inside. One
 * button in.
 */
export function WelcomeFlow({ name, title, project }: { name: string; title: string; project?: string }) {
  const [n, setN] = useState(name);
  const [t, setT] = useState(title);
  const [pace, setPace] = useState<(typeof PACES)[number]["key"]>("now");

  return (
    <div className="grid min-h-[calc(100dvh-1rem)] gap-2 sm:min-h-[calc(100dvh-1.5rem)] lg:min-h-[calc(100dvh-2rem)] lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] lg:gap-3">
      <section className="gs-rise gs-card flex flex-col justify-between gap-10 rounded-[2rem] p-6 sm:p-10 lg:p-14">
        <div className="flex items-center justify-between">
          <Mark className="size-24 shrink-0" decorative />
          <span className={`${LABEL} text-tertiary`}>Welcome</span>
        </div>

        <div className="grid max-w-[30rem] gap-8">
          <div className="grid gap-4">
            <h1 className={`${DISPLAY} text-[2.75rem] sm:text-[3.5rem]`}>You&rsquo;re in, {n.split(" ")[0] || "there"}.</h1>
            <p className="text-[0.9375rem] leading-[1.6] text-secondary">
              Two quick things before {project ? project : "your project"}: how your name should read to the studio, and how often you&rsquo;d like to
              hear from us.
            </p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Your name" value={n} onChange={setN} />
            <Field label="Your role" value={t} onChange={setT} />
          </div>
          <fieldset className="grid gap-2.5">
            <legend className={`mb-2.5 ${LABEL} text-tertiary`}>Email me</legend>
            <div className="grid gap-2 sm:grid-cols-3">
              {PACES.map((p) => (
                <label
                  key={p.key}
                  className={`gs-press grid cursor-pointer gap-1 rounded-[1.125rem] p-3.5 ring-1 ring-inset transition-colors ${pace === p.key ? "bg-white ring-ink-950/30" : "ring-ink-950/[0.07] hover:bg-ink-950/[0.02]"}`}
                >
                  <input type="radio" name="pace" checked={pace === p.key} onChange={() => setPace(p.key)} className="sr-only" />
                  <span className="flex items-center gap-2 text-[0.8125rem] font-medium">
                    <span aria-hidden className={`grid size-3.5 place-items-center rounded-full ring-1 ring-inset ${pace === p.key ? "ring-ink-950" : "ring-ink-950/25"}`}>
                      {pace === p.key ? <span className="size-1.5 rounded-full bg-ink-950" /> : null}
                    </span>
                    {p.title}
                  </span>
                  <span className={`${META} text-[0.75rem]`}>{p.body}</span>
                </label>
              ))}
            </div>
          </fieldset>
          <ArrowPill href="/portal" className="inline-flex justify-self-start">{project ? `Take me to ${project}` : "Take me in"}</ArrowPill>
        </div>

        <p className={`${LABEL} text-tertiary`}>You can change any of this later in Settings.</p>
      </section>

      <aside aria-label="What's inside" className="gs-rise grid content-center gap-3 rounded-[2rem] bg-ink-950 p-6 text-white [--i:2] sm:p-10 lg:p-14">
        <p className={`${LABEL} mb-3 text-white/50`}>What&rsquo;s inside</p>
        {TILES.map(({ Icon, title: tt, body }, i) => (
          <div key={tt} className="gs-rise flex gap-4 rounded-[1.375rem] bg-white/[0.06] p-5 ring-1 ring-inset ring-white/[0.07]" style={{ "--i": i + 3 } as React.CSSProperties}>
            <span className="grid size-10 shrink-0 place-items-center rounded-full bg-white/10">
              <Icon aria-hidden className="size-4" strokeWidth={1.5} />
            </span>
            <span className="grid gap-1">
              <span className="text-[0.9375rem] font-medium tracking-[-0.015em]">{tt}</span>
              <span className="text-[0.8125rem] leading-[1.55] text-white/60">{body}</span>
            </span>
          </div>
        ))}
      </aside>
    </div>
  );
}
