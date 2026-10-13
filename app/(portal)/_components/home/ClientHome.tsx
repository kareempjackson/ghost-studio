import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight, Mail, MessageCircle } from "lucide-react";
import { ArrowPill } from "@/app/(site)/_components/ArrowPill";
import { getClientHome, type ItemCard } from "@/lib/portal/data";
import { TODAY, day, dayLong, due, daysUntil, firstName, greeting, money, pad, when } from "@/lib/portal/format";
import { stageChip } from "@/lib/portal/stage";
import type { Viewer } from "@/lib/portal/types";
import {
  Avatar,
  Card,
  CardHead,
  Chip,
  Count,
  CornerArrow,
  Figure,
  LABEL,
  META,
  Money,
  PageHead,
  Pill,
  ProgressBar,
  ProjectStatus,
  DIVIDE,
  RULE,
  TITLE,
} from "../ui";

const WORDS = ["Nothing", "One thing", "Two things", "Three things", "Four things", "Five things"];

/**
 * A client's first screen. It answers, in order: what needs me, where are
 * we, what did the studio say, what do I owe. The greeting leads, and the
 * rest is a grid of cards, each one a door to the screen that holds the rest.
 */
export async function ClientHome({ viewer }: { viewer: Viewer }) {
  const { cards, waiting, nextMilestone, latest, money: owed } = await getClientHome(viewer);

  return (
    <div className="grid gap-4 lg:gap-5">
      <PageHead
        eyebrow={dayLong(TODAY)}
        title={`${greeting()}, ${firstName(viewer.person.name)}.`}
        lede={
          waiting.length
            ? `${WORDS[Math.min(waiting.length, WORDS.length - 1)]} ${waiting.length === 1 ? "needs" : "need"} your eye this week.`
            : "Nothing needs you today. The studio will let you know."
        }
      >
        <Pill tone="ink" href="/portal/messages">
          <MessageCircle aria-hidden className="size-4" strokeWidth={1.5} />
          Message the studio
        </Pill>
      </PageHead>

      <div className="grid grid-cols-[minmax(0,1fr)] gap-4 lg:grid-cols-12 lg:gap-5">
        <NeedsYou items={waiting} />

        {nextMilestone ? (
          <Card i={2} className="flex flex-col lg:col-span-5" aria-labelledby="home-milestone">
            <CardHead id="home-milestone" title="Next milestone" meta={`${nextMilestone.project.code} · ${nextMilestone.project.name}`}>
              <CornerArrow href={`/portal/projects/${nextMilestone.project.slug}/milestones`} label="All milestones" />
            </CardHead>
            <div className="mt-8 flex items-end justify-between gap-4">
              <Figure value={pad(nextMilestone.milestone.position)} unit={`/ ${pad(nextMilestone.all.length)}`} size="xl" />
              <Chip tone={daysUntil(nextMilestone.milestone.dueOn) < 7 ? "signal" : "quiet"} dot>
                {day(nextMilestone.milestone.dueOn)} · {due(nextMilestone.milestone.dueOn)}
              </Chip>
            </div>
            <p className={`mt-4 ${TITLE} text-[1.125rem]`}>{nextMilestone.milestone.title}</p>
            <p className={`mt-1 ${META}`}>{nextMilestone.milestone.summary}</p>
            <div className="mt-6 grid gap-2.5">
              <ProgressBar
                label={`Milestone ${nextMilestone.milestone.position} of ${nextMilestone.all.length}`}
                segments={nextMilestone.all.map((m) => ({
                  share: 1,
                  tone: m.status === "done" ? "acid" : m.id === nextMilestone.milestone.id ? "ink" : "hatch",
                }))}
              />
              <div className="grid" style={{ gridTemplateColumns: `repeat(${nextMilestone.all.length}, minmax(0, 1fr))` }}>
                {nextMilestone.all.map((m) => (
                  <span key={m.id} className={`${LABEL} ${m.id === nextMilestone.milestone.id ? "text-primary" : "text-tertiary"}`}>
                    {pad(m.position)}
                  </span>
                ))}
              </div>
            </div>
            {nextMilestone.items.length ? (
              <ul className={`mt-6 grid border-t pt-2 ${RULE}`}>
                {nextMilestone.items.map((item) => {
                  const chip = stageChip(item.stage, viewer.role, item.mine);
                  return (
                    <li key={item.id}>
                      <Link href={item.href} className="flex items-center justify-between gap-3 py-2.5 text-[0.875rem] tracking-[-0.01em] transition-colors hover:text-accent">
                        <span className="truncate">{item.title}</span>
                        <Chip tone={chip.tone}>{chip.label}</Chip>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            ) : null}
            {nextMilestone.then ? (
              <div className="mt-auto pt-5">
                <div className="flex items-center gap-4 rounded-[1rem] bg-ink-950/[0.035] px-4 py-3">
                  <span className={`${LABEL} text-tertiary`}>Then</span>
                  <span className="flex-1 truncate text-[0.875rem] tracking-[-0.01em]">
                    {pad(nextMilestone.then.position)} {nextMilestone.then.title}
                  </span>
                  <span className={META}>{day(nextMilestone.then.dueOn)}</span>
                </div>
              </div>
            ) : null}
          </Card>
        ) : null}

        <Card i={3} className="lg:col-span-5" aria-labelledby="home-messages">
          <CardHead id="home-messages" title="Messages" meta="From the studio, here and by email">
            <CornerArrow href="/portal/messages" label="All messages" />
          </CardHead>
          <ul className={`mt-3 ${DIVIDE}`}>
            {latest.map(({ message, author, project }) => (
              <li key={message.id}>
                <Link href={`/portal/projects/${project.slug}/messages`} className="group/m flex gap-3 py-3.5">
                  <Avatar person={author} size="sm" />
                  <span className="min-w-0 flex-1">
                    <span className="flex items-center gap-2">
                      <span className="text-[0.8125rem] font-medium tracking-[-0.01em]">{author.id === viewer.person.id ? "You" : author.name}</span>
                      {message.source === "email" ? (
                        <Mail aria-label="By email" className="size-3 text-tertiary" strokeWidth={1.5} />
                      ) : null}
                      <span className={`ml-auto shrink-0 ${META} text-[0.75rem]`}>{when(message.at)}</span>
                    </span>
                    <span className="mt-0.5 line-clamp-2 block text-[0.8125rem] leading-[1.45] text-secondary transition-colors group-hover/m:text-primary">
                      {message.body}
                    </span>
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </Card>

        <Card i={4} className="flex flex-col lg:col-span-3" aria-labelledby="home-owed">
          <CardHead id="home-owed" title="Outstanding" meta={owed.next ? `${owed.next.number} · due ${day(owed.next.dueOn)}` : "All paid. Thank you."}>
            <CornerArrow href="/portal/payments" label="Payments" />
          </CardHead>
          <div className="mt-auto grid gap-4 pt-10">
            <Money cents={owed.outstanding} />
            <ProgressBar
              label={`${money(owed.paid)} paid of ${money(owed.total)}`}
              segments={[
                { share: owed.paid, tone: "acid" },
                { share: owed.outstanding, tone: "hatch" },
              ]}
            />
            <div className={`flex justify-between ${META} text-[0.75rem]`}>
              <span>Paid {money(owed.paid)}</span>
              <span>of {money(owed.total)}</span>
            </div>
          </div>
        </Card>

        <Card i={5} className="lg:col-span-4" aria-labelledby="home-projects">
          <CardHead id="home-projects" title="Your projects" meta={`${cards.length} with the studio`}>
            <CornerArrow href="/portal/projects" label="All projects" />
          </CardHead>
          <ul className="mt-3 grid gap-0.5">
            {cards.map(({ project, done, milestoneCount }) => (
              <li key={project.id}>
                <Link href={`/portal/projects/${project.slug}`} className="group/p -mx-2.5 flex items-center gap-3.5 rounded-[1.125rem] p-2.5 transition-colors hover:bg-ink-950/[0.03]">
                  <span
                    className={`grid size-12 shrink-0 place-items-center rounded-[0.875rem] ${LABEL} text-ink-800`}
                    style={{ backgroundColor: project.ground, boxShadow: "inset 0 0 0 1px rgb(14 13 11 / 0.05)" }}
                  >
                    {project.code.replace("GS-", "")}
                  </span>
                  <span className="grid min-w-0 flex-1 gap-1.5">
                    <span className={`truncate ${TITLE} text-[0.875rem]`}>{project.name}</span>
                    <span className="flex items-center gap-2">
                      <ProjectStatus status={project.status} />
                      <span className={`${META} text-[0.75rem]`}>
                        {pad(done)} / {pad(milestoneCount)}
                      </span>
                    </span>
                  </span>
                  <ArrowUpRight aria-hidden className="size-4 text-ink-300 transition-colors group-hover/p:text-primary" strokeWidth={1.5} />
                </Link>
              </li>
            ))}
          </ul>
        </Card>
      </div>
    </div>
  );
}

/** The card that leads: the first piece of work waiting on the client, large, and the rest under it. */
function NeedsYou({ items }: { items: readonly ItemCard[] }) {
  const [first, ...rest] = items;
  return (
    <Card i={1} className="flex flex-col lg:col-span-7" aria-labelledby="home-needs">
      <CardHead id="home-needs" title="Needs your approval" meta={items.length ? `${items.length} waiting on you` : "You're all caught up"}>
        <Count n={items.length} />
      </CardHead>
      {first ? (
        <>
          <div
            className="group relative mt-5 overflow-hidden rounded-[1.25rem]"
            style={{ backgroundColor: first.project.ground, boxShadow: "inset 0 0 0 1px rgb(14 13 11 / 0.05)" }}
          >
            <div className="relative aspect-[16/10]">
              {first.thumb ? (
                <Image src={first.thumb} alt="" fill unoptimized className="object-cover" />
              ) : null}
            </div>
            <div className="absolute top-3.5 left-3.5 flex gap-1.5">
              <Chip colour={first.project.chip} className="bg-white">
                {first.project.code}
              </Chip>
              <Chip tone="ink">v{pad(first.version)}</Chip>
            </div>
            <CornerArrow href={first.href} label={`Review ${first.title}`} tone="white" className="absolute right-3.5 bottom-3.5 size-11" />
          </div>
          <div className="mt-5 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div className="grid gap-1">
              <p className={`${TITLE} text-[1.125rem]`}>{first.title}</p>
              <p className={META}>
                {first.project.name} · {first.dueOn ? `Due ${day(first.dueOn)}` : "No date"}
                {first.openComments ? ` · ${first.openComments} open comments` : ""}
              </p>
            </div>
            <ArrowPill href={first.href} size="sm">
              Review
            </ArrowPill>
          </div>
          {rest.length ? (
            <ul className={`mt-5 grid gap-1 border-t pt-3 ${RULE}`}>
              {rest.map((item) => (
                <li key={item.id}>
                  <Link href={item.href} className="-mx-2 flex items-center gap-3.5 rounded-[1rem] p-2 transition-colors hover:bg-ink-950/[0.03]">
                    <span className="relative h-11 w-[4.5rem] shrink-0 overflow-hidden rounded-[0.625rem]" style={{ backgroundColor: item.project.ground }}>
                      {item.thumb ? <Image src={item.thumb} alt="" fill unoptimized className="object-cover" /> : null}
                    </span>
                    <span className="grid min-w-0 flex-1 gap-0.5">
                      <span className={`truncate ${TITLE} text-[0.875rem]`}>{item.title}</span>
                      <span className={`${META} text-[0.75rem]`}>
                        {item.project.code} · v{pad(item.version)}
                      </span>
                    </span>
                    {item.dueOn ? <span className={`${META} text-[0.75rem]`}>{due(item.dueOn)}</span> : null}
                  </Link>
                </li>
              ))}
            </ul>
          ) : null}
        </>
      ) : (
        <p className={`mt-6 ${META}`}>When the studio sends work your way, it lands here.</p>
      )}
    </Card>
  );
}
