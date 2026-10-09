"use client";

import { useState, useSyncExternalStore } from "react";
import { SocialIcon } from "../../_components/SocialIcon";

/** The same family as SocialIcon: outline, 2px, a rounded square around each. */
const ICON_PROPS = {
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 2,
  strokeLinecap: "round",
  strokeLinejoin: "round",
  className: "size-5",
  "aria-hidden": true,
  focusable: "false",
} as const;

const X_MARK = (
  <svg {...ICON_PROPS}>
    <rect x="3.5" y="3.5" width="17" height="17" rx="5" />
    <path d="M8.5 8l7 8M15.5 8l-7 8" />
  </svg>
);

const MAIL = (
  <svg {...ICON_PROPS}>
    <rect x="3.5" y="5.5" width="17" height="13" rx="3" />
    <path d="M4.5 7.5l7.5 5.5 7.5-5.5" />
  </svg>
);

const LINK = (
  <svg {...ICON_PROPS}>
    <path d="M10.5 13.5a3.5 3.5 0 0 0 5 0l3-3a3.5 3.5 0 0 0-5-5l-1 1" />
    <path d="M13.5 10.5a3.5 3.5 0 0 0-5 0l-3 3a3.5 3.5 0 0 0 5 5l1-1" />
  </svg>
);

const CHECK = (
  <svg {...ICON_PROPS}>
    <path d="M5.5 12.5l4 4 9-9" />
  </svg>
);

const BUTTON =
  "grid size-10 place-items-center rounded-full border border-edge-subtle text-ink-700 transition-colors duration-200 hover:border-ink-950 hover:bg-ink-950 hover:text-white";

/** The page's own address, without its query or anchor. Empty on the server. */
const pageUrl = () => window.location.origin + window.location.pathname;
const noUpdates = () => () => {};

/**
 * Ways to pass the insight on: LinkedIn, X, email, or the link itself. The
 * address is read from the page once it is open, so it is the one the
 * reader is on, whichever domain that is.
 */
export function Share({ title, label = "Share" }: { title: string; label?: string }) {
  const url = useSyncExternalStore(noUpdates, pageUrl, () => "");
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(url || window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* No clipboard (an insecure origin, or permission refused): the
         address bar still has it. */
    }
  };

  const to = encodeURIComponent(url);
  const text = encodeURIComponent(title);

  return (
    <div role="group" aria-label={label} className="flex items-center gap-2">
      <a
        href={`https://www.linkedin.com/sharing/share-offsite/?url=${to}`}
        target="_blank"
        rel="noopener noreferrer"
        className={BUTTON}
      >
        <SocialIcon id="linkedin" />
        <span className="sr-only">Share on LinkedIn</span>
      </a>
      <a
        href={`https://x.com/intent/post?url=${to}&text=${text}`}
        target="_blank"
        rel="noopener noreferrer"
        className={BUTTON}
      >
        {X_MARK}
        <span className="sr-only">Share on X</span>
      </a>
      <a href={`mailto:?subject=${text}&body=${to}`} className={BUTTON}>
        {MAIL}
        <span className="sr-only">Share by email</span>
      </a>
      <button type="button" onClick={copy} className={BUTTON}>
        {copied ? CHECK : LINK}
        <span className="sr-only">Copy the link</span>
      </button>
      <span aria-live="polite" className="sr-only">
        {copied ? "Link copied" : ""}
      </span>
    </div>
  );
}
