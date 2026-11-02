"use client";

import { useEffect, useId, useRef, useState, type FormEvent } from "react";
import { MAX_QUESTION, MAX_TURNS, type GuideError } from "@/lib/guide/protocol";
import type { Chat, StarterPlace } from "@/sanity/types";
import { useVisitor } from "../moment";
import { GuideCards } from "./Cards";
import { guide, type GuideState, type Said } from "./store";
import { ARROW, CHOICE, KICKER } from "./styles";

/** What kind of page the panel is open on, for the questions offered there. */
function placeOf(path: string): StarterPlace {
  if (path === "/") return "home";
  if (/^\/work\/[^/]+/.test(path)) return "work";
  if (/^\/insights\/[^/]+/.test(path)) return "insights";
  if (/^\/(services|build|engage|integrate)(\/|$)/.test(path)) return "services";
  if (path.startsWith("/who-we-serve")) return "audiences";
  if (path.startsWith("/our-approach")) return "approach";
  return "any";
}

/**
 * The questions offered as chips: this kind of page's, or any page's. On the
 * home page, someone back who has read a case study or an insight before is
 * offered the returning set, where there is one.
 */
export function startersFor(chat: Chat, path: string, returning = false) {
  const place = placeOf(path);
  const own =
    (place === "home" && returning ? chat.starters.find((set) => set.where === "returning") : undefined) ??
    chat.starters.find((set) => set.where === place);
  const any = chat.starters.find((set) => set.where === "any");
  return (own ?? any)?.prompts.slice(0, 3) ?? [];
}

/** Why there is no answer, in the guide's words. */
const errorText = (ask: Chat["ask"], error: GuideError) =>
  error === "busy" ? ask.busy : error === "limit" ? ask.limit : ask.error;

/** One answer: its words, the pages it points to, and the way to the brief it drafted. */
function Answer({
  said,
  chat,
  onFollow,
}: {
  said: Said;
  chat: Chat;
  onFollow: () => void;
}) {
  if (said.error) {
    return <p className="text-[0.9375rem] leading-[1.5] text-ink-600">{errorText(chat.ask, said.error)}</p>;
  }
  return (
    <div>
      {said.text ? (
        <div className="space-y-3 text-[0.9375rem] leading-[1.5] tracking-[-0.01em] text-ink-950">
          {said.text
            .split(/\n\s*\n/)
            .filter((part) => part.trim())
            .map((part, i) => (
              <p key={i} className="whitespace-pre-line">
                {part.trim()}
              </p>
            ))}
        </div>
      ) : (
        said.writing && <p className={`${KICKER} motion-safe:animate-pulse`}>{chat.ask.reading}</p>
      )}
      {said.picks.length > 0 && (
        <div className="mt-4">
          <GuideCards cards={said.picks} kinds={chat.picker.kinds} onFollow={onFollow} />
        </div>
      )}
      {said.brief && !said.writing && (
        <button
          type="button"
          onClick={() => guide.show("brief")}
          className="mt-4 inline-flex h-10 items-center rounded-pill bg-ink-950 px-5 font-label text-[0.6875rem] leading-none tracking-[0.08em] text-white uppercase transition-colors duration-200 hover:bg-ink-800"
        >
          {chat.brief.review}
        </button>
      )}
    </div>
  );
}

/**
 * The conversation: the questions offered for this page until the first is
 * asked, then each question and its answer, the answer written in as it
 * arrives. A screen reader hears each answer once, when it is complete.
 */
export function Thread({
  chat,
  state,
  path,
  canAsk,
  shown,
  onFollow,
}: {
  chat: Chat;
  state: GuideState;
  path: string;
  canAsk: boolean;
  shown: readonly string[];
  onFollow: () => void;
}) {
  const end = useRef<HTMLDivElement>(null);
  const last = state.thread.at(-1);
  const heard = [...state.thread].reverse().find((said) => said.from === "guide" && !said.writing);

  /* Keep the newest words in view as they arrive. */
  useEffect(() => {
    end.current?.scrollIntoView({ block: "nearest" });
  }, [state.thread.length, last?.text.length, last?.picks.length]);

  const visitor = useVisitor();
  const readBefore = Boolean(
    visitor &&
      visitor.visits > 1 &&
      [...visitor.read.work, ...visitor.read.insights].some((one) => one.at < visitor.current),
  );
  const starters = canAsk && state.thread.length === 0 ? startersFor(chat, path, readBefore) : [];

  return (
    <div>
      {starters.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {starters.map((question) => (
            <button
              key={question}
              type="button"
              onClick={() => guide.ask(question, path, shown)}
              className={CHOICE}
            >
              {question}
            </button>
          ))}
        </div>
      )}

      {state.thread.length > 0 && (
        <ol className="space-y-5">
          {state.thread.map((said) => (
            <li key={said.id}>
              <span className="sr-only">{said.from === "visitor" ? chat.ask.you : chat.ask.guide}</span>
              {said.from === "visitor" ? (
                <p className="ml-auto w-fit max-w-[85%] rounded-[0.875rem] rounded-br-[0.25rem] bg-ink-950 px-4 py-2.5 text-[0.9375rem] leading-[1.4] tracking-[-0.01em] whitespace-pre-line text-white">
                  {said.text}
                </p>
              ) : (
                <Answer said={said} chat={chat} onFollow={onFollow} />
              )}
            </li>
          ))}
        </ol>
      )}

      <p className="sr-only" aria-live="polite">
        {heard ? heard.text || (heard.error ? errorText(chat.ask, heard.error) : "") : ""}
      </p>
      <div ref={end} />
    </div>
  );
}

/**
 * Where a question is typed. Held while an answer is being written; gone,
 * with a line saying so, once the conversation has run its length.
 */
export function AskBar({
  chat,
  state,
  path,
  shown,
}: {
  chat: Chat;
  state: GuideState;
  path: string;
  shown: readonly string[];
}) {
  const id = useId();
  const [question, setQuestion] = useState("");
  const writing = state.thread.some((said) => said.writing);

  if (state.turns.length >= MAX_TURNS) {
    return <p className="text-[0.8125rem] leading-[1.4] text-ink-600">{chat.ask.limit}</p>;
  }

  function onSubmit(event: FormEvent) {
    event.preventDefault();
    if (!question.trim() || writing) return;
    guide.ask(question, path, shown);
    setQuestion("");
  }

  return (
    <form
      onSubmit={onSubmit}
      className="flex items-center gap-2 rounded-pill bg-white p-1 pl-4 focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-ink-950"
    >
      <label htmlFor={`${id}-question`} className="sr-only">
        {chat.ask.placeholder}
      </label>
      <input
        id={`${id}-question`}
        data-autofocus-ask=""
        value={question}
        onChange={(event) => setQuestion(event.target.value)}
        maxLength={MAX_QUESTION}
        autoComplete="off"
        placeholder={chat.ask.placeholder}
        className="min-w-0 flex-1 bg-transparent py-2 text-[0.9375rem] leading-[1.3] tracking-[-0.01em] text-ink-950 outline-none placeholder:text-ink-500"
      />
      <button
        type="submit"
        disabled={writing || !question.trim()}
        aria-label={chat.ask.send}
        className="grid size-10 shrink-0 place-items-center rounded-pill bg-ink-950 text-white transition-colors duration-200 hover:bg-ink-800 disabled:bg-ink-300"
      >
        <svg
          aria-hidden
          viewBox="0 0 16 16"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.25"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="size-4"
        >
          <path d={ARROW} />
        </svg>
      </button>
    </form>
  );
}
