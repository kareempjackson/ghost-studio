import { stegaClean } from "next-sanity";
import { markdownHref } from "@/lib/links";
import { absoluteUrl } from "@/lib/site";
import { getAgentIndex, type AgentPage } from "@/sanity/content";

/**
 * A page as one line: its name as a link, then what it holds. The address
 * is cleaned first: an edit mark left in it would be escaped into the URL,
 * out of the final clean's reach.
 */
const entry = ({ path, title, description }: AgentPage, href = path) =>
  `- [${title}](${absoluteUrl(stegaClean(href))})${description ? `: ${description.replace(/\s+/g, " ").trim()}` : ""}`;

/** A heading over its pages; nothing, for a section with none. */
const section = (heading: string, lines: readonly (string | null)[]) => {
  const listed = lines.filter(Boolean);
  return listed.length ? `## ${heading}\n\n${listed.join("\n")}` : "";
};

/** A note after a page's description, in brackets: a track's terms, an insight's topic. */
const noted = (page: AgentPage, note: string) =>
  note ? { ...page, description: `${page.description} (${note})`.trim() } : page;

/**
 * /llms.txt: the site for agents, as llmstxt.org sets it out. Who the studio
 * is and how to reach it, then every page worth reading, with a line on
 * what each holds. Insights and case studies link to their Markdown copies
 * (lib/markdown.ts). From Sanity, as the sitemap is, so a new insight is
 * listed as soon as it is published.
 */
export async function GET() {
  const { site, pages, tracks, audiences, phases, projects, insights, family, legal } =
    await getAgentIndex();
  const fixed = (id: string) => (pages[id] ? entry(pages[id]) : null);

  const text = [
    `# ${site.title}`,
    `> ${site.description}`,
    `Contact: ${site.email} · ${absoluteUrl("/contact")}`,
    "Insights and case studies are linked below as Markdown: any of their pages, with .md added to the address. " +
      "Their pages also answer in Markdown to a request that accepts text/markdown. " +
      `Every page on the site is in ${absoluteUrl("/sitemap.xml")}.`,
    section("Services", [
      fixed("servicesPage"),
      ...tracks.map((track) => entry(noted(track, track.terms))),
      fixed("managedServicesPage"),
    ]),
    section("Who we serve", [fixed("whoWeServePage"), ...audiences.map((audience) => entry(audience))]),
    section("How we work", [fixed("approachPage"), ...phases.map((phase) => entry(phase))]),
    section("Work", [
      fixed("workPage"),
      ...projects.map((project) => entry(project, markdownHref(project.path))),
    ]),
    section("Insights", [
      fixed("insightsPage"),
      ...insights.map((insight) => entry(noted(insight, insight.topic), markdownHref(insight.path))),
    ]),
    section("Studio", [fixed("aboutPage"), fixed("contactPage")]),
    section("Ghost family", family.map((page) => entry(page))),
    section("Optional", legal.map((page) => entry(page))),
  ]
    .filter(Boolean)
    .join("\n\n");

  return new Response(`${stegaClean(text)}\n`, {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
}
