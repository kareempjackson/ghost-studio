import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { CSSProperties } from "react";
import { projectHref } from "@/lib/links";
import { getProject, getProjectSlugs, getWorkPage } from "@/sanity/content";
import type { Chapter, Project } from "@/sanity/types";
import { ChatLauncher } from "../../_components/ChatLauncher";
import { ContactBand } from "../../_components/ContactBand";
import { MONO } from "../../_components/SectionHead";
import { SiteFooter } from "../../_components/SiteFooter";
import { SiteHeader } from "../../_components/SiteHeader";
import { Overview } from "../_components/Overview";
import { PartsBar } from "../_components/PartsBar";
import { Plate, PlateRows } from "../_components/Plate";
import { Visual } from "../../_components/Visual";
import { Rich } from "../../_components/Rich";

/**
 * Every project with a slug, prerendered. With Cache Components the list may
 * not be empty, so until there is work in Sanity it holds a placeholder that
 * the page turns away.
 */
export async function generateStaticParams() {
  const slugs = await getProjectSlugs();
  return slugs.length ? slugs.map((slug) => ({ slug })) : [{ slug: "_" }];
}

export async function generateMetadata({
  params,
}: PageProps<"/work/[slug]">): Promise<Metadata> {
  const project = await getProject((await params).slug);
  if (!project) return {};
  return {
    title: project.name,
    description: project.description ?? project.tagline,
  };
}

/** 40px at 390 to 68px at 1440, held there. What the studio did, in a sentence. */
const HEADLINE_STYLE: CSSProperties = {
  fontSize: "clamp(2.5rem, 1.85rem + 2.667vw, 4.25rem)",
  fontWeight: 400,
  letterSpacing: "-0.045em",
  lineHeight: 1.08,
};

/** 28px at 390 to 40px at 1440, held there. A part's heading, and its list's. */
const PART_STYLE: CSSProperties = {
  fontSize: "clamp(1.75rem, 1.4714rem + 1.143vw, 2.5rem)",
  fontWeight: 400,
  letterSpacing: "-0.04em",
  lineHeight: 1.12,
};

/** 32px at 390 to 42px at 1440, held there. The close's heading. */
const MORE_STYLE: CSSProperties = {
  fontSize: "clamp(2rem, 1.7679rem + 0.952vw, 2.625rem)",
  fontWeight: 400,
  letterSpacing: "-0.045em",
  lineHeight: 1.05,
};

/** 48px at 390 to 80px at 1440, held there. A client's name on a plate. */
const PLATE_NAME_STYLE: CSSProperties = {
  fontSize: "clamp(3rem, 2.2571rem + 3.048vw, 5rem)",
  fontWeight: 500,
  letterSpacing: "-0.055em",
  lineHeight: 0.95,
};

/** The text column every part sets its words in, beside its label. */
const PART_GRID =
  "grid gap-y-6 lg:grid-cols-[minmax(0,2.8fr)_minmax(0,7.2fr)] lg:gap-x-8";

/**
 * `/work/[slug]` — one project, as a case study.
 *
 * A plate, then the record and the claim: who the client is, beside what the
 * studio did for them in a sentence, the trades it took, and the opening of
 * the story. Then the work, part by part — each part's words and then its
 * pictures — with a bar along the top of the screen to move between them.
 * Two more projects close the page.
 *
 * Every part is optional: a project reads as far as it is written, and one
 * with no case study yet is its record, its plate and the way on.
 */
export default async function ProjectPage({
  params,
}: PageProps<"/work/[slug]">) {
  const [project, workPage] = await Promise.all([
    getProject((await params).slug),
    getWorkPage(),
  ]);
  if (!project) notFound();
  const labels = workPage.caseStudy;

  return (
    <>
      <SiteHeader />
      {/* One layer above the footer, with its own ground: the page is the
          sheet that slides up off the footer lying underneath it. */}
      <main className="relative z-[1] flex flex-1 flex-col bg-surface-page">
        {project.hero && (
          <div className="px-5 pt-[calc(var(--gs-header-h)+2rem)] sm:px-8 lg:px-12 lg:pt-[calc(var(--gs-header-h)+3rem)]">
            <Plate
              media={{ ...project.hero, aspect: project.hero.aspect ?? "wide" }}
              sizes="100vw"
              priority
            />
          </div>
        )}

        <section
          aria-labelledby="project-heading"
          className={`grid gap-y-14 px-5 pb-24 sm:px-8 lg:grid-cols-[minmax(0,3fr)_minmax(0,5fr)] lg:gap-x-8 lg:px-12 lg:pb-32 ${
            project.hero
              ? "pt-20 lg:pt-28"
              : "pt-[calc(var(--gs-header-h)+4rem)] lg:pt-[calc(var(--gs-header-h)+8rem)]"
          }`}
        >
          {/* The record, in the margin. */}
          <div>
            <Link
              href="/work"
              className={`${MONO} inline-flex items-center gap-2 text-ink-500 transition-colors duration-200 hover:text-ink-950`}
            >
              <span aria-hidden>←</span> {labels.back}
            </Link>
            {project.facts.length > 0 && (
              <dl className="mt-12 max-w-[26rem] space-y-5 text-[0.9375rem] leading-[1.6] tracking-[-0.01em] text-primary lg:mt-20">
                {project.facts.map((fact) => (
                  <div key={fact.label}>
                    <dt className="inline font-semibold">{fact.label}:</dt>{" "}
                    <dd className="inline"><Rich value={fact.value} inline /></dd>
                  </div>
                ))}
              </dl>
            )}
          </div>

          {/* The claim, and the opening. */}
          <div>
            {project.logo.src && (
              <Image
                src={project.logo.src}
                alt={project.logo.alt || project.name}
                width={240}
                height={72}
                className="h-11 w-auto object-contain object-left lg:h-14"
              />
            )}
            <h1
              id="project-heading"
              className={`max-w-[46rem] text-primary ${project.logo.src ? "mt-10 lg:mt-12" : ""}`}
              style={HEADLINE_STYLE}
            >
              <Rich value={project.headline} inline />
            </h1>
            {project.tags.length > 0 && (
              <ul className="mt-10 flex flex-wrap gap-2 lg:mt-12">
                {project.tags.map((tag) => (
                  <li
                    key={tag}
                    className="inline-flex h-9 items-center rounded-pill bg-ink-100 px-4 text-[0.875rem] leading-none tracking-[-0.01em] text-ink-950 lg:h-10"
                  >
                    {tag}
                  </li>
                ))}
              </ul>
            )}
            {(project.overview.length > 0 || project.website) && (
              <div className="mt-20 lg:mt-28">
                <Overview
                  label={labels.overview}
                  paragraphs={project.overview}
                  readMore={labels.readMore}
                  readLess={labels.readLess}
                  visit={labels.visit}
                  website={project.website}
                />
              </div>
            )}
          </div>
        </section>

        {project.feature && (
          <div className="px-5 sm:px-8 lg:px-12">
            <Plate media={project.feature} sizes="100vw" />
          </div>
        )}

        {project.chapters.length > 0 && (
          <div className="mt-20 lg:mt-28">
            <PartsBar
              label={labels.partsLabel}
              parts={project.chapters.map(({ id, label }) => ({ id, label }))}
            />
            {project.chapters.map((chapter) => (
              <Part
                key={chapter.id}
                chapter={chapter}
                listHeading={chapter.listHeading || labels.listHeading}
              />
            ))}
          </div>
        )}

        {project.more.length > 0 && (
          <section
            aria-labelledby="more-heading"
            className="px-5 pt-24 pb-24 sm:px-8 lg:px-12 lg:pt-36 lg:pb-36"
          >
            <p className={`${MONO} text-ink-500`}>{labels.more.label}</p>
            <div className="mt-6 flex flex-wrap items-end justify-between gap-x-8 gap-y-4 lg:mt-8">
              <h2 id="more-heading" className="text-primary" style={MORE_STYLE}>
                {labels.more.heading}
              </h2>
              <Link
                href={labels.more.action.href}
                className="inline-flex items-center gap-1.5 text-[1rem] tracking-[-0.01em] text-ink-950 transition-colors duration-200 hover:text-accent"
              >
                {labels.more.action.label}
                <span aria-hidden>↗</span>
              </Link>
            </div>
            <ul className="mt-10 grid gap-x-6 gap-y-14 md:grid-cols-2 lg:mt-12">
              {project.more.map((other) => (
                <li key={other.slug}>
                  <MoreCard project={other} previewLabel={workPage.previewLabel} />
                </li>
              ))}
            </ul>
          </section>
        )}
      </main>
      {/* The close sits over the footer, not inside the page, so its rounded
          corners open onto the footer beneath it. */}
      <ContactBand />
      <SiteFooter />
      <ChatLauncher />
    </>
  );
}

/**
 * One part of the story: its label in the margin, then the heading, what
 * the situation was, and what the studio did about it. Its pictures follow,
 * before the next part begins.
 */
function Part({ chapter, listHeading }: { chapter: Chapter; listHeading: string }) {
  const headingId = `${chapter.id}-heading`;
  return (
    <section
      id={chapter.id}
      aria-labelledby={headingId}
      className="scroll-mt-20 pt-20 lg:pt-32"
    >
      <div className={`${PART_GRID} px-5 sm:px-8 lg:px-12`}>
        <p className={`${MONO} text-ink-500 lg:pt-4`}>{chapter.label}</p>
        <div className="max-w-[45rem]">
          <h2 id={headingId} className="text-primary" style={PART_STYLE}>
            <Rich value={chapter.heading} inline />
          </h2>
          {chapter.body.length > 0 && (
            <div className="mt-8 text-[1.0625rem] leading-[2] tracking-[-0.01em] text-secondary [--rich-gap:2rem] lg:mt-10 lg:text-[1.125rem] lg:leading-[2.15]">
              <Rich value={chapter.body} />
            </div>
          )}
          {chapter.items.length > 0 && (
            <>
              <h3 className="mt-16 text-primary lg:mt-24" style={PART_STYLE}>
                {listHeading}
              </h3>
              <ul className="mt-8 list-disc pl-5 text-[1.0625rem] leading-[2] tracking-[-0.01em] text-secondary marker:text-ink-400 lg:mt-10 lg:text-[1.125rem] lg:leading-[2.35]">
                {chapter.items.map((item, index) => (
                  <li key={index} className="pl-1">
                    {item.lead && <strong className="font-semibold">{item.lead}</strong>}
                    {item.lead && ": "}
                    <Rich value={item.text} inline />
                  </li>
                ))}
              </ul>
            </>
          )}
        </div>
      </div>
      {chapter.media.length > 0 && (
        <div className="mt-20 lg:mt-32">
          <PlateRows rows={chapter.media} />
        </div>
      )}
    </section>
  );
}

/**
 * Another project, at the foot. With its picture in, the plate is the
 * picture; until then it is the client's ground with their name set large,
 * the trades over it and a note that the artwork is to come.
 */
function MoreCard({ project, previewLabel }: { project: Project; previewLabel: string }) {
  return (
    <Link href={projectHref(project.slug)} className="group block">
      <div
        className="relative flex aspect-[10/7] flex-col justify-between overflow-hidden rounded-[0.75rem] p-6 text-ink-950 lg:p-9"
        style={{ backgroundColor: project.ground }}
      >
        {(project.image || project.imageVideo) ? (
          <Visual
            src={project.image}
            video={project.imageVideo}
            alt={project.imageAlt}
            sizes="(min-width: 768px) 50vw, 100vw"
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
      <h3 className="mt-5 text-[1.25rem] leading-[1.2] tracking-[-0.03em] text-primary transition-colors duration-200 group-hover:text-accent lg:mt-6 lg:text-[1.375rem]">
        {project.name}
      </h3>
      <p className="mt-2 text-[1.125rem] leading-[1.4] tracking-[-0.015em] text-secondary lg:text-[1.375rem]">
        {project.tagline}
      </p>
    </Link>
  );
}
