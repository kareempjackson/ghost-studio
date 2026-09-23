"use client";

import type { CSSProperties } from "react";
import { contactBand, email } from "@/lib/footer";
import { SheetTrails } from "./SheetTrails";

/** 44px at 390 to 80px at 1440, held there. */
const HEADING_STYLE: CSSProperties = {
  fontSize: "clamp(2.75rem, 1.9143rem + 3.429vw, 5rem)",
  fontWeight: 400,
  letterSpacing: "-0.06em",
  lineHeight: 0.98,
};

/**
 * The close: one question on vermilion, and one way to answer it.
 *
 * It sits after `main`, directly over the footer lying underneath, so its
 * rounded bottom corners open onto the footer rather than onto the page. It
 * is the sheet that slides up off the footer, and while it moves, colour
 * trails out from under its bottom edge.
 */
export function ContactBand() {
  return (
    <div className="relative z-[1] isolate">
      <SheetTrails />
      <section
        aria-labelledby="contact-heading"
        className="relative rounded-b-[32px] bg-[#eb5b32] px-5 pt-14 pb-14 text-ink-950 sm:px-8 lg:px-12 lg:pt-16 lg:pb-16"
      >
        <p className="font-label text-[0.75rem] leading-none tracking-[0.06em] uppercase">
          {contactBand.eyebrow}
        </p>

        <div className="mt-8 flex flex-col gap-10 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h2 id="contact-heading" style={HEADING_STYLE}>
              {contactBand.heading.map((line) => (
                <span key={line} className="block">
                  {line}
                </span>
              ))}
            </h2>
            <a
              href={`mailto:${email}`}
              className="mt-8 inline-block border-b border-ink-950 pb-1 text-[1.125rem] leading-none tracking-[-0.02em] transition-opacity duration-200 hover:opacity-70 lg:text-[1.25rem]"
            >
              {email}
            </a>
          </div>

          {/* The one control: a black disc, the arrow leaning into the hover. */}
          <a
            href={contactBand.action.href}
            className="group grid size-36 shrink-0 place-content-center justify-items-center gap-4 self-end rounded-full bg-[#111] text-white transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] hover:scale-[1.04] lg:mb-2 lg:size-36"
          >
            <svg
              aria-hidden
              viewBox="0 0 48 32"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="h-7 w-10 transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:translate-x-1.5 group-hover:-translate-y-1"
            >
              <path d="M3 22 44 10M30 4l14 6-6 14" />
            </svg>
            <span className="font-label text-[0.75rem] leading-none tracking-[0.08em] uppercase">
              {contactBand.action.label}
            </span>
          </a>
        </div>
      </section>
    </div>
  );
}
