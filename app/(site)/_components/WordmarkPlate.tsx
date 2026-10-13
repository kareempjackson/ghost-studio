import Image from "next/image";
import type { Film } from "@/sanity/types";
import { Visual } from "./Visual";

/**
 * The plate under an inner page's cover: a picture or a film edge to edge,
 * the wordmark across it. Until the picture is in, the plate is its ground
 * colour, and says what it will show to anyone who can't see it.
 *
 * Shared by the track pages and /integrate/managed-services.
 */
export function WordmarkPlate({
  plate,
  ground,
}: {
  plate: { readonly src: string | null; readonly video: Film; readonly alt: string; readonly ground: string | null };
  /** The colour when the plate sets none. */
  ground: string;
}) {
  const shown = plate.src || plate.video;
  return (
    <div
      data-ground="dark"
      style={{ backgroundColor: plate.ground || ground }}
      className="relative aspect-[4/3] overflow-hidden sm:aspect-[16/9] lg:aspect-[1512/760]"
      {...(shown ? {} : { role: "img", "aria-label": plate.alt })}
    >
      {shown && <Visual src={plate.src} video={plate.video} alt={plate.alt} sizes="100vw" className="object-cover" />}
      <Image
        src="/logos/wordmark-flat.svg"
        alt=""
        width={923}
        height={204}
        className="absolute top-1/2 left-1/2 w-[62%] -translate-x-1/2 -translate-y-1/2 lg:w-[54%]"
      />
    </div>
  );
}
