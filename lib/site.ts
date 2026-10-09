/**
 * The site's public address. Canonical links, share cards, the sitemap and
 * the structured data all point here, wherever the site is being served
 * from. Set SITE_URL to change it, e.g. for a staging domain.
 */
export const SITE_URL = (process.env.SITE_URL || "https://www.ghostsavvy.com").replace(/\/$/, "");

/** A path on the site as a full address. */
export const absoluteUrl = (path = "/") => new URL(path, `${SITE_URL}/`).href;
