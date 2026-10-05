"use client";

import { useEffect, useState } from "react";

/**
 * The parts of a case study, as a bar that holds to the top of the screen
 * while they scroll past under it. The part being read is set in a pill;
 * the others are a click away.
 */
export function PartsBar({
  label,
  parts,
}: {
  /** The bar's name, for screen readers. */
  label: string;
  parts: readonly { readonly id: string; readonly label: string }[];
}) {
  const [current, setCurrent] = useState(parts[0]?.id ?? "");

  useEffect(() => {
    const sections = parts
      .map((part) => document.getElementById(part.id))
      .filter((el): el is HTMLElement => el !== null);
    if (!sections.length) return;

    /* A part is current once its top has passed the upper third of the
       screen, and stays current until the next one's has. */
    const observer = new IntersectionObserver(
      () => {
        const line = window.innerHeight / 3;
        let active = sections[0].id;
        for (const section of sections) {
          if (section.getBoundingClientRect().top <= line) active = section.id;
        }
        setCurrent(active);
      },
      { rootMargin: "0px 0px -66% 0px", threshold: [0, 1] },
    );
    sections.forEach((section) => observer.observe(section));
    return () => observer.disconnect();
  }, [parts]);

  return (
    <nav
      aria-label={label}
      className="sticky top-0 z-20 bg-surface-page/95 px-5 py-3 backdrop-blur-sm sm:px-8 lg:px-12 lg:py-4"
    >
      <ol className="-mx-5 flex gap-2 overflow-x-auto px-5 sm:mx-0 sm:px-0 lg:justify-between">
        {parts.map((part) => {
          const on = part.id === current;
          return (
            <li key={part.id} className="shrink-0">
              <a
                href={`#${part.id}`}
                aria-current={on ? "location" : undefined}
                className={`inline-flex h-10 items-center rounded-pill px-5 font-label text-[0.75rem] leading-none tracking-[0.04em] whitespace-nowrap uppercase transition-colors duration-200 lg:h-11 lg:text-[0.8125rem] ${
                  on ? "bg-ink-100 text-ink-950" : "text-ink-500 hover:text-ink-950"
                }`}
              >
                {part.label}
              </a>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
