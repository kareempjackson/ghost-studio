import { positioning } from "@/lib/brand";
import { workAction } from "@/lib/work";
import { ArrowPill } from "./ArrowPill";

/**
 * The band under the work: the sign-off on the left margin, the way through
 * on the right. Two things, set as far apart as the page allows, with nothing
 * between them.
 */
export function ExploreWork() {
  return (
    <section
      aria-label="Explore our work"
      className="relative z-10 flex flex-col items-start gap-8 bg-surface-page px-5 pt-28 pb-28 sm:flex-row sm:items-center sm:justify-between sm:px-8 lg:px-12 lg:pt-44 lg:pb-40"
    >
      <p className="font-mono text-[0.75rem] leading-[1.6] tracking-[0.06em] text-primary uppercase sm:text-[0.8125rem]">
        {positioning.motto.map((line) => (
          <span key={line} className="block">
            {line}
          </span>
        ))}
      </p>

      <ArrowPill href={workAction.href}>{workAction.label}</ArrowPill>
    </section>
  );
}
