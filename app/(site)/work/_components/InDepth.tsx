import Link from "next/link";
import type { CSSProperties } from "react";
import { projectHref } from "@/lib/links";
import type { CaseStudyLabels, Project } from "@/sanity/types";
import { BAND_STYLE, MONO } from "../../_components/SectionHead";
import { Visual } from "../../_components/Visual";

/** 28px at 390 to 40px at 1440, held there. A part's name under its plate. */
const NAME_STYLE: CSSProperties = {
  fontSize: "clamp(1.75rem, 1.4714rem + 1.143vw, 2.5rem)",
  fontWeight: 400,
  letterSpacing: "-0.04em",
  lineHeight: 1.1,
};

/**
 * A project's own parts, each told in full as a case study of its own, that
 * no chapter has linked to: set after the chapters, centred, as the story's
 * way on. One part is a single wide feature; more sit two to a row.
 *
 * Each is its plate — its picture, or its colour until there is one, with
 * what the work was pinned in the corner — then its name, its line, and the
 * way in, all centred under it.
 */
export function InDepth({
  parts,
  labels,
}: {
  parts: readonly Project[];
  labels: CaseStudyLabels["inDepth"];
}) {
  const single = parts.length === 1;

  return (
    <section
      aria-labelledby="in-depth-heading"
      className="px-5 pt-28 sm:px-8 lg:px-12 lg:pt-44"
    >
      <div className="mx-auto max-w-[44rem] text-center">
        <p className={`${MONO} text-ink-500`}>{labels.label}</p>
        <h2
          id="in-depth-heading"
          className="mt-6 text-balance text-primary lg:mt-8"
          style={BAND_STYLE}
        >
          {labels.heading}
        </h2>
      </div>

      <ul
        className={`mx-auto mt-14 grid gap-x-6 gap-y-16 lg:mt-20 ${
          single ? "max-w-[68rem]" : "md:grid-cols-2 lg:gap-x-8"
        }`}
      >
        {parts.map((part) => (
          <li key={part.slug}>
            <Link
              href={projectHref(part.slug)}
              aria-label={`${labels.action}: ${part.name}`}
              className="group block"
            >
              <div
                className={`relative overflow-hidden rounded-[0.75rem] ${
                  single ? "aspect-[4/3] sm:aspect-[16/9]" : "aspect-[4/3]"
                }`}
                style={{ backgroundColor: part.ground }}
              >
                {(part.image || part.imageVideo) && (
                  <Visual
                    src={part.image}
                    video={part.imageVideo}
                    alt={part.imageAlt}
                    sizes={single ? "(min-width: 1088px) 68rem, 100vw" : "(min-width: 768px) 50vw, 100vw"}
                    className={`${part.fit === "contain" ? "object-contain" : "object-cover"} transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.03]`}
                  />
                )}
                <span
                  className={`absolute top-5 left-5 inline-flex rounded-pill bg-white px-3.5 py-2 text-ink-950 lg:top-6 lg:left-6 ${MONO}`}
                >
                  {part.scope}
                </span>
                <span
                  aria-hidden
                  className="absolute right-5 bottom-5 grid size-11 place-items-center rounded-full bg-white text-ink-950 transition-colors duration-200 group-hover:bg-ink-950 group-hover:text-white lg:right-6 lg:bottom-6 lg:size-12"
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
              </div>

              <div className="mx-auto mt-8 max-w-[38rem] text-center lg:mt-10">
                <h3
                  className="text-balance text-primary transition-colors duration-200 group-hover:text-accent"
                  style={NAME_STYLE}
                >
                  {part.name}
                </h3>
                <p className="mt-3 text-[1.0625rem] leading-[1.5] tracking-[-0.015em] text-secondary lg:mt-4 lg:text-[1.1875rem]">
                  {part.tagline}
                </p>
                <span
                  aria-hidden
                  className={`mt-6 inline-flex items-center gap-2 text-ink-950 transition-colors duration-200 group-hover:text-accent lg:mt-8 ${MONO}`}
                >
                  {labels.action}
                  <span className="transition-transform duration-300 ease-out group-hover:translate-x-0.5 group-hover:-translate-y-0.5">
                    ↗
                  </span>
                </span>
              </div>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
