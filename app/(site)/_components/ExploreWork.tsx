import type { HomePage, Link } from "@/sanity/types";
import { ArrowPill } from "./ArrowPill";
import { ShowreelButton } from "./ShowreelButton";

/**
 * The band under the work: the reel on the left margin, the way through on
 * the right. Two things, set as far apart as the page allows, with nothing
 * between them.
 */
export function ExploreWork({
  hero,
  workAction,
}: {
  /** The reel, its label and its mark, from the home page's hero. */
  hero: HomePage["hero"];
  workAction: Link;
}) {
  return (
    <section
      aria-label="Explore our work"
      className="relative z-10 flex flex-col items-start gap-8 bg-surface-page px-5 pt-28 pb-28 sm:flex-row sm:items-center sm:justify-between sm:px-8 lg:px-12 lg:pt-44 lg:pb-40"
    >
      <ShowreelButton
        label={hero.showreelLabel}
        mark={hero.showreelMark}
        video={hero.video}
        poster={hero.poster}
      />

      <ArrowPill href={workAction.href}>{workAction.label}</ArrowPill>
    </section>
  );
}
