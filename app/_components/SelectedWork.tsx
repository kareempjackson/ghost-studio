"use client";

import { MotionConfig, motion } from "motion/react";
import Image from "next/image";
import type { CSSProperties } from "react";
import { projectHref, selectedWork } from "@/lib/work";
import { Claim } from "./Claim";
import { COVER_SVH } from "./Hero";

/** Quick out, long settle: the cards arrive, they do not drift in. */
const EASE_OUT = [0.22, 1, 0.36, 1] as const;

/**
 * The band that turns the page over.
 *
 * It is pulled up by the hero's COVER_SVH so it slides over the settled reel,
 * and it sits a layer above it on its own ground. The push that follows is the
 * hero's pin letting go, so nothing here listens to scroll. Reduced motion
 * gets no track to overlap, so the margin comes off with it.
 */
export function SelectedWork() {
  return (
    <section
      aria-labelledby="selected-work-heading"
      style={{ "--gs-cover": `${COVER_SVH}svh` } as CSSProperties}
      className="relative z-10 mt-[calc(var(--gs-cover)*-1)] bg-surface-page px-5 pt-10 motion-reduce:mt-0 sm:px-8 lg:px-12 lg:pt-14"
    >
      <h2 id="selected-work-heading" className="sr-only">
        {selectedWork.tag}
      </h2>

      {/* The claim again, carried up with the work it is claiming. */}
      <Claim repeat />

      <MotionConfig reducedMotion="user">
        <ul className="mt-20 grid gap-x-5 gap-y-14 md:grid-cols-3 lg:mt-32">
          {selectedWork.items.map((project, index) => (
            <motion.li
              key={project.slug}
              initial={{ opacity: 0, y: 48 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.05 }}
              transition={{
                duration: 0.6,
                ease: EASE_OUT,
                delay: index * 0.08,
              }}
            >
              <a href={projectHref(project.slug)} className="group block">
                <div className="relative aspect-[1.065] overflow-hidden rounded-[0.75rem] bg-ink-950">
                  <Image
                    src={project.image}
                    alt=""
                    fill
                    sizes="(min-width: 768px) 33vw, 100vw"
                    className="object-cover transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.03]"
                  />
                </div>

                <h3 className="mt-6 text-[1.5rem] leading-[1.2] font-normal tracking-[-0.02em] text-primary lg:mt-8 lg:text-[1.75rem]">
                  {project.name}
                </h3>
                <p className="mt-1.5 text-[1.0625rem] leading-[1.4] text-secondary lg:text-[1.1875rem]">
                  {project.scope}
                </p>
                <span className="mt-6 inline-block bg-ink-100 px-3 py-2 font-mono text-[0.75rem] leading-none tracking-[0.04em] text-primary uppercase lg:mt-8">
                  {selectedWork.tag}
                </span>
              </a>
            </motion.li>
          ))}
        </ul>
      </MotionConfig>
    </section>
  );
}
