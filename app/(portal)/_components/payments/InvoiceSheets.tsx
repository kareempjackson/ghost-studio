"use client";

import { Bell, Download, MessageCircle, Upload } from "lucide-react";
import { useEffect, useState } from "react";
import { Mark } from "@/app/(site)/_components/Mark";
import type { InvoiceRow } from "@/lib/portal/data";
import { TODAY, day, dayYear, money } from "@/lib/portal/format";
import type { Payment, Role } from "@/lib/portal/types";
import { Field } from "../clients/ClientActions";
import { Sheet } from "../Sheet";
import { Chip, DISPLAY, LABEL, META, Pill } from "../ui";

const METHODS: readonly Payment["method"][] = ["wire", "ach", "check", "card", "other"];
const METHOD_LABEL: Record<Payment["method"], string> = { wire: "Wire", ach: "ACH", check: "Check", card: "Card", other: "Other" };

export function statusOf(row: { balance: number; overdue: boolean; paid: number }) {
  if (row.balance === 0) return { label: "Paid", tone: "acid" as const };
  if (row.overdue) return { label: "Overdue", tone: "signal" as const };
  if (row.paid > 0) return { label: "Part paid", tone: "outline" as const };
  return { label: "Sent", tone: "quiet" as const };
}

/**
 * One invoice, opened: the document itself set as paper — who it's from,
 * who it's to, what it's for, when it's due — then every payment against
 * it. The studio records payments here; everyone can take the PDF.
 */
export function InvoiceSheet({
  row,
  role,
  onClose,
  onPay,
}: {
  row: InvoiceRow | null;
  role: Role;
  onClose: () => void;
  onPay: (id: string, payment: Payment) => void;
}) {
  /* Said inside the sheet: a toast outside a modal dialog sits under its backdrop. */
  const [notice, setNotice] = useState("");
  const onToast = setNotice;
  useEffect(() => {
    if (!notice) return;
    const t = setTimeout(() => setNotice(""), 3200);
    return () => clearTimeout(t);
  }, [notice]);
  const [amount, setAmount] = useState("");
  const [method, setMethod] = useState<Payment["method"]>("wire");
  const [recording, setRecording] = useState(false);

  const status = row ? statusOf(row) : null;
  const from = row?.direction === "payable" ? row.contractor?.name ?? "Contractor" : "Ghost Savvy Studios";
  const to = row?.direction === "payable" ? "Ghost Savvy Studios" : row?.org.name ?? "";

  return (
    <Sheet
      open={row !== null}
      onClose={() => {
        setRecording(false);
        onClose();
      }}
      eyebrow={row ? `${row.project.code} · ${row.project.name}` : ""}
      title={row ? row.number : ""}
      footer={
        row ? (
          <>
            <Pill tone="ghost" onClick={() => onToast(`${row.number}.pdf downloaded. (Prototype: no file yet.)`)}>
              <Download aria-hidden className="size-4" strokeWidth={1.5} />
              PDF
            </Pill>
            {role === "studio" && row.balance > 0 && row.direction === "receivable" ? (
              <Pill tone="white" onClick={() => onToast(`Reminder sent to ${row.org.name}.`)}>
                <Bell aria-hidden className="size-4" strokeWidth={1.5} />
                Remind
              </Pill>
            ) : null}
            {role === "studio" && row.balance > 0 ? (
              <Pill
                tone="ink"
                onClick={() => {
                  setAmount(String(row.balance / 100));
                  setRecording(true);
                }}
              >
                {row.direction === "payable" ? "Mark paid" : "Record payment"}
              </Pill>
            ) : null}
            {role === "client" && row.balance > 0 ? (
              <Pill tone="ink" href={`/portal/projects/${row.project.slug}/messages`}>
                <MessageCircle aria-hidden className="size-4" strokeWidth={1.5} />
                Ask about it
              </Pill>
            ) : null}
          </>
        ) : null
      }
    >
      {row && status ? (
        <div className="grid gap-6">
          {notice ? (
            <p role="status" className="gs-rise rounded-pill bg-ink-950 px-4 py-2.5 text-center text-[0.8125rem] font-medium text-white">
              {notice}
            </p>
          ) : null}
          {/* The paper -------------------------------------------------------- */}
          <article aria-label={`Invoice ${row.number}`} className="grid gap-6 rounded-[1.25rem] bg-white p-6 shadow-[0_0_0_1px_rgb(14_13_11/0.08)]">
            <header className="flex items-start justify-between gap-4">
              {row.direction === "receivable" ? <Mark className="size-16 shrink-0" decorative /> : <span className="text-[0.875rem] font-medium">{from}</span>}
              <div className="grid justify-items-end gap-1">
                <span className={`${LABEL} text-tertiary`}>Invoice</span>
                <span className="text-[0.875rem] font-medium tabular-nums">{row.number}</span>
              </div>
            </header>
            <div className="grid grid-cols-2 gap-4 text-[0.75rem]">
              <div className="grid gap-1">
                <span className={`${LABEL} text-tertiary`}>From</span>
                <span>{from}</span>
              </div>
              <div className="grid gap-1">
                <span className={`${LABEL} text-tertiary`}>To</span>
                <span>{to}</span>
              </div>
              <div className="grid gap-1">
                <span className={`${LABEL} text-tertiary`}>Issued</span>
                <span className="tabular-nums">{dayYear(row.issuedOn)}</span>
              </div>
              <div className="grid gap-1">
                <span className={`${LABEL} text-tertiary`}>Due</span>
                <span className={`tabular-nums ${row.overdue ? "text-signal-700" : ""}`}>{dayYear(row.dueOn)}</span>
              </div>
            </div>
            <table className="w-full border-collapse text-[0.8125rem]">
              <thead>
                <tr className="border-b border-ink-950/[0.08]">
                  <th scope="col" className={`pb-2 text-left font-normal ${LABEL} text-tertiary`}>
                    For
                  </th>
                  <th scope="col" className={`pb-2 text-right font-normal ${LABEL} text-tertiary`}>
                    Amount
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-ink-950/[0.06]">
                  <td className="py-3">
                    {row.label}
                    <span className="text-tertiary"> · {row.project.name}</span>
                  </td>
                  <td className="py-3 text-right tabular-nums">{money(row.amount)}</td>
                </tr>
              </tbody>
              <tfoot>
                <tr>
                  <td className="pt-3 font-medium">Total</td>
                  <td className="pt-3 text-right font-medium tabular-nums">{money(row.amount)}</td>
                </tr>
              </tfoot>
            </table>
            <footer className="flex items-end justify-between gap-4 border-t border-ink-950/[0.06] pt-4">
              <span className={`${META} max-w-[22ch] text-[0.6875rem] leading-[1.5]`}>
                {row.direction === "receivable" ? "Wire or ACH. Account details are on the PDF." : `Submitted ${day(row.issuedOn)}.`}
              </span>
              <span className="grid justify-items-end gap-1">
                <span className={`${LABEL} text-tertiary`}>{row.balance ? "Balance" : "Settled"}</span>
                <span className={`${DISPLAY} text-[1.75rem] tabular-nums ${row.overdue ? "text-signal-700" : ""}`}>{money(row.balance)}</span>
              </span>
            </footer>
          </article>

          <div className="flex items-center justify-between">
            <span className={`${LABEL} text-tertiary`}>Status</span>
            <Chip tone={status.tone}>{status.label}</Chip>
          </div>

          {/* Payments --------------------------------------------------------- */}
          <section aria-label="Payments" className="grid gap-2">
            <span className={`${LABEL} text-tertiary`}>Payments</span>
            {row.payments.length ? (
              <ul className="grid gap-1.5">
                {row.payments.map((p) => (
                  <li key={p.id} className="flex items-center justify-between gap-3 rounded-[0.875rem] bg-ink-950/[0.03] px-3.5 py-2.5 text-[0.8125rem]">
                    <span className="flex items-center gap-2.5">
                      <span aria-hidden className="size-1.5 rounded-full bg-acid-500" />
                      <span className="tabular-nums">{day(p.paidOn)}</span>
                      <span className="text-tertiary">{METHOD_LABEL[p.method]}</span>
                    </span>
                    <span className="font-medium tabular-nums">{money(p.amount)}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className={`${META} text-[0.8125rem]`}>Nothing paid yet.</p>
            )}
          </section>

          {recording ? (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                const cents = Math.round(Number(amount) * 100);
                if (!(cents > 0)) return;
                onPay(row.id, { id: `local-${Date.now()}`, amount: Math.min(cents, row.balance), paidOn: TODAY.slice(0, 10), method });
                setRecording(false);
                onToast(cents >= row.balance ? `${row.number} is settled.` : `${money(cents)} recorded against ${row.number}.`);
              }}
              className="grid gap-4 rounded-[1.25rem] bg-ink-950/[0.025] p-4 ring-1 ring-inset ring-ink-950/[0.05]"
            >
              <Field label="Amount ($)" type="number" value={amount} onChange={setAmount} />
              <fieldset className="grid gap-2">
                <legend className={`mb-2 ${LABEL} text-tertiary`}>How</legend>
                <div className="flex flex-wrap gap-1">
                  {METHODS.map((m) => (
                    <button
                      key={m}
                      type="button"
                      aria-pressed={method === m}
                      onClick={() => setMethod(m)}
                      className={`gs-press h-7 rounded-pill px-3 text-[0.75rem] font-medium ${method === m ? "gs-ink" : "bg-ink-950/[0.045] text-secondary hover:text-primary"}`}
                    >
                      {METHOD_LABEL[m]}
                    </button>
                  ))}
                </div>
              </fieldset>
              <Pill tone="ink" type="submit" className="justify-self-start">
                Record {amount ? money(Math.round(Number(amount) * 100)) : "payment"}
              </Pill>
            </form>
          ) : null}
        </div>
      ) : null}
    </Sheet>
  );
}

/**
 * A new invoice: the studio billing a client, or a contractor billing the
 * studio. The PDF, what it's for, how much, and when it's due.
 */
export function UploadInvoiceSheet({
  open,
  onClose,
  role,
  projects,
  nextNumber,
  onDone,
}: {
  open: boolean;
  onClose: () => void;
  role: Role;
  projects: readonly { readonly slug: string; readonly code: string; readonly name: string; readonly chip: string; readonly org: string }[];
  nextNumber: string;
  onDone: (message: string) => void;
}) {
  const [file, setFile] = useState("");
  const [number, setNumber] = useState(role === "studio" ? nextNumber : "");
  const [slug, setSlug] = useState(projects[0]?.slug ?? "");
  const [label, setLabel] = useState("");
  const [amount, setAmount] = useState("");
  const [dueOn, setDueOn] = useState("");
  const project = projects.find((p) => p.slug === slug);
  const ready = number.trim() && label.trim() && Number(amount) > 0 && dueOn && project;

  return (
    <Sheet
      open={open}
      onClose={onClose}
      eyebrow={role === "studio" ? "Bill a client" : "Bill the studio"}
      title={role === "studio" ? "Upload an invoice" : "Submit an invoice"}
      footer={
        <>
          <Pill tone="ghost" onClick={onClose}>
            Cancel
          </Pill>
          <Pill
            tone="ink"
            disabled={!ready}
            onClick={() => {
              onDone(role === "studio" ? `${number} sent to ${project?.org}.` : `${number} submitted. The studio will confirm when it's paid.`);
              setFile("");
              setLabel("");
              setAmount("");
              setDueOn("");
              onClose();
            }}
          >
            {role === "studio" ? `Send to ${project?.org ?? "client"}` : "Submit to the studio"}
          </Pill>
        </>
      }
    >
      <div className="grid gap-5">
        <label className="grid cursor-pointer place-items-center gap-2.5 rounded-[1.25rem] border border-dashed border-ink-950/15 bg-ink-950/[0.02] px-6 py-8 text-center transition-colors hover:bg-ink-950/[0.04]">
          <span className="gs-card grid size-10 place-items-center rounded-full">
            <Upload aria-hidden className="size-4" strokeWidth={1.5} />
          </span>
          <span className="text-[0.8125rem] font-medium">{file || "The invoice PDF"}</span>
          <span className={`${META} text-[0.75rem]`}>{file ? "Ready" : "Drop it here, or browse"}</span>
          <input type="file" accept="application/pdf" className="sr-only" onChange={(e) => setFile(e.target.files?.[0]?.name ?? "")} />
        </label>
        <fieldset className="grid gap-2.5">
          <legend className={`mb-2.5 ${LABEL} text-tertiary`}>Project</legend>
          <div className="flex flex-wrap gap-1.5">
            {projects.map((p) => (
              <button
                key={p.slug}
                type="button"
                aria-pressed={p.slug === slug}
                onClick={() => setSlug(p.slug)}
                className={`gs-press inline-flex h-8 items-center gap-2 rounded-pill px-3 text-[0.75rem] font-medium ${p.slug === slug ? "gs-ink" : "bg-ink-950/[0.045] hover:bg-ink-950/[0.08]"}`}
              >
                <span className="size-2 rounded-[0.1875rem]" style={{ backgroundColor: p.chip }} aria-hidden />
                {p.name}
              </button>
            ))}
          </div>
        </fieldset>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Number" value={number} onChange={setNumber} placeholder={role === "studio" ? nextNumber : "TL-023"} />
          <Field label="Amount ($)" type="number" value={amount} onChange={setAmount} placeholder="9500" />
        </div>
        <Field label="For" value={label} onChange={setLabel} placeholder={role === "studio" ? "Guidelines, milestone 03" : "Logo animation, v02"} />
        <Field label="Due" type="date" value={dueOn} onChange={setDueOn} hint={role === "studio" ? "The client is reminded three days before, and on the day." : undefined} />
        {role === "contractor" ? (
          <p className="rounded-[1rem] bg-ink-950/[0.035] p-4 text-[0.8125rem] leading-[1.55] text-secondary">
            Only the studio sees your invoices. You&rsquo;ll see it marked paid here when it&rsquo;s settled.
          </p>
        ) : null}
      </div>
    </Sheet>
  );
}
