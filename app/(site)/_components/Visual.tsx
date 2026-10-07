import Image from "next/image";
import type { Film as FilmUrl } from "@/sanity/types";
import { Film } from "./Film";

/**
 * A picture from Sanity, or the film uploaded to play in its place. Fills
 * its positioned parent, as `next/image` with `fill` does.
 *
 * With a film, the film is all that is drawn: the picture becomes its
 * poster, the frame shown before it plays and to anyone who has asked for
 * less motion. Stacking the two let the picture underneath show as a
 * hairline round the film's edges, so they are never layered. The slot it
 * fills must clip it (overflow-hidden), as every plate on the site does.
 */
export function Visual({
  src,
  video,
  alt,
  sizes,
  className = "object-cover",
  priority = false,
}: {
  src: string | null | undefined;
  video?: FilmUrl;
  alt: string;
  sizes: string;
  /** Classes for the picture or the film: fit, transforms. */
  className?: string;
  priority?: boolean;
}) {
  if (video) {
    /* The film bleeds 2px past its slot on every side, which the slot
       clips: exported films often carry a dark row or two at their edges,
       and at a card's size that reads as an outline round the plate. */
    return (
      <Film
        src={video}
        poster={src}
        label={alt}
        className={`absolute -inset-[2px] h-[calc(100%+4px)] w-[calc(100%+4px)] max-w-none ${className}`}
      />
    );
  }
  if (!src) return null;
  return <Image src={src} alt={alt} fill sizes={sizes} priority={priority} className={className} />;
}
