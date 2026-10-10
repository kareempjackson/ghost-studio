/**
 * Where things live on the site. The content says what a thing is called;
 * these say where it is, so a route is spelled once.
 */

export const projectHref = (slug: string) => `/work/${slug}`;

/** An insight's own page. The journal band on the home page links here too. */
export const insightHref = (slug: string) => `/insights/${slug}`;

/** The anchor on /services a discipline's card opens onto. */
export const serviceHref = (slug: string) => `/services#${slug}`;

/** The way in from a discipline, carrying what the reader was reading. */
export const serviceEnquiryHref = (slug: string) => `/contact?need=${slug}`;

/**
 * The Ghost family: the pages where the studio works beyond the brief. Each
 * lives at /{slug}, with its stories under it.
 */
export const families = [
  { slug: "ghost-labs", title: "Ghost Labs" },
  { slug: "ghost-u", title: "Ghost U" },
  { slug: "ghost-gives", title: "Ghost Gives" },
] as const;

export type FamilySlug = (typeof families)[number]["slug"];

/** A story's own page, under its family: /ghost-labs/low-signal. */
export const storyHref = (family: string, slug: string) => `/${family}/${slug}`;

/** An audience's anchor on /who-we-serve, from its name: "funded-startups-and-founders". */
export const audienceSlug = (audience: { readonly name: readonly string[] }) =>
  audience.name
    .join(" ")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
