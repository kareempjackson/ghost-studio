/**
 * Where things live on the site. The content says what a thing is called;
 * these say where it is, so a route is spelled once.
 */

export const projectHref = (slug: string) => `/work/${slug}`;

/** An insight's own page. The journal band on the home page links here too. */
export const insightHref = (slug: string) => `/insights/${slug}`;

/**
 * Whether a link in the navigation is for where the reader is, as
 * aria-current takes it: "page" on the page itself, "true" in the section it
 * heads, so Work stays marked on a project. An anchor or another site is
 * never current, and nothing is while the address is not yet known.
 */
export function currentFor(pathname: string | null, href: string): "page" | "true" | undefined {
  if (!pathname || !href.startsWith("/") || href.includes("#")) return undefined;
  const path = href.split("?")[0].replace(/(.)\/$/, "$1");
  if (pathname === path) return "page";
  return path !== "/" && pathname.startsWith(`${path}/`) ? "true" : undefined;
}

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

/** A story's own page, under its family: /ghost-labs/vynl. */
export const storyHref = (family: string, slug: string) => `/${family}/${slug}`;

/** An audience's anchor on /who-we-serve, from its name: "funded-startups-and-founders". */
export const audienceSlug = (audience: { readonly name: readonly string[] }) =>
  audience.name
    .join(" ")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
