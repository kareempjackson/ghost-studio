import type { Film as FilmUrl } from "@/sanity/types";
import { sanityImage } from "@/lib/sanity-image";
import { Film } from "./Film";
import { Picture } from "./Picture";

/**
 * A picture from Sanity, or the film uploaded to play in its place. Fills
 * its positioned parent, as `next/image` with `fill` does.
 *
 * With a film, the film is all that is drawn: the picture becomes its
 * poster, the frame shown before it plays and to anyone who has asked for
 * less motion. Stacking the two let the picture underneath show as a
 * hairline round the film's edges, so they are never layered. The slot it
 * fills must clip it (overflow-hidden), as every plate on the site does.
 *
 * Both wait until the reader comes near them, unless `priority` marks the
 * one at the top of the page, which is fetched first.
 */
export function Visual({
  src,
  video,
  alt,
  sizes,
  className = "object-cover",
  priority = false,
  position,
}: {
  src: string | null | undefined;
  video?: FilmUrl;
  alt: string;
  sizes: string;
  /** Classes for the picture or the film: fit, transforms. */
  className?: string;
  priority?: boolean;
  /**
   * Where the picture sits in its slot, as `object-position`: from
   * coverPosition in lib/sanity-image.ts, so a cover crop keeps the face the
   * editor marked in frame. The middle if unset. A film is framed by its own
   * export, so it takes none.
   */
  position?: string;
}) {
  const style = position ? { objectPosition: position } : undefined;
  if (video) {
    /* The film bleeds 2px past its slot on every side, which the slot
       clips: exported films often carry a dark row or two at their edges,
       and at a card's size that reads as an outline round the plate. The
       poster is one size, so it is the size of the widest screen's plate. */
    return (
      <Film
        src={video}
        poster={src ? sanityImage(src, 1920) : null}
        label={alt}
        eager={priority}
        className={`absolute -inset-[2px] h-[calc(100%+4px)] w-[calc(100%+4px)] max-w-none ${className}`}
      />
    );
  }
  if (!src) return null;
  return (
    <Picture src={src} alt={alt} fill sizes={sizes} preload={priority} className={className} style={style} />
  );
}
