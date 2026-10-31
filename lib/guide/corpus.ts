/**
 * What the site guide knows: the site, written out as one Markdown document
 * for the model to answer from, with the paths it may point to.
 *
 * Read from the same Sanity queries the pages render from, so an answer can
 * only say what the site says, and a change published in the Studio reaches
 * the guide when it reaches the page. Who the studio is, its six disciplines,
 * the ways of working with their terms and questions, managed services, who
 * it serves, the approach, the work and the insights. The legal pages are left
 * out, and so is the work on the guide's Never recommend list.
 *
 * The text must come out byte for byte the same while the content is the
 * same: it is the cached part of every request (app/api/guide), and a
 * conversation's earlier answers are bound to it.
 */

import "server-only";

import { stegaClean } from "next-sanity";
import { positioning } from "@/lib/brand/voice";
import { toMarkdown } from "@/lib/markdown";
import {
  getAboutPage,
  getApproachPage,
  getAudiencePage,
  getEngagement,
  getEnquiryCopy,
  getGuideCatalogue,
  getInsightsPage,
  getManagedServicesPage,
  getPhasePage,
  getProject,
  getServices,
  getSettings,
  getTrackPage,
} from "@/sanity/content";
import { toPlain } from "@/sanity/lib/rich";
import type { GuideCatalogue, Lines, Question, Rich, Step } from "@/sanity/types";

export interface Grounding {
  /** The site, as the model reads it. */
  readonly text: string;
  readonly catalogue: GuideCatalogue;
  /** The contact form's "What can we help with?" options: a brief picks from these. */
  readonly help: readonly string[];
  readonly studioEmail: string;
}

/** Rich text run onto one line. */
const oneLine = (value: Rich | null | undefined) => toMarkdown(value).replace(/\s*\n+\s*/g, " ").trim();
const joined = (lines: Lines | null | undefined) => (lines ?? []).join(" ").trim();

/** A read that may find nothing: one missing document should not silence the guide. */
const maybe = <T>(read: Promise<T>) => read.catch(() => null);

const steps = (items: readonly Step[] | null | undefined) =>
  (items ?? []).map((item) => `- ${item.title}: ${oneLine(item.body)}`).join("\n");

const questions = (items: readonly Question[] | null | undefined) =>
  (items ?? []).map((item) => `Q: ${item.question}\nA: ${oneLine(item.answer)}`).join("\n\n");

/** A section: its heading and the parts that have something in them. */
const section = (heading: string, parts: readonly (string | false | null | undefined)[]) => {
  const body = parts.filter((part): part is string => Boolean(part && part.trim()));
  return body.length ? [heading, ...body].join("\n\n") : "";
};

/** Where a page is, as show_picks names it. */
const at = (path: string) => `(page: ${path})`;

export async function getGrounding(): Promise<Grounding> {
  const catalogue = await getGuideCatalogue();
  const projectSlugs = catalogue.projects.map((project) => project.path.split("/").pop()!);
  const audienceSlugs = catalogue.audiences.filter((one) => one.hasPage).map((one) => one.slug);
  const trackPaths = catalogue.tracks.map((track) => track.path);

  const [settings, enquiry, about, services, engagement, managed, approach, insights, tracks, audiences, projects] =
    await Promise.all([
      getSettings(),
      maybe(getEnquiryCopy()),
      maybe(getAboutPage()),
      maybe(getServices()),
      maybe(getEngagement()),
      maybe(getManagedServicesPage()),
      maybe(getApproachPage()),
      maybe(getInsightsPage()),
      Promise.all(trackPaths.map((path) => maybe(getTrackPage(path.slice(1))))),
      Promise.all(audienceSlugs.map((slug) => maybe(getAudiencePage(slug)))),
      Promise.all(projectSlugs.map((slug) => maybe(getProject(slug)))),
    ]);
  const phases = await Promise.all(
    (approach?.phases.items ?? []).filter((phase) => phase.hasPage).map((phase) => maybe(getPhasePage(phase.slug))),
  );
  const listed = new Set(Object.keys(catalogue.cards));

  const who = section("## Who we are", [
    positioning.line,
    positioning.summary,
    positioning.difference,
    positioning.proof,
    about && oneLine(about.summary),
    about && oneLine(about.who.deck),
    about && toMarkdown(about.who.body),
    `Contact: ${settings.email}, or the form on the contact page ${at("/contact")}. More about the studio: ${at("/about")}.`,
  ]);

  const disciplines = section(`## What we do: the disciplines ${at("/services")}`, [
    ...(services?.items ?? []).map(
      (item) => `### ${item.name}\n${item.promise}\nCapabilities: ${item.capabilities.join(", ")}.`,
    ),
  ]);

  const models = section("## Ways to work together", [
    ...(engagement?.models ?? []).map((model) => {
      const track = tracks.find((page) => page?.slug === model.slug);
      const path = `/${model.slug}`;
      const copy = oneLine(model.copy);
      const audience = oneLine(model.audience);
      return section(`### ${model.name}: ${model.kind.trim()}${listed.has(path) ? ` ${at(path)}` : ""}`, [
        `Terms: ${track ? [track.terms.price, track.terms.minimum].filter(Boolean).join(" · ") : model.terms}`,
        copy,
        audience && audience !== copy && `Who it's for: ${audience}`,
        track && oneLine(track.summary),
        track && oneLine(track.who.deck),
        track && `${track.shape.heading}\n${steps(track.shape.items)}`,
        track && `${joined(track.process.heading)}\n${steps(track.process.items)}`,
        track && track.questions.items.length > 0 && `Questions people ask\n\n${questions(track.questions.items)}`,
      ]);
    }),
    managed &&
      section(`### Managed services ${at("/integrate/managed-services")}`, [
        oneLine(managed.summary),
        managed.who.items.length > 0 &&
          `${managed.who.heading}\n${managed.who.items.map((item) => `- ${joined(item.title)}: ${oneLine(item.body)}`).join("\n")}`,
        managed.included.services.length > 0 &&
          `${joined(managed.included.heading)}\n${managed.included.services
            .map(
              (service) =>
                `- ${joined(service.title)}: ${oneLine(service.body)}${service.covered.length ? ` Covers: ${service.covered.join(", ")}.` : ""}`,
            )
            .join("\n")}`,
        `${joined(managed.setup.heading)}: ${oneLine(managed.setup.body)}`,
        `${managed.pricing.heading}: ${oneLine(managed.pricing.body)}`,
        managed.questions.items.length > 0 && `Questions people ask\n\n${questions(managed.questions.items)}`,
      ]),
  ]);

  const serve = section(`## Who we serve ${at("/who-we-serve")}`, [
    ...catalogue.audiences.map((audience) => {
      const page = audiences.find((one) => one?.slug === audience.slug);
      const path = `/who-we-serve/${audience.slug}`;
      const featured = audience.featured && catalogue.cards[audience.featured];
      return section(`### ${audience.name}${page ? ` ${at(path)}` : ""}`, [
        page && oneLine(page.summary),
        page && `${joined(page.challenge.heading)} ${oneLine(page.challenge.deck)}`.trim(),
        page?.practice &&
          page.practice.items.map((item) => `- ${item.title ? `${item.title}: ` : ""}${oneLine(item.body)}`).join("\n"),
        page?.outputs && `What they leave with: ${page.outputs.items.join("; ")}.`,
        featured && `Work to show them: ${featured.title} ${at(featured.path)}`,
      ]);
    }),
  ]);

  const how = section(`## How we work: our approach ${at("/our-approach")}`, [
    approach && oneLine(approach.summary),
    approach && oneLine(approach.start.deck),
    ...phases.map(
      (phase) =>
        phase &&
        section(`### ${phase.title} ${at(`/our-approach/${phase.slug}`)}`, [
          phase.question,
          oneLine(phase.purpose.deck),
          phase.outputs && `What it produces: ${phase.outputs.items.join("; ")}.`,
        ]),
    ),
  ]);

  const work = section(`## Work: the case studies ${at("/work")}`, [
    ...projects.map((project) => {
      if (!project) return null;
      const path = `/work/${project.slug}`;
      if (!listed.has(path)) return null;
      const { testimonial } = project;
      return section(`### ${project.name} ${at(path)}`, [
        oneLine(project.headline) || project.tagline,
        [
          ...project.facts.map((fact) => `${fact.label}: ${oneLine(fact.value)}`),
          project.disciplines.length > 0 && `Disciplines: ${project.disciplines.join(", ")}`,
          project.parent && `Part of: ${project.parent.name} ${at(`/work/${project.parent.slug}`)}`,
        ]
          .filter(Boolean)
          .map((line) => `- ${line}`)
          .join("\n"),
        toMarkdown(project.overview),
        project.chapters.length > 0 &&
          `The work, part by part: ${project.chapters
            .map((chapter) => [chapter.label, oneLine(chapter.heading)].filter(Boolean).join(": "))
            .join("; ")}.`,
        testimonial &&
          `What the client said: "${toPlain(testimonial.quote).replace(/\s+/g, " ").trim()}" (${[
            testimonial.name,
            testimonial.role,
            testimonial.company,
          ]
            .filter(Boolean)
            .join(", ")})`,
      ]);
    }),
  ]);

  const reading = section(`## Insights: what we've written ${at("/insights")}`, [
    ...(insights?.articles ?? []).map((article) => {
      const path = `/insights/${article.slug}`;
      if (!listed.has(path)) return null;
      return `### ${joined(article.title)} ${at(path)}\nTopic: ${article.topic}\n${oneLine(article.excerpt)}`;
    }),
  ]);

  const text = stegaClean(
    [`# ${settings.title}: the website`, who, disciplines, models, serve, how, work, reading].filter(Boolean).join("\n\n"),
  );

  return {
    text,
    catalogue,
    help: stegaClean([...(enquiry?.form.help.options ?? [])]),
    studioEmail: stegaClean(settings.email),
  };
}
