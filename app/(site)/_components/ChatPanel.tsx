"use client";

import { useEffect, useId, useRef } from "react";
import { useChrome } from "./ChromeProvider";
import { Brief } from "./guide/Brief";
import { Picker } from "./guide/Picker";
import { AskBar, Thread } from "./guide/Thread";
import { guide, prepare, shortlistFor, useCatalogue, useGuide } from "./guide/store";
import { KICKER } from "./guide/styles";

/**
 * The site guide's panel: a header that says what it is, then the way in.
 *
 * Two questions narrow the site to a shortlist of real work, the way of
 * working that fits, and something to read (./guide/Picker.tsx). Then the
 * guide answers, from the site's own content, in the studio's voice
 * (./guide/Thread.tsx, app/api/guide). And when the visitor is ready, a brief
 * goes to the team (./guide/Brief.tsx). Everything typed stays in the tab
 * unless it is sent as a brief.
 *
 * It never opens itself, never asks for an address until the brief, and says
 * plainly that its answers are written by AI.
 */
export function ChatPanel({ onClose, path }: { onClose: () => void; path: string }) {
  const {
    settings: { email },
    chat,
  } = useChrome();
  const state = useGuide();
  const loaded = useCatalogue();
  const root = useRef<HTMLDivElement>(null);
  const focused = useRef(false);
  const id = useId();

  useEffect(() => {
    prepare();
    guide.opened();
    /* Closed, the panel opens next time on the guide, not a half-filled brief. */
    return () => guide.show("guide");
  }, []);

  /* Once there is something to choose, focus goes to the first choice, or to
     the question box when the choosing is done. */
  useEffect(() => {
    if (!loaded || focused.current) return;
    focused.current = true;
    root.current
      ?.querySelector<HTMLElement>("[data-autofocus], [data-autofocus-ask]")
      ?.focus({ preventScroll: true });
  }, [loaded]);

  const list = loaded ? shortlistFor(loaded.catalogue, state) : null;
  const shown = [
    ...(list?.paths ?? []),
    ...state.thread.flatMap((said) => said.picks.map((pick) => pick.card.path)),
  ];
  const follow = () => onClose();

  return (
    <div
      ref={root}
      className="flex max-h-[min(46rem,calc(100svh-7.5rem))] w-[min(26rem,calc(100vw-2rem))] flex-col overflow-hidden rounded-[1.25rem] bg-[#f3f2f0] shadow-[0_30px_80px_-24px_rgb(14_13_11/0.45)] max-sm:max-h-[88svh] max-sm:w-full max-sm:rounded-b-none"
    >
      <header className="flex items-start gap-4 bg-[#111] px-5 pt-5 pb-5 text-white">
        <span
          aria-hidden
          className="grid size-11 shrink-0 place-items-center rounded-full bg-white text-[1.25rem] font-bold text-ink-950"
        >
          G
        </span>
        <div className="min-w-0 flex-1">
          <h2 id={`${id}-title`} className="text-[1.25rem] leading-[1.15] font-medium tracking-[-0.03em]">
            {chat.heading}
          </h2>
          <p className="mt-2 text-[0.8125rem] leading-[1.35] text-ink-400">{chat.disclosure}</p>
        </div>
        <button
          type="button"
          onClick={onClose}
          aria-label={chat.closeLabel}
          className="grid size-9 shrink-0 place-items-center rounded-full bg-white/15 text-white transition-colors duration-200 hover:bg-white hover:text-ink-950"
        >
          <svg
            aria-hidden
            viewBox="0 0 16 16"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            className="size-3.5"
          >
            <path d="m4 4 8 8M12 4l-8 8" />
          </svg>
        </button>
      </header>

      <div className="flex-1 overflow-y-auto overscroll-contain px-5 py-5">
        {!loaded ? (
          <p className={`${KICKER} motion-safe:animate-pulse`}>{chat.ask.reading}</p>
        ) : state.view === "brief" ? (
          <Brief chat={chat} state={state} catalogue={loaded.catalogue} studioEmail={email} />
        ) : (
          <>
            <Picker
              chat={chat}
              state={state}
              catalogue={loaded.catalogue}
              canAsk={loaded.canAsk}
              onFollow={follow}
            />
            {(state.picked || state.thread.length > 0) && (
              <div className={list ? "mt-8" : ""}>
                <Thread
                  chat={chat}
                  state={state}
                  path={path}
                  canAsk={loaded.canAsk}
                  shown={shown}
                  onFollow={follow}
                />
              </div>
            )}
          </>
        )}
      </div>

      {loaded && state.view === "guide" && (
        <footer className="border-t border-ink-200 px-4 pt-3 pb-4 sm:px-5">
          {loaded.canAsk && <AskBar chat={chat} state={state} path={path} shown={shown} />}
          <div className={`flex items-center justify-between gap-4 ${loaded.canAsk ? "mt-3 px-1" : ""}`}>
            <button
              type="button"
              onClick={() => guide.show("brief")}
              className="text-[0.875rem] text-ink-950 underline underline-offset-4 hover:text-ink-600"
            >
              {chat.brief.open}
            </button>
            <a
              href={`mailto:${email}`}
              className="truncate text-[0.8125rem] text-ink-600 underline-offset-4 hover:text-ink-950 hover:underline"
            >
              {email}
            </a>
          </div>
        </footer>
      )}
    </div>
  );
}
