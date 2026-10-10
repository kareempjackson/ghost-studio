import Link from "next/link";
import type { CSSProperties } from "react";
import type { StoryCard as StoryCardData } from "@/sanity/types";
import { Rich } from "./Rich";
import { MONO } from "./SectionHead";
import { Visual } from "./Visual";

/** 26px at 390 to 32px at 1440, held there. One story's name, or one experiment's. */
export const STORY_TITLE_STYLE: CSSProperties = {
  fontSize: "clamp(1.5rem, 1.3571rem + 0.571vw, 1.875rem)",
  fontWeight: 400,
  letterSpacing: "-0.04em",
  lineHeight: 1.1,
};

/**
 * One Ghost family story as a way into it: its plate, with its number
 * pinned in the corner and the arrow in the other, then its name and line.
 * The plate is its picture or film on its colour, or the colour alone until
 * there is one.
 *
 * The plate's shape is the caller's: the family archive's staggered plates,
 * or the two at a story's foot.
 */
export function StoryCard({
  story,
  plate,
  sizes,
  heading: Heading = "h3",
}: {
  story: StoryCardData;
  /** The plate's aspect and corner classes. The picture is cropped to it. */
  plate: string;
  sizes: string;
  heading?: "h2" | "h3";
}) {
  return (
    <Link href={story.href} className="group block">
      <div
        className={`relative overflow-hidden ${plate}`}
        style={{ backgroundColor: story.ground }}
      >
        {(story.image || story.imageVideo) && (
          <Visual
            src={story.image}
            video={story.imageVideo}
            alt={story.imageAlt}
            sizes={sizes}
            className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.03]"
          />
        )}
        <span
          className={`absolute top-5 left-5 inline-flex rounded-pill bg-white px-3.5 py-2 text-ink-950 lg:top-6 lg:left-6 ${MONO}`}
        >
          {story.eyebrow}
        </span>
        <span
          aria-hidden
          className="absolute right-5 bottom-5 grid size-11 place-items-center rounded-full bg-white text-ink-950 transition-colors duration-200 group-hover:bg-ink-950 group-hover:text-white lg:right-6 lg:bottom-6 lg:size-12"
        >
          <svg
            viewBox="0 0 16 16"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="size-4 transition-transform duration-300 ease-out group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
          >
            <path d="M4.5 11.5l7-7M5.5 4.5h6v6" />
          </svg>
        </span>
      </div>
      <Heading
        className="mt-6 text-primary transition-colors duration-200 group-hover:text-accent lg:mt-8"
        style={STORY_TITLE_STYLE}
      >
        {story.title}
      </Heading>
      <div className="mt-3 max-w-[34rem] text-[0.875rem] leading-[1.5] tracking-[-0.01em] text-secondary lg:mt-4 lg:text-[0.9375rem]">
        <Rich value={story.summary} linkless />
      </div>
    </Link>
  );
}
