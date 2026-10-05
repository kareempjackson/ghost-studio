/**
 * Every read the site makes, one function per document.
 *
 * Each query projects its document into the shape in sanity/types.ts, so a
 * component reads the same fields it always has. Pictures come back as CDN
 * URLs. Every query is tagged with the document types it reads, which is
 * what the revalidation webhook expires.
 */

import "server-only";

import { sanityFetch } from "./lib/live";
import { stegaClean } from "next-sanity";
import type {
  AboutPage,
  ApproachPage,
  AudiencePage,
  Chapter,
  Media,
  Project,
  PhasePage,
  ArticleCard,
  ArticleDetail,
  Chat,
  Chrome,
  ContactPage,
  Engagement,
  FamilyPageData,
  Footer,
  HomePage,
  InsightsPage,
  LegalDocument,
  Navigation,
  PointOfView,
  Process,
  ProjectDetail,
  Sectors,
  Services,
  ServicesPage,
  SiteSettings,
  StudioStrip,
  Testimonials,
  TrackPageData,
  WhoWeServePage,
  WorkPage,
} from "./types";

/* ---- Projections ----------------------------------------------------------- */

const url = (field: string) => `${field}.asset->url`;
const pic = (field: string) => `{"src": ${url(field)}, "alt": coalesce(${field}.alt, "")}`;
const link = `{label, href}`;

/* Reference lists skip anything unpublished or deleted
   (`[defined(@->slug.current)]`), so a page never renders a null. */
const PROJECT = `{
  "slug": slug.current,
  name, scope, tagline, location, sector,
  "disciplines": coalesce(disciplines, []),
  ground,
  "image": ${url("image")},
  "imageAlt": coalesce(image.alt, "")
}`;

const ARTICLE = `{
  "slug": slug.current,
  topic, title, excerpt,
  "cover": {"src": ${url("cover.image")}, "alt": coalesce(cover.image.alt, ""), "ground": coalesce(cover.ground, "#e7e6e1")}
}`;

const PHASE = `{
  "slug": slug.current, title, question,
  "image": {"src": image.asset->url, "alt": coalesce(image.alt, "")},
  "hasPage": defined(purpose.heading)
}`;

const AUDIENCE = `{
  "slug": slug.current, name, body,
  "hasPage": defined(challenge.heading)
}`;

const MEDIA = `{
  "src": image.asset->url,
  "alt": coalesce(image.alt, ""),
  "video": video.asset->url,
  ground,
  "aspect": coalesce(aspect, "landscape")
}`;

const SEO = `"title": coalesce(title, ""), "description": coalesce(description, "")`;
const COVER = `eyebrow, heading, summary, action${link}`;
const STEPS = `items[]{title, body}`;

/** A document by its fixed id: singletons are stored at their type's name. */
async function single<T>(id: string, projection: string, tags: string[]): Promise<T> {
  const data = await sanityFetch({
    query: `*[_id == $id][0]${projection}`,
    params: { id },
    tags: [id, ...tags],
  });
  if (!data) {
    throw new Error(`Sanity has no "${id}" document yet. Run npm run seed.`);
  }
  return data as T;
}

/* ---- Site ------------------------------------------------------------------ */

export const getSettings = () =>
  single<SiteSettings>(
    "siteSettings",
    `{title, description, email, social[]{id, label, href}, headerAction${link}}`,
    [],
  );

export async function getNavigation(): Promise<Navigation> {
  const data = await single<
    Omit<Navigation, "items"> & {
      items: (Navigation["items"][number] & { audiences?: boolean })[];
      audiences: { name: string[]; slug: string; hasPage: boolean }[];
    }
  >(
    "navigation",
    `{
      items[]{label, href, "inHeader": coalesce(inHeader, false), audiences, "intro": select(defined(intro.label) => intro{label, deck}), "children": children[]${link}},
      ventures{label, links[]{label, href, ground, ink}},
      contactLabel, featureLabel, openLabel,
      "feature": *[_id == "homePage"][0].selectedWork.projects[defined(@->slug.current)][0]->${PROJECT},
      "network": *[_id == "servicesPage"][0].method.network{alt, "nodes": coalesce(nodes[]{x, y, r, "src": ${url("image")}}, [])},
      "audiences": coalesce(*[_id == "whoWeServePage"][0].audiences.items[defined(@->slug.current)]->${AUDIENCE}, [])
    }`,
    ["homePage", "whoWeServePage", "audience", "servicesPage", "project"],
  );

  const { audiences, items, ...rest } = data;
  return {
    ...rest,
    /* An item set to open onto the audiences lists them, so the menu and
       /who-we-serve cannot disagree about who the studio works with. Each
       goes to its own page once it has one, and to its place on the list
       until then. */
    items: items.map(({ audiences: opens, children, intro, ...item }) => {
      const list = opens
        ? audiences.map((audience) => ({
            label: audience.name.join(" "),
            href: audience.hasPage
              ? `/who-we-serve/${audience.slug}`
              : `/who-we-serve#${audience.slug}`,
          }))
        : children;
      return {
        ...item,
        ...(intro ? { intro } : {}),
        ...(list?.length ? { children: list } : {}),
      };
    }),
  };
}

export const getFooter = () =>
  single<Footer>(
    "footer",
    `{
      contactBand{eyebrow, heading, action${link}},
      explore{label, links[]${link}},
      newsletter{heading, placeholder, inputLabel, action, subject, note{before, link${link}, after}, done, invalid},
      legal[]${link},
      top
    }`,
    [],
  );

export const getChat = () => single<Chat>("chat", `{...}`, []);

export async function getChrome(): Promise<Chrome> {
  const [settings, navigation, footer, chat] = await Promise.all([
    getSettings(),
    getNavigation(),
    getFooter(),
    getChat(),
  ]);
  return { settings, navigation, footer, chat };
}

/* ---- Bands ----------------------------------------------------------------- */

export const getHomePage = () =>
  single<HomePage>(
    "homePage",
    `{
      hero{"video": video.asset->url, "poster": ${url("poster")}, showreelLabel, showreelMark},
      claim{cover, motto},
      methodology{heading, difference},
      selectedWork{tag, "items": projects[defined(@->slug.current)]->${PROJECT}, action${link}},
      journal{
        eyebrow, heading,
        "featured": featured{
          label, action,
          ...article->{"slug": slug.current, "category": topic, title, "summary": excerpt},
          "image": {
            "src": coalesce(${url("image")}, ${url("article->cover.image")}),
            "alt": coalesce(image.alt, article->cover.image.alt, "")
          }
        },
        "entries": entries[defined(@->slug.current)]->{
          "slug": slug.current, "category": topic, title, excerpt,
          "cover": {"src": ${url("cover.image")}, "alt": coalesce(cover.image.alt, ""), "ground": coalesce(cover.ground, "#e7e6e1")}
        }
      }
    }`,
    ["project", "article"],
  );

export const getPointOfView = () =>
  single<PointOfView>(
    "pointOfView",
    `{eyebrow, heading, deck, action${link}, cards[]{label, statement, action, ground, tilt}}`,
    [],
  );

export const getProcess = () =>
  single<Process>(
    "process",
    `{mark, steps[]{title, short, question, body, outputs, icon}}`,
    [],
  );

export const getServices = () =>
  single<Services>(
    "services",
    `{eyebrow, cta, items[]{slug, name, promise, capabilities, action}}`,
    [],
  );

export const getEngagement = () =>
  single<Engagement>(
    "engagement",
    `{
      chip, title, subtitle,
      "image": {
        "src": ${url("image")},
        "width": image.asset->metadata.dimensions.width,
        "height": image.asset->metadata.dimensions.height,
        "alt": coalesce(image.alt, "")
      },
      models[]{slug, name, kind, copy, audience, terms, action${link}}
    }`,
    [],
  );

export const getSectors = () =>
  single<Sectors>(
    "sectors",
    `{eyebrow, items[]{slug, name, work, "image": ${url("image")}}}`,
    [],
  );

export const getTestimonials = () =>
  single<Testimonials>(
    "testimonials",
    `{eyebrow, heading, deck, label, items[]{quote, name, role, company}, controls}`,
    [],
  );

export const getStudioStrip = () =>
  single<StudioStrip>(
    "studioStrip",
    `{label, "tee": ${pic("tee")}, principle{label, statement, source}, "tote": ${pic("tote")}}`,
    [],
  );

/* ---- Pages ----------------------------------------------------------------- */

export const getAboutPage = () =>
  single<AboutPage>(
    "aboutPage",
    `{
      ${SEO}, ${COVER},
      who{label, heading, deck, body},
      team{label, heading, deck, portraitLabel, members[]{name, role, "portrait": ${url("portrait")}, ground}},
      expect{label, heading, ${STEPS}},
      family{label, heading, members[]{name, statement, href}}
    }`,
    [],
  );

export const getServicesPage = () =>
  single<ServicesPage>(
    "servicesPage",
    `{
      ${SEO}, ${COVER},
      ways{label, heading, deck},
      disciplines{label, heading, deck},
      method{label, heading, copy, action${link}, network{alt, nodes[]{x, y, r, "src": ${url("image")}}}}
    }`,
    [],
  );

export const getWhoWeServePage = () =>
  single<WhoWeServePage>(
    "whoWeServePage",
    `{${SEO}, ${COVER}, audiences{label, heading, deck, "items": items[defined(@->slug.current)]->${AUDIENCE}}}`,
    ["audience"],
  );

export const getWorkPage = () =>
  single<WorkPage>(
    "workPage",
    `{
      ${SEO}, heading, summary,
      "projects": [
        ...coalesce(projects[defined(@->slug.current)]->${PROJECT}, []),
        ...*[_type == "project" && defined(slug.current) && !(_id in ^.projects[]._ref)] | order(_createdAt desc) ${PROJECT}
      ],
      all, previewLabel, empty,
      close{eyebrow, heading, action${link}},
      caseStudy{back, overview, readMore, readLess, visit, listHeading, partsLabel, more{label, heading, action${link}}}
    }`,
    ["project"],
  );

export const getInsightsPage = () =>
  single<InsightsPage>(
    "insightsPage",
    `{
      ${SEO}, eyebrow, heading, summary, status, all, filterLabel, empty,
      "articles": *[_type == "article" && defined(slug.current)] | order(publishedAt desc) ${ARTICLE}
    }`,
    ["article"],
  );

export const getContactPage = () =>
  single<ContactPage>(
    "contactPage",
    `{
      ${SEO}, eyebrow, heading, summary,
      "start": start{label, copy, copied, "email": *[_id == "siteSettings"][0].email},
      base{label, lines},
      next{label, steps},
      form
    }`,
    ["siteSettings"],
  );

export const getApproachPage = () =>
  single<ApproachPage>(
    "approachPage",
    `{
      ${SEO}, ${COVER},
      "plate": {"src": ${url("plate.image")}, "alt": coalesce(plate.image.alt, ""), "ground": plate.ground},
      start{label, heading, deck, body},
      phases{label, heading, itemLabel, pageEyebrow, "items": items[defined(@->slug.current)]->${PHASE}},
      "network": *[_id == "servicesPage"][0].method.network{alt, "nodes": coalesce(nodes[]{x, y, r, "src": ${url("image")}}, [])}
    }`,
    ["servicesPage", "phase"],
  );

/** The phases with a page of their own. */
export async function getPhaseSlugs(): Promise<string[]> {
  return sanityFetch({
    query: `*[_type == "phase" && defined(slug.current) && defined(purpose.heading)].slug.current`,
    tags: ["phase"],
  }) as Promise<string[]>;
}

/**
 * A phase's page. Its number, eyebrow and the pills come from where it sits
 * in the approach page's list, so reordering the phases there renumbers
 * every page. Null for a phase with no page yet.
 */
export async function getPhasePage(slug: string): Promise<PhasePage | null> {
  const data = await sanityFetch({
    query: `*[_id == "approachPage"][0]{
      "phases": phases.items[defined(@->slug.current)]->${PHASE},
      "itemLabel": phases.itemLabel,
      "pageEyebrow": phases.pageEyebrow,
      "page": *[_type == "phase" && slug.current == $slug && defined(purpose.heading)][0]{
        "slug": slug.current,
        "title": title,
        "description": coalesce(description, question),
        "heading": coalesce(heading, [title]),
        question,
        "action": select(defined(action.href) => action${link}),
        "plate": {"src": ${url("plate.image")}, "alt": coalesce(plate.image.alt, ""), "ground": plate.ground},
        purpose{label, heading, deck},
        "practice": select(count(practice.items) > 0 => practice{label, heading, "items": items[]{title, body}}),
        "outputs": select(count(outputs.items) > 0 => outputs{label, heading, deck, items})
      },
      "network": *[_id == "servicesPage"][0].method.network{alt, "nodes": coalesce(nodes[]{x, y, r, "src": ${url("image")}}, [])}
    }`,
    params: { slug },
    tags: ["approachPage", "phase", "servicesPage"],
  });
  const result = data as {
    phases: PhasePage["phases"];
    itemLabel: string;
    pageEyebrow: string;
    page: Omit<PhasePage, "eyebrow" | "phases" | "network"> | null;
    network: PhasePage["network"];
  } | null;
  if (!result?.page) return null;

  const index = result.phases.findIndex((phase) => phase.slug === slug);
  const number = index < 0 ? "" : ` ${String(index + 1).padStart(2, "0")}`;
  return {
    ...result.page,
    eyebrow: `${result.pageEyebrow} / ${result.itemLabel}${number}`,
    phases: result.phases,
    network: result.network,
  };
}

/** The audiences with a page of their own. */
export async function getAudienceSlugs(): Promise<string[]> {
  return sanityFetch({
    query: `*[_type == "audience" && defined(slug.current) && defined(challenge.heading)].slug.current`,
    tags: ["audience"],
  }) as Promise<string[]>;
}

/** An audience's page; null for one with no page yet. */
export async function getAudiencePage(slug: string): Promise<AudiencePage | null> {
  return sanityFetch({
    query: `*[_type == "audience" && slug.current == $slug && defined(challenge.heading)][0]{
      "slug": slug.current,
      "title": array::join(name, " "),
      "description": coalesce(description, summary, body),
      "eyebrow": *[_id == "whoWeServePage"][0].eyebrow,
      name,
      "heading": coalesce(heading, name),
      "summary": coalesce(summary, body),
      "action": select(defined(action.href) => action${link}),
      "plate": {"src": ${url("plate.image")}, "alt": coalesce(plate.image.alt, ""), "ground": plate.ground},
      challenge{label, heading, deck},
      "practice": select(count(practice.items) > 0 => practice{label, heading, "items": items[]{"title": title, body}}),
      "outputs": select(count(outputs.items) > 0 => outputs{label, heading, items}),
      "network": *[_id == "servicesPage"][0].method.network{alt, "nodes": coalesce(nodes[]{x, y, r, "src": ${url("image")}}, [])}
    }`,
    params: { slug },
    tags: ["audience", "whoWeServePage", "servicesPage"],
  }) as Promise<AudiencePage | null>;
}

/** A document of a type with one per fixed route, stored at `${type}-${slug}`. No dot: Sanity treats a dotted id as private, hidden from tokenless reads. */
const fixed = <T,>(type: string, slug: string, projection: string, tags: string[] = []) =>
  single<T>(`${type}-${slug}`, projection, [type, ...tags]);

export const getTrackPage = (slug: string) =>
  fixed<TrackPageData>(
    "trackPage",
    slug,
    `{
      slug, ${SEO}, ${COVER},
      "plate": {"src": ${url("plate.image")}, "alt": coalesce(plate.image.alt, ""), "ground": plate.ground},
      terms{price, minimum, compare${link}},
      who{label, heading, deck},
      shape{label, heading, ${STEPS}},
      process{label, heading, ${STEPS}},
      questions{label, heading, items[]{question, answer}},
      others{label}
    }`,
  );

export const getFamilyPage = (slug: string) =>
  fixed<FamilyPageData>(
    "familyPage",
    slug,
    `{
      "href": "/" + slug, ${SEO},
      cover{heading, summary, action${link}, notes[]{text, ground}, "card": ${pic("card")}},
      archive{label, heading, deck, items[]{title, body, ground}},
      ask{label, heading, summary, action${link}},
      family{label, heading}
    }`,
  );

export const getLegalPage = (slug: string) =>
  fixed<LegalDocument>(
    "legalPage",
    slug,
    `{slug, ${SEO}, updated, intro, contentsLabel, sections[]{id, title, "paragraphs": coalesce(paragraphs, []), list}}`,
  );

/* ---- Projects and articles -------------------------------------------------- */

export async function getProjectSlugs(): Promise<string[]> {
  return sanityFetch({
    query: `*[_type == "project" && defined(slug.current)].slug.current`,
    tags: ["project"],
  }) as Promise<string[]>;
}

/**
 * A project's page. The "more work" at its foot is what the project names,
 * or else the next two on /work, wrapping round, so every page ends on
 * somewhere to go.
 */
export async function getProject(slug: string): Promise<ProjectDetail | null> {
  const data = (await sanityFetch({
    query: `{
      "project": *[_type == "project" && slug.current == $slug][0]{
        ...@${PROJECT},
        description,
        "hero": select(defined(hero) => hero${MEDIA}),
        "logo": ${pic("logo")},
        "headline": coalesce(headline, tagline),
        "facts": coalesce(facts[]{label, value}, []),
        "tags": coalesce(tags, []),
        "overview": coalesce(overview, []),
        website,
        "feature": select(defined(feature) => feature${MEDIA}),
        "chapters": coalesce(chapters[]{
          label, heading,
          "body": coalesce(body, []),
          listHeading,
          "items": coalesce(items[]{lead, text}, []),
          "rows": coalesce(media[]{"items": coalesce(items[]${MEDIA}, [])}, [])
        }, []),
        "more": coalesce(more[defined(@->slug.current)]->${PROJECT}, [])
      },
      "order": *[_id == "workPage"][0]{"list": [
        ...coalesce(projects[defined(@->slug.current)]->${PROJECT}, []),
        ...*[_type == "project" && defined(slug.current) && !(_id in ^.projects[]._ref)] | order(_createdAt desc) ${PROJECT}
      ]}.list
    }`,
    params: { slug },
    tags: ["project", "workPage"],
  })) as {
    project:
      | (Omit<ProjectDetail, "chapters"> & {
          chapters: (Omit<Chapter, "id" | "media"> & { rows: { items: Media[] }[] })[];
        })
      | null;
    order: Project[];
  };
  if (!data.project) return null;

  const { project, order } = data;
  const at = order.findIndex((p) => p.slug === slug);
  const others = [...order.slice(at + 1), ...order.slice(0, Math.max(at, 0))].filter(
    (p) => p.slug !== slug,
  );

  return {
    ...project,
    chapters: project.chapters.map(({ rows, ...chapter }) => ({
      ...chapter,
      id: anchor(chapter.label),
      media: rows.map((row) => row.items).filter((items) => items.length),
    })),
    more: project.more.length ? project.more : others.slice(0, 2),
  };
}

/** "Brand identity" → "brand-identity": a part's place on the page. */
const anchor = (label: string) =>
  stegaClean(label)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

export async function getArticleSlugs(): Promise<string[]> {
  return sanityFetch({
    query: `*[_type == "article" && defined(slug.current)].slug.current`,
    tags: ["article"],
  }) as Promise<string[]>;
}

export async function getArticle(slug: string): Promise<ArticleDetail | null> {
  return sanityFetch({
    query: `*[_type == "article" && slug.current == $slug][0]{
      ...@${ARTICLE},
      publishedAt,
      description,
      body[]{..., _type == "image" => {..., "src": asset->url, "width": asset->metadata.dimensions.width, "height": asset->metadata.dimensions.height}}
    }`,
    params: { slug },
    tags: ["article"],
  }) as Promise<ArticleDetail | null>;
}

/** The other articles, for the foot of an article. */
export async function getMoreArticles(slug: string): Promise<ArticleCard[]> {
  return sanityFetch({
    query: `*[_type == "article" && defined(slug.current) && slug.current != $slug] | order(publishedAt desc)[0...2] ${ARTICLE}`,
    params: { slug },
    tags: ["article"],
  }) as Promise<ArticleCard[]>;
}
