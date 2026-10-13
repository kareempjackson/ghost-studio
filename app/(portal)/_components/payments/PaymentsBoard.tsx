"use client";

import Link from "next/link";
import { ChevronRight, Upload } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import type { InvoiceRow } from "@/lib/portal/data";
import { TODAY, day, due, money } from "@/lib/portal/format";
import type { Invoice, Payment, Role } from "@/lib/portal/types";
import { Card, Chip, DIVIDE, Empty, LABEL, META, Money, Pill } from "../ui";
import { InvoiceSheet, UploadInvoiceSheet, statusOf } from "./InvoiceSheets";

type Filter = "all" | "open" | "overdue" | "paid";

/**
 * Money, as a ledger. The four figures that matter at the top — what's
 * owed, what's late, what's come in this year, what's next — then every
 * invoice, open ones first. Opening one shows the invoice itself.
 *
 * Who's looking decides the ledger: the studio sees money in and out (the
 * tabs), a client sees what they've been billed, a contractor sees what
 * they've billed the studio.
 */
export function PaymentsBoard({
  rows: initial,
  role,
  direction,
  showProject,
  tabs,
  projects,
  nextNumber,
}: {
  rows: readonly InvoiceRow[];
  role: Role;
  direction: Invoice["direction"];
  showProject: boolean;
  /** The studio's Receivables / Payables switch. */
  tabs?: readonly { readonly label: string; readonly href: string; readonly active: boolean }[];
  /** Where a new invoice can be for. Empty for clients. */
  projects: readonly { readonly slug: string; readonly code: string; readonly name: string; readonly chip: string; readonly org: string }[];
  nextNumber: string;
}) {
  const [rows, setRows] = useState<InvoiceRow[]>([...initial]);
  const [filter, setFilter] = useState<Filter>("all");
  const [openId, setOpenId] = useState<string | null>(null);
  const [upload, setUpload] = useState(false);
  const [toast, setToast] = useState("");

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(""), 3600);
    return () => clearTimeout(t);
  }, [toast]);

  const pay = (id: string, payment: Payment) =>
    setRows((rs) =>
      rs.map((r) => {
        if (r.id !== id) return r;
        const balance = Math.max(0, r.balance - payment.amount);
        return { ...r, payments: [...r.payments, payment], balance, paid: r.amount - balance, overdue: balance > 0 && r.overdue };
      }),
    );

  const stats = useMemo(() => {
    const unpaid = rows.filter((r) => r.balance > 0).sort((a, b) => a.dueOn.localeCompare(b.dueOn));
    return {
      outstanding: unpaid.reduce((s, r) => s + r.balance, 0),
      overdue: unpaid.filter((r) => r.overdue).reduce((s, r) => s + r.balance, 0),
      paidYear: rows.flatMap((r) => r.payments).filter((p) => p.paidOn.startsWith(TODAY.slice(0, 4))).reduce((s, p) => s + p.amount, 0),
      next: unpaid[0],
    };
  }, [rows]);

  const filters: { key: Filter; label: string; test: (r: InvoiceRow) => boolean }[] = [
    { key: "all", label: "All", test: () => true },
    { key: "open", label: "Open", test: (r) => r.balance > 0 },
    { key: "overdue", label: "Overdue", test: (r) => r.overdue },
    { key: "paid", label: "Paid", test: (r) => r.balance === 0 },
  ];
  const active = filters.find((f) => f.key === filter)!;
  const shown = rows.filter(active.test);
  const open = rows.find((r) => r.id === openId) ?? null;

  const owedLabel = role === "contractor" ? "Owed to you" : direction === "payable" ? "Owed to contractors" : "Outstanding";
  const paidLabel = role === "contractor" ? "Paid to you this year" : direction === "payable" ? "Paid out this year" : "Paid this year";
  const counterparty = (r: InvoiceRow) => (r.direction === "payable" ? r.contractor?.name ?? "" : r.org.name);

  return (
    <div className="grid gap-4 lg:gap-5">
      {/* The figures ----------------------------------------------------------- */}
      <div className="grid gap-4 sm:grid-cols-2 lg:gap-5 xl:grid-cols-4">
        {[
          { label: owedLabel, cents: stats.outstanding, meta: `${rows.filter((r) => r.balance > 0).length} open` },
          { label: "Overdue", cents: stats.overdue, meta: stats.overdue ? `${rows.filter((r) => r.overdue).length} late` : "Nothing late", alert: stats.overdue > 0 },
          { label: paidLabel, cents: stats.paidYear, meta: `${rows.flatMap((r) => r.payments).filter((p) => p.paidOn.startsWith(TODAY.slice(0, 4))).length} payments` },
          {
            label: "Next due",
            cents: stats.next?.balance ?? 0,
            meta: stats.next ? `${stats.next.number} · ${day(stats.next.dueOn)} · ${due(stats.next.dueOn)}` : "Nothing due",
          },
        ].map((f, n) => (
          <Card key={f.label} i={n + 1} className="grid min-h-[9.5rem] content-between gap-5">
            <span className={`flex items-center gap-2 ${LABEL} text-tertiary`}>
              {f.alert ? <span aria-hidden className="size-1.5 rounded-full bg-alert" /> : null}
              {f.label}
            </span>
            <span className="grid gap-1">
              <Money cents={f.cents} size="md" className={f.alert ? "text-signal-700" : ""} />
              <span className={`truncate ${META} text-[0.75rem]`}>{f.meta}</span>
            </span>
          </Card>
        ))}
      </div>

      {/* The ledger ------------------------------------------------------------- */}
      <section aria-label="Invoices" className="gs-rise gs-card rounded-[1.75rem] p-3 [--i:5] sm:p-4">
        <div className="flex flex-wrap items-center justify-between gap-3 p-2 pb-3">
          <div className="flex flex-wrap items-center gap-2">
            {tabs ? (
              <nav aria-label="Direction" className="flex gap-0.5 rounded-pill bg-ink-950/[0.045] p-1">
                {tabs.map((t) => (
                  <Link
                    key={t.href}
                    href={t.href}
                    aria-current={t.active ? "page" : undefined}
                    className={`gs-press inline-flex h-8 items-center rounded-pill px-3.5 ${LABEL} ${t.active ? "gs-ink" : "text-ink-800 hover:bg-white"}`}
                  >
                    {t.label}
                  </Link>
                ))}
              </nav>
            ) : null}
            <div role="tablist" aria-label="Status" className="flex gap-0.5">
              {filters.map((f) => (
                <button
                  key={f.key}
                  role="tab"
                  type="button"
                  aria-selected={f.key === filter}
                  onClick={() => setFilter(f.key)}
                  className={`gs-press h-8 rounded-pill px-3 text-[0.75rem] font-medium ${f.key === filter ? "bg-ink-950/[0.07] text-primary" : "text-tertiary hover:text-primary"}`}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>
          {projects.length ? (
            <Pill tone="ink" onClick={() => setUpload(true)}>
              <Upload aria-hidden className="size-4" strokeWidth={1.5} />
              {role === "studio" ? "Upload invoice" : "Submit invoice"}
            </Pill>
          ) : null}
        </div>

        <div className={`hidden gap-4 border-b border-ink-950/[0.08] px-3 pb-2.5 md:grid ${showProject ? "md:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)_5rem_5rem_6.5rem_7rem_1rem]" : "md:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)_5rem_5rem_6.5rem_7rem_1rem]"}`}>
          {["Invoice", direction === "payable" ? "From" : "Client", "Issued", "Due", "Amount", "Status", ""].map((h) => (
            <span key={h} className={`${LABEL} text-tertiary ${h === "Amount" ? "text-right" : ""}`}>
              {h}
            </span>
          ))}
        </div>

        {shown.length ? (
          <ul className={DIVIDE}>
            {shown.map((r) => {
              const s = statusOf(r);
              return (
                <li key={r.id}>
                  <button
                    type="button"
                    onClick={() => setOpenId(r.id)}
                    className="group grid w-full grid-cols-[minmax(0,1fr)_auto] items-center gap-x-4 gap-y-1 rounded-[1rem] px-3 py-3.5 text-left transition-colors hover:bg-ink-950/[0.025] md:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)_5rem_5rem_6.5rem_7rem_1rem]"
                  >
                    <span className="grid min-w-0 gap-0.5">
                      <span className="text-[0.8125rem] font-medium tabular-nums">{r.number}</span>
                      <span className={`flex min-w-0 items-center gap-1.5 ${META} text-[0.75rem]`}>
                        {showProject ? <span className="size-2 shrink-0 rounded-[0.1875rem]" style={{ backgroundColor: r.project.chip }} aria-hidden /> : null}
                        <span className="truncate">
                          {r.label}
                          {showProject ? ` · ${r.project.code}` : ""}
                        </span>
                      </span>
                    </span>
                    <span className="hidden truncate text-[0.8125rem] text-secondary md:block">{counterparty(r)}</span>
                    <span className={`hidden ${META} text-[0.75rem] tabular-nums md:block`}>{day(r.issuedOn)}</span>
                    <span className={`hidden text-[0.75rem] tabular-nums md:block ${r.overdue ? "text-signal-700" : "text-tertiary"}`}>{day(r.dueOn)}</span>
                    <span className="grid justify-items-end gap-0.5 md:block md:text-right">
                      <span className="text-[0.8125rem] font-medium tabular-nums">{money(r.amount)}</span>
                      {r.balance > 0 && r.balance < r.amount ? <span className={`block ${META} text-[0.6875rem] tabular-nums`}>{money(r.balance)} left</span> : null}
                    </span>
                    <span className="col-span-2 md:col-span-1">
                      <Chip tone={s.tone}>{s.label}</Chip>
                    </span>
                    <ChevronRight aria-hidden className="hidden size-4 text-ink-300 transition-transform group-hover:translate-x-0.5 group-hover:text-primary md:block" strokeWidth={1.5} />
                  </button>
                </li>
              );
            })}
          </ul>
        ) : (
          <div className="p-2">
            <Empty title={filter === "all" ? "No invoices yet." : `Nothing ${active.label.toLowerCase()}.`} />
          </div>
        )}
      </section>

      <InvoiceSheet row={open} role={role} onClose={() => setOpenId(null)} onPay={pay} />
      {projects.length ? (
        <UploadInvoiceSheet open={upload} onClose={() => setUpload(false)} role={role} projects={projects} nextNumber={nextNumber} onDone={setToast} />
      ) : null}

      {toast ? (
        <p role="status" className="gs-rise fixed bottom-6 left-1/2 z-[60] -translate-x-1/2 rounded-pill bg-ink-950 px-5 py-3 text-[0.8125rem] font-medium whitespace-nowrap text-white shadow-float">
          {toast}
        </p>
      ) : null}
    </div>
  );
}
