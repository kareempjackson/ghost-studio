import { insightHref } from "@/lib/links";
import { markdownResponse, toMarkdown } from "@/lib/markdown";
import { absoluteUrl } from "@/lib/site";
import { getArticle, getArticleSlugs, getSettings } from "@/sanity/content";

/**
 * Every insight with a slug, written out at build as its page is. With Cache
 * Components the list may not be empty, so until there is writing in Sanity
 * it holds a placeholder that is turned away. One published later is
 * written on its first visit.
 */
export async function generateStaticParams() {
  const slugs = await getArticleSlugs();
  return slugs.length ? slugs.map((slug) => ({ slug })) : [{ slug: "_" }];
}

const DATE = new Intl.DateTimeFormat("en-GB", {
  day: "numeric",
  month: "long",
  year: "numeric",
  timeZone: "UTC",
});

/**
 * `/insights/[slug].md`: an insight as Markdown, for agents. Its title and
 * standfirst, the record the page sets under them, then the body. Reached
 * through the rewrites in next.config.ts; see lib/markdown.ts.
 */
export async function GET(_request: Request, { params }: RouteContext<"/md/insights/[slug]">) {
  const { slug } = await params;
  const [article, settings] = await Promise.all([getArticle(slug), getSettings()]);
  if (!article) return new Response("Not found", { status: 404 });

  const href = insightHref(slug);
  const record = [
    article.topic && `Topic: ${article.topic}`,
    article.publishedAt && `Published: ${DATE.format(new Date(article.publishedAt))}`,
    `Reading time: ${article.readingMinutes} min`,
    `By: ${settings.title}`,
    `Page: ${absoluteUrl(href)}`,
  ]
    .filter(Boolean)
    .map((line) => `- ${line}`)
    .join("\n");

  return markdownResponse(
    [`# ${article.title.join(" ")}`, toMarkdown(article.excerpt), record, toMarkdown(article.body)]
      .filter(Boolean)
      .join("\n\n"),
    href,
  );
}
