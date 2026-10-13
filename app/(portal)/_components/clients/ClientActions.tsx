"use client";

import { Check, Copy, RotateCw, UserPlus } from "lucide-react";
import { useEffect, useState } from "react";
import { Sheet } from "../Sheet";
import { LABEL, META, Pill } from "../ui";

/** Sends the invitation again. In the prototype it only says it did. */
export function ResendInvite({ name }: { name: string }) {
  const [sent, setSent] = useState(false);
  useEffect(() => {
    if (!sent) return;
    const t = setTimeout(() => setSent(false), 3000);
    return () => clearTimeout(t);
  }, [sent]);
  return (
    <Pill tone="canvas" onClick={() => setSent(true)} className="h-8 px-3 text-[0.75rem]">
      {sent ? <Check aria-hidden className="size-3.5" strokeWidth={2} /> : <RotateCw aria-hidden className="size-3.5" strokeWidth={1.5} />}
      <span aria-live="polite">{sent ? `Sent to ${name}` : "Resend invite"}</span>
    </Pill>
  );
}

/** An address to hand out, with a button that copies it. */
export function CopyField({ value, label }: { value: string; label: string }) {
  const [copied, setCopied] = useState(false);
  useEffect(() => {
    if (!copied) return;
    const t = setTimeout(() => setCopied(false), 2000);
    return () => clearTimeout(t);
  }, [copied]);
  return (
    <div className="grid min-w-0 gap-1.5">
      <span className={`${LABEL} text-tertiary`}>{label}</span>
      <div className="flex min-w-0 items-center gap-2 rounded-[0.875rem] bg-ink-950/[0.035] py-1 pr-1 pl-3.5">
        <code className="min-w-0 flex-1 truncate font-mono text-[0.75rem] text-ink-800">{value}</code>
        <button
          type="button"
          onClick={() => {
            void navigator.clipboard?.writeText(value).catch(() => {});
            setCopied(true);
          }}
          aria-label={copied ? "Copied" : `Copy ${label.toLowerCase()}`}
          className="gs-press grid size-8 shrink-0 place-items-center rounded-full text-ink-600 hover:bg-white hover:text-primary"
        >
          {copied ? <Check aria-hidden className="size-3.5" strokeWidth={2} /> : <Copy aria-hidden className="size-3.5" strokeWidth={1.5} />}
        </button>
      </div>
    </div>
  );
}

/**
 * Asks someone else at the client in: their name and address, and which
 * projects they can see. They get the same branded invitation as everyone.
 */
export function InviteSomeone({
  org,
  domain,
  projects,
}: {
  org: string;
  domain: string;
  projects: readonly { readonly code: string; readonly name: string; readonly chip: string }[];
}) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [picked, setPicked] = useState<string[]>(projects.slice(0, 1).map((p) => p.code));
  const [done, setDone] = useState("");

  const close = () => {
    setOpen(false);
    setTimeout(() => {
      setName("");
      setEmail("");
      setDone("");
    }, 300);
  };

  return (
    <>
      <Pill tone="ink" onClick={() => setOpen(true)}>
        <UserPlus aria-hidden className="size-4" strokeWidth={1.5} />
        Invite someone
      </Pill>
      <Sheet
        open={open}
        onClose={close}
        eyebrow={org}
        title={done ? "Invitation sent" : "Invite someone"}
        footer={
          done ? (
            <Pill tone="ink" onClick={close}>
              Done
            </Pill>
          ) : (
            <>
              <Pill tone="ghost" onClick={close}>
                Cancel
              </Pill>
              <Pill tone="ink" disabled={!name.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)} onClick={() => setDone(name.trim().split(" ")[0])}>
                Send invitation
              </Pill>
            </>
          )
        }
      >
        {done ? (
          <div className="grid gap-4">
            <span className="grid size-11 place-items-center rounded-full bg-acid-300">
              <Check aria-hidden className="size-5" strokeWidth={2} />
            </span>
            <p className="text-[0.9375rem] leading-[1.55]">
              {done} will get an email with a link straight into {picked.length === 1 ? "their project" : "their projects"}. You&rsquo;ll see them
              here as <span className="font-medium">Invited</span> until they open it.
            </p>
          </div>
        ) : (
          <div className="grid gap-5">
            <Field label="Name" value={name} onChange={setName} placeholder="Jen Alvarez" />
            <Field label="Email" value={email} onChange={setEmail} placeholder={`jen@${domain}`} type="email" />
            <fieldset className="grid gap-2">
              <legend className={`mb-2 ${LABEL} text-tertiary`}>Can see</legend>
              {projects.map((p) => {
                const on = picked.includes(p.code);
                return (
                  <label
                    key={p.code}
                    className={`gs-press flex cursor-pointer items-center gap-3 rounded-[1rem] p-3 ring-1 ring-inset transition-colors ${on ? "bg-white ring-ink-950/20" : "ring-ink-950/[0.06] hover:bg-ink-950/[0.02]"}`}
                  >
                    <input
                      type="checkbox"
                      checked={on}
                      onChange={() => setPicked((x) => (on ? x.filter((c) => c !== p.code) : [...x, p.code]))}
                      className="size-4 accent-ink-950"
                    />
                    <span className="size-2 rounded-[0.1875rem]" style={{ backgroundColor: p.chip }} aria-hidden />
                    <span className="flex-1 text-[0.8125rem] font-medium">{p.name}</span>
                    <span className={`${META} text-[0.75rem]`}>{p.code}</span>
                  </label>
                );
              })}
            </fieldset>
          </div>
        )}
      </Sheet>
    </>
  );
}

export function Field({
  label,
  value,
  onChange,
  placeholder,
  type = "text",
  hint,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  type?: string;
  hint?: string;
}) {
  return (
    <label className="grid gap-2">
      <span className={`${LABEL} text-tertiary`}>{label}</span>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="h-11 rounded-[0.875rem] bg-ink-950/[0.035] px-4 text-[0.875rem] tracking-[-0.01em] outline-none transition-shadow placeholder:text-ink-400 focus-visible:bg-white focus-visible:shadow-[0_0_0_1px_rgb(14_13_11/0.14)]"
      />
      {hint ? <span className={`${META} text-[0.75rem]`}>{hint}</span> : null}
    </label>
  );
}
