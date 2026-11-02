"use client";

import Link from "next/link";
import { track } from "@/lib/track";
import type { Chat, GuideCard } from "@/sanity/types";
import { UpRight } from "../UpRight";
import { Visual } from "../Visual";

/**
 * A page the guide points to: its picture or ground, what kind of page it
 * is, its name, and why it is here, the guide's reason or else the page's
 * own line. The whole card is the link, and following it closes the panel.
 */
export function GuideCardLink({
  card,
  why,
  kinds,
  onFollow,
}: {
  card: GuideCard;
  why?: string;
  kinds: Chat["picker"]["kinds"];
  onFollow: () => void;
}) {
  return (
    <Link
      href={card.path}
      onClick={() => {
        track("guide_card_click", { path: card.path, kind: card.kind });
        onFollow();
      }}
      className="group flex items-center gap-3.5 rounded-[0.75rem] bg-white p-2 pr-3.5 transition-shadow duration-200 hover:shadow-[0_8px_24px_-14px_rgb(14_13_11/0.45)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink-950"
    >
      <span
        aria-hidden
        className="relative grid size-14 shrink-0 place-items-center overflow-hidden rounded-[0.5rem] text-ink-950"
        style={{ backgroundColor: card.ground ?? "#e7e6e1" }}
      >
        {card.image ? <Visual src={card.image} alt="" sizes="56px" /> : <UpRight />}
      </span>
      <span className="min-w-0 flex-1">
        <span className="block font-label text-[0.5625rem] leading-none tracking-[0.08em] text-ink-500 uppercase">
          {kinds[card.kind]}
        </span>
        <span className="mt-1.5 block text-[0.9375rem] leading-[1.2] tracking-[-0.015em] text-ink-950">
          {card.title}
        </span>
        {(why || card.line) && (
          <span className="mt-1 line-clamp-2 block text-[0.8125rem] leading-[1.35] text-ink-600">
            {why || card.line}
          </span>
        )}
      </span>
    </Link>
  );
}

/** The cards one after the other, for the shortlist or under an answer. */
export function GuideCards({
  cards,
  kinds,
  onFollow,
}: {
  cards: readonly { card: GuideCard; why?: string }[];
  kinds: Chat["picker"]["kinds"];
  onFollow: () => void;
}) {
  if (!cards.length) return null;
  return (
    <ul className="space-y-2">
      {cards.map(({ card, why }) => (
        <li key={card.path}>
          <GuideCardLink card={card} why={why} kinds={kinds} onFollow={onFollow} />
        </li>
      ))}
    </ul>
  );
}
