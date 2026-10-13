import Image from "next/image";
import Link from "next/link";
import { Inbox, Mail, Paperclip, Plus, Receipt, Upload } from "lucide-react";
import { getStudioHome, type QueueRow } from "@/lib/portal/data";
import {
  TODAY,
  dateNumber,
  day,
  dayLong,
  due,
  daysUntil,
  firstName,
  greeting,
  isWeekend,
  money,
  pad,
  weekday,
  when,
} from "@/lib/portal/format";
import type { Tone } from "@/lib/portal/stage";
import type { Viewer } from "@/lib/portal/types";
import {
  Avatar,
  Card,
  CardHead,
  Chip,
  CornerArrow,
  Count,
  DIVIDE,
  Figure,
  LABEL,
  META,
  Money,
  PageHead,
  Pill,
  ProgressBar,
  TITLE,
} from "../ui";

const WORDS = ["Nothing", "One thing", "Two things", "Three things", "Four things", "Five things", "Six things", "Seven things"];

const KIND_TONE: Record<QueueRow["kind"], Tone> = {
  "Studio review": "signal",
  "Upload next version": "signal-soft",
  Overdue: "signal",
  "Unfiled email": "quiet",
};

/**
 * The studio's morning: the four numbers that say how the day stands, then
 * one queue of everything waiting on the studio — work to review, versions
 * owed, money that's late, mail to file — and around it the next two weeks,
 * what clients decided, and where the money is.
 */
export async function StudioHome({ viewer }: { viewer: Viewer }) {
  const data = await getStudioHome(viewer);
  if (!data) return null;
  const { stats, queue, days, due: upcoming, decisions, inbox, receivables, payables } = data;
  const mine = queue.filter((q) => q.kind !== "Unfiled email").length;

  return (
    <div className="grid gap-4 lg:gap-5">
      <PageHead
        eyebrow={dayLong(TODAY)}
        title={`${greeting()}, ${firstName(viewer.person.name)}.`}
        lede={`${WORDS[Math.min(mine, WORDS.length - 1)]} ${mine === 1 ? "needs" : "need"} you today, and ${inbox.length} emails need a home.`}
      >
        <Pill tone="white" href="/portal/reviews?submit=1">
          <Upload aria-hidden className="size-4" strokeWidth={1.5} />
          Submit work
        </Pill>
        <Pill tone="ink" href="/portal/clients/new">
          <Plus aria-hidden className="size-4" strokeWidth={1.75} />
          New client
        </Pill>
      </PageHead>

      {/* The four numbers ------------------------------------------------ */}
      <div className="grid gap-4 sm:grid-cols-2 lg:gap-5 xl:grid-cols-4">
        <Stat
          i={1}
          label="Your review"
          href={stats.reviewNext?.href ?? "/portal/reviews"}
          figure={<Figure value={pad(stats.review)} unit={stats.review === 1 ? "piece" : "pieces"} size="lg" />}
          meta={stats.reviewNext ? `${stats.reviewNext.title} · from ${stats.reviewNext.submittedBy.name.split(" ")[0]}` : "Nothing waiting"}
          hot={stats.review > 0}
        />
        <Stat
          i={2}
          label="Client decisions"
          href="/portal/reviews"
          figure={<Figure value={pad(stats.decisions)} unit="this week" size="lg" />}
          meta={stats.decisionsChanges ? `${stats.decisionsChanges} asked for changes` : "All approvals"}
        />
        <Stat
          i={3}
          label="Unread"
          href="/portal/messages"
          figure={<Figure value={pad(stats.unread)} unit="messages" size="lg" />}
          meta={`Across ${stats.unreadThreads} ${stats.unreadThreads === 1 ? "thread" : "threads"}`}
          hot={stats.unread > 0}
        />
        <Stat
          i={4}
          label="Overdue"
          href="/portal/payments"
          figure={<Money cents={stats.overdue} size="lg" className={stats.overdue ? "text-signal-700" : ""} />}
          meta={stats.overdueInvoice ? `${stats.overdueInvoice.number} · ${stats.overdueInvoice.org} · ${stats.overdueInvoice.late} days late` : "Nothing late"}
          hot={stats.overdue > 0}
        />
      </div>

      <div className="grid grid-cols-[minmax(0,1fr)] gap-4 lg:grid-cols-12 lg:gap-5">
        {/* The queue ---------------------------------------------------- */}
        <Card i={5} className="lg:col-span-7" aria-labelledby="st-queue">
          <CardHead id="st-queue" title="Waiting on the studio" meta="Soonest first">
            <Count n={queue.length} />
          </CardHead>
          <ul className={`mt-3 ${DIVIDE}`}>
            {queue.map((q) => (
              <li key={q.id}>
                <Link href={q.href} className="group flex items-center gap-3.5 py-3">
                  <QueueIcon row={q} />
                  <span className="grid min-w-0 flex-1 gap-0.5">
                    <span className={`truncate ${TITLE} text-[0.875rem] transition-colors group-hover:text-accent`}>{q.title}</span>
                    <span className={`truncate ${META} text-[0.75rem]`}>{q.detail}</span>
                  </span>
                  <span className="hidden sm:block">
                    <Chip tone={KIND_TONE[q.kind]}>{q.kind}</Chip>
                  </span>
                  <span className={`w-16 shrink-0 sm:w-20 text-right text-[0.75rem] tabular-nums ${q.dueOn && daysUntil(q.dueOn) < 0 ? "text-signal-700" : "text-tertiary"}`}>
                    {q.dueOn ? due(q.dueOn) : "—"}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </Card>

        {/* Two weeks ---------------------------------------------------- */}
        <Card i={6} className="flex flex-col lg:col-span-5" aria-labelledby="st-weeks">
          <CardHead id="st-weeks" title="Next two weeks" meta={`${upcoming.length} milestones due`} />
          <ol className="mt-5 grid grid-cols-7 gap-1 sm:grid-cols-14" aria-label="The next fourteen days">
            {days.map((d, n) => (
              <li
                key={d.iso}
                aria-label={`${dayLong(d.iso)}${d.marks.length ? `, ${d.marks.length} due` : ""}`}
                className={`grid justify-items-center gap-1.5 rounded-[0.875rem] py-2.5 ${n === 0 ? "gs-ink" : isWeekend(d.iso) ? "text-ink-400" : ""}`}
              >
                <span className={`${LABEL} text-[0.5rem] ${n === 0 ? "text-white/60" : "text-tertiary"}`}>{weekday(d.iso).slice(0, 2)}</span>
                <span className="text-[0.875rem] leading-none tabular-nums">{dateNumber(d.iso)}</span>
                <span className="flex h-1.5 gap-0.5">
                  {d.marks.map((c, k) => (
                    <span key={k} className="size-1.5 rounded-full" style={{ backgroundColor: c, boxShadow: "inset 0 0 0 1px rgb(14 13 11 / 0.15)" }} />
                  ))}
                </span>
              </li>
            ))}
          </ol>
          <ul className={`mt-4 ${DIVIDE}`}>
            {upcoming.map(({ milestone: m, project }) => (
              <li key={m.id}>
                <Link href={`/portal/projects/${project.slug}/milestones`} className="group flex items-center gap-3 py-3">
                  <span className="w-12 shrink-0 text-[0.75rem] text-tertiary tabular-nums">{day(m.dueOn)}</span>
                  <span className="size-2 shrink-0 rounded-[0.1875rem]" style={{ backgroundColor: project.chip }} aria-hidden />
                  <span className="grid min-w-0 flex-1">
                    <span className={`truncate ${TITLE} text-[0.8125rem] transition-colors group-hover:text-accent`}>
                      {pad(m.position)} {m.title}
                    </span>
                    <span className={`truncate ${META} text-[0.75rem]`}>
                      {project.code} · {project.name}
                    </span>
                  </span>
                  <Chip tone={daysUntil(m.dueOn) < 7 ? "signal" : "quiet"} dot>
                    {due(m.dueOn)}
                  </Chip>
                </Link>
              </li>
            ))}
          </ul>
        </Card>

        {/* Decisions ---------------------------------------------------- */}
        <Card i={7} className="lg:col-span-4" aria-labelledby="st-decisions">
          <CardHead id="st-decisions" title="Client decisions" meta="Lately">
            <CornerArrow href="/portal/reviews" label="All reviews" />
          </CardHead>
          <ul className="mt-4 grid gap-4">
            {decisions.map((d) => (
              <li key={d.id}>
                <Link href={d.href} className="group flex gap-3">
                  <Avatar person={d.reviewer} size="sm" />
                  <span className="grid min-w-0 flex-1 gap-1">
                    <span className="text-[0.8125rem] leading-[1.4] text-secondary">
                      <span className="font-medium text-primary">{d.reviewer.name.split(" ")[0]}</span>{" "}
                      {d.decision === "approved" ? "approved" : d.decision === "rejected" ? "rejected" : "asked for changes on"}{" "}
                      <span className="text-primary transition-colors group-hover:text-accent">{d.item}</span>
                    </span>
                    {d.reason ? <span className={`${META} text-[0.75rem]`}>&ldquo;{d.reason}&rdquo;</span> : null}
                    <span className="flex items-center gap-2">
                      <Chip tone={d.decision === "approved" ? "acid" : d.decision === "rejected" ? "ink" : "signal-soft"}>
                        {d.decision === "approved" ? "Approved" : d.decision === "rejected" ? "Rejected" : "Changes"}
                      </Chip>
                      <span className={`${META} text-[0.6875rem]`}>{when(d.at)}</span>
                    </span>
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </Card>

        {/* Mail to file ------------------------------------------------- */}
        <Card i={8} tone="ink" className="flex flex-col lg:col-span-4" aria-labelledby="st-inbox">
          <CardHead id="st-inbox" title="Email to sort" meta="Came in without a thread" inverse>
            <Count n={inbox.length} />
          </CardHead>
          <ul className="mt-4 grid gap-1.5">
            {inbox.map((e) => (
              <li key={e.id} className="grid gap-1.5 rounded-[1.125rem] bg-white/[0.06] p-3.5 ring-1 ring-inset ring-white/[0.06]">
                <span className="flex items-center justify-between gap-3">
                  <span className="truncate text-[0.8125rem] font-medium">{e.fromName}</span>
                  <span className="shrink-0 text-[0.6875rem] text-white/45">{when(e.at)}</span>
                </span>
                <span className="truncate text-[0.8125rem] text-white/75">{e.subject}</span>
                <span className="flex items-center gap-1.5">
                  <span className={`inline-flex h-[1.375rem] items-center gap-1.5 rounded-pill bg-white/10 px-2 ${LABEL} text-white/80`}>
                    {e.guess ? (
                      <>
                        <span className="size-2 rounded-[0.1875rem]" style={{ backgroundColor: e.guess.colour }} aria-hidden />
                        {e.guess.name}
                      </>
                    ) : (
                      "New contact"
                    )}
                  </span>
                  {e.attachments ? (
                    <span className="inline-flex items-center gap-1 text-[0.6875rem] text-white/45">
                      <Paperclip aria-hidden className="size-3" strokeWidth={1.5} />
                      {e.attachments}
                    </span>
                  ) : null}
                </span>
              </li>
            ))}
          </ul>
          <div className="mt-auto pt-5">
            <Link
              href="/portal/messages"
              className="gs-press inline-flex h-9 items-center gap-1.5 rounded-pill bg-white px-4 text-[0.8125rem] font-medium text-ink-950 hover:bg-ink-100"
            >
              <Inbox aria-hidden className="size-4" strokeWidth={1.5} />
              Sort them
            </Link>
          </div>
        </Card>

        {/* Money -------------------------------------------------------- */}
        <Card i={9} className="flex flex-col lg:col-span-4" aria-labelledby="st-money">
          <CardHead id="st-money" title="Money" meta="All clients">
            <CornerArrow href="/portal/payments" label="Payments" />
          </CardHead>
          <div className="mt-6 grid gap-1.5">
            <span className={`${LABEL} text-tertiary`}>Outstanding</span>
            <Money cents={receivables.outstanding} />
          </div>
          <ProgressBar
            className="mt-4"
            label={`${money(receivables.paid)} paid of ${money(receivables.total)}, ${money(receivables.overdue)} overdue`}
            segments={[
              { share: receivables.paid, tone: "acid" },
              { share: receivables.overdue, tone: "alert" },
              { share: receivables.outstanding - receivables.overdue, tone: "hatch" },
            ]}
          />
          <dl className={`mt-5 ${DIVIDE}`}>
            {[
              ["Paid to date", money(receivables.paid)],
              ["Overdue", money(receivables.overdue)],
              ["Owed to contractors", money(payables.outstanding)],
            ].map(([k, v]) => (
              <div key={k} className="flex items-center justify-between py-2.5">
                <dt className={`${META} text-[0.8125rem]`}>{k}</dt>
                <dd className={`text-[0.8125rem] font-medium tabular-nums ${k === "Overdue" && receivables.overdue ? "text-signal-700" : ""}`}>{v}</dd>
              </div>
            ))}
          </dl>
        </Card>
      </div>
    </div>
  );
}

function Stat({
  i,
  label,
  href,
  figure,
  meta,
  hot = false,
}: {
  i: number;
  label: string;
  href: string;
  figure: React.ReactNode;
  meta: string;
  hot?: boolean;
}) {
  return (
    <Card i={i} className="group flex min-h-[10.5rem] flex-col justify-between gap-6">
      <div className="flex items-start justify-between gap-3">
        <p className={`flex items-center gap-2 ${LABEL} text-tertiary`}>
          {hot ? <span aria-hidden className="size-1.5 rounded-full bg-alert" /> : null}
          {label}
        </p>
        <CornerArrow href={href} label={label} />
      </div>
      <div className="grid gap-1.5">
        {figure}
        <p className={`truncate ${META} text-[0.75rem]`}>{meta}</p>
      </div>
    </Card>
  );
}

function QueueIcon({ row }: { row: QueueRow }) {
  if (row.thumb && row.project) {
    return (
      <span
        className="relative h-10 w-14 shrink-0 overflow-hidden rounded-[0.625rem]"
        style={{ backgroundColor: row.project.ground, boxShadow: "inset 0 0 0 1px rgb(14 13 11 / 0.05)" }}
      >
        <Image src={row.thumb} alt="" fill unoptimized className="object-cover" />
      </span>
    );
  }
  const Icon = row.kind === "Overdue" ? Receipt : Mail;
  return (
    <span className={`grid h-10 w-14 shrink-0 place-items-center rounded-[0.625rem] ${row.kind === "Overdue" ? "bg-signal-50 text-signal-700" : "bg-ink-950/[0.045] text-ink-600"}`}>
      <Icon aria-hidden className="size-4" strokeWidth={1.5} />
    </span>
  );
}
