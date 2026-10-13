import type { Metadata } from "next";
import { ArrowLeft, FileText, Plus, UserPlus } from "lucide-react";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { CopyField, InviteSomeone, ResendInvite } from "../../../../_components/clients/ClientActions";
import { ProjectPlate } from "../../../../_components/project/ProjectGrid";
import { toPlate } from "../../../../_components/project/plates";
import {
  Avatar,
  Card,
  CardHead,
  Chip,
  DIVIDE,
  H1,
  IconButton,
  LABEL,
  META,
  Money,
  OrgMark,
  Pill,
  SkeletonCard,
  TITLE,
} from "../../../../_components/ui";
import { getClient } from "@/lib/portal/data";
import { day, dayYear, money, seen, when } from "@/lib/portal/format";
import { STUDIO_INBOX, replyAddress } from "@/lib/portal/mail";
import { getViewer } from "@/lib/portal/viewer";

export const metadata: Metadata = { title: "Client" };

/**
 * One client, whole: the people in the portal (and who hasn't opened their
 * invitation), the account, their projects, every invoice, and where their
 * mail goes. The studio's alone.
 */
export default function ClientPage({ params }: PageProps<"/portal/clients/[org]">) {
  return (
    <Suspense fallback={<SkeletonCard className="mt-24 h-96" lines={6} />}>
      {params.then(({ org }) => (
        <Client slug={org} />
      ))}
    </Suspense>
  );
}

async function Client({ slug }: { slug: string }) {
  const viewer = await getViewer();
  const client = await getClient(slug, viewer);
  if (!client) notFound();
  const { org, contacts, projects, cards, invoices, activity, money: m, lifetime } = client;

  return (
    <div className="grid gap-4 lg:gap-5">
      <header className="gs-rise flex flex-col gap-5 pt-5 pb-2 lg:flex-row lg:items-end lg:justify-between lg:pt-8 lg:pb-3">
        <div className="flex items-end gap-4">
          <IconButton label="All clients" href="/portal/clients" className="mb-1.5 hidden sm:grid">
            <ArrowLeft aria-hidden className="size-4" strokeWidth={1.5} />
          </IconButton>
          <OrgMark org={org} size="xl" />
          <div className="grid gap-2.5">
            <p className={`${LABEL} text-tertiary`}>
              Client since {dayYear(org.since).replace(/^\d+ /, "")} · {org.website}
            </p>
            <h1 className={H1}>{org.name}</h1>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Pill tone="white">
            <Plus aria-hidden className="size-4" strokeWidth={1.75} />
            New project
          </Pill>
          <InviteSomeone org={org.name} domain={org.domains[0]} projects={projects.map((p) => ({ code: p.code, name: p.name, chip: p.chip }))} />
        </div>
      </header>

      {/* The account, in four figures --------------------------------------- */}
      <section aria-label="Account" className="gs-rise gs-card grid grid-cols-2 rounded-[1.75rem] [--i:1] lg:grid-cols-4">
        {[
          { label: "Outstanding", cents: m.outstanding },
          { label: "Overdue", cents: m.overdue, alert: m.overdue > 0 },
          { label: "Paid to date", cents: m.paid },
          { label: "Billed in all", cents: lifetime },
        ].map((f, n) => (
          <div
            key={f.label}
            className={`grid gap-2 p-5 sm:p-6 lg:p-7 ${n % 2 ? "border-l border-ink-950/[0.06]" : ""} ${n > 1 ? "border-t border-ink-950/[0.06] lg:border-t-0" : ""} ${n === 2 ? "lg:border-l" : ""}`}
          >
            <span className={`flex items-center gap-2 ${LABEL} text-tertiary`}>
              {f.alert ? <span aria-hidden className="size-1.5 rounded-full bg-alert" /> : null}
              {f.label}
            </span>
            <Money cents={f.cents} size="md" className={f.alert ? "text-signal-700" : ""} />
          </div>
        ))}
      </section>

      <div className="grid grid-cols-[minmax(0,1fr)] gap-4 lg:grid-cols-12 lg:gap-5">
        {/* People ---------------------------------------------------------- */}
        <Card i={2} className="lg:col-span-8" aria-labelledby="cl-people">
          <CardHead
            id="cl-people"
            title="People"
            meta={`${contacts.length} in the portal${contacts.some((c) => c.status === "invited") ? ` · ${contacts.filter((c) => c.status === "invited").length} yet to accept` : ""}`}
          />
          <ul className={`mt-3 ${DIVIDE}`}>
            {contacts.map((p) => {
              const on = projects.filter((pr) => pr.members.some((x) => x.personId === p.id));
              return (
                <li key={p.id} className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-x-5 gap-y-2 py-3.5 sm:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)_auto]">
                  <span className="flex min-w-0 items-center gap-3">
                    <Avatar person={p} size="md" />
                    <span className="grid min-w-0 gap-0.5">
                      <span className={`truncate ${TITLE} text-[0.875rem]`}>{p.name}</span>
                      <span className={`truncate ${META} text-[0.75rem]`}>
                        {p.title} · {p.email}
                      </span>
                    </span>
                  </span>
                  <span className="hidden flex-wrap gap-1.5 sm:flex">
                    {on.map((pr) => (
                      <Chip key={pr.id} colour={pr.chip}>
                        {pr.code}
                      </Chip>
                    ))}
                  </span>
                  <span className="flex items-center justify-end gap-2">
                    {p.status === "invited" ? (
                      <>
                        <Chip tone="outline">Invited {p.invitedAt ? day(p.invitedAt) : ""}</Chip>
                        <ResendInvite name={p.name.split(" ")[0]} />
                      </>
                    ) : (
                      <span className="flex items-center gap-1.5 text-[0.75rem] text-tertiary">
                        <span aria-hidden className="size-1.5 rounded-full bg-acid-500" />
                        {p.lastSeenAt ? seen(p.lastSeenAt) : "Active"}
                      </span>
                    )}
                  </span>
                </li>
              );
            })}
          </ul>
          <p className={`mt-3 flex items-center gap-3 rounded-[1.125rem] border border-dashed border-ink-950/[0.12] px-4 py-3.5 ${META} text-[0.8125rem]`}>
            <UserPlus aria-hidden className="size-4 shrink-0" strokeWidth={1.5} />
            Anyone else at {org.name} who should see the work? Invite them, and they&rsquo;ll only see the projects you choose.
          </p>
        </Card>

        {/* The studio's note, and the mail ---------------------------------- */}
        <Card i={3} className="flex min-w-0 flex-col gap-6 lg:col-span-4" aria-labelledby="cl-note">
          <div className="grid gap-3">
            <CardHead id="cl-note" title="Note" meta="Only the studio sees this" />
            <p className="text-[0.875rem] leading-[1.6] text-secondary">{org.note}</p>
          </div>
          <div className="grid min-w-0 gap-3 border-t border-ink-950/[0.06] pt-5">
            <p className={`${TITLE} text-[0.875rem]`}>Mail</p>
            <p className={`${META} text-[0.8125rem] leading-[1.5]`}>
              Anything from <span className="text-primary">@{org.domains[0]}</span> sent or forwarded to the inbox is filed to {org.name}. Each
              project has its own reply address.
            </p>
            {projects
              .filter((p) => p.status !== "complete")
              .slice(0, 2)
              .map((p) => (
                <CopyField key={p.id} label={p.name} value={replyAddress(p.slug)} />
              ))}
            <CopyField label="Studio inbox" value={STUDIO_INBOX} />
          </div>
        </Card>

        {/* Projects --------------------------------------------------------- */}
        <section aria-label="Projects" className="grid gap-4 sm:grid-cols-2 lg:col-span-8 lg:gap-5">
          {cards.map((c, n) => (
            <div key={c.project.id} className="gs-rise" style={{ "--i": 4 + n } as React.CSSProperties}>
              <ProjectPlate plate={toPlate(c)} />
            </div>
          ))}
        </section>

        {/* Activity --------------------------------------------------------- */}
        <Card i={5} className="lg:col-span-4" aria-labelledby="cl-activity">
          <CardHead id="cl-activity" title="Activity" meta="Across their projects" />
          <ol className="mt-4 grid">
            {activity.map((a, n) => (
              <li key={a.id} className="relative flex gap-3 pb-4">
                {n < activity.length - 1 ? <span aria-hidden className="absolute top-7 bottom-1 left-[0.75rem] w-px bg-ink-950/[0.07]" /> : null}
                <Avatar person={a.actor} size="xs" />
                <p className="min-w-0 flex-1 text-[0.8125rem] leading-[1.45] text-secondary">
                  <span className="font-medium text-primary">{a.actor.name.split(" ")[0]}</span> {a.verb} <span className="text-primary">{a.object}</span>
                  <span className={`mt-0.5 block ${META} text-[0.75rem]`}>{when(a.at)}</span>
                </p>
              </li>
            ))}
          </ol>
        </Card>

        {/* Invoices --------------------------------------------------------- */}
        <Card i={6} className="lg:col-span-12" aria-labelledby="cl-invoices">
          <CardHead id="cl-invoices" title="Invoices" meta={`${invoices.length} issued · ${money(m.outstanding)} outstanding`} />
          <div className="mt-4 overflow-x-auto">
            <table className="w-full min-w-[44rem] border-collapse text-left">
              <thead>
                <tr className="border-b border-ink-950/[0.08]">
                  {["Invoice", "For", "Issued", "Due", "Amount", "Status", ""].map((h) => (
                    <th key={h} scope="col" className={`pr-4 pb-3 ${LABEL} font-normal text-tertiary ${h === "Amount" ? "text-right" : ""}`}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className={DIVIDE}>
                {invoices.map((inv) => {
                  const status = inv.balance === 0
                    ? { label: "Paid", tone: "acid" as const }
                    : inv.overdue
                      ? { label: `${money(inv.balance)} overdue`, tone: "signal" as const }
                      : inv.status === "partially_paid"
                        ? { label: "Part paid", tone: "outline" as const }
                        : { label: "Sent", tone: "quiet" as const };
                  return (
                    <tr key={inv.id} className="text-[0.8125rem]">
                      <td className="py-3.5 pr-4 font-medium tabular-nums">{inv.number}</td>
                      <td className="py-3.5 pr-4">
                        <span className="flex items-center gap-2">
                          <span className="size-2 rounded-[0.1875rem]" style={{ backgroundColor: inv.project.chip }} aria-hidden />
                          {inv.label}
                          <span className="text-tertiary">· {inv.project.code}</span>
                        </span>
                      </td>
                      <td className="py-3.5 pr-4 text-secondary tabular-nums">{day(inv.issuedOn)}</td>
                      <td className="py-3.5 pr-4 text-secondary tabular-nums">{day(inv.dueOn)}</td>
                      <td className="py-3.5 pr-4 text-right font-medium tabular-nums">{money(inv.amount)}</td>
                      <td className="py-3.5 pr-4">
                        <Chip tone={status.tone}>{status.label}</Chip>
                      </td>
                      <td className="py-3.5 text-right">
                        <IconButton label={`${inv.number} PDF`} tone="clear" size="sm">
                          <FileText aria-hidden className="size-4" strokeWidth={1.5} />
                        </IconButton>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </div>
  );
}
