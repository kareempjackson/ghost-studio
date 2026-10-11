"use client";

import { useEffect, useState } from "react";

export interface ContentsItem {
  readonly id: string;
  readonly label: string;
}

/** The label face, as every label in the margin is set. */
const MONO = "font-label text-[0.6875rem] leading-none tracking-[0.06em] uppercase";

/**
 * The insight's sections, down the margin beside the text: each numbered,
 * the numbers in a column of their own so the titles line up. The one being
 * read is set in ink with its number in vermilion, the one signal on the
 * screen; the rest wait in grey, a click away. The same reading line as the
 * case studies' parts bar: a section is current once its heading has passed
 * the upper third of the screen.
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
      <p className={`${MONO} text-ink-500`}>{label}</p>
      <ol className="mt-7 space-y-3.5">
        {items.map((item, index) => {
          const on = item.id === current;
          return (
            <li key={item.id}>
              <a
                href={`#${item.id}`}
                aria-current={on ? "location" : undefined}
                className="group grid grid-cols-[1.75rem_minmax(0,1fr)] items-baseline text-[0.875rem] leading-[1.4] tracking-[-0.01em]"
              >
                <span
                  className={`${MONO} tabular-nums transition-colors duration-200 ${
                    on ? "text-accent" : "text-ink-400 group-hover:text-ink-950"
                  }`}
                >
                  {String(index + 1).padStart(2, "0")}
                </span>
                <span
                  className={`transition-colors duration-200 ${
                    on ? "text-ink-950" : "text-ink-500 group-hover:text-ink-950"
                  }`}
                >
                  {item.label}
                </span>
              </a>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
