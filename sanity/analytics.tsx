import { useLayoutEffect } from "react";
import { definePlugin, useClient, type LayoutProps } from "sanity";
import {
  createSeoView,
  sanityAnalyticsPlugin,
  type LighthouseDocumentTypeConfig,
  type LighthouseResolveContext,
} from "sanity-plugin-analytics";
import { FAMILY_ON_SHOW, PAGE_PATHS, insightHref, isFamilyHref, projectHref, storyHref } from "../lib/links";
import { apiVersion } from "./env";

/**
 * The Studio's Analytics tool: GA4, Search Console and Lighthouse, from
 * sanity-plugin-analytics, read through the site's routes under
 * /api/analytics (lib/studio-reports.ts). Those answer an editor only, and
 * the plugin's dashboards call them without saying who is asking, so while
 * the Studio is open each call to them carries the signed-in editor's token,
 * as sanity/lib/call-site.ts sends it to /api/r2 and /api/tailor.
 */

const ROUTES = "/api/analytics/";

/**
 * Where the site is. The Studio is served from the site's own address
 * (/studio), so it is where the Studio is; PageSpeed tests only pages there
 * (app/api/analytics/pagespeed), which rules out localhost.
 */
const siteUrl = typeof window === "undefined" ? "" : window.location.origin;

interface PageDoc {
  _id: string;
  _type: string;
  slug?: string | { current?: string };
  family?: string;
  noindex?: boolean;
  seo?: { noindex?: boolean };
  challenge?: { heading?: unknown };
  purpose?: { heading?: unknown };
}

/**
 * A document's page, as the sitemap lists it (getSitemapEntries in
 * sanity/content.ts): none for a page hidden from search engines, an
 * audience or phase without a page of its own, or the Ghost family while
 * it is off show.
 */
function pagePath(doc: PageDoc): string | null {
  if (doc.noindex || doc.seo?.noindex) return null;
  const slug = typeof doc.slug === "string" ? doc.slug : doc.slug?.current;
  const path = PAGE_PATHS[doc._id.replace(/^drafts\./, "")] ?? (slug ? slugPath(doc, slug) : null);
  return path && (FAMILY_ON_SHOW || !isFamilyHref(path)) ? path : null;
}

function slugPath(doc: PageDoc, slug: string): string | null {
  switch (doc._type) {
    case "project":
      return projectHref(slug);
    case "article":
      return insightHref(slug);
    case "audience":
      return doc.challenge?.heading ? `/who-we-serve/${slug}` : null;
    case "phase":
      return doc.purpose?.heading ? `/our-approach/${slug}` : null;
    case "familyStory":
      return doc.family ? storyHref(doc.family, slug) : null;
    case "trackPage":
    case "familyPage":
    case "legalPage":
      return `/${slug}`;
    default:
      return null;
  }
}

const resolveUrl = (doc: Record<string, unknown>, { siteUrl }: LighthouseResolveContext) => {
  const path = pagePath(doc as unknown as PageDoc);
  return path && new URL(path, `${siteUrl}/`).href;
};

/*
 * The plugin makes an address of its own from the slug field when
 * resolveUrl gives none: /{slug}, the wrong page for a project or an
 * insight. Pointed at a field no document has, it makes none.
 */
const NO_FIELD = "__none__";

/** What Lighthouse tests, and the field each is named by. */
const documentTypes: LighthouseDocumentTypeConfig[] = [
  ...Object.keys(PAGE_PATHS).map((type) => ({ type })),
  { type: "project", titleField: "name" },
  { type: "article", titleField: "title.0" },
  { type: "audience", titleField: "name.0" },
  { type: "phase" },
  { type: "trackPage" },
  { type: "legalPage" },
  ...(FAMILY_ON_SHOW ? [{ type: "familyPage" }, { type: "familyStory" }] : []),
].map((mapping) => ({ ...mapping, slugField: NO_FIELD }));

/** A project's or an insight's SEO tab: its Search Console figures and its latest Lighthouse scores. */
export const seoView = createSeoView({
  siteUrl,
  apiUrl: `${ROUTES}pagespeed`,
  searchConsoleApiUrl: `${ROUTES}search-console`,
  documentTypes,
  resolveUrl,
});

/**
 * Adds the editor's token to the dashboards' calls to /api/analytics/*,
 * and to nothing else. Set in a layout effect, which runs before any
 * dashboard's data effect does.
 */
function SignAnalyticsCalls(props: LayoutProps) {
  const token = useClient({ apiVersion }).config().token;
  useLayoutEffect(() => {
    if (!token) return;
    const own = window.fetch;
    const signed: typeof fetch = (input, init) => {
      const href = typeof input === "string" ? input : input instanceof URL ? input.href : input.url;
      const url = new URL(href, window.location.href);
      if (url.origin !== window.location.origin || !url.pathname.startsWith(ROUTES)) return own(input, init);
      const headers = new Headers(init?.headers ?? (input instanceof Request ? input.headers : undefined));
      if (!headers.has("Authorization")) headers.set("Authorization", `Bearer ${token}`);
      return own(input, { ...init, headers });
    };
    window.fetch = signed;
    return () => {
      if (window.fetch === signed) window.fetch = own;
    };
  }, [token]);
  return props.renderDefault(props);
}

const host = siteUrl.replace(/^https?:\/\//, "");

export const analytics = definePlugin({
  name: "ghost-analytics",
  studio: { components: { layout: SignAnalyticsCalls } },
  plugins: [
    sanityAnalyticsPlugin({
      title: "Analytics",
      analytics: { apiUrl: `${ROUTES}ga`, siteTitle: host },
      searchConsole: { apiUrl: `${ROUTES}search-console`, siteTitle: host },
      lighthouse: { apiUrl: `${ROUTES}pagespeed`, siteUrl, documentTypes, resolveUrl },
    }),
  ],
});
