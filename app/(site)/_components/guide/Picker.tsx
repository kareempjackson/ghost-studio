"use client";

import Link from "next/link";
import { useId } from "react";
import { OTHER, UNSURE } from "@/lib/guide/shortlist";
import type { Chat, GuideCatalogue } from "@/sanity/types";
import { Rich } from "../Rich";
import { GuideCards } from "./Cards";
import { guide, shortlistFor, type GuideState } from "./store";
import { CHOICE, KICKER, QUIET } from "./styles";

/** One question's answers, as pills; the chosen one stays dark. */
function Choices({
  label,
  options,
  chosen,
  onChoose,
  autoFocus,
}: {
  label: string;
  options: readonly { value: string; label: string }[];
  chosen: string | null;
  onChoose: (value: string) => void;
  autoFocus?: boolean;
}) {
  const id = useId();
  return (
    <fieldset className="mt-6 first:mt-0">
      <legend id={id} className={KICKER}>
        {label}
      </legend>
      <div className="mt-3.5 flex flex-wrap gap-2">
        {options.map((option, i) => {
          const on = option.value === chosen;
          return (
            <button
              key={option.value}
              type="button"
              aria-pressed={on}
              data-autofocus={autoFocus && i === 0 ? "" : undefined}
              onClick={() => onChoose(option.value)}
              className={CHOICE}
            >
              {option.label}
            </button>
          );
        })}
      </div>
    </fieldset>
  );
}

/**
 * The two questions, then the shortlist they narrow the site to.
 *
 * Who the work is for, from the audiences on Who we serve, then what it
 * needs, from the needs set in the Studio. The second answer draws the
 * shortlist at once, no model involved (lib/guide/shortlist.ts). Either
 * question can be passed over, straight to asking.
 */
export function Picker({
  chat,
  state,
  catalogue,
  canAsk,
  onFollow,
}: {
  chat: Chat;
  state: GuideState;
  catalogue: GuideCatalogue;
  /** Without answers to give, there is nothing to skip to. */
  canAsk: boolean;
  onFollow: () => void;
}) {
  const { picker } = chat;
  const list = shortlistFor(catalogue, state);

  if (!state.picked) {
    const audiences = [
      ...catalogue.audiences.map((one) => ({ value: one.slug, label: one.name })),
      { value: OTHER, label: picker.other },
    ];
    const needs = [
      ...catalogue.needs.map((one) => ({ value: one.key, label: one.label })),
      { value: UNSURE, label: picker.unsure },
    ];
    return (
      <div>
        <div className="rounded-[0.625rem] bg-ink-200/70 px-4 py-3.5 text-[0.9375rem] leading-[1.45] tracking-[-0.01em] text-ink-950">
          <Rich value={chat.intro} />
        </div>
        <div className="mt-6">
          <Choices
            label={picker.audienceLabel}
            options={audiences}
            chosen={state.profile.audience}
            onChoose={guide.chooseAudience}
            autoFocus
          />
          {state.profile.audience && (
            <Choices label={picker.needLabel} options={needs} chosen={state.profile.need} onChoose={guide.chooseNeed} />
          )}
        </div>
        {canAsk && (
          <button type="button" onClick={guide.skip} className={`mt-6 ${QUIET}`}>
            {picker.skip}
          </button>
        )}
      </div>
    );
  }

  if (!list) return null;

  const answered = [
    state.profile.audience === OTHER
      ? picker.other
      : catalogue.audiences.find((one) => one.slug === state.profile.audience)?.name,
    state.profile.need === UNSURE
      ? picker.unsure
      : catalogue.needs.find((one) => one.key === state.profile.need)?.label,
  ].filter(Boolean);

  return (
    <section aria-label={picker.resultLabel}>
      <h3 className={KICKER}>{picker.resultLabel}</h3>
      {answered.length > 0 && (
        <p className="mt-2.5 text-[0.8125rem] leading-[1.35] text-ink-600">{answered.join(" · ")}</p>
      )}
      <div className="mt-4">
        <GuideCards
          cards={list.paths.map((path) => ({ card: catalogue.cards[path] }))}
          kinds={picker.kinds}
          onFollow={onFollow}
        />
      </div>
      {list.audience && (
        <Link
          href={list.audience.path}
          onClick={onFollow}
          className="mt-4 inline-block text-[0.875rem] text-ink-950 underline underline-offset-4 hover:text-ink-600"
        >
          {picker.audienceLink.replace("{audience}", list.audience.name)}
        </Link>
      )}
    </section>
  );
}
