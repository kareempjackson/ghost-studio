import Image from "next/image";
import type { CSSProperties } from "react";
import { studioStrip } from "@/lib/studio-strip";

/** 40px at 390 to 64px at 1440, held there. The line on the principle. */
const PRINCIPLE_STYLE: CSSProperties = {
  fontSize: "clamp(2.5rem, 1.9429rem + 2.286vw, 4rem)",
  fontWeight: 500,
  letterSpacing: "-0.05em",
  lineHeight: 1,
};

/** The principle's ground: the vermilion the point-of-view cards are dealt on. */
const VERMILION = "#eb5b32";

export const LABEL =
  "text-[0.6875rem] leading-none tracking-[0.02em] uppercase sm:text-[0.75rem]";

/**
 * The strip under an inner page's cover: two things the studio made, the
 * principle between them. Edge to edge, so it reads as a wall and not as a
 * gallery.
 */
export function StudioStrip() {
  const { tee, principle, tote } = studioStrip;

  return (
    <section
      aria-label={studioStrip.label}
      className="grid gap-3 sm:grid-cols-2 lg:h-[31.5vw] lg:grid-cols-[minmax(0,1.55fr)_minmax(0,1fr)_minmax(0,1.17fr)] lg:gap-5"
    >
      <div className="relative aspect-[4/3] overflow-hidden bg-ink-100 sm:col-span-2 lg:col-span-1 lg:aspect-auto">
        <Image
          src={tee.src}
          alt={tee.alt}
          fill
          sizes="(min-width: 1024px) 41vw, 100vw"
          className="object-cover"
        />
      </div>

      <figure
        style={{ backgroundColor: VERMILION }}
        className="flex aspect-square flex-col p-6 text-ink-950 sm:aspect-auto lg:p-7"
      >
        <p className={LABEL}>{principle.label}</p>
        <blockquote className="my-auto py-10" style={PRINCIPLE_STYLE}>
          {principle.statement.map((line) => (
            <span key={line} className="block">
              {line}
            </span>
          ))}
        </blockquote>
        <figcaption className={LABEL}>{principle.source}</figcaption>
      </figure>

      <div
        className="relative aspect-square overflow-hidden bg-[#1a1111] sm:aspect-auto sm:min-h-[20rem] lg:min-h-0"
        {...(tote.src ? {} : { role: "img", "aria-label": tote.alt })}
      >
        {/* PLACEHOLDER — the comp sets the “Work over noise” tote here. */}
        {tote.src && (
          <Image
            src={tote.src}
            alt={tote.alt}
            fill
            sizes="(min-width: 1024px) 31vw, (min-width: 640px) 50vw, 100vw"
            className="object-cover"
          />
        )}
      </div>
    </section>
  );
}
