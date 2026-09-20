"use client";

import { AnimatePresence, MotionConfig, motion } from "motion/react";
import { useState } from "react";
import {
  disciplines,
  projectHref,
  projects,
  workPage,
  type Discipline,
  type Project,
} from "@/lib/work";

/** Quick out, long settle: the cards arrive, they do not drift in. */
const EASE_OUT = [0.22, 1, 0.36, 1] as const;

const pad = (n: number) => String(n).padStart(2, "0");

const MONO =
  "font-mono text-[0.6875rem] leading-none tracking-[0.06em] uppercase";

/**
 * The corner arrow: a white disc on the plate, which fills on hover.
 *
 * It is the same gesture as the row arrows in the journal index, at the size
 * the plate can carry. Decorative — the whole card is the link.
 */
function CornerArrow() {
  return (
    <span
      aria-hidden
      className="grid size-10 shrink-0 place-items-center rounded-full bg-white text-ink-950 transition-colors duration-200 group-hover:bg-ink-950 group-hover:text-white lg:size-11"
    >
      <svg
        viewBox="0 0 16 16"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="size-4 transition-transform duration-300 ease-out group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
      >
        <path d="M4.5 11.5l7-7M5.5 4.5h6v6" />
      </svg>
    </span>
  );
}

/**
 * One project.
 *
 * The plate carries the client's name in the top corner and the arrow in the
 * bottom one; the record — name, the job in a line, where and in what trade —
 * sits under it, so the page reads as an index rather than a wall of colour.
 *
 * `featured` gives the first card the full width and a taller plate, which is
 * what makes the page open on one piece of work rather than a grid.
 */
function ProjectCard({
  project,
  featured = false,
}: {
  project: Project;
  featured?: boolean;
}) {
  return (
    <a href={projectHref(project.slug)} className="group block">
      <div
        style={{ backgroundColor: project.ground }}
        className={`flex flex-col justify-between overflow-hidden rounded-[0.75rem] p-5 text-ink-950 sm:p-6 ${
          featured ? "aspect-[16/10] lg:aspect-[21/9]" : "aspect-[4/3]"
        }`}
      >
        {featured ? (
          <span
            className={`inline-flex self-start rounded-pill bg-white px-4 py-2.5 ${MONO}`}
          >
            {project.disciplines.join(" · ")}
          </span>
        ) : (
          <span className={MONO}>{project.name}</span>
        )}

        <div className="flex items-end justify-between gap-6">
          <span className={`${MONO} text-ink-950/70`}>
            {workPage.previewLabel}
          </span>
          <CornerArrow />
        </div>
      </div>

      <h3
        className={`mt-6 leading-[1.15] font-normal tracking-[-0.03em] text-primary transition-colors duration-200 group-hover:text-accent lg:mt-7 ${
          featured
            ? "text-[1.75rem] lg:text-[2.25rem]"
            : "text-[1.5rem] lg:text-[1.875rem]"
        }`}
      >
        {project.name}
      </h3>
      <p className="mt-2 text-[0.9375rem] leading-[1.5] text-secondary lg:text-[1rem]">
        {project.tagline}
      </p>
      <p className={`mt-5 text-ink-500 lg:mt-6 ${MONO}`}>
        {project.location} / {project.sector}
      </p>
    </a>
  );
}

/**
 * The index of the work, with the filter over it.
 *
 * The filter is held here rather than in the URL: three projects is a list a
 * reader scans in one go, and a querystring for it would be state nobody
 * asked to share. When the filter leaves one project standing, that project
 * takes the featured plate — the page always opens on a piece of work.
 */
export function WorkGallery() {
  const [filter, setFilter] = useState<Discipline | null>(null);
  const shown = filter
    ? projects.filter((project) =>
        (project.disciplines as readonly Discipline[]).includes(filter),
      )
    : projects;
  const [lead, ...rest] = shown;

  const pill = (active: boolean) =>
    `rounded-pill px-5 py-3 font-mono text-[0.75rem] leading-none tracking-[0.04em] transition-colors duration-200 ${
      active
        ? "bg-ink-950 text-white"
        : "bg-ink-100 text-ink-950 hover:bg-ink-200"
    }`;

  return (
    <section
      aria-labelledby="work-index-heading"
      className="px-5 pb-28 sm:px-8 lg:px-12 lg:pb-40"
    >
      <h2 id="work-index-heading" className="sr-only">
        {workPage.all}
      </h2>

      <div className="flex flex-wrap items-center justify-between gap-x-6 gap-y-5 border-t border-edge-subtle pt-8 lg:pt-10">
        <div
          role="group"
          aria-label="Filter the work by discipline"
          className="flex flex-wrap gap-2"
        >
          <button
            type="button"
            onClick={() => setFilter(null)}
            aria-pressed={filter === null}
            className={`${pill(filter === null)} inline-flex items-center gap-3`}
          >
            {workPage.all}
            <span className={filter === null ? "text-ink-400" : "text-ink-500"}>
              {pad(projects.length)}
            </span>
          </button>
          {disciplines.map((discipline) => (
            <button
              key={discipline}
              type="button"
              onClick={() => setFilter(discipline)}
              aria-pressed={filter === discipline}
              className={pill(filter === discipline)}
            >
              {discipline}
            </button>
          ))}
        </div>

        <p
          aria-live="polite"
          className={`${MONO} text-ink-500`}
        >{`${shown.length} ${shown.length === 1 ? "project" : "projects"}`}</p>
      </div>

      <MotionConfig reducedMotion="user">
        {shown.length === 0 ? (
          <p className="mt-20 text-[1.125rem] text-secondary">
            {workPage.empty}
          </p>
        ) : (
          <div className="mt-14 lg:mt-20">
            <AnimatePresence mode="popLayout" initial={false}>
              <motion.div
                key={lead.slug}
                layout
                initial={{ opacity: 0, y: 32 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -16 }}
                transition={{ duration: 0.5, ease: EASE_OUT }}
              >
                <ProjectCard project={lead} featured />
              </motion.div>
            </AnimatePresence>

            {rest.length > 0 && (
              <ul className="mt-16 grid gap-x-6 gap-y-16 md:grid-cols-2 lg:mt-24">
                <AnimatePresence mode="popLayout" initial={false}>
                  {rest.map((project, index) => (
                    <motion.li
                      key={project.slug}
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
                      <ProjectCard project={project} />
                    </motion.li>
                  ))}
                </AnimatePresence>
              </ul>
            )}
          </div>
        )}
      </MotionConfig>
    </section>
  );
}
