"use client";

import { useEffect, useState } from "react";
import type { GuideSection } from "./sections";

/**
 * Rail nav with a scroll spy. Anchors are real links, so the section index
 * works with JavaScript off, with find-in-page, and when a link is shared.
 */
export function SectionNav({ sections }: { sections: readonly GuideSection[] }) {
  const [active, setActive] = useState<string>(sections[0]?.id ?? "");

  useEffect(() => {
    const targets = sections
      .map((s) => document.getElementById(s.id))
      .filter((el): el is HTMLElement => el !== null);

    if (targets.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (visible[0]) setActive(visible[0].target.id);
      },
      // Focus the band just under the top of the viewport.
      { rootMargin: "-15% 0px -70% 0px", threshold: 0 }
    );

    targets.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [sections]);

  return (
    <nav
      aria-label="Sections"
      className="sticky top-0 hidden h-screen flex-col justify-center py-16 pl-8 xl:flex"
    >
      <ol className="grid gap-1">
        {sections.map((section) => {
          const isActive = section.id === active;
          return (
            <li key={section.id}>
              <a
                href={`#${section.id}`}
                aria-current={isActive ? "true" : undefined}
                className="group flex items-baseline gap-3 py-1.5 font-sans text-[0.6875rem] font-bold uppercase tracking-[0.12em] transition-colors duration-150"
              >
                <span
                  className={
                    isActive
                      ? "text-signal-700"
                      : "text-disabled group-hover:text-secondary"
                  }
                >
                  {section.index}
                </span>
                <span
                  className={
                    isActive
                      ? "text-primary"
                      : "text-tertiary group-hover:text-primary"
                  }
                >
                  {section.title}
                </span>
              </a>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
