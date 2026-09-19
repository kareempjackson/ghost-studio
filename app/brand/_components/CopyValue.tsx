"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Click a token to copy it. The confirmation is announced as well as shown —
 * a colour swatch that only signals success by turning green would be exactly
 * the failure this brand exists to argue against.
 */
export function CopyValue({
  value,
  label,
  className = "",
}: {
  value: string;
  label?: string;
  className?: string;
}) {
  const [copied, setCopied] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  useEffect(() => () => clearTimeout(timer.current), []);

  async function copy() {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      clearTimeout(timer.current);
      timer.current = setTimeout(() => setCopied(false), 1600);
    } catch {
      // Clipboard blocked (insecure context, permissions). Select-and-copy
      // still works, so fail quietly rather than throwing an error at someone
      // who is only reading a brand guide.
    }
  }

  return (
    <button
      type="button"
      onClick={copy}
      className={`group inline-flex min-h-6 items-center gap-2 font-mono text-[0.75rem] leading-5 tracking-tight text-tertiary transition-colors duration-150 hover:text-primary ${className}`}
      aria-label={`Copy ${label ?? value}`}
    >
      <span className="tabular-nums">{value}</span>
      <span
        aria-hidden
        className="opacity-0 transition-opacity duration-150 group-hover:opacity-100 group-focus-visible:opacity-100"
      >
        {copied ? "copied" : "copy"}
      </span>
      <span className="sr-only" role="status">
        {copied ? `${label ?? value} copied` : ""}
      </span>
    </button>
  );
}
