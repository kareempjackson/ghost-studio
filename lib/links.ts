/**
 * Where things live on the site. The content says what a thing is called;
 * these say where it is, so a route is spelled once.
 */

export const projectHref = (slug: string) => `/work/${slug}`;

export const journalHref = (slug: string) => `/journal/${slug}`;

/** The anchor on /services a discipline's card opens onto. */
export const serviceHref = (slug: string) => `/services#${slug}`;

/** The way in from a discipline, carrying what the reader was reading. */
export const serviceEnquiryHref = (slug: string) => `/contact?need=${slug}`;

/** An audience's anchor on /who-we-serve, from its name: "funded-startups-and-founders". */
export const audienceSlug = (audience: { readonly name: readonly string[] }) =>
  audience.name
    .join(" ")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
