import { stegaClean } from "next-sanity";
import { markdownHref, projectHref } from "@/lib/links";
import { markdownResponse, toMarkdown } from "@/lib/markdown";
import { absoluteUrl } from "@/lib/site";
import { getProject, getProjectSlugs, getWorkPage } from "@/sanity/content";
import type { Rich } from "@/sanity/types";

/**
 * Every project with a slug, written out at build as its page is. With
 * Cache Components the list may not be empty, so until there is work in
 * Sanity it holds a placeholder that is turned away.
 */
export async function generateStaticParams() {
  const slugs = await getProjectSlugs();
  return slugs.length ? slugs.map((slug) => ({ slug })) : [{ slug: "_" }];
}

/** Rich text run onto one line: a fact, a part's heading, a list item. */
const oneLine = (value: Rich) => toMarkdown(value).replace(/\s*\n+\s*/g, " ");

/**
 * A page by its address, which is cleaned first: an edit mark left in it
 * would be escaped into the URL, out of the final clean's reach.
 */
const linkTo = (label: string, href: string) => `[${label}](${absoluteUrl(stegaClean(href))})`;

/** Another project, by the way to its own Markdown copy. */
const projectLink = (project: { slug: string; name: string }) =>
  linkTo(project.name, markdownHref(projectHref(stegaClean(project.slug))));

/**
 * `/work/[slug].md`: a case study as Markdown, for agents. The record and
 * the claim, the overview, then the work part by part, what the client
 * said, and the parts told in full on pages of their own. The pictures are
 * left out: the words carry the story. Reached through the rewrites in
 * next.config.ts; see lib/markdown.ts.
 */
export async function GET(_request: Request, { params }: RouteContext<"/md/work/[slug]">) {
  const { slug } = await params;
  const [project, { caseStudy: labels }] = await Promise.all([getProject(slug), getWorkPage()]);
  if (!project) return new Response("Not found", { status: 404 });

  const href = projectHref(slug);
  const record = [
    ...project.facts.map((fact) => `${fact.label}: ${oneLine(fact.value)}`),
    project.disciplines.length > 0 && `Disciplines: ${project.disciplines.join(", ")}`,
    project.tags.length > 0 && `Tags: ${project.tags.join(", ")}`,
    project.parent && `${labels.partOf}: ${projectLink(project.parent)}`,
    project.families.length > 0 &&
      `${labels.family}: ${project.families.map((family) => linkTo(family.label, family.href)).join(", ")}`,
    project.website && `Website: ${project.website}`,
    `Page: ${absoluteUrl(href)}`,
  ]
    .filter(Boolean)
    .map((line) => `- ${line}`)
    .join("\n");

  const chapters = project.chapters.flatMap((chapter) => [
    `## ${chapter.label}`,
    chapter.heading.length > 0 && `### ${oneLine(chapter.heading)}`,
    toMarkdown(chapter.body, 2),
    chapter.items.length > 0 && `**${chapter.listHeading || labels.listHeading}**`,
    chapter.items
      .map((item) => `- ${item.lead ? `**${item.lead}** ` : ""}${oneLine(item.text)}`)
      .join("\n"),
    chapter.deepDive && `${labels.inDepth.action}: ${projectLink(chapter.deepDive)}`,
  ]);

  const { testimonial } = project;
  const said = testimonial && [
    `## ${labels.feedbackLabel}`,
    [
      ...toMarkdown(testimonial.quote).split("\n").map((line) => `> ${line}`.trimEnd()),
      ">",
      /* Signed as the page signs it: the name, then the role – the company. */
      `> — ${[testimonial.name, [testimonial.role, testimonial.company].filter(Boolean).join(" – ")].filter(Boolean).join(", ")}`,
    ].join("\n"),
  ];

  return markdownResponse(
    [
      `# ${project.name}`,
      oneLine(project.headline),
      record,
      project.overview.length > 0 && `## ${labels.overview}`,
      toMarkdown(project.overview),
      ...chapters,
      ...(said || []),
      project.inDepth.length > 0 && `## ${labels.inDepth.label}`,
      project.inDepth
        .map((part) => `- ${projectLink(part)}${part.tagline ? `: ${part.tagline}` : ""}`)
        .join("\n"),
    ]
      .filter(Boolean)
      .join("\n\n"),
    href,
  );
}
