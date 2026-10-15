"use client";

import Image, { type ImageLoader, type ImageProps } from "next/image";
import { isSanityImage, isSizable, sanityImage } from "@/lib/sanity-image";

const sanityLoader: ImageLoader = ({ src, width, quality }) => sanityImage(src, width, quality);

/**
 * `next/image`, with Sanity's pictures fetched from Sanity's CDN at the width
 * each screen draws them (lib/sanity-image.ts) rather than through Next's
 * optimiser. One whose address already sizes it — a portrait, an SVG logo —
 * is drawn as it is. Anything else, the site's own files, is Next's as usual.
 *
 * Lazy, like `next/image`, unless `preload` or `loading="eager"` says not.
 */
export function Picture({ alt, ...props }: ImageProps) {
  const src = typeof props.src === "string" ? props.src : "";
  if (isSizable(src)) return <Image alt={alt} {...props} loader={sanityLoader} />;
  if (isSanityImage(src)) return <Image alt={alt} {...props} unoptimized />;
  return <Image alt={alt} {...props} />;
}
