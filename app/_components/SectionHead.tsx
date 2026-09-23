import type { CSSProperties, ReactNode } from "react";

/** 36px at 390 to 76px at 1440, held there. Every band heading on the page. */
export const BAND_STYLE: CSSProperties = {
  fontSize: "clamp(2.25rem, 1.3214rem + 3.81vw, 4.75rem)",
  fontWeight: 500,
  letterSpacing: "-0.045em",
  lineHeight: 1.02,
};

export const MONO =
  "font-label text-[0.6875rem] leading-none tracking-[0.06em] uppercase";

/**
 * The head of a band: what it is, small, in the margin; what it says, large,
 * from three-eighths across. The margin column is the same on every band and
 * every inner page, so the headings line up down the page and across the site.
 *
 * `heading` as an array sets one line per entry, for the comps that break it.
 * Anything passed as children follows the deck in the same column.
 */
export function SectionHead({
  id,
  label,
  heading,
  deck,
  children,
}: {
  id: string;
  label: string;
  heading: string | readonly string[];
  deck?: string;
  children?: ReactNode;
}) {
  return (
    <div className="grid gap-y-8 lg:grid-cols-[minmax(0,3fr)_minmax(0,5fr)] lg:gap-x-8">
      <p className={`${MONO} text-ink-500 lg:pt-5`}>{label}</p>
      <div>
        <h2 id={id} className="text-primary" style={BAND_STYLE}>
          {typeof heading === "string"
            ? heading
            : heading.map((line) => (
                <span key={line} className="block">
                  {line}
                </span>
              ))}
        </h2>
        {deck && (
          <p className="mt-6 max-w-[34rem] text-[1.0625rem] leading-[1.55] tracking-[-0.01em] text-secondary lg:mt-8 lg:text-[1.125rem]">
            {deck}
          </p>
        )}
        {children}
      </div>
    </div>
  );
}
