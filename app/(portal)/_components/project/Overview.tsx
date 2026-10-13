import Image from "next/image";
import Link from "next/link";
import { Mail, MessageSquare } from "lucide-react";
import { notFound } from "next/navigation";
import { getOverview } from "@/lib/portal/data";
import { day, daysUntil, due, money, pad, when } from "@/lib/portal/format";
import { stageChip } from "@/lib/portal/stage";
import { getViewer } from "@/lib/portal/viewer";
import { Avatar, Card, CardHead, Chip, CornerArrow, DIVIDE, LABEL, META, Money, Pill, ProgressBar, TITLE } from "../ui";

const ROLE_NAME = { lead: "Lead", studio: "Studio", contractor: "Contractor", client: "Client" } as const;

/**
 * A project at a glance: where the milestones stand, who owes what, the
 * work in review, the last word in the conversation, the team, the money and
 * what happened lately. Every card is a door to its own page.
 */
export async function Overview({ slug }: { slug: string }) {
  const viewer = await getViewer();
  const data = await getOverview(slug, viewer);
  if (!data) notFound();
  const { milestones, awaiting, items, latest, team, money: owed, activity } = data;
  const base = `/portal/projects/${slug}`;
  const done = milestones.filter((m) => m.status === "done").length;
  const current = milestones.find((m) => m.status !== "done");
  const people = team.filter(({ role }) => viewer.role !== "client" || role !== "contractor");

  return (
    <div className="grid grid-cols-[minmax(0,1fr)] gap-4 lg:grid-cols-12 lg:gap-5">
      {/* Milestones ------------------------------------------------------- */}
      <Card i={1} className="lg:col-span-8" aria-labelledby="ov-milestones">
        <CardHead id="ov-milestones" title="Milestones" meta={`${done} of ${milestones.length} complete`}>
          <CornerArrow href={`${base}/milestones`} label="All milestones" />
        </CardHead>
        <ol className="mt-7 grid gap-4 sm:gap-3" style={{ gridTemplateColumns: `repeat(${milestones.length}, minmax(0, 1fr))` }}>
          {milestones.map((m) => {
            const isCurrent = m.id === current?.id;
            return (
              <li key={m.id} className="grid content-start gap-2.5" aria-current={isCurrent ? "step" : undefined}>
                <span
                  className={`h-1.5 rounded-pill ${m.status === "done" ? "bg-acid-300" : isCurrent ? "bg-ink-950" : "gs-hatch bg-ink-950/[0.04] text-ink-300"}`}
                />
                <span className={`${LABEL} ${isCurrent ? "text-primary" : "text-tertiary"}`}>{pad(m.position)}</span>
                <span className={`hidden ${TITLE} text-[0.8125rem] sm:block ${m.status === "upcoming" ? "text-secondary" : ""}`}>{m.title}</span>
                <span className={`hidden ${META} text-[0.75rem] sm:block`}>
                  {m.status === "done" ? `Done ${day(m.completedOn ?? m.dueOn)}` : day(m.dueOn)}
                </span>
              </li>
            );
          })}
        </ol>
        {current ? (
          <div className="mt-6 flex flex-col gap-3 rounded-[1.25rem] bg-ink-950/[0.035] p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5">
            <div className="grid gap-1">
              <span className={`${LABEL} text-tertiary`}>Now · {pad(current.position)}</span>
              <span className={`${TITLE} text-[1rem]`}>{current.title}</span>
              <span className={META}>{current.summary}</span>
            </div>
            <Chip tone={daysUntil(current.dueOn) < 7 ? "signal" : "quiet"} dot className="self-start bg-white sm:self-auto">
              {day(current.dueOn)} · {due(current.dueOn)}
            </Chip>
          </div>
        ) : null}
      </Card>

      {/* Awaiting --------------------------------------------------------- */}
      <Card i={2} className="lg:col-span-4" aria-labelledby="ov-awaiting">
        <CardHead id="ov-awaiting" title="Awaiting" meta="Who owes what next" />
        {awaiting.length ? (
          <ul className="mt-4 grid gap-1.5">
            {awaiting.map((a) => (
              <li key={a.id}>
                <Link href={a.href} className="group flex items-center gap-3 rounded-[1rem] bg-ink-950/[0.03] p-3 pl-3.5 transition-colors hover:bg-ink-950/[0.055]">
                  <span className={`size-1.5 shrink-0 rounded-full ${a.you ? "bg-alert" : "bg-ink-300"}`} aria-hidden />
                  <span className="grid min-w-0 flex-1 gap-0.5">
                    <span className="truncate text-[0.8125rem] font-medium tracking-[-0.01em]">{a.what}</span>
                    <span className={`${META} text-[0.75rem]`}>
                      <span className={a.you ? "text-signal-700" : ""}>{a.who}</span> · {a.kind}
                    </span>
                  </span>
                  {a.dueOn ? (
                    <span className={`shrink-0 text-[0.75rem] tabular-nums ${daysUntil(a.dueOn) < 0 ? "text-signal-700" : "text-tertiary"}`}>{due(a.dueOn)}</span>
                  ) : null}
                </Link>
              </li>
            ))}
          </ul>
        ) : (
          <p className={`mt-6 ${META}`}>Nobody owes anything. Enjoy it.</p>
        )}
      </Card>

      {/* Reviews ---------------------------------------------------------- */}
      <Card i={3} className="lg:col-span-7" aria-labelledby="ov-reviews">
        <CardHead id="ov-reviews" title="In review" meta={`${items.length} pieces of work`}>
          <CornerArrow href={`${base}/reviews`} label="All reviews" />
        </CardHead>
        <ul className={`mt-3 ${DIVIDE}`}>
          {items.map((item) => {
            const chip = stageChip(item.stage, viewer.role, item.mine);
            return (
              <li key={item.id}>
                <Link href={item.href} className="group flex items-center gap-4 py-3">
                  <span
                    className="relative h-12 w-[4.75rem] shrink-0 overflow-hidden rounded-[0.75rem]"
                    style={{ backgroundColor: item.project.ground, boxShadow: "inset 0 0 0 1px rgb(14 13 11 / 0.05)" }}
                  >
                    {item.thumb ? (
                      <Image src={item.thumb} alt="" fill unoptimized className="object-cover" />
                    ) : null}
                  </span>
                  <span className="grid min-w-0 flex-1 gap-0.5">
                    <span className={`truncate ${TITLE} text-[0.875rem] transition-colors group-hover:text-accent`}>{item.title}</span>
                    <span className={`${META} text-[0.75rem]`}>
                      v{pad(item.version)}
                      {item.milestone ? ` · ${item.milestone}` : ""}
                      {item.openComments ? ` · ${item.openComments} open` : ""}
                    </span>
                  </span>
                  <Chip tone={chip.tone}>{chip.label}</Chip>
                </Link>
              </li>
            );
          })}
        </ul>
      </Card>

      {/* Latest message --------------------------------------------------- */}
      <Card i={4} className="flex flex-col lg:col-span-5" aria-labelledby="ov-latest">
        <CardHead id="ov-latest" title="Latest" meta={latest ? (latest.kind === "internal" ? "Internal thread" : "With the client") : "No messages yet"}>
          <CornerArrow href={`${base}/messages`} label="Messages" />
        </CardHead>
        {latest ? (
          <div className="mt-5 flex flex-1 flex-col justify-between gap-5">
            <figure className="grid gap-2.5">
              <figcaption className="flex items-center gap-2.5">
                <Avatar person={latest.author} size="sm" />
                <span className="text-[0.8125rem] font-medium">{latest.author.id === viewer.person.id ? "You" : latest.author.name}</span>
                {latest.message.source === "email" ? (
                  <Chip tone="outline" dot={false}>
                    <Mail aria-hidden className="size-3" strokeWidth={1.5} />
                    Email
                  </Chip>
                ) : null}
                <span className={`ml-auto ${META} text-[0.75rem]`}>{when(latest.message.at)}</span>
              </figcaption>
              <blockquote className="rounded-[1.25rem] rounded-tl-[0.375rem] bg-ink-950/[0.035] px-4 py-3.5 text-[0.875rem] leading-[1.55] tracking-[-0.005em]">
                {latest.message.body}
              </blockquote>
            </figure>
            <Pill tone="canvas" href={`${base}/messages`} className="self-start">
              <MessageSquare aria-hidden className="size-4" strokeWidth={1.5} />
              Reply
            </Pill>
          </div>
        ) : null}
      </Card>

      {/* Team ------------------------------------------------------------- */}
      <Card i={5} className="lg:col-span-4" aria-labelledby="ov-team">
        <CardHead id="ov-team" title="Team" meta={`${people.length} people`} />
        <ul className="mt-3 grid">
          {people.map(({ person, role }) => (
            <li key={person.id} className="flex items-center gap-3 py-2">
              <Avatar person={person} size="md" />
              <span className="grid min-w-0 flex-1 gap-0.5">
                <span className="truncate text-[0.8125rem] font-medium tracking-[-0.01em]">
                  {person.name}
                  {person.status === "invited" ? <span className="font-normal text-tertiary"> · invited</span> : null}
                </span>
                <span className={`truncate ${META} text-[0.75rem]`}>{person.title}</span>
              </span>
              <Chip tone={role === "lead" ? "ink" : "quiet"}>{ROLE_NAME[role]}</Chip>
            </li>
          ))}
        </ul>
      </Card>

      {/* Payments --------------------------------------------------------- */}
      {owed ? (
        <Card i={6} className="flex flex-col lg:col-span-4" aria-labelledby="ov-money">
          <CardHead id="ov-money" title="Payments" meta={owed.next ? `Next: ${owed.next.number}, ${day(owed.next.dueOn)}` : "Nothing outstanding"}>
            <CornerArrow href={`${base}/payments`} label="Payments" />
          </CardHead>
          <div className="mt-auto grid gap-4 pt-8">
            <div className="grid gap-1.5">
              <span className={`${LABEL} text-tertiary`}>Outstanding</span>
              <Money cents={owed.outstanding} />
            </div>
            <ProgressBar
              label={`${money(owed.paid)} paid of ${money(owed.total)}`}
              segments={[
                { share: owed.paid, tone: "acid" },
                { share: owed.overdue, tone: "alert" },
                { share: owed.outstanding - owed.overdue, tone: "hatch" },
              ]}
            />
            <div className={`flex justify-between ${META} text-[0.75rem]`}>
              <span>Paid {money(owed.paid)}</span>
              <span>of {money(owed.total)}</span>
            </div>
          </div>
        </Card>
      ) : null}

      {/* Activity --------------------------------------------------------- */}
      <Card i={7} className={owed ? "lg:col-span-4" : "lg:col-span-8"} aria-labelledby="ov-activity">
        <CardHead id="ov-activity" title="Activity" meta="Lately" />
        <ol className="mt-4 grid">
          {activity.map((a, n) => (
            <li key={a.id} className="relative flex gap-3 pb-4">
              {n < activity.length - 1 ? <span aria-hidden className="absolute top-7 bottom-1 left-[0.75rem] w-px bg-ink-950/[0.07]" /> : null}
              <Avatar person={a.actor} size="xs" />
              <p className="min-w-0 flex-1 text-[0.8125rem] leading-[1.45] text-secondary">
                <span className="font-medium text-primary">{a.actor.id === viewer.person.id ? "You" : a.actor.name.split(" ")[0]}</span> {a.verb}{" "}
                <span className="text-primary">{a.object}</span>
                <span className={`mt-0.5 block ${META} text-[0.75rem]`}>{when(a.at)}</span>
              </p>
            </li>
          ))}
        </ol>
      </Card>
    </div>
  );
}
