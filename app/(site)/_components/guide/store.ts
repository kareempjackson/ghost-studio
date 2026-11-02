"use client";

import { useSyncExternalStore } from "react";
import {
  MAX_TURNS,
  type GuideBrief,
  type GuideContext,
  type GuideError,
  type GuideEvent,
  type GuidePick,
  type SealedTurn,
} from "@/lib/guide/protocol";
import { OTHER, UNSURE, shortlist, type Profile, type Shortlist } from "@/lib/guide/shortlist";
import { track } from "@/lib/track";
import type { GuideCatalogue } from "@/sanity/types";
import { loadGuide } from "./actions";

/** One line of the conversation as the panel draws it. */
export interface Said {
  readonly id: string;
  readonly from: "visitor" | "guide";
  readonly text: string;
  readonly picks: readonly GuidePick[];
  readonly brief: GuideBrief | null;
  readonly error: GuideError | null;
  /** True while the answer is still being written. */
  readonly writing: boolean;
}

export interface GuideState {
  readonly profile: Profile;
  /** Past the two questions: answered both, or skipped them. */
  readonly picked: boolean;
  readonly thread: readonly Said[];
  /** The conversation as the server sealed it, to send back with the next question. */
  readonly turns: readonly SealedTurn[];
  /** The pages read in this tab, oldest first. */
  readonly visited: readonly string[];
  /** The latest brief the guide drafted, for the brief's form. */
  readonly draft: GuideBrief | null;
  readonly view: "guide" | "brief";
  /** When the panel was first opened this tab: the brief's guard against bots counts from it. */
  readonly openedAt: number;
}

const KEY = "gs-guide";
const VISITS = 30;

const EMPTY: GuideState = {
  profile: { audience: null, need: null },
  picked: false,
  thread: [],
  turns: [],
  visited: [],
  draft: null,
  view: "guide",
  openedAt: 0,
};

/* ---- The store ------------------------------------------------------------- */

/*
 * One store for the tab, outside React: every page places its own pill, so
 * the conversation has to outlive each one. It is kept in session storage
 * too, so a reload carries it, and closing the tab ends it. An answer being
 * written carries on if the panel is closed or the reader moves on.
 */

let state: GuideState = EMPTY;
let restored = false;
const listeners = new Set<() => void>();

function restore() {
  if (restored || typeof window === "undefined") return;
  restored = true;
  try {
    const saved = window.sessionStorage.getItem(KEY);
    if (saved) {
      const parsed = JSON.parse(saved) as GuideState;
      /* An answer cut off by a reload is not coming back. */
      state = {
        ...EMPTY,
        ...parsed,
        view: "guide",
        thread: parsed.thread.filter((said) => !said.writing),
      };
    }
  } catch {
    /* Storage blocked or the saved copy unreadable: start fresh. */
  }
}

function save() {
  try {
    window.sessionStorage.setItem(KEY, JSON.stringify(state));
  } catch {
    /* Storage blocked or full: the conversation lasts as long as the page. */
  }
}

function set(next: Partial<GuideState> | ((current: GuideState) => Partial<GuideState>)) {
  restore();
  state = { ...state, ...(typeof next === "function" ? next(state) : next) };
  save();
  for (const listener of listeners) listener();
}

function subscribe(listener: () => void) {
  restore();
  listeners.add(listener);
  return () => listeners.delete(listener);
}

const snapshot = () => {
  restore();
  return state;
};

export function useGuide(): GuideState {
  return useSyncExternalStore(subscribe, snapshot, () => EMPTY);
}

/* ---- What the panel reads from ---------------------------------------------- */

let load: Promise<void> | null = null;
let loaded: { catalogue: GuideCatalogue; canAsk: boolean } | null = null;
const loadListeners = new Set<() => void>();

/** Reads the shortlist's catalogue once a tab; a failed read is tried again on the next call. */
export function prepare() {
  load ??= loadGuide()
    .then((result) => {
      loaded = result;
      for (const listener of loadListeners) listener();
    })
    .catch(() => {
      load = null;
    });
  return load;
}

export function useCatalogue() {
  return useSyncExternalStore(
    (listener) => {
      loadListeners.add(listener);
      return () => loadListeners.delete(listener);
    },
    () => loaded,
    () => null,
  );
}

/** The shortlist for what was answered, or null before both answers are in. */
export function shortlistFor(catalogue: GuideCatalogue, current: GuideState): Shortlist | null {
  const { audience, need } = current.profile;
  if (!current.picked || (!audience && !need)) return null;
  return shortlist(catalogue, current.profile);
}

/* ---- What the panel does ----------------------------------------------------- */

const id = () => Math.random().toString(36).slice(2, 10);

export const guide = {
  opened() {
    set((current) => (current.openedAt ? {} : { openedAt: Date.now() }));
    track("guide_open", { path: location.pathname });
  },

  /** A page read in this tab, for the guide to know where the visitor has been. */
  visit(path: string) {
    set((current) =>
      current.visited.at(-1) === path ? {} : { visited: [...current.visited, path].slice(-VISITS) },
    );
  },

  chooseAudience(audience: string) {
    set((current) => ({ profile: { ...current.profile, audience } }));
  },

  chooseNeed(need: string) {
    set((current) => ({ profile: { ...current.profile, need }, picked: true }));
    const { audience } = state.profile;
    track("guide_pick", { audience: audience ?? "", need });
  },

  skip() {
    set({ picked: true });
  },

  restart() {
    set({ profile: { audience: null, need: null }, picked: false });
  },

  show(view: GuideState["view"]) {
    set({ view });
  },

  /** Asks the guide, and writes its answer into the thread as it arrives. */
  async ask(question: string, path: string, shown: readonly string[]) {
    restore();
    const text = question.trim();
    if (!text || state.thread.some((said) => said.writing) || state.turns.length >= MAX_TURNS) return;

    const answer = id();
    const context: GuideContext = { path, visited: state.visited, profile: state.profile, shown };
    const turns = state.turns;
    /* A question typed before the two are answered passes over them. */
    set((current) => ({
      picked: true,
      thread: [
        ...current.thread,
        { id: id(), from: "visitor", text, picks: [], brief: null, error: null, writing: false },
        { id: answer, from: "guide", text: "", picks: [], brief: null, error: null, writing: true },
      ],
    }));
    track("guide_ask", { path });

    const update = (change: (said: Said) => Partial<Said>) =>
      set((current) => ({
        thread: current.thread.map((said) => (said.id === answer ? { ...said, ...change(said) } : said)),
      }));
    const fail = (error: GuideError) => update(() => ({ text: "", picks: [], brief: null, error, writing: false }));

    let response: Response;
    try {
      response = await fetch("/api/guide", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ turns, question: text, context }),
      });
    } catch {
      fail("failed");
      return;
    }
    if (!response.body) {
      fail("failed");
      return;
    }

    const reader = response.body.pipeThrough(new TextDecoderStream()).getReader();
    let buffer = "";
    let finished = false;
    const handle = (event: GuideEvent) => {
      switch (event.t) {
        case "text":
          update((said) => ({ text: said.text + event.v }));
          break;
        case "picks":
          update(() => ({ picks: event.v }));
          break;
        case "brief":
          update(() => ({ brief: event.v }));
          set({ draft: event.v });
          break;
        case "turn":
          set((current) => ({ turns: [...current.turns, event.v] }));
          break;
        case "done":
          finished = true;
          update(() => ({ writing: false }));
          break;
        case "error":
          finished = true;
          fail(event.v);
          break;
      }
    };

    try {
      for (;;) {
        const { value, done } = await reader.read();
        if (value) buffer += value;
        let at: number;
        while ((at = buffer.indexOf("\n")) >= 0) {
          const line = buffer.slice(0, at).trim();
          buffer = buffer.slice(at + 1);
          if (line) handle(JSON.parse(line) as GuideEvent);
        }
        if (done) break;
      }
      if (buffer.trim()) handle(JSON.parse(buffer) as GuideEvent);
    } catch {
      if (!finished) fail("failed");
      return;
    }
    if (!finished) fail("failed");
  },

  /**
   * After a brief is sent: the conversation has reached the studio, so the
   * next one starts clean. The brief stays on screen, saying where it went.
   */
  sent() {
    set({ draft: null, thread: [], turns: [] });
    track("guide_brief_sent");
    track("enquiry_sent", { source: "guide" });
  },
};

/**
 * The conversation as the studio reads it with a brief: the two answers,
 * then each question, each answer, and the pages it pointed to.
 */
export function transcriptOf(current: GuideState, catalogue: GuideCatalogue | null) {
  const audience =
    current.profile.audience === OTHER
      ? "Something else"
      : catalogue?.audiences.find((one) => one.slug === current.profile.audience)?.name;
  const need =
    current.profile.need === UNSURE
      ? "Not sure yet"
      : catalogue?.needs.find((one) => one.key === current.profile.need)?.label;
  return [
    audience && `Who it's for: ${audience}`,
    need && `What they need: ${need}`,
    ...current.thread
      .filter((said) => said.text)
      .map((said) =>
        said.from === "visitor"
          ? `Visitor: ${said.text}`
          : `Guide: ${said.text}${said.picks.length ? `\n(Pointed to: ${said.picks.map((pick) => pick.card.title).join(", ")})` : ""}`,
      ),
  ]
    .filter(Boolean)
    .join("\n\n");
}
