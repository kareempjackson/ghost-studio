import type { CSSProperties } from "react";
import { MONO, SectionHead } from "./SectionHead";
import type { Rich as RichValue } from "@/sanity/types";
import { Rich } from "./Rich";

/** 28px at 390 to 38px at 1440, held there. A step in practice. */
const STEP_STYLE: CSSProperties = {
  fontSize: "clamp(1.75rem, 1.5179rem + 0.952vw, 2.375rem)",
  fontWeight: 400,
  letterSpacing: "-0.04em",
  lineHeight: 1.12,
};

const pad = (n: number) => String(n).padStart(2, "0");

/**
 * "In practice": what the team does, as numbered steps on the sunken ground.
 * Set on the phase pages and the audience pages alike.
 *
 * On a wide screen the first step holds the margin column, so the second
 * lines up under the heading and the third follows it. Each step's number,
 * title and body share rows with its neighbours', so the bodies line up
 * whatever the titles' lengths, and a step with no title keeps its place.
 */
export function Practice({
  id,
  label,
  heading,
  items,
}: {
  id: string;
  label: string;
  heading: string | readonly string[];
  items: readonly { readonly title?: string | null; readonly body: RichValue | string }[];
}) {
  return (
    <section
      aria-labelledby={id}
      className="bg-surface-sunken px-5 py-24 sm:px-8 lg:px-12 lg:py-32"
    >
      <SectionHead id={id} label={label} heading={heading} />

      <ol className="mt-16 grid gap-y-12 sm:grid-cols-2 sm:gap-x-5 lg:mt-20 lg:grid-cols-[minmax(0,3fr)_minmax(0,2.5fr)_minmax(0,2.5fr)] lg:gap-x-8">
        {items.map((step, index) => (
          <li
            key={index}
            className="lg:row-span-3 lg:grid lg:grid-rows-subgrid lg:gap-y-0"
          >
            <p className={`${MONO} text-ink-500`}>{pad(index + 1)}</p>
            {step.title ? (
              <h3
                className="mt-6 max-w-[22rem] text-primary lg:mt-8"
                style={STEP_STYLE}
              >
                {step.title}
              </h3>
            ) : (
              <span aria-hidden className="hidden lg:block" />
            )}
            <div className="mt-4 max-w-[20rem] text-[1rem] leading-[1.6] tracking-[-0.01em] text-secondary lg:mt-6">
              <Rich value={step.body} />
            </div>
          </li>
        ))}
      </ol>
    </section>
  );
}
