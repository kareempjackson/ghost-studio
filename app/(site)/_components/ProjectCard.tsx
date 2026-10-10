import Link from "next/link";
import type { CSSProperties } from "react";
import { projectHref } from "@/lib/links";
import type { Project } from "@/sanity/types";
import { MONO } from "./SectionHead";
import { Visual } from "./Visual";

/** 48px at 390 to 80px at 1440, held there. A client's name on a plate. */
const PLATE_NAME_STYLE: CSSProperties = {
  fontSize: "clamp(3rem, 2.2571rem + 3.048vw, 5rem)",
  fontWeight: 500,
  letterSpacing: "-0.055em",
  lineHeight: 0.95,
};

/**
 * One project as a way into its case study: its picture or film on its
 * ground, then its name and line. A project with neither picture nor film
 * yet shows its name on the ground instead, so a draft never breaks a page.
 *
 * The plate's shape is the caller's: the two cards at a case study's foot,
 * or the wide plate a page closes on.
 */
export function ProjectCard({
  project,
  aspect,
  sizes,
  previewLabel,
  heading: Heading = "h3",
}: {
  project: Project;
  /** The plate's aspect classes. The picture is cropped to it, never squeezed. */
  aspect: string;
  sizes: string;
  /** Under the name on a plate with no picture yet. */
  previewLabel?: string;
  heading?: "h2" | "h3";
}) {
  return (
    <Link href={projectHref(project.slug)} className="group block">
      <div
        className={`relative flex ${aspect} flex-col justify-between overflow-hidden rounded-[0.75rem] p-6 text-ink-950 lg:p-9`}
        style={{ backgroundColor: project.ground }}
      >
        {(project.image || project.imageVideo) ? (
          <Visual
            src={project.image}
            video={project.imageVideo}
            alt={project.imageAlt}
            sizes={sizes}
            className={`${project.fit === "contain" ? "object-contain" : "object-cover"} transition-transform duration-700 ease-out group-hover:scale-[1.03]`}
          />
        ) : (
          <>
            <span className={MONO}>{project.disciplines.join(" · ")}</span>
            <span style={PLATE_NAME_STYLE} className="max-w-[12ch]">
              {project.name}.
            </span>
            <span className={MONO}>{previewLabel}</span>
          </>
        )}
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
            className="size-4"
          >
            <path d="M4.5 11.5l7-7M5.5 4.5h6v6" />
          </svg>
        </span>
      </div>
      <Heading className="mt-5 text-[1.25rem] leading-[1.2] tracking-[-0.03em] text-primary transition-colors duration-200 group-hover:text-accent lg:mt-6 lg:text-[1.375rem]">
        {project.name}
      </Heading>
      <p className="mt-2 text-[1.125rem] leading-[1.4] tracking-[-0.015em] text-secondary lg:text-[1.375rem]">
        {project.tagline}
      </p>
    </Link>
  );
}

/**
 * The project a page closes on, across the page: the one the page's document
 * features. With none picked the page has no plate at its foot (see
 * `featured` in sanity/content.ts).
 */
export function FeaturedProject({ project }: { project: Project }) {
  return (
    <ProjectCard
      project={project}
      aspect="aspect-[4/3] sm:aspect-[1436/756]"
      sizes="100vw"
      heading="h2"
    />
  );
}
