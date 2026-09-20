"use client";

import { useEffect, useRef, useState } from "react";
import { contact } from "@/lib/contact";

/** How long the control holds its confirmation before going back, in ms. */
const HELD = 2000;

/**
 * The address, copied.
 *
 * A control that says it copied and then never says anything again is a
 * control nobody trusts the second time, so it goes back to its label. The
 * change is announced politely rather than as an alert: it is the answer to
 * something the reader just did, not news.
 *
 * `navigator.clipboard` is not there on an insecure origin, and the write can
 * be refused outright, so a failure leaves the label alone — the address is
 * already on the page as a link, which is the fallback.
 */
export function CopyEmail() {
  const [copied, setCopied] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(
    () => () => void (timer.current && clearTimeout(timer.current)),
    [],
  );

  async function copy() {
    try {
      await navigator.clipboard?.writeText(contact.start.email);
      setCopied(true);
      if (timer.current) clearTimeout(timer.current);
      timer.current = setTimeout(() => setCopied(false), HELD);
    } catch {
      /* Left as it was: the address above is still a link. */
    }
  }

  return (
    <button
      type="button"
      onClick={copy}
      className="group inline-flex items-center gap-3 border-b border-edge pb-2 text-[0.9375rem] leading-none tracking-[-0.01em] text-ink-950 transition-colors duration-200 hover:border-ink-950"
    >
      <span aria-live="polite">
        {copied ? contact.start.copied : contact.start.copy}
      </span>
      <svg
        aria-hidden
        viewBox="0 0 16 16"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="size-3 transition-transform duration-300 ease-out group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
      >
        <path d="M4.5 11.5l7-7M5.5 4.5h6v6" />
      </svg>
    </button>
  );
}
