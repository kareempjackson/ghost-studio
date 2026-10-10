import { pageMetadata } from "@/lib/seo";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { CSSProperties } from "react";
import { getProject, getProjectSlugs, getWorkPage } from "@/sanity/content";
import { ChatLauncher } from "../../_components/ChatLauncher";
import { ContactBand } from "../../_components/ContactBand";
import { MONO } from "../../_components/SectionHead";
import { SiteFooter } from "../../_components/SiteFooter";
import { ProjectCard } from "../../_components/ProjectCard";
import { SiteHeader } from "../../_components/SiteHeader";
import { ClientFeedback } from "../_components/ClientFeedback";
import { Overview } from "../_components/Overview";
import { Part } from "../_components/Part";
import { PartsBar } from "../_components/PartsBar";
import { Plate } from "../_components/Plate";
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
  const { slug } = await params;
  const project = await getProject(slug);
  if (!project) return {};
  return pageMetadata({
    title: project.name,
    description: project.description ?? project.tagline,
    path: `/work/${slug}`,
  });
}

/** 40px at 390 to 68px at 1440, held there. What the studio did, in a sentence. */
const HEADLINE_STYLE: CSSProperties = {
  fontSize: "clamp(2.5rem, 1.85rem + 2.667vw, 4.25rem)",
  fontWeight: 400,
  letterSpacing: "-0.045em",
  lineHeight: 1.08,
};

/** 32px at 390 to 42px at 1440, held there. The close's heading. */
const MORE_STYLE: CSSProperties = {
  fontSize: "clamp(2rem, 1.7679rem + 0.952vw, 2.625rem)",
  fontWeight: 400,
  letterSpacing: "-0.045em",
  lineHeight: 1.05,
};

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

        {/* What the client said: the story's close, once they have said it. */}
        {project.testimonial && (
          <ClientFeedback
            testimonial={project.testimonial}
            label={labels.feedbackLabel}
            heading={labels.feedbackHeading}
          />
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
                  <ProjectCard
                    project={other}
                    aspect="aspect-[10/7]"
                    sizes="(min-width: 768px) 50vw, 100vw"
                    previewLabel={workPage.previewLabel}
                  />
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
