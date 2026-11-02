"use client";

import { useEffect, useId, useRef, useSyncExternalStore } from "react";
import { asks, consent } from "@/lib/consent";
import { useChrome } from "./ChromeProvider";

/** Until Site settings says it in its own words. */
const FALLBACK = {
  message: "We use cookies to see how our site is used, so we can make it better.",
  link: { label: "Cookie policy", href: "/cookies" },
  accept: "Accept",
  decline: "Decline",
};

const BUTTON =
  "h-9 cursor-pointer rounded-pill border border-white/25 px-4 text-[0.8125rem] leading-none tracking-[-0.01em] transition-colors duration-200 hover:border-white hover:bg-white hover:text-[#0b0b0b] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white";

/**
 * The cookie banner: asked of visitors in the EEA, the UK and Switzerland,
 * or of everyone if Site settings › Tracking says so, before any tracking
 * cookie is set (lib/consent.ts), and of anyone who opens Cookie settings in
 * the footer.
 *
 * A small black card in the corner the guide's pill leaves free, over the
 * page rather than pushing it, so the page reads the same under it. Accept
 * and Decline are the same size and weight: saying no is as easy as saying
 * yes. Nothing is trapped: it is a labelled region, and the page stays
 * usable while it is up. Rendered only when there is something to ask
 * about, which the layout decides.
 */
export function CookieBanner() {
  const { settings } = useChrome();
  const copy = settings.cookieBanner;
  const state = useSyncExternalStore(consent.subscribe, consent.get, consent.getServer);
  const id = useId();
  const first = useRef<HTMLButtonElement>(null);

  /* Reopened from the footer: start where the choice is made. */
  useEffect(() => {
    if (state.reopened) first.current?.focus();
  }, [state.reopened]);

  if (!asks(state)) return null;

  const link = copy?.link ?? FALLBACK.link;

  return (
    <section
      aria-labelledby={`${id}-message`}
      className="fixed inset-x-4 bottom-4 z-[60] rounded-[1.25rem] bg-[#0b0b0b] p-5 text-white shadow-[0_12px_40px_rgb(0_0_0/0.25)] sm:right-auto sm:bottom-6 sm:left-6 sm:max-w-[25rem]"
    >
      <p id={`${id}-message`} className="text-[0.875rem] leading-[1.5] tracking-[-0.01em]">
        {copy?.message || FALLBACK.message}{" "}
        <a
          href={link.href}
          className="text-ink-300 underline decoration-ink-500 underline-offset-[3px] transition-colors duration-200 hover:text-white hover:decoration-white"
        >
          {link.label}
        </a>
      </p>
      <div className="mt-4 flex gap-2">
        <button ref={first} type="button" onClick={() => consent.choose("granted")} className={BUTTON}>
          {copy?.accept || FALLBACK.accept}
        </button>
        <button type="button" onClick={() => consent.choose("denied")} className={BUTTON}>
          {copy?.decline || FALLBACK.decline}
        </button>
      </div>
    </section>
  );
}

/**
 * Cookie settings, among the footer's legal links: opens the banner again,
 * so a choice can be changed as easily as it was made.
 */
export function CookieSettings({ label, className }: { label: string; className?: string }) {
  return (
    <button type="button" onClick={consent.reopen} className={className}>
      {label}
    </button>
  );
}
