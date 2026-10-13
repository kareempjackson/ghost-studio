import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight, Lock, Receipt, Upload } from "lucide-react";
import { getContractorHome } from "@/lib/portal/data";
import { TODAY, day, dayLong, due, firstName, greeting, money, pad, when } from "@/lib/portal/format";
import { stageChip, waitsOn } from "@/lib/portal/stage";
import type { Viewer } from "@/lib/portal/types";
import { Card, CardHead, Chip, CornerArrow, Count, DIVIDE, Empty, LABEL, META, Money, PageHead, Pill, ProjectStatus, TITLE } from "../ui";

/**
 * A contractor's morning: their own work and where each piece stands (what
 * came back first), what the studio said, what the studio owes them, and
 * what they agreed to do. Never the client's thread or the client's money.
 */
export async function ContractorHome({ viewer }: { viewer: Viewer }) {
  const data = await getContractorHome(viewer);
  if (!data) return null;
  const { cards, mine, threads, invoices, actions } = data;
  const waiting = mine.filter((i) => waitsOn(i.stage, viewer.role, i.mine)).length;
  const unread = threads.reduce((n, t) => n + t.unread, 0);

  return (
    <div className="grid gap-4 lg:gap-5">
      <PageHead
        eyebrow={dayLong(TODAY)}
        title={`${greeting()}, ${firstName(viewer.person.name)}.`}
        lede={
          waiting
            ? `${waiting === 1 ? "One piece" : `${waiting} pieces`} came back with changes.`
            : mine.length
              ? "Nothing's waiting on you. Your work is with the studio."
              : "Nothing's waiting on you."
        }
      >
        <Pill tone="white" href="/portal/payments">
          <Receipt aria-hidden className="size-4" strokeWidth={1.5} />
          Submit invoice
        </Pill>
        <Pill tone="ink" href="/portal/reviews?submit=1">
          <Upload aria-hidden className="size-4" strokeWidth={1.5} />
          Submit work
        </Pill>
      </PageHead>

      <div className="grid grid-cols-[minmax(0,1fr)] gap-4 lg:grid-cols-12 lg:gap-5">
        <Card i={1} className="lg:col-span-7" aria-labelledby="ct-work">
          <CardHead id="ct-work" title="Your work" meta={mine.length ? `${mine.length} ${mine.length === 1 ? "piece" : "pieces"} you've submitted` : "Nothing submitted yet"}>
            <CornerArrow href="/portal/reviews" label="All reviews" />
          </CardHead>
          {mine.length ? (
            <ul className={`mt-3 ${DIVIDE}`}>
              {mine.map((item) => {
                const chip = stageChip(item.stage, viewer.role, item.mine);
                return (
                  <li key={item.id}>
                    <Link href={item.href} className="group flex items-center gap-4 py-3.5">
                      <span
                        className="relative h-14 w-20 shrink-0 overflow-hidden rounded-[0.75rem]"
                        style={{ backgroundColor: item.project.ground, boxShadow: "inset 0 0 0 1px rgb(14 13 11 / 0.05)" }}
                      >
                        {item.thumb ? <Image src={item.thumb} alt="" fill unoptimized className="object-cover" /> : null}
                      </span>
                      <span className="grid min-w-0 flex-1 gap-1">
                        <span className={`truncate ${TITLE} text-[0.875rem] transition-colors group-hover:text-accent`}>
                          {item.title} <span className="font-normal text-tertiary">v{pad(item.version)}</span>
                        </span>
                        <span className="flex items-center gap-2">
                          <Chip colour={item.project.chip}>{item.project.code}</Chip>
                          {item.dueOn ? <span className={`${META} text-[0.75rem]`}>{due(item.dueOn)}</span> : null}
                        </span>
                      </span>
                      <Chip tone={chip.tone}>{chip.label}</Chip>
                    </Link>
                  </li>
                );
              })}
            </ul>
          ) : (
            <div className="mt-5">
              <Empty title="Nothing submitted yet." body="When you put work up for review, it shows here with where it stands." />
            </div>
          )}
        </Card>

        <Card i={2} className="lg:col-span-5" aria-labelledby="ct-studio">
          <CardHead id="ct-studio" title="From the studio" meta="Internal threads">
            <Count n={unread} />
          </CardHead>
          <ul className={`mt-3 ${DIVIDE}`}>
            {threads.map((t) => (
              <li key={t.id}>
                <Link href={`/portal/projects/${t.project.slug}/messages`} className="group flex gap-3 py-3.5">
                  <span className={`grid size-9 shrink-0 place-items-center rounded-[0.75rem] ${LABEL} text-ink-800`} style={{ backgroundColor: t.project.chip }}>
                    {t.project.code.replace("GS-", "")}
                  </span>
                  <span className="grid min-w-0 flex-1 gap-0.5">
                    <span className="flex items-center gap-2">
                      <span className={`truncate ${TITLE} text-[0.8125rem]`}>{t.project.name}</span>
                      <Lock aria-label="Internal" className="size-3 shrink-0 text-tertiary" strokeWidth={1.5} />
                      <span className={`ml-auto shrink-0 ${META} text-[0.6875rem]`}>{when(t.last.at)}</span>
                    </span>
                    <span className={`line-clamp-2 text-[0.8125rem] leading-[1.45] ${t.unread ? "text-primary" : "text-secondary"}`}>
                      {t.lastAuthor.id === viewer.person.id ? "You" : t.lastAuthor.name.split(" ")[0]}: {t.last.body}
                    </span>
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </Card>

        <Card i={3} className="flex flex-col lg:col-span-4" aria-labelledby="ct-money">
          <CardHead id="ct-money" title="Owed to you" meta={invoices.summary.next ? `${invoices.summary.next.number} · due ${day(invoices.summary.next.dueOn)}` : "All settled"}>
            <CornerArrow href="/portal/payments" label="Your invoices" />
          </CardHead>
          <div className="mt-auto grid gap-1.5 pt-10">
            <Money cents={invoices.summary.outstanding} />
            <span className={`${META} text-[0.75rem]`}>
              {invoices.paidThisYear ? `Paid to you this year: ${money(invoices.paidThisYear)}` : "No payments yet this year"}
            </span>
          </div>
        </Card>

        <Card i={4} className="lg:col-span-4" aria-labelledby="ct-actions">
          <CardHead id="ct-actions" title="On your list" meta="From meeting notes" />
          {actions.length ? (
            <ul className="mt-3 grid gap-1">
              {actions.map((a) => (
                <li key={`${a.href}-${a.id}`}>
                  <Link href={a.href} className="-mx-2 flex items-start gap-3 rounded-[0.875rem] p-2 transition-colors hover:bg-ink-950/[0.025]">
                    <span aria-hidden className="mt-0.5 size-[1.125rem] shrink-0 rounded-[0.375rem] bg-white ring-1 ring-inset ring-ink-950/20" />
                    <span className="grid min-w-0 gap-0.5">
                      <span className="text-[0.8125rem] leading-[1.45]">{a.text}</span>
                      <span className={`${META} text-[0.6875rem]`}>
                        {a.dueOn ? `${due(a.dueOn)} · ` : ""}
                        {a.note}
                      </span>
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            <p className={`mt-6 ${META}`}>Nothing assigned to you.</p>
          )}
        </Card>

        <Card i={5} className="lg:col-span-4" aria-labelledby="ct-projects">
          <CardHead id="ct-projects" title="Your projects" meta={`${cards.length} with the studio`} />
          <ul className="mt-3 grid gap-0.5">
            {cards.map(({ project, org }) => (
              <li key={project.id}>
                <Link href={`/portal/projects/${project.slug}`} className="group/p -mx-2.5 flex items-center gap-3.5 rounded-[1.125rem] p-2.5 transition-colors hover:bg-ink-950/[0.03]">
                  <span className={`grid size-11 shrink-0 place-items-center rounded-[0.875rem] ${LABEL} text-ink-800`} style={{ backgroundColor: project.ground, boxShadow: "inset 0 0 0 1px rgb(14 13 11 / 0.05)" }}>
                    {project.code.replace("GS-", "")}
                  </span>
                  <span className="grid min-w-0 flex-1 gap-1">
                    <span className={`truncate ${TITLE} text-[0.8125rem]`}>{project.name}</span>
                    <span className="flex items-center gap-2">
                      <ProjectStatus status={project.status} />
                      <span className={`truncate ${META} text-[0.6875rem]`}>{org.name}</span>
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
