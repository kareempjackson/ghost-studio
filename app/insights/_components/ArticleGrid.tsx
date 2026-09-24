"use client";

import { AnimatePresence, MotionConfig, motion } from "motion/react";
import Image from "next/image";
import { useState } from "react";
import {
  articles,
  insightsPage,
  topics,
  type Article,
  type Topic,
} from "@/lib/insights";
import { LABEL } from "../../_components/StudioStrip";

/** Quick out, long settle: the cards arrive, they do not drift in. */
const EASE_OUT = [0.22, 1, 0.36, 1] as const;

/**
 * One piece: the plate, then topic, title and why it is worth opening.
 */
function ArticleCard({ article }: { article: Article }) {
  const inner = (
    <>
      <div className="relative aspect-[9/10] overflow-hidden rounded-[0.75rem] bg-[#ececec]">
        {article.cover && (
          <Image
            src={article.cover.src}
            alt={article.cover.alt}
            fill
            sizes="(min-width: 1024px) 31vw, (min-width: 768px) 50vw, 100vw"
            className="object-cover"
          />
        )}
      </div>
      <p className={`${LABEL} mt-6 text-ink-500 lg:mt-7`}>
        {article.topic} / {insightsPage.status}
      </p>
      <h3
        className={`mt-4 text-[1.625rem] leading-[1.15] font-normal tracking-[-0.035em] text-primary transition-colors duration-200 lg:mt-5 lg:text-[2.125rem] ${
          article.href ? "group-hover:text-accent" : ""
        }`}>
        {article.title}
      </h3>
      <p className="mt-3 max-w-[28rem] text-[1rem] leading-[1.6] tracking-[-0.01em] text-secondary lg:mt-4">
        {article.excerpt}
      </p>
    </>
  );

  return article.href ? (
    <a href={article.href} className="group block">
      {inner}
    </a>
  ) : (
    <div className="group">{inner}</div>
  );
}

/**
 * Every piece, with the topic filter over it.
 *
 * The filter is held here rather than in the URL, as on /work: a handful of
 * pieces is a list a reader scans in one go.
 */
export function ArticleGrid() {
  const [filter, setFilter] = useState<Topic | null>(null);
  const shown = filter
    ? articles.filter((article) => article.topic === filter)
    : articles;

  const pill = (active: boolean) =>
    `rounded-pill px-5 py-3 text-[0.875rem] leading-none tracking-[-0.01em] transition-colors duration-200 ${
      active
        ? "bg-ink-950 text-white"
        : "bg-ink-100 text-ink-700 hover:bg-ink-200"
    }`;

  return (
    <section
      aria-labelledby="insights-index-heading"
      className="px-5 pb-28 sm:px-8 lg:px-12 lg:pb-40"
    >
      <h2 id="insights-index-heading" className="sr-only">
        {insightsPage.all}
      </h2>

      <div className="flex flex-wrap items-center justify-between gap-x-6 gap-y-5">
        <div
          role="group"
          aria-label={insightsPage.filterLabel}
          className="flex flex-wrap gap-3"
        >
          <button
            type="button"
            onClick={() => setFilter(null)}
            aria-pressed={filter === null}
            className={pill(filter === null)}
          >
            {insightsPage.all}
          </button>
          {topics.map((topic) => (
            <button
              key={topic}
              type="button"
              onClick={() => setFilter(topic)}
              aria-pressed={filter === topic}
              className={pill(filter === topic)}
            >
              {topic}
            </button>
          ))}
        </div>

        <p aria-live="polite" className={`${LABEL} text-ink-950`}>
          {`${shown.length} ${shown.length === 1 ? "article" : "articles"}`}
        </p>
      </div>

      <MotionConfig reducedMotion="user">
        {shown.length === 0 ? (
          <p className="mt-20 text-[1.125rem] text-secondary">
            {insightsPage.empty}
          </p>
        ) : (
          <ul className="mt-10 grid gap-x-8 gap-y-16 md:grid-cols-2 lg:mt-12 lg:grid-cols-3">
            <AnimatePresence mode="popLayout" initial={false}>
              {shown.map((article, index) => (
                <motion.li
                  key={article.slug}
                  layout
                  initial={{ opacity: 0, y: 32 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -16 }}
                  transition={{
                    duration: 0.5,
                    ease: EASE_OUT,
                    delay: index * 0.06,
                  }}
                >
                  <ArticleCard article={article} />
                </motion.li>
              ))}
            </AnimatePresence>
          </ul>
        )}
      </MotionConfig>
    </section>
  );
}
