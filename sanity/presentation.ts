import {
  defineDocuments,
  defineLocations,
  type PresentationPluginOptions,
} from "sanity/presentation";

/**
 * Where each document shows on the site, so Presentation can open the right
 * page beside the form and the page can open the right document from a click.
 */
const at = (title: string, href: string) => ({ locations: [{ title, href }] });

const home = at("Home", "/");

export const resolve: PresentationPluginOptions["resolve"] = {
  mainDocuments: defineDocuments([
    { route: "/", filter: `_id == "homePage"` },
    { route: "/about", filter: `_id == "aboutPage"` },
    { route: "/services", filter: `_id == "servicesPage"` },
    { route: "/who-we-serve", filter: `_id == "whoWeServePage"` },
    { route: "/work", filter: `_id == "workPage"` },
    { route: "/insights", filter: `_id == "insightsPage"` },
    { route: "/contact", filter: `_id == "contactPage"` },
    { route: "/our-approach", filter: `_id == "approachPage"` },
    { route: "/our-approach/:slug", filter: `_type == "phase" && slug.current == $slug` },
    { route: "/who-we-serve/:slug", filter: `_type == "audience" && slug.current == $slug` },
    { route: "/work/:slug", filter: `_type == "project" && slug.current == $slug` },
    { route: "/journal/:slug", filter: `_type == "article" && slug.current == $slug` },
    { route: "/:slug", filter: `_type in ["trackPage", "familyPage", "legalPage"] && slug == $slug` },
  ]),
  locations: {
    homePage: defineLocations(home),
    pointOfView: defineLocations(home),
    process: defineLocations(home),
    sectors: defineLocations(home),
    testimonials: defineLocations(home),
    services: defineLocations({
      locations: [
        { title: "Home", href: "/" },
        { title: "Services", href: "/services" },
      ],
    }),
    engagement: defineLocations({
      locations: [
        { title: "Home", href: "/" },
        { title: "Services", href: "/services" },
      ],
    }),
    studioStrip: defineLocations({
      locations: [
        { title: "Services", href: "/services" },
        { title: "About", href: "/about" },
      ],
    }),
    aboutPage: defineLocations(at("About", "/about")),
    servicesPage: defineLocations({
      locations: [
        { title: "Services", href: "/services" },
        { title: "Our approach", href: "/our-approach" },
        { title: "Who we serve", href: "/who-we-serve" },
      ],
    }),
    whoWeServePage: defineLocations(at("Who we serve", "/who-we-serve")),
    workPage: defineLocations(at("Work", "/work")),
    insightsPage: defineLocations(at("Insights", "/insights")),
    contactPage: defineLocations(at("Contact", "/contact")),
    approachPage: defineLocations(at("Our approach", "/our-approach")),
    audience: defineLocations({
      select: { name: "name", slug: "slug.current" },
      resolve: (doc) => ({
        locations: [
          { title: (doc?.name as string[] | undefined)?.join(" ") || "Audience", href: `/who-we-serve/${doc?.slug}` },
          { title: "Who we serve", href: "/who-we-serve" },
        ],
      }),
    }),
    phase: defineLocations({
      select: { title: "title", slug: "slug.current" },
      resolve: (doc) => ({
        locations: [
          { title: doc?.title || "Phase", href: `/our-approach/${doc?.slug}` },
          { title: "Our approach", href: "/our-approach" },
        ],
      }),
    }),
    project: defineLocations({
      select: { title: "name", slug: "slug.current" },
      resolve: (doc) => ({
        locations: [
          { title: doc?.title || "Project", href: `/work/${doc?.slug}` },
          { title: "Work", href: "/work" },
        ],
      }),
    }),
    article: defineLocations({
      select: { title: "title.0", slug: "slug.current" },
      resolve: (doc) => ({
        locations: [
          { title: doc?.title || "Article", href: `/journal/${doc?.slug}` },
          { title: "Insights", href: "/insights" },
        ],
      }),
    }),
    ...Object.fromEntries(
      ["trackPage", "familyPage", "legalPage"].map((type) => [
        type,
        defineLocations({
          select: { title: "title", slug: "slug" },
          resolve: (doc) => ({
            locations: [{ title: doc?.title || doc?.slug || "Page", href: `/${doc?.slug}` }],
          }),
        }),
      ]),
    ),
  },
};
