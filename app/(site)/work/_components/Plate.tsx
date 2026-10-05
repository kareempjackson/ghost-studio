import Image from "next/image";
import type { Media } from "@/sanity/types";
import { PlateFilm } from "./PlateFilm";

const ASPECT = {
  landscape: "aspect-[3/2]",
  wide: "aspect-[16/9]",
  portrait: "aspect-[4/5]",
} as const;

/** What shows until the picture is in. */
const PAPER = "#edebe7";

/**
 * One plate of a case study: the picture, cropped to the plate's shape, with
 * the film over it when there is one. Until either is in, the plate is its
 * ground, at the size the picture will be, so the page keeps its rhythm.
 */
export function Plate({
  media,
  sizes,
  priority = false,
}: {
  media: Media;
  sizes: string;
  priority?: boolean;
}) {
  return (
    <div
      role={media.src || media.video ? undefined : "presentation"}
      className={`relative overflow-hidden rounded-[0.75rem] ${ASPECT[media.aspect] ?? ASPECT.landscape}`}
      style={{ backgroundColor: media.ground || PAPER }}
    >
      {media.src && (
        <Image
          src={media.src}
          alt={media.video ? "" : media.alt}
          fill
          sizes={sizes}
          priority={priority}
          className="object-cover"
        />
      )}
      {media.video && <PlateFilm src={media.video} label={media.alt} />}
    </div>
  );
}

/** Rows of plates: one across the page, or two side by side. */
export function PlateRows({ rows }: { rows: readonly (readonly Media[])[] }) {
  return (
    <div className="space-y-5 px-5 sm:px-8 lg:space-y-6 lg:px-12">
      {rows.map((row, index) => (
        <div
          key={index}
          className={`grid gap-5 lg:gap-6 ${row.length > 1 ? "sm:grid-cols-2" : ""}`}
        >
          {row.map((media, i) => (
            <Plate
              key={i}
              media={media}
              sizes={row.length > 1 ? "(min-width: 640px) 50vw, 100vw" : "100vw"}
            />
          ))}
        </div>
      ))}
    </div>
  );
}
