"use client";

import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import type { Question } from "@/lib/build";
import { Toggle } from "../../_components/Toggle";
import { usePrefersReducedMotion } from "../../_components/usePrefersReducedMotion";

/** Quick out, long settle — the same curve the rest of the site opens on. */
const EASE_OUT = [0.22, 1, 0.36, 1] as const;

/**
 * The questions left over, one open at a time. Closed, the list is the
 * questions alone, so it reads as what a buyer would ask before it reads as
 * an FAQ.
 */
export function Questions({ items }: { items: readonly Question[] }) {
  const [open, setOpen] = useState<number | null>(null);
  const reduced = usePrefersReducedMotion();

  return (
    <ul>
      {items.map((item, index) => {
        const isOpen = open === index;
        const panel = `build-question-${index}`;
        return (
          <li key={item.question}>
            <h3>
              <button
                type="button"
                onClick={() => setOpen(isOpen ? null : index)}
                aria-expanded={isOpen}
                aria-controls={panel}
                className="group flex w-full items-center justify-between gap-6 py-6 text-left lg:py-7"
              >
                <span className="text-[1.125rem] leading-[1.3] tracking-[-0.02em] text-primary transition-colors duration-200 group-hover:text-accent lg:text-[1.3125rem]">
                  {item.question}
                </span>
                <Toggle open={isOpen} />
              </button>
            </h3>

            <AnimatePresence initial={false}>
              {isOpen && (
                <motion.div
                  key="panel"
                  id={panel}
                  initial={reduced ? false : { height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={reduced ? undefined : { height: 0, opacity: 0 }}
                  transition={{ duration: 0.45, ease: EASE_OUT }}
                  className="overflow-hidden"
                >
                  <p className="max-w-[34rem] pb-8 text-[1rem] leading-[1.6] tracking-[-0.01em] text-secondary lg:text-[1.0625rem]">
                    {item.answer}
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </li>
        );
      })}
    </ul>
  );
}
