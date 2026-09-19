import Image from "next/image";
import { footer } from "@/lib/footer";
import { FooterReveal } from "./FooterReveal";

const MONO =
  "font-mono text-[0.625rem] leading-none tracking-[0.08em] uppercase";

function UpRight() {
  return (
    <svg
      aria-hidden
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="size-3 transition-transform duration-300 ease-out group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
    >
      <path d="M4.5 11.5l7-7M5.5 4.5h6v6" />
    </svg>
  );
}

/**
 * The footer, lying under the page.
 *
 * Black, and one layer below `main`: the orange close slides up off it. The
 * sign-off, the site, the studio's other work and the way in — then the
 * wordmark with the way back up and the small print beside it.
 */
export function SiteFooter() {
  return (
    <FooterReveal>
      <footer
        data-ground="dark"
        /* Tucked 32px up under the orange close, so its rounded corners always
           open onto black; the same 32px goes back on as padding. */
        className="-mt-8 bg-[#0b0b0b] px-5 pt-18 pb-8 text-white sm:px-8 lg:px-12 lg:pt-20 lg:pb-12"
      >
        <div className="grid grid-cols-2 gap-x-6 gap-y-10 lg:grid-cols-12">
          <div className="col-span-2 lg:col-span-5">
            <p className="font-mono text-[0.6875rem] leading-[1.7] tracking-[0.06em] uppercase">
              {footer.motto.map((line) => (
                <span key={line} className="block">
                  {line}
                </span>
              ))}
            </p>
            <p className="mt-4 text-[0.875rem] leading-[1.55] text-ink-400">
              {footer.summary.map((line) => (
                <span key={line} className="block">
                  {line}
                </span>
              ))}
            </p>
          </div>

          {[footer.explore, footer.more].map((group) => (
            <nav
              key={group.label}
              aria-label={group.label}
              className="lg:col-span-2"
            >
              <p className={`${MONO} text-ink-400`}>{group.label}</p>
              <ul className="mt-4 space-y-2">
                {group.links.map((link) => (
                  <li key={link.href}>
                    <a
                      href={link.href}
                      className="text-[0.9375rem] leading-[1.35] tracking-[-0.01em] transition-colors duration-200 hover:text-[#eb5b32]"
                    >
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </nav>
          ))}

          <div className="col-span-2 lg:col-span-3">
            <p className={`${MONO} text-ink-400`}>{footer.start.label}</p>
            <ul className="mt-4 space-y-3">
              {footer.start.links.map((link) => (
                <li key={link.href}>
                  <a
                    href={link.href}
                    className="group inline-flex items-center gap-1.5 border-b border-white/30 pb-1 text-[0.875rem] leading-none tracking-[-0.01em] transition-colors duration-200 hover:border-white"
                  >
                    {link.label}
                    <UpRight />
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/*
          The name and the small print share the last row: the wordmark takes
          two thirds and sits on the baseline, and the space it leaves is
          where the way back up and the credits go.
        */}
        <div className="mt-14 grid items-end gap-8 lg:mt-20 lg:grid-cols-12 lg:gap-6">
          <Image
            src="/logos/wordmark-flat.svg"
            alt="Ghost Savvy"
            width={923}
            height={204}
            className="h-auto w-full lg:col-span-8"
          />

          <div
            className={`flex items-end justify-between gap-6 text-ink-400 lg:col-span-4 lg:flex-col lg:items-end lg:justify-between lg:self-stretch ${MONO}`}
          >
            <a
              href="#"
              aria-label={footer.top}
              className="group order-last grid size-12 shrink-0 place-items-center rounded-full border border-white/20 text-white transition-colors duration-200 hover:border-white hover:bg-white hover:text-ink-950 lg:order-first lg:size-14"
            >
              <svg
                aria-hidden
                viewBox="0 0 16 16"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.4"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="size-4 transition-transform duration-300 ease-out group-hover:-translate-y-0.5"
              >
                <path d="M8 13V3M3.5 7.5 8 3l4.5 4.5" />
              </svg>
            </a>
            <p className="space-y-2 leading-[1.6] lg:text-right">
              <span className="block">{footer.signoff}</span>
              <span className="block">
                &copy; {new Date().getFullYear()} Ghostsavvy
              </span>
            </p>
          </div>
        </div>
      </footer>
    </FooterReveal>
  );
}
