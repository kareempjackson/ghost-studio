"use client";

import { useEffect, useState } from "react";
import { LABEL } from "../../_components/StudioStrip";

export interface ContentsItem {
  readonly id: string;
  readonly label: string;
}

/**
 * The insight's sections, down the margin beside the text. The one being
 * read is set in ink with a vermilion tick; the rest are a click away. The
 * same reading line as the case studies' parts bar: a section is current
 * once its heading has passed the upper third of the screen.
 */
export function Contents({ label, items }: { label: string; items: readonly ContentsItem[] }) {
  const [current, setCurrent] = useState<string | null>(null);

  useEffect(() => {
    const headings = items
      .map((item) => document.getElementById(item.id))
      .filter((el): el is HTMLElement => el !== null);
    if (!headings.length) return;

    const observer = new IntersectionObserver(
      () => {
        const line = window.innerHeight / 3;
        let active: string | null = null;
        for (const heading of headings) {
          if (heading.getBoundingClientRect().top <= line) active = heading.id;
        }
        setCurrent(active);
      },
      { rootMargin: "0px 0px -66% 0px", threshold: [0, 1] },
    );
    headings.forEach((heading) => observer.observe(heading));
    return () => observer.disconnect();
  }, [items]);

  return (
    <nav aria-label={label}>
      <p className={`${LABEL} text-ink-950`}>{label}</p>
      <ol className="mt-6 space-y-1 border-l border-edge-subtle">
        {items.map((item, index) => {
          const on = item.id === current;
          return (
            <li key={item.id}>
              <a
                href={`#${item.id}`}
                aria-current={on ? "location" : undefined}
                className={`-ml-px flex gap-3 border-l py-1.5 pl-4 text-[0.875rem] leading-[1.35] tracking-[-0.01em] transition-colors duration-200 ${
                  on
                    ? "border-surface-accent text-ink-950"
                    : "border-transparent text-ink-500 hover:text-ink-950"
                }`}
              >
                <span className="font-label text-[0.6875rem] leading-[1.75] tracking-[0.06em] text-ink-400 tabular-nums">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <span>{item.label}</span>
              </a>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
