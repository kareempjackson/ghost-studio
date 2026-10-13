import type { Metadata } from "next";
import Link from "next/link";
import { Lock, Mail } from "lucide-react";
import { Suspense } from "react";
import { Conversation } from "../../../_components/messages/Conversation";
import { TriageList } from "../../../_components/messages/TriageList";
import { audienceLine } from "../../../_components/messages/audience";
import { Count, Empty, LABEL, META, PageHead, SkeletonCard } from "../../../_components/ui";
import { getThread, getTriage, listThreads } from "@/lib/portal/data";
import { pad, when } from "@/lib/portal/format";
import { getViewer } from "@/lib/portal/viewer";

export const metadata: Metadata = { title: "Messages" };

/**
 * Every conversation the viewer is in, newest first, with the open one
 * beside the list. On a phone it's one or the other: the list, or the thread
 * with a way back.
 */
export default function MessagesPage(props: PageProps<"/portal/messages">) {
  return (
    <Suspense fallback={<Fallback />}>
      <Inbox searchParams={props.searchParams} />
    </Suspense>
  );
}

async function Inbox({ searchParams }: Pick<PageProps<"/portal/messages">, "searchParams">) {
  const { thread: picked, tab } = await searchParams;
  const viewer = await getViewer();
  const threads = await listThreads(viewer);
  const triage = await getTriage(viewer);
  const sorting = Boolean(triage) && tab === "sort";
  const chosen = threads.find((t) => t.id === picked) ?? threads[0];
  const open = chosen && !sorting ? await getThread(chosen.project.slug, chosen.kind, viewer) : null;
  const unread = threads.reduce((n, t) => n + t.unread, 0);

  return (
    <div className="grid gap-4">
      <div className={picked ? "hidden lg:block" : ""}>
        <PageHead eyebrow={unread ? `${pad(unread)} unread` : "All read"} title="Messages" />
      </div>

      {triage ? (
        <nav aria-label="Inbox" className={`gs-rise gs-card flex w-max gap-0.5 rounded-pill p-1 [--i:1] ${picked ? "hidden lg:flex" : ""}`}>
          {[
            { href: "/portal/messages", label: "Conversations", n: unread, on: !sorting },
            { href: "/portal/messages?tab=sort", label: "To sort", n: triage.length, on: sorting },
          ].map((t) => (
            <Link
              key={t.href}
              href={t.href}
              aria-current={t.on ? "page" : undefined}
              className={`gs-press inline-flex h-8 items-center gap-2 rounded-pill px-3.5 ${LABEL} ${t.on ? "gs-ink" : "text-ink-800 hover:bg-ink-950/[0.04]"}`}
            >
              {t.label}
              {t.n ? (
                <span className={`grid h-4 min-w-4 place-items-center rounded-full px-1 text-[0.5625rem] tracking-normal ${t.on ? "bg-white/15" : "bg-alert text-white"}`}>{t.n}</span>
              ) : null}
            </Link>
          ))}
        </nav>
      ) : null}

      {sorting && triage ? (
        <TriageList
          emails={triage.map((e) => ({ ...e, guess: e.guess ? { name: e.guess.name, colour: e.guess.colour } : undefined }))}
        />
      ) : (

      <div className="grid grid-cols-[minmax(0,1fr)] gap-4 lg:grid-cols-[21rem_minmax(0,1fr)] lg:gap-5">
        <nav aria-label="Conversations" className={`gs-rise gs-card self-start rounded-[1.75rem] p-1.5 [--i:1] ${picked ? "hidden lg:block" : ""}`}>
          {threads.length ? (
            <ul className="grid gap-1">
              {threads.map((t) => {
                const active = t.id === chosen?.id;
                return (
                  <li key={t.id}>
                    <Link
                      href={`/portal/messages?thread=${t.id}`}
                      aria-current={active ? "true" : undefined}
                      className={`flex gap-3 rounded-[1.375rem] p-3 transition-colors ${active ? "bg-ink-950/[0.045]" : "hover:bg-ink-950/[0.025]"}`}
                    >
                      <span className={`grid size-10 shrink-0 place-items-center rounded-[0.75rem] ${LABEL} text-ink-800`} style={{ backgroundColor: t.project.chip, boxShadow: "inset 0 0 0 1px rgb(14 13 11 / 0.06)" }}>
                        {t.project.code.replace("GS-", "")}
                      </span>
                      <span className="grid min-w-0 flex-1 gap-1">
                        <span className="flex items-center gap-2">
                          <span className="min-w-0 truncate text-[0.8125rem] font-medium tracking-[-0.01em]">{t.project.name}</span>
                          {t.kind === "internal" ? <Lock aria-label="Internal" className="size-3 shrink-0 text-tertiary" strokeWidth={1.5} /> : null}
                          <span className={`ml-auto shrink-0 ${META} text-[0.6875rem]`}>{when(t.last.at)}</span>
                        </span>
                        <span className="flex min-w-0 items-center gap-2">
                          {t.last.source === "email" ? <Mail aria-label="By email" className="size-3 shrink-0 text-tertiary" strokeWidth={1.5} /> : null}
                          <span className={`min-w-0 truncate text-[0.8125rem] ${t.unread ? "text-primary" : "text-tertiary"}`}>
                            {t.lastAuthor.id === viewer.person.id ? "You" : t.lastAuthor.name.split(" ")[0]}: {t.last.body}
                          </span>
                          <Count n={t.unread} className="ml-auto shrink-0" />
                        </span>
                      </span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          ) : (
            <Empty title="No conversations yet." />
          )}
        </nav>

        {open ? (
          <Conversation
            key={open.thread.id}
            className={`gs-rise [--i:2] h-[calc(100dvh-9rem)] lg:h-[calc(100dvh-13.5rem)] ${picked ? "" : "hidden lg:flex"}`}
            back="/portal/messages"
            viewer={{ personId: viewer.person.id, role: viewer.role }}
            people={open.people}
            messages={open.thread.messages}
            firstUnread={open.firstUnread}
            kind={open.thread.kind}
            kinds={[]}
            project={{ code: open.project.code, name: open.project.name, chip: open.project.chip, href: `/portal/projects/${open.project.slug}` }}
            audience={audienceLine(
              open.thread.kind,
              viewer.role,
              open.team.filter((m) => m.role === "client").map((m) => m.person),
            )}
          />
        ) : null}
      </div>
      )}
    </div>
  );
}

function Fallback() {
  return (
    <div className="grid gap-4 pt-24 lg:grid-cols-[22rem_minmax(0,1fr)]">
      <SkeletonCard className="h-[30rem]" lines={5} />
      <SkeletonCard className="h-[30rem]" lines={6} />
    </div>
  );
}
