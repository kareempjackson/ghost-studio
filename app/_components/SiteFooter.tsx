import { footer } from "@/lib/footer";
import { FooterReveal } from "./FooterReveal";
import { FooterWordmark } from "./FooterWordmark";

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

        {/* The name, full width and sitting on the baseline of the page. */}
        <FooterWordmark />

        {/*
          The small print, as one thin rule of a row under the name: the
          credits, the sign-off and the way back up, in three equal columns
          so the middle one sits on the centre of the page.
        */}
        <div
          className={`mt-10 grid gap-x-6 gap-y-3 text-ink-500 sm:grid-cols-3 sm:items-center lg:mt-12 ${MONO}`}
        >
          <p>&copy; {new Date().getFullYear()} Ghostsavvy</p>
          <p className="sm:text-center">{footer.signoff}</p>
          <a
            href="#"
            className="group inline-flex items-center gap-1.5 transition-colors duration-200 hover:text-white sm:justify-self-end"
          >
            {footer.top}
            <svg
              aria-hidden
              viewBox="0 0 16 16"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="size-2.5 transition-transform duration-300 ease-out group-hover:-translate-y-0.5"
            >
              <path d="M8 13V3M3.5 7.5 8 3l4.5 4.5" />
            </svg>
          </a>
        </div>
      </footer>
    </FooterReveal>
  );
}
