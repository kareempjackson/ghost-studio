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

/** A point on a picture, 0 to 1 across and down: the hotspot an editor set. */
export interface Focus {
  readonly x: number;
  readonly y: number;
}

/**
 * Where to set a picture in a frame of another shape, as `object-position`,
 * so `focus` lands at `place` in the frame — its centre, unless asked
 * otherwise — as near as the picture allows without showing past its edges.
 * Cropping in the page rather than in the picture's address keeps it one
 * address, sized for each screen.
 *
 * `object-position` alone does not put a point anywhere — 30% sets the
 * picture's 30% line on the frame's — so the point is turned into the share
 * of the overflow to hide before it, on each axis that overflows.
 */
export function coverPosition(
  focus: Focus,
  pictureAspect: number,
  frameAspect: number,
  place: Focus = { x: 0.5, y: 0.5 },
) {
  const along = (at: number, shown: number, to: number) =>
    shown >= 1 ? 50 : Math.round(Math.min(Math.max((at - shown * to) / (1 - shown), 0), 1) * 1000) / 10;
  const x = along(focus.x, pictureAspect > frameAspect ? frameAspect / pictureAspect : 1, place.x);
  const y = along(focus.y, pictureAspect < frameAspect ? pictureAspect / frameAspect : 1, place.y);
  return `${x}% ${y}%`;
}
