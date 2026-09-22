import { footer, social } from "@/lib/footer";
import { FooterReveal } from "./FooterReveal";
import { FooterWordmark } from "./FooterWordmark";
import { NewsletterSignup } from "./NewsletterSignup";
import { SocialIcon } from "./SocialIcon";

const MONO =
  "font-mono text-[0.625rem] leading-none tracking-[0.08em] uppercase";

/**
 * The footer, lying under the page.
 *
 * Black, and one layer below `main`: the orange close slides up off it.
 * The newsletter, the site's links and where else the studio is, then the
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
            <NewsletterSignup />
          </div>

          {/* The links and the icons keep to the right-hand side of the grid. */}
          <nav
            aria-label={footer.explore.label}
            className="lg:col-span-2 lg:col-start-9"
          >
            <p className={`${MONO} text-ink-400`}>{footer.explore.label}</p>
            <ul className="mt-4 space-y-2">
              {footer.explore.links.map((link) => (
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

          <ul
            aria-label="Ghost Savvy elsewhere"
            /* The hit areas are 40px but the icons are 20px, so the row is
               pulled up and left by the difference to line up with the links. */
            className="-mt-2.5 -ml-2.5 flex self-start lg:col-span-2"
          >
            {social.map((item) => (
              <li key={item.id}>
                <a
                  href={item.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={`${item.label} (opens in a new tab)`}
                  className="grid size-10 place-items-center transition-colors duration-200 hover:text-[#eb5b32]"
                >
                  <SocialIcon id={item.id} />
                </a>
              </li>
            ))}
          </ul>
        </div>

        {/* The name, full width and sitting on the baseline of the page. */}
        <FooterWordmark />

        {/*
          The small print, as one thin rule of a row under the name: the
          credits, the legal pages and the way back up, in three equal columns
          so the middle one sits on the centre of the page.
        */}
        <div
          className={`mt-10 grid gap-x-6 gap-y-3 text-ink-500 sm:grid-cols-3 sm:items-center lg:mt-12 ${MONO}`}
        >
          <p>&copy; {new Date().getFullYear()} Ghostsavvy</p>
          <nav aria-label="Legal">
            <ul className="flex flex-wrap gap-x-5 gap-y-2 sm:justify-center">
              {footer.legal.map((link) => (
                <li key={link.href}>
                  <a
                    href={link.href}
                    className="transition-colors duration-200 hover:text-white"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
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
