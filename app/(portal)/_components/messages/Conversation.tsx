"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, ArrowUp, Lock, Mail, Paperclip } from "lucide-react";
import { Fragment, useEffect, useMemo, useRef, useState, type FormEvent } from "react";
import { TODAY, bytes, dayLong, time } from "@/lib/portal/format";
import type { Message, Person, Role, Thread } from "@/lib/portal/types";
import { Avatar, Chip, IconButton, LABEL } from "../ui";

/** Messages from one person this close together read as one turn. */
const RUN_MS = 10 * 60 * 1000;

export interface ConversationProps {
  readonly viewer: { readonly personId: string; readonly role: Role };
  readonly people: readonly Person[];
  readonly messages: readonly Message[];
  readonly firstUnread?: string;
  readonly kind: Thread["kind"];
  /** The Client / Internal switch, for those who are in both. */
  readonly kinds: readonly { readonly kind: Thread["kind"]; readonly href: string; readonly active: boolean }[];
  readonly project: { readonly code: string; readonly name: string; readonly chip: string; readonly href: string };
  /** Who else will get what's written here, said under the box. */
  readonly audience: string;
  /** On a phone, the way back to the list of threads. */
  readonly back?: string;
  readonly className?: string;
}

/**
 * One conversation, whichever way it arrives. A message written here and a
 * client's reply to an email land in the same thread; mail is marked as
 * mail, with its subject, so nobody wonders why it reads like a letter.
 *
 * The viewer's own messages sit on the right in ink; everyone else's on the
 * left on the canvas. A vermilion rule marks where the unread begins.
 */
export function Conversation({
  viewer,
  people: list,
  messages: initial,
  firstUnread,
  kind,
  kinds,
  project,
  audience,
  back,
  className = "",
}: ConversationProps) {
  const people = useMemo(() => new Map(list.map((p) => [p.id, p])), [list]);
  const [messages, setMessages] = useState(initial);
  const [body, setBody] = useState("");
  const scroller = useRef<HTMLDivElement>(null);
  const field = useRef<HTMLTextAreaElement>(null);

  /* A different thread is a different component (keyed by its id), so the
     messages here only ever start from `initial` once. */
  useEffect(() => {
    /* Only the thread scrolls to its newest message, never the page around it. */
    const el = scroller.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [messages.length]);

  const send = (event?: FormEvent) => {
    event?.preventDefault();
    const text = body.trim();
    if (!text) return;
    const last = messages.at(-1)?.at ?? TODAY;
    setMessages((m) => [
      ...m,
      {
        id: `local-${m.length}`,
        authorId: viewer.personId,
        body: text,
        at: new Date(Math.max(Date.parse(last), Date.parse(TODAY)) + 60_000).toISOString(),
        source: "portal",
      },
    ]);
    setBody("");
    field.current?.focus();
  };

  const members = [...new Set(messages.map((m) => m.authorId))].map((id) => people.get(id)!).filter(Boolean);

  return (
    <section aria-label={`${project.name} — ${kind === "internal" ? "internal" : "client"} thread`} className={`gs-card flex min-h-[28rem] min-w-0 flex-col rounded-[1.75rem] ${className}`}>
      <header className="flex flex-wrap items-center justify-between gap-3 border-b border-ink-950/[0.06] px-4 py-3.5 sm:px-6">
        <div className="flex min-w-0 items-center gap-3">
          {back ? (
            <IconButton label="All messages" href={back} tone="canvas" className="lg:hidden">
              <ArrowLeft aria-hidden className="size-[1.125rem]" strokeWidth={1.5} />
            </IconButton>
          ) : null}
          <div className="grid min-w-0 gap-1.5">
            <div className="flex items-center gap-2">
              <Chip colour={project.chip}>{project.code}</Chip>
              <Link href={project.href} className="truncate text-[0.9375rem] font-medium tracking-[-0.015em] transition-colors hover:text-accent">
                {project.name}
              </Link>
            </div>
            <p className="text-[0.75rem] text-tertiary">
              {kind === "internal" ? "Internal · studio and contractors" : "With the client · portal and email"}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <span className="hidden sm:block">
            <span className="flex items-center">
              {members.slice(0, 4).map((p, n) => (
                <Avatar key={p.id} person={p} size="sm" ring="#ffffff" className={n ? "-ml-2" : ""} />
              ))}
            </span>
          </span>
          {kinds.length > 1 ? (
            <nav aria-label="Thread" className="flex gap-0.5 rounded-pill bg-ink-950/[0.045] p-1">
              {kinds.map((k) => (
                <Link
                  key={k.kind}
                  href={k.href}
                  aria-current={k.active ? "page" : undefined}
                  className={`gs-press inline-flex h-7 items-center gap-1.5 rounded-pill px-3 ${LABEL} ${k.active ? "gs-ink" : "text-secondary hover:text-primary"}`}
                >
                  {k.kind === "internal" ? <Lock aria-hidden className="size-3" strokeWidth={1.5} /> : null}
                  {k.kind === "internal" ? "Internal" : "Client"}
                </Link>
              ))}
            </nav>
          ) : null}
        </div>
      </header>

      <div ref={scroller} className="min-h-0 flex-1 overflow-y-auto px-4 py-6 sm:px-6" aria-live="polite">
        <ol className="grid gap-1">
          {messages.map((m, n) => {
            const prev = messages[n - 1];
            const newDay = !prev || prev.at.slice(0, 10) !== m.at.slice(0, 10);
            const run = !newDay && prev && prev.authorId === m.authorId && Date.parse(m.at) - Date.parse(prev.at) < RUN_MS && m.source === prev.source;
            const mine = m.authorId === viewer.personId;
            const author = people.get(m.authorId);
            return (
              <Fragment key={m.id}>
                {newDay ? (
                  <li className="my-4 flex justify-center">
                    <span className={`rounded-pill bg-ink-950/[0.04] px-2.5 py-1 ${LABEL} text-tertiary`}>{dayLong(m.at)}</span>
                  </li>
                ) : null}
                {m.id === firstUnread ? (
                  <li className="my-3 flex items-center gap-3" aria-label="Unread from here">
                    <span className="h-px flex-1 bg-alert/40" />
                    <span className={`${LABEL} text-alert`}>New</span>
                    <span className="h-px flex-1 bg-alert/40" />
                  </li>
                ) : null}
                <li className={`flex gap-3 ${mine ? "flex-row-reverse" : ""} ${run ? "" : "mt-3"}`}>
                  <span className="w-8 shrink-0">{!run && !mine && author ? <Avatar person={author} size="sm" /> : null}</span>
                  <div className={`grid max-w-[min(38rem,85%)] gap-1.5 ${mine ? "justify-items-end" : ""}`}>
                    {!run ? (
                      <span className={`flex items-center gap-2 px-1 ${mine ? "flex-row-reverse" : ""}`}>
                        <span className="text-[0.75rem] font-medium text-secondary">{mine ? "You" : author?.name}</span>
                        <span className="text-[0.6875rem] text-tertiary tabular-nums">{time(m.at)}</span>
                      </span>
                    ) : null}
                    <div
                      className={`grid gap-2 rounded-[1.25rem] px-4 py-2.5 text-[0.875rem] leading-[1.55] tracking-[-0.005em] ${mine ? "rounded-tr-[0.375rem] bg-ink-950 text-white" : "rounded-tl-[0.375rem] bg-ink-950/[0.045]"} ${run ? (mine ? "rounded-tr-[1.25rem]" : "rounded-tl-[1.25rem]") : ""}`}
                    >
                      {m.source === "email" ? (
                        <span className={`flex items-center gap-2 border-b pb-2 ${mine ? "border-white/15 text-white/60" : "border-ink-950/[0.08] text-tertiary"}`}>
                          <Mail aria-hidden className="size-3.5 shrink-0" strokeWidth={1.5} />
                          <span className={LABEL}>Email</span>
                          {m.subject ? <span className="truncate text-[0.75rem]">{m.subject}</span> : null}
                        </span>
                      ) : null}
                      <p className="whitespace-pre-wrap">{m.body}</p>
                      {m.attachments?.map((f) => (
                        <a
                          key={f.id}
                          href={f.src}
                          download={f.name}
                          className={`flex items-center gap-3 rounded-[0.875rem] p-1.5 pr-4 transition-colors ${mine ? "bg-white/10 hover:bg-white/15" : "bg-white hover:bg-ink-100"}`}
                        >
                          <span className="relative h-9 w-14 shrink-0 overflow-hidden rounded-[0.5rem] bg-ink-950/[0.04]">
                            {f.mime.startsWith("image/") ? <Image src={f.src} alt="" fill unoptimized className="object-cover" /> : null}
                          </span>
                          <span className="grid min-w-0">
                            <span className="truncate text-[0.8125rem] font-medium">{f.name}</span>
                            <span className={`${LABEL} ${mine ? "text-white/55" : "text-tertiary"}`}>{bytes(f.size)}</span>
                          </span>
                        </a>
                      ))}
                    </div>
                  </div>
                </li>
              </Fragment>
            );
          })}
        </ol>
      </div>

      <form onSubmit={send} className="border-t border-ink-950/[0.06] p-3 sm:p-4">
        <div className="flex items-end gap-1.5 rounded-[1.5rem] bg-ink-950/[0.035] p-1.5 transition-shadow focus-within:bg-white focus-within:shadow-[0_0_0_1px_rgb(14_13_11/0.12)]">
          <IconButton label="Attach a file" tone="white">
            <Paperclip aria-hidden className="size-4" strokeWidth={1.5} />
          </IconButton>
          <label htmlFor="message-body" className="sr-only">
            Message
          </label>
          <textarea
            id="message-body"
            ref={field}
            rows={1}
            value={body}
            onChange={(e) => setBody(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                send();
              }
            }}
            placeholder={kind === "internal" ? "Write to the team" : viewer.role === "client" ? "Write to the studio" : "Write to the client"}
            className="max-h-40 min-h-9 min-w-0 flex-1 resize-none bg-transparent px-2 py-2 text-[0.875rem] leading-[1.4] outline-none [field-sizing:content] placeholder:text-ink-400"
          />
          <IconButton label="Send" active onClick={() => send()}>
            <ArrowUp aria-hidden className="size-[1.125rem]" strokeWidth={1.75} />
          </IconButton>
        </div>
        <p className="mt-2 flex items-center gap-1.5 px-2 text-[0.6875rem] text-tertiary">
          {kind === "internal" ? <Lock aria-hidden className="size-3" strokeWidth={1.5} /> : <Mail aria-hidden className="size-3" strokeWidth={1.5} />}
          {audience}
        </p>
      </form>
    </section>
  );
}
