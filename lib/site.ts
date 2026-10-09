/**
 * The site's public address. Canonical links, share cards, the sitemap and
 * the structured data all point here, so it must be an address that serves
 * this app, or a share card links to an image that is not there.
 *
 * SITE_URL, when set, wins. On Vercel it is otherwise the address the
 * deployment answers at: the project's production domain in production
 * (its custom domain once one is attached, the .vercel.app one until then)
 * and the deployment's own address in a preview. Locally, localhost.
 */
function resolve() {
  if (process.env.SITE_URL) return process.env.SITE_URL;
  const vercel =
    process.env.VERCEL_ENV === "production"
      ? process.env.VERCEL_PROJECT_PRODUCTION_URL
      : process.env.VERCEL_URL;
  if (vercel) return `https://${vercel}`;
  return `http://localhost:${process.env.PORT || 3000}`;
}

export const SITE_URL = resolve().replace(/\/$/, "");

/** A path on the site as a full address. */
export const absoluteUrl = (path = "/") => new URL(path, `${SITE_URL}/`).href;
