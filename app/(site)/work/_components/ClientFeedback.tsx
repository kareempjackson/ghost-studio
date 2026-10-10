import Image from "next/image";
import type { CSSProperties } from "react";
import type { ClientTestimonial } from "@/sanity/types";
import { Rich } from "../../_components/Rich";

/** 20px at 390 to 30px at 1440, held there. The client's words, set large. */
const QUOTE_STYLE: CSSProperties = {
  fontSize: "clamp(1.25rem, 1.0179rem + 0.9524vw, 1.875rem)",
  fontWeight: 400,
  letterSpacing: "-0.03em",
  lineHeight: 1.35,
};

/** "Dr. Cindi A. Lewis" → "CL": the name's words, without titles or initials. */
const initials = (name: string) => {
  const words = name.split(/\s+/).filter((word) => word && !word.endsWith("."));
  return [words[0], words[words.length - 1]]
    .filter(Boolean)
    .map((word) => word[0])
    .join("")
    .toUpperCase();
};

/**
 * What the client said, closing the case study: the label in the margin,
 * as every band's is, and the quote from three-eighths across under a
 * vermilion mark, signed with the client's portrait, name and role.
 */
export function ClientFeedback({
  testimonial,
  label,
  heading,
}: {
  testimonial: ClientTestimonial;
  label: string;
  heading: string;
}) {
  const { quote, name, role, company, portrait, portraitAlt } = testimonial;

  return (
    <section aria-labelledby="feedback-heading" className="px-5 pt-24 sm:px-8 lg:px-12 lg:pt-36">
      <div className="grid gap-y-10 rounded-[1rem] bg-[#ecede9] px-6 py-12 sm:px-10 sm:py-16 lg:grid-cols-[minmax(0,3fr)_minmax(0,5fr)] lg:gap-x-8 lg:px-[5.5rem] lg:pt-24 lg:pb-32">
        <p className="font-label text-[0.8125rem] leading-none tracking-[0.02em] text-ink-500 uppercase lg:text-[1rem]">
          {label}
        </p>

        <figure className="max-w-[60rem]">
          {/* The mark: two slanted strokes, the brand's quotation. */}
          <svg
            aria-hidden
            viewBox="0 0 44 30"
            className="h-7 w-auto text-[#eb5b32] lg:h-[1.875rem]"
            fill="currentColor"
          >
            <path d="M8 0h12L12 30H0z" />
            <path d="M30 0h12l-8 30H22z" />
          </svg>

          <p
            id="feedback-heading"
            className="mt-10 text-[0.9375rem] leading-none tracking-[-0.01em] text-ink-950 lg:mt-16"
          >
            {heading}
          </p>

          <blockquote className="mt-8 text-ink-950 lg:mt-11" style={QUOTE_STYLE}>
            &ldquo;
            <Rich value={quote} inline />
            &rdquo;
          </blockquote>

          <figcaption className="mt-10 flex items-center gap-5 lg:mt-12">
            <span className="relative grid size-14 shrink-0 place-items-center overflow-hidden rounded-full bg-ink-200 font-label text-[0.8125rem] text-ink-700 lg:size-16">
              {portrait ? (
                <Image src={portrait} alt={portraitAlt} fill sizes="64px" className="object-cover" />
              ) : (
                <span aria-hidden>{initials(name)}</span>
              )}
            </span>
            <span>
              <span className="block text-[1rem] leading-[1.3] font-medium tracking-[-0.01em] text-ink-950">
                {name}
                {role || company ? "," : ""}
              </span>
              <span className="mt-1 block text-[0.875rem] leading-[1.4] tracking-[-0.005em] text-ink-500">
                {[role, company].filter(Boolean).join(" – ")}
              </span>
            </span>
          </figcaption>
        </figure>
      </div>
    </section>
  );
}
