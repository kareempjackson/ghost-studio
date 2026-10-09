import { objectTypes } from "./objects";
import { article, insightTopic, project } from "./documents/collections";
import {
  aboutPage,
  approachPage,
  audience,
  phase,
  contactPage,
  familyPage,
  insightsPage,
  legalPage,
  servicesPage,
  trackPage,
  whoWeServePage,
  workPage,
} from "./documents/pages";
import {
  engagement,
  homePage,
  pointOfView,
  processSection,
  sectors,
  services,
  studioStrip,
  testimonials,
} from "./documents/sections";
import { chat, footer, navigation, siteSettings } from "./documents/site";

export const schemaTypes = [
  ...objectTypes,
  siteSettings,
  navigation,
  footer,
  chat,
  homePage,
  pointOfView,
  processSection,
  services,
  engagement,
  sectors,
  testimonials,
  studioStrip,
  aboutPage,
  servicesPage,
  whoWeServePage,
  workPage,
  insightsPage,
  contactPage,
  trackPage,
  familyPage,
  legalPage,
  approachPage,
  phase,
  audience,
  project,
  article,
  insightTopic,
];

/** One document each, at a fixed id: the Studio lists them, never creates more. */
export const singletons = [
  { type: "siteSettings", title: "Site settings" },
  { type: "navigation", title: "Navigation" },
  { type: "footer", title: "Footer" },
  { type: "chat", title: "Chat" },
  { type: "homePage", title: "Home page" },
  { type: "pointOfView", title: "Point of view" },
  { type: "process", title: "Process" },
  { type: "services", title: "Services" },
  { type: "engagement", title: "Ways to work together" },
  { type: "sectors", title: "Sectors" },
  { type: "testimonials", title: "Testimonials" },
  { type: "studioStrip", title: "Studio strip" },
  { type: "aboutPage", title: "About" },
  { type: "servicesPage", title: "Services page" },
  { type: "whoWeServePage", title: "Who we serve" },
  { type: "workPage", title: "Work page" },
  { type: "insightsPage", title: "Insights page" },
  { type: "contactPage", title: "Contact page" },
  { type: "approachPage", title: "Our approach" },
] as const;

/** Types with one document per fixed route; ids are `${type}-${slug}`. */
export const fixedPages = [
  { type: "trackPage", title: "Track pages", slugs: ["build", "engage", "integrate"] },
  { type: "familyPage", title: "Family pages", slugs: ["ghost-labs", "ghost-u", "ghost-gives"] },
  { type: "legalPage", title: "Legal pages", slugs: ["privacy", "terms", "cookies"] },
] as const;
