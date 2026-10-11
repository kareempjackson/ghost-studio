import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { CSSProperties } from "react";
import { stegaClean } from "next-sanity";
import { insightHref } from "@/lib/links";
import { absoluteUrl } from "@/lib/site";
import { getArticle, getArticleSlugs, getMoreArticles, getSettings } from "@/sanity/content";
import { toPlain } from "@/sanity/lib/rich";
import { ChatLauncher } from "../../_components/ChatLauncher";
import { ContactBand } from "../../_components/ContactBand";
import { Rich } from "../../_components/Rich";
import { RichText, outline } from "../../_components/RichText";
import { MONO } from "../../_components/SectionHead";
import { SiteFooter } from "../../_components/SiteFooter";
import { SiteHeader } from "../../_components/SiteHeader";
import { LABEL } from "../../_components/StudioStrip";
import { Visual } from "../../_components/Visual";
import { Contents } from "../_components/Contents";
import { ReadingProgress } from "../_components/ReadingProgress";
import { Share } from "../_components/Share";

/**
 * Every insight with a slug, prerendered. With Cache Components the list may
 * not be empty, so until there is writing in Sanity it holds a placeholder
 * that the page turns away. One published later renders on its first visit.
 */
export async function generateStaticParams() {
  const slugs = await getArticleSlugs();
  return slugs.length ? slugs.map((slug) => ({ slug })) : [{ slug: "_" }];
}

/**
 * The SEO tab, with the insight's own content behind every field: its title
 * and its excerpt. A meta title is set whole, as the editor wrote it, without
 * the site's name after it. The share image is ./opengraph-image: the social
 * image, the cover, or the brand card. Clean of edit marks: these leave the page.
 */
export async function generateMetadata({
  params,
}: PageProps<"/insights/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const [article, settings] = await Promise.all([getArticle(slug), getSettings()]);
  if (!article) return {};

  const name = stegaClean(article.title.join(" "));
  const metaTitle = article.seo.title ? stegaClean(article.seo.title) : null;
  const title = metaTitle ?? name;
  const description = stegaClean(article.seo.description ?? toPlain(article.excerpt));

  return {
    title: metaTitle ? { absolute: metaTitle } : name,
    description,
    ...(article.seo.keyword ? { keywords: [stegaClean(article.seo.keyword)] } : {}),
    alternates: { canonical: insightHref(slug) },
    openGraph: {
      type: "article",
      siteName: stegaClean(settings.title),
      title,
      description,
      url: insightHref(slug),
      ...(article.publishedAt ? { publishedTime: article.publishedAt } : {}),
      modifiedTime: article.updatedAt,
      section: stegaClean(article.topic),
    },
    twitter: { card: "summary_large_image", title, description },
  };
}

/** 40px at 390 to 76px at 1440, held there. Long titles balance their lines. */
const TITLE_STYLE: CSSProperties = {
  fontSize: "clamp(2.5rem, 1.6rem + 3.45vw, 4.75rem)",
  fontWeight: 400,
  letterSpacing: "-0.045em",
  lineHeight: 1,
};

const DATE = new Intl.DateTimeFormat("en-GB", {
  day: "numeric",
  month: "long",
  year: "numeric",
  timeZone: "UTC",
});

/**
 * `/insights/[slug]` — one insight, set as a long read.
 *
 * The topic, the title and the excerpt as its standfirst, then the record:
 * when it was published, how long it takes, ways to pass it on. The cover
 * across the page, or its ground until there is one. Then the body at the
 * reading measure, its sections listed down the margin and followed as the
 * reader goes, a vermilion line across the top filling as they read. Two
 * more pieces to go on to at the foot.
 */
export default async function InsightPage({ params }: PageProps<"/insights/[slug]">) {
  const { slug } = await params;
  const [article, settings] = await Promise.all([getArticle(slug), getSettings()]);
  if (!article) notFound();
  const more = await getMoreArticles(slug);

  const name = article.title.join(" ");
  const sections = outline(article.body);
  const hasContents = sections.length > 1;
  const published = article.publishedAt ? new Date(article.publishedAt) : null;

  /* What search engines read as the article: the same fields the share
     cards carry. */
  const structured = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: stegaClean(article.seo.title ?? name),
    description: stegaClean(article.seo.description ?? toPlain(article.excerpt)),
    ...(article.publishedAt ? { datePublished: article.publishedAt } : {}),
    dateModified: article.updatedAt,
    ...(article.seo.keyword ? { keywords: stegaClean(article.seo.keyword) } : {}),
    articleSection: stegaClean(article.topic),
    mainEntityOfPage: absoluteUrl(insightHref(slug)),
    author: { "@type": "Organization", name: stegaClean(settings.title) },
    publisher: { "@type": "Organization", name: stegaClean(settings.title) },
  };

  return (
    <>
      <SiteHeader />
      <ReadingProgress target="insight-body" />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structured).replace(/</g, "\\u003c") }}
      />
      {/* One layer above the footer, with its own ground: the page is the
          sheet that slides up off the footer lying underneath it. */}
      <main className="relative z-[1] flex flex-1 flex-col bg-surface-page">
        <article aria-labelledby="article-heading">
          <header className="px-5 pt-[calc(var(--gs-header-h)+4rem)] sm:px-8 lg:px-12 lg:pt-[calc(var(--gs-header-h)+7rem)]">
            <div className="gs-reveal flex flex-wrap items-center gap-x-3 gap-y-2">
              <Link
                href="/insights"
                className={`${LABEL} inline-flex items-center gap-2 text-ink-950 transition-colors duration-200 hover:text-accent`}
              >
                <span aria-hidden>←</span> Insights
              </Link>
              <span aria-hidden className={`${LABEL} text-ink-400`}>
                /
              </span>
              <p className={`${LABEL} text-ink-500`}>{article.topic}</p>
            </div>

            <h1
              id="article-heading"
              className="mt-10 max-w-[68rem] text-primary lg:mt-14"
              style={TITLE_STYLE}
            >
              {article.title.map((line) => (
                <span key={line} className="block text-balance">
                  {line}
                </span>
              ))}
            </h1>

            <div className="gs-reveal mt-8 max-w-[40rem] text-[1.1875rem] leading-[1.5] tracking-[-0.015em] text-secondary [--reveal:3] lg:mt-12 lg:text-[1.375rem]">
              <Rich value={article.excerpt} />
            </div>

            {/* The record: when, how long, and ways to pass it on. */}
            <div className="mt-12 flex flex-wrap items-end justify-between gap-x-10 gap-y-6 lg:mt-16">
              <dl className="flex flex-wrap gap-x-10 gap-y-4">
                {published && (
                  <div>
                    <dt className={`${LABEL} text-ink-400`}>Published</dt>
                    <dd className="mt-2.5 text-[0.9375rem] tracking-[-0.01em] text-ink-950">
                      <time dateTime={article.publishedAt!}>{DATE.format(published)}</time>
                    </dd>
                  </div>
                )}
                <div>
                  <dt className={`${LABEL} text-ink-400`}>Reading time</dt>
                  <dd className="mt-2.5 text-[0.9375rem] tracking-[-0.01em] text-ink-950">
                    {article.readingMinutes} min
                  </dd>
                </div>
                <div>
                  <dt className={`${LABEL} text-ink-400`}>Topic</dt>
                  <dd className="mt-2.5 text-[0.9375rem] tracking-[-0.01em] text-ink-950">
                    {article.topic}
                  </dd>
                </div>
              </dl>
              <Share title={stegaClean(name)} />
            </div>
          </header>

          {/* The cover, or its ground until there is one. */}
          <div className="px-5 pt-10 sm:px-8 lg:px-12 lg:pt-12">
            <div
              style={{ backgroundColor: article.cover.ground }}
              className="relative aspect-[4/3] overflow-hidden rounded-[0.75rem] sm:aspect-[16/9] lg:aspect-[21/9]"
              {...(article.cover.src || article.cover.video
                ? {}
                : article.cover.alt
                  ? { role: "img", "aria-label": article.cover.alt }
                  : { "aria-hidden": true })}
            >
              {(article.cover.src || article.cover.video) && (
                <Visual
                  src={article.cover.src}
                  video={article.cover.video}
                  alt={article.cover.alt}
                  priority
                  sizes="100vw"
                  className="object-cover"
                />
              )}
            </div>
          </div>

          {article.body && article.body.length > 0 && (
            <div className="px-5 pt-16 sm:px-8 lg:grid lg:grid-cols-12 lg:gap-8 lg:px-12 lg:pt-24">
              {hasContents && (
                <aside className="hidden lg:col-span-3 lg:block">
                  <div className="sticky top-12">
                    <Contents label="On this page" items={sections} />
                  </div>
                </aside>
              )}

              <div className="lg:col-span-7 lg:col-start-5">
                {/* Under lg the margin is gone: the contents fold above the text. */}
                {hasContents && (
                  <details className="group mb-12 lg:hidden">
                    <summary className={`${MONO} flex cursor-pointer list-none items-center justify-between py-4 text-ink-950 [&::-webkit-details-marker]:hidden`}>
                      On this page
                      <span aria-hidden className="transition-transform duration-200 group-open:rotate-45">
                        +
                      </span>
                    </summary>
                    <ol className="space-y-3 pb-5">
                      {sections.map((section, index) => (
                        <li key={section.id}>
                          <a
                            href={`#${section.id}`}
                            className="flex gap-3 text-[0.9375rem] leading-[1.35] text-ink-700 hover:text-accent"
                          >
                            <span className="font-label text-[0.6875rem] leading-[1.9] tracking-[0.06em] text-ink-400 tabular-nums">
                              {String(index + 1).padStart(2, "0")}
                            </span>
                            {section.label}
                          </a>
                        </li>
                      ))}
                    </ol>
                  </details>
                )}

                <RichText id="insight-body" value={article.body} className="max-w-[42rem]" />

                <div className="mt-20 flex max-w-[42rem] flex-wrap items-center justify-between gap-6 lg:mt-24">
                  <p className={`${LABEL} text-ink-950`}>Share this insight</p>
                  <Share title={stegaClean(name)} />
                </div>
              </div>
            </div>
          )}
        </article>

        {more.length > 0 && (
          <section
            aria-labelledby="more-heading"
            className="px-5 pt-24 sm:px-8 lg:px-12 lg:pt-36"
          >
            <h2 id="more-heading" className={`${LABEL} text-ink-950`}>
              More insights
            </h2>
            <ul className="mt-10 grid gap-x-8 gap-y-16 md:grid-cols-2 lg:mt-12">
              {more.map((entry) => (
                <li key={entry.slug}>
                  <a href={insightHref(entry.slug)} className="group block">
                    <div
                      style={{ backgroundColor: entry.cover.ground }}
                      className="relative aspect-[9/10] overflow-hidden rounded-[0.75rem] sm:aspect-[4/3]"
                    >
                      {(entry.cover.src || entry.cover.video) && (
                        <Visual
                          src={entry.cover.src}
                          video={entry.cover.video}
                          alt={entry.cover.alt}
                          sizes="(min-width: 768px) 50vw, 100vw"
                          className="object-cover transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.02]"
                        />
                      )}
                    </div>
                    <p className={`${LABEL} mt-6 text-ink-500 lg:mt-7`}>
                      {entry.topic}
                    </p>
                    <h3 className="mt-4 text-[1.625rem] leading-[1.15] font-normal tracking-[-0.035em] text-primary transition-colors duration-200 group-hover:text-accent lg:mt-5 lg:text-[2.125rem]">
                      {entry.title.join(" ")}
                    </h3>
                    <div className="mt-3 max-w-[28rem] text-[1rem] leading-[1.6] tracking-[-0.01em] text-secondary lg:mt-4">
                      <Rich value={entry.excerpt} linkless />
                    </div>
                  </a>
                </li>
              ))}
            </ul>
          </section>
        )}

        <div className="px-5 pt-16 pb-24 sm:px-8 lg:px-12 lg:pt-24 lg:pb-36">
          <Link
            href="/insights"
            className="group inline-flex items-center gap-3 text-[0.9375rem] leading-none tracking-[-0.01em] text-secondary transition-colors duration-200 hover:text-accent"
          >
            <span
              aria-hidden
              className="transition-transform duration-300 ease-out group-hover:-translate-x-1"
            >
              ←
            </span>
            All insights
          </Link>
        </div>
      </main>
      {/* The close sits over the footer, not inside the page, so its rounded
          corners open onto the footer beneath it. */}
      <ContactBand />
      <SiteFooter />
      <ChatLauncher />
    </>
  );
}
