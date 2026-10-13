"use client";

import { Monitor, Smartphone } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Card, IconButton, LABEL, META, TITLE } from "../ui";

export interface EmailSample {
  readonly key: string;
  readonly name: string;
  readonly audience: "Client" | "Studio" | "Contractor";
  /** What makes the portal send it. */
  readonly when: string;
  readonly to: string;
  readonly replyTo?: string;
  readonly subject: string;
  readonly preheader: string;
  readonly html: string;
  readonly text: string;
}

const GROUPS = ["Client", "Studio", "Contractor"] as const;

/**
 * Every email the portal sends, drawn as a mail client would show it: the
 * envelope, then the message in a frame of its own (its own document, so the
 * portal's styles can't help it look better than it will), at desktop or
 * phone width, or as the plain text some clients read instead.
 */
export function EmailGallery({ samples }: { samples: readonly EmailSample[] }) {
  const [key, setKey] = useState(samples[0]?.key ?? "");
  const [width, setWidth] = useState<"desktop" | "phone">("desktop");
  const [mode, setMode] = useState<"html" | "text">("html");
  const [height, setHeight] = useState(900);
  const frame = useRef<HTMLIFrameElement>(null);
  const email = samples.find((s) => s.key === key) ?? samples[0];

  /* The frame grows to its email, so the page scrolls rather than the frame. */
  useEffect(() => {
    const el = frame.current;
    if (!el) return;
    /* Collapse the frame first: a document is never shorter than its frame,
       so measuring at the old height would never let it shrink. */
    const fit = () => {
      const doc = el.contentDocument;
      if (!doc?.body) return;
      el.style.height = "0px";
      const next = Math.max(480, doc.documentElement.scrollHeight);
      el.style.height = `${next}px`;
      setHeight(next);
    };
    el.addEventListener("load", fit);
    const t = setTimeout(fit, 600);
    return () => {
      el.removeEventListener("load", fit);
      clearTimeout(t);
    };
  }, [key, width, mode]);

  if (!email) return null;

  return (
    <div className="grid grid-cols-[minmax(0,1fr)] items-start gap-4 lg:grid-cols-[19rem_minmax(0,1fr)] lg:gap-5">
      <nav aria-label="Emails" className="gs-rise gs-card grid gap-4 rounded-[1.75rem] p-2 [--i:1] lg:sticky lg:top-[5rem]">
        {GROUPS.map((g) => (
          <div key={g} className="grid gap-0.5">
            <p className={`px-3 pt-3 pb-1.5 ${LABEL} text-tertiary`}>To the {g.toLowerCase()}</p>
            {samples
              .filter((s) => s.audience === g)
              .map((s) => (
                <button
                  key={s.key}
                  type="button"
                  aria-current={s.key === email.key ? "true" : undefined}
                  onClick={() => setKey(s.key)}
                  className={`gs-press grid gap-0.5 rounded-[1.125rem] px-3 py-2.5 text-left ${s.key === email.key ? "bg-ink-950 text-white" : "hover:bg-ink-950/[0.035]"}`}
                >
                  <span className="text-[0.8125rem] font-medium tracking-[-0.01em]">{s.name}</span>
                  <span className={`text-[0.6875rem] leading-[1.4] ${s.key === email.key ? "text-white/55" : "text-tertiary"}`}>{s.when}</span>
                </button>
              ))}
          </div>
        ))}
      </nav>

      <div className="grid min-w-0 gap-4 lg:gap-5">
        <Card i={2} className="grid gap-4">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="grid gap-1">
              <p className={`${LABEL} text-tertiary`}>{email.audience} · {email.when}</p>
              <h2 className={`${TITLE} text-[1.125rem]`}>{email.subject}</h2>
              <p className={`${META} text-[0.8125rem]`}>{email.preheader}</p>
            </div>
            <div className="flex items-center gap-2">
              <div role="group" aria-label="Format" className="flex gap-0.5 rounded-pill bg-ink-950/[0.045] p-1">
                {(["html", "text"] as const).map((m) => (
                  <button
                    key={m}
                    type="button"
                    aria-pressed={mode === m}
                    onClick={() => setMode(m)}
                    className={`gs-press h-7 rounded-pill px-3 text-[0.75rem] font-medium ${mode === m ? "gs-ink" : "text-secondary hover:text-primary"}`}
                  >
                    {m === "html" ? "Email" : "Plain text"}
                  </button>
                ))}
              </div>
              <div role="group" aria-label="Width" className="flex gap-0.5 rounded-pill bg-ink-950/[0.045] p-1">
                <IconButton label="Desktop width" tone="clear" size="sm" active={width === "desktop"} pressed={width === "desktop"} onClick={() => setWidth("desktop")}>
                  <Monitor aria-hidden className="size-3.5" strokeWidth={1.5} />
                </IconButton>
                <IconButton label="Phone width" tone="clear" size="sm" active={width === "phone"} pressed={width === "phone"} onClick={() => setWidth("phone")}>
                  <Smartphone aria-hidden className="size-3.5" strokeWidth={1.5} />
                </IconButton>
              </div>
            </div>
          </div>
          <dl className="grid gap-2 border-t border-ink-950/[0.06] pt-4 text-[0.75rem] sm:grid-cols-[5.5rem_minmax(0,1fr)]">
            {[
              ["From", "Ghost Savvy Studios <portal@ghostsavvy.com>"],
              ["To", email.to],
              ...(email.replyTo ? [["Reply-To", email.replyTo]] : []),
            ].map(([k, v]) => (
              <div key={k} className="contents">
                <dt className={`${LABEL} pt-0.5 text-tertiary`}>{k}</dt>
                <dd className="min-w-0 truncate font-mono text-[0.75rem] text-secondary">{v}</dd>
              </div>
            ))}
          </dl>
        </Card>

        <section aria-label="The email" className="gs-rise rounded-[1.75rem] bg-ink-950/[0.04] p-3 ring-1 ring-inset ring-ink-950/[0.04] [--i:3] sm:p-6">
          <div className={`mx-auto overflow-hidden transition-[max-width] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] ${width === "phone" ? "max-w-[390px] rounded-[1.5rem] ring-1 ring-ink-950/10" : "max-w-[680px] rounded-[1.25rem] ring-1 ring-ink-950/[0.06]"}`}>
            {mode === "html" ? (
              <iframe
                key={`${email.key}-${width}`}
                ref={frame}
                title={`${email.name} email`}
                srcDoc={email.html}
                sandbox="allow-same-origin"
                className="block w-full bg-[#f0efed]"
                style={{ height }}
              />
            ) : (
              <pre className="max-h-[80vh] overflow-auto bg-white p-6 font-mono text-[0.8125rem] leading-[1.7] whitespace-pre-wrap text-ink-800">
                {`Subject: ${email.subject}\n\n${email.text}`}
              </pre>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
