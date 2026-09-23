import type { Metadata } from "next";
import type { CSSProperties } from "react";
import { contact } from "@/lib/contact";
import { ChatLauncher } from "../_components/ChatLauncher";
import { SheetTrails } from "../_components/SheetTrails";
import { SiteFooter } from "../_components/SiteFooter";
import { SiteHeader } from "../_components/SiteHeader";
import { ContactForm } from "./_components/ContactForm";
import { CopyEmail } from "./_components/CopyEmail";

export const metadata: Metadata = {
  title: "Contact",
  description:
    "A clear brief, a rough idea or a problem that needs a name. Tell Ghost Savvy Studios what you are trying to solve.",
};

/** 48px at 390 to 96px at 1440, held there. The question, asked once. */
const HEADING_STYLE: CSSProperties = {
  fontSize: "clamp(3rem, 1.6857rem + 5.39vw, 6rem)",
  fontWeight: 400,
  letterSpacing: "-0.05em",
  lineHeight: 0.96,
};

/** 30px at 390 to 44px at 1440, held there. The address, set as a headline. */
const EMAIL_STYLE: CSSProperties = {
  fontSize: "clamp(1.875rem, 1.55rem + 1.333vw, 2.75rem)",
  fontWeight: 400,
  letterSpacing: "-0.04em",
  lineHeight: 1.1,
};

const MONO =
  "font-label text-[0.6875rem] leading-none tracking-[0.06em] uppercase";

const pad = (n: number) => String(n).padStart(2, "0");

function UpRight({ className = "" }: { className?: string }) {
  return (
    <svg
      aria-hidden
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.25"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M4.5 11.5l7-7M5.5 4.5h6v6" />
    </svg>
  );
}

/**
 * `/contact` — one question, and two ways to answer it.
 *
 * The address is given first and in full, because the fastest way to reach a
 * studio is still a letter, and the form beside it is for anyone who would
 * rather be asked. Under the address: where the studio is, and what happens
 * after a message lands, so nobody has to guess what they are starting.
 *
 * The orange close band is deliberately not here. It exists to ask for this
 * page, and a page that asks for itself is furniture.
 */
export default function Contact() {
  return (
    <>
      <SiteHeader />
      {/* One layer above the footer, with its own ground: the page is the
          sheet that slides up off the footer lying underneath it. With no
          orange close here, the page itself takes the rounded bottom edge
          and the colour trailing out from under it. */}
      <div className="relative z-[1] isolate flex flex-1 flex-col">
        <SheetTrails />
        <main className="relative flex flex-1 flex-col rounded-b-[32px] bg-surface-page">
          <section
            aria-labelledby="contact-heading"
            className="px-5 pt-[calc(var(--gs-header-h)+4rem)] pb-16 sm:px-8 lg:px-12 lg:pt-[calc(var(--gs-header-h)+7rem)] lg:pb-24"
          >
            <p className={`${MONO} text-ink-950`}>{contact.eyebrow}</p>
            <h1
              id="contact-heading"
              className="mt-10 text-primary lg:mt-14"
              style={HEADING_STYLE}
            >
              {contact.heading.map((line) => (
                <span key={line} className="block">
                  {line}
                </span>
              ))}
            </h1>
            <p className="mt-10 text-[1.0625rem] leading-[1.5] tracking-[-0.01em] text-secondary lg:mt-12 lg:text-[1.25rem]">
              {contact.summary.map((line) => (
                <span key={line} className="block">
                  {line}
                </span>
              ))}
            </p>
          </section>

          <div className="grid gap-16 px-5 pb-28 sm:px-8 lg:grid-cols-2 lg:gap-12 lg:px-12 lg:pb-40">
            <div>
              <p className={`${MONO} text-ink-950`}>{contact.start.label}</p>

              <a
                href={`mailto:${contact.start.email}`}
                className="group mt-8 inline-flex items-start gap-3 text-primary transition-colors duration-200 hover:text-accent lg:mt-10"
                style={EMAIL_STYLE}
              >
                <span className="break-all">{contact.start.email}</span>
                <UpRight className="mt-[0.35em] size-[0.5em] shrink-0 transition-transform duration-300 ease-out group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
              </a>

              <div className="mt-8">
                <CopyEmail />
              </div>

              <div className="mt-16 lg:mt-20">
                <p className={`${MONO} text-ink-500`}>{contact.base.label}</p>
                <p className="mt-5 text-[1rem] leading-[1.55] tracking-[-0.01em] text-primary">
                  {contact.base.lines.map((line) => (
                    <span key={line} className="block">
                      {line}
                    </span>
                  ))}
                </p>
              </div>

              <div className="mt-16 lg:mt-20">
                <h2 className={`${MONO} text-ink-500`}>{contact.next.label}</h2>
                <ol className="mt-6 border-t border-edge-subtle">
                  {contact.next.steps.map((step, index) => (
                    <li
                      key={step}
                      className="flex items-baseline gap-6 border-b border-edge-subtle py-5"
                    >
                      <span className={`${MONO} shrink-0 text-ink-500`}>
                        {pad(index + 1)}
                      </span>
                      <span className="text-[1rem] leading-[1.45] tracking-[-0.01em] text-primary">
                        {step}
                      </span>
                    </li>
                  ))}
                </ol>
              </div>
            </div>

            <ContactForm />
          </div>
        </main>
      </div>
      <SiteFooter />
      <ChatLauncher />
    </>
  );
}
