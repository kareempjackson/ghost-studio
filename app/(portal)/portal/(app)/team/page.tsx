import type { Metadata } from "next";
import { UserPlus } from "lucide-react";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import {
  Avatar,
  Card,
  CardHead,
  Chip,
  DIVIDE,
  LABEL,
  META,
  Money,
  PageHead,
  Pill,
  SkeletonCard,
  TITLE,
} from "../../../_components/ui";
import { listTeam } from "@/lib/portal/data";
import { day, money, seen } from "@/lib/portal/format";
import { getViewer } from "@/lib/portal/viewer";

export const metadata: Metadata = { title: "Team" };

/**
 * The studio, and the people it brings in. For contractors, the two things
 * the studio needs to see at a glance: what they're on, and what the studio
 * owes them. The studio's alone.
 */
export default function TeamPage() {
  return (
    <Suspense fallback={<SkeletonCard className="mt-24 h-96" lines={6} />}>
      <Team />
    </Suspense>
  );
}

async function Team() {
  const viewer = await getViewer();
  const team = await listTeam(viewer);
  if (!team) notFound();
  const { studio, contractors } = team;
  const owed = contractors.reduce((n, c) => n + c.payables.outstanding, 0);
  const next = contractors
    .map((c) => ({ person: c.person, invoice: c.payables.next }))
    .filter((c) => c.invoice)
    .sort((a, b) => a.invoice!.dueOn.localeCompare(b.invoice!.dueOn))[0];

  return (
    <div className="grid gap-4 lg:gap-5">
      <PageHead eyebrow={`${studio.length} studio · ${contractors.length} contractors`} title="Team">
        <Pill tone="ink">
          <UserPlus aria-hidden className="size-4" strokeWidth={1.5} />
          Invite a contractor
        </Pill>
      </PageHead>

      <div className="grid grid-cols-[minmax(0,1fr)] gap-4 lg:grid-cols-12 lg:gap-5">
        <Card i={1} className="lg:col-span-8" aria-labelledby="tm-contractors">
          <CardHead id="tm-contractors" title="Contractors" meta="They see only the projects they're on, and never the client's money or mail." />
          <ul className={`mt-3 ${DIVIDE}`}>
            {contractors.map(({ person, projects, inReview, payables, lastInvoice }) => (
              <li key={person.id} className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-x-6 gap-y-3 py-4 sm:grid-cols-[minmax(0,1.5fr)_minmax(0,1.2fr)_minmax(0,0.9fr)]">
                <span className="flex min-w-0 items-center gap-3">
                  <Avatar person={person} size="md" />
                  <span className="grid min-w-0 gap-0.5">
                    <span className={`truncate ${TITLE} text-[0.875rem]`}>{person.name}</span>
                    <span className={`truncate ${META} text-[0.75rem]`}>
                      {person.title} · {person.lastSeenAt ? seen(person.lastSeenAt) : "Not yet in"}
                    </span>
                  </span>
                </span>
                <span className="hidden flex-wrap gap-1.5 sm:flex">
                  {projects.map((p) => (
                    <Chip key={p.code} colour={p.chip}>
                      {p.code}
                    </Chip>
                  ))}
                  {inReview ? <Chip tone="signal">{inReview} open</Chip> : null}
                </span>
                <span className="grid justify-items-end gap-0.5">
                  <span className="text-[0.875rem] font-medium tabular-nums">{payables.outstanding ? money(payables.outstanding) : "—"}</span>
                  <span className={`${META} text-[0.75rem]`}>
                    {payables.next ? `${payables.next.number} · due ${day(payables.next.dueOn)}` : lastInvoice ? `Last paid ${day(lastInvoice.payments.at(-1)?.paidOn ?? lastInvoice.dueOn)}` : "No invoices"}
                  </span>
                </span>
              </li>
            ))}
          </ul>
        </Card>

        <Card i={2} className="flex flex-col lg:col-span-4" aria-labelledby="tm-owed">
          <CardHead id="tm-owed" title="Owed to contractors" meta="Invoices they've sent the studio" />
          <div className="mt-auto grid gap-2 pt-10">
            <Money cents={owed} />
            <p className={`${META} text-[0.8125rem]`}>
              {next?.invoice ? `Next: ${next.person.name.split(" ")[0]}, ${next.invoice.number}, due ${day(next.invoice.dueOn)}` : "Nothing owed."}
            </p>
          </div>
        </Card>

        <Card i={3} className="lg:col-span-12" aria-labelledby="tm-studio">
          <CardHead id="tm-studio" title="Studio" meta="Everything, every client" />
          <ul className="mt-4 grid gap-3 sm:grid-cols-2">
            {studio.map(({ person, projects }) => (
              <li key={person.id} className="flex items-center gap-3.5 rounded-[1.25rem] bg-ink-950/[0.025] p-4 ring-1 ring-inset ring-ink-950/[0.04]">
                <Avatar person={person} size="lg" />
                <span className="grid min-w-0 flex-1 gap-0.5">
                  <span className={`truncate ${TITLE} text-[0.875rem]`}>{person.name}</span>
                  <span className={`truncate ${META} text-[0.75rem]`}>
                    {person.title} · {person.email}
                  </span>
                </span>
                <span className="grid justify-items-end gap-1">
                  <span className={`${LABEL} text-tertiary`}>Leads</span>
                  <span className="text-[0.875rem] font-medium tabular-nums">{projects.filter((p) => p.lead).length}</span>
                </span>
              </li>
            ))}
          </ul>
        </Card>
      </div>
    </div>
  );
}
