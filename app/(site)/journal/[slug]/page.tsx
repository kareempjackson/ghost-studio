import type { Metadata } from "next";
import { notFound } from "next/navigation";
import type { CSSProperties } from "react";
import { journalHref } from "@/lib/links";
import { getArticle, getArticleSlugs, getMoreArticles } from "@/sanity/content";
import { toPlain } from "@/sanity/lib/rich";
import { ChatLauncher } from "../../_components/ChatLauncher";
import { ContactBand } from "../../_components/ContactBand";
import { RichText } from "../../_components/RichText";
import { SiteFooter } from "../../_components/SiteFooter";
import { SiteHeader } from "../../_components/SiteHeader";
import { LABEL } from "../../_components/StudioStrip";
import { Visual } from "../../_components/Visual";
import { Rich } from "../../_components/Rich";

/**
 * Every article with a slug, prerendered. With Cache Components the list may
 * not be empty, so until there is writing in Sanity it holds a placeholder
 * that the page turns away.
 */
export async function generateStaticParams() {
  const slugs = await getArticleSlugs();
  return slugs.length ? slugs.map((slug) => ({ slug })) : [{ slug: "_" }];
}

export async function generateMetadata({
  params,
}: PageProps<"/journal/[slug]">): Promise<Metadata> {
  const article = await getArticle((await params).slug);
  if (!article) return {};
  return {
    title: article.title.join(" "),
    description: article.description ?? toPlain(article.excerpt),
  };
}

/** 44px at 390 to 88px at 1440, held there. The title, set as a cover. */
const TITLE_STYLE: CSSProperties = {
  fontSize: "clamp(2.75rem, 1.7286rem + 4.19vw, 5.5rem)",
  fontWeight: 400,
  letterSpacing: "-0.05em",
  lineHeight: 0.98,
};

/**
 * `/journal/[slug]` — one article.
 *
 * The topic, the title in its lines, and the excerpt as the standfirst; the
 * cover edge to edge, or its ground until there is a picture; then the body
 * at the reading measure, and two more pieces to go on to.
 */
export default async function ArticlePage({
  params,
}: PageProps<"/journal/[slug]">) {
  const { slug } = await params;
  const article = await getArticle(slug);
  if (!article) notFound();
  const more = await getMoreArticles(slug);

  return (
    <>
      <SiteHeader />
      {/* One layer above the footer, with its own ground: the page is the
          sheet that slides up off the footer lying underneath it. */}
      <main className="relative z-[1] flex flex-1 flex-col bg-surface-page">
        <article aria-labelledby="article-heading">
          <header className="px-5 pt-[calc(var(--gs-header-h)+4rem)] pb-16 sm:px-8 lg:px-12 lg:pt-[calc(var(--gs-header-h)+8rem)] lg:pb-24">
            <div className="gs-reveal flex flex-wrap items-center gap-x-3 gap-y-2">
              <a
                href="/insights"
                className={`${LABEL} inline-flex items-center gap-2 text-ink-950 transition-colors duration-200 hover:text-accent`}
              >
                <span aria-hidden>←</span> Insights
              </a>
              <span aria-hidden className={`${LABEL} text-ink-400`}>
                /
              </span>
              <p className={`${LABEL} text-ink-500`}>{article.topic}</p>
            </div>

            <h1
              id="article-heading"
              className="mt-10 max-w-[64rem] text-primary lg:mt-16"
              style={TITLE_STYLE}
            >
              {article.title.map((line) => (
                <span key={line} className="block">
                  {line}
                </span>
              ))}
            </h1>

            <div className="gs-reveal mt-10 max-w-[38rem] text-[1.1875rem] leading-[1.5] tracking-[-0.015em] text-secondary [--reveal:3] lg:mt-14 lg:text-[1.375rem]">
              <Rich value={article.excerpt} />
            </div>
          </header>

          {/* Edge to edge: the cover, or its ground until there is one. */}
          <div
            style={{ backgroundColor: article.cover.ground }}
            className="relative aspect-[4/3] overflow-hidden sm:aspect-[16/9] lg:aspect-[1512/760]"
            {...(article.cover.src
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
                priority sizes="100vw" className="object-cover"
              />
            )}
          </div>

          {article.body && article.body.length > 0 && (
            <div className="grid px-5 pt-20 sm:px-8 lg:grid-cols-12 lg:gap-6 lg:px-12 lg:pt-28">
              <RichText
                value={article.body}
                className="max-w-[42rem] lg:col-span-7 lg:col-start-5"
              />
            </div>
          )}
        </article>

        {more.length > 0 && (
          <section
            aria-labelledby="more-heading"
            className="px-5 pt-24 sm:px-8 lg:px-12 lg:pt-36"
          >
            <div className="border-t border-edge-subtle pt-8 lg:pt-10">
              <h2 id="more-heading" className={`${LABEL} text-ink-950`}>
                More insights
              </h2>
            </div>
            <ul className="mt-10 grid gap-x-8 gap-y-16 md:grid-cols-2 lg:mt-12">
              {more.map((entry) => (
                <li key={entry.slug}>
                  <a href={journalHref(entry.slug)} className="group block">
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
                          className="object-cover"
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
          <a
            href="/insights"
            className="group inline-flex items-center gap-3 border-t border-edge-subtle pt-8 text-[0.9375rem] leading-none tracking-[-0.01em] text-secondary transition-colors duration-200 hover:text-accent"
          >
            <span
              aria-hidden
              className="transition-transform duration-300 ease-out group-hover:-translate-x-1"
            >
              ←
            </span>
            All insights
          </a>
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
