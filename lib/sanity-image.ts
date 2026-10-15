/**
 * Pictures from Sanity, sized by Sanity.
 *
 * Sanity keeps every picture at the size it was uploaded — a 2MB PNG, a
 * 4000px photograph. Its CDN will resize and re-encode any of them by its
 * address, and keeps the result at the edge, so the browser can ask it for
 * the width it will draw, in the smallest format it reads (AVIF or WebP).
 * Next's own optimiser would fetch the original to our server and encode it
 * there first, which is slow every time a size is asked for fresh.
 */

const CDN = "https://cdn.sanity.io/images/";

/** A picture on Sanity's CDN. */
export const isSanityImage = (src: string) => src.startsWith(CDN);

/**
 * Whether Sanity can size it: a raster picture whose address doesn't already
 * crop or size it (a portrait's does). An SVG is drawn as it is.
 */
export const isSizable = (src: string) =>
  isSanityImage(src) && !src.includes("?") && !src.endsWith(".svg");

/**
 * The picture at `width`, never wider than it was uploaded, in the browser's
 * best format. Anything Sanity can't size comes back as it was.
 */
export function sanityImage(src: string, width: number, quality = 75) {
  return isSizable(src) ? `${src}?w=${width}&q=${quality}&fit=max&auto=format` : src;
}
