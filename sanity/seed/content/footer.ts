/**
 * Ghost Savvy Studios — the close, and the footer under it.
 *
 * The orange band is the last thing on the page and asks one question; the
 * footer it slides off is the index. Everything either says lives here.
 */

export const email = "hello@ghostsavvy.com";

/**
 * Where else the studio is. PLACEHOLDER: the Instagram handle is read off the
 * comp; the LinkedIn company slug is a guess. Confirm both before this ships.
 */
export const social = [
  {
    id: "instagram",
    label: "Instagram",
    href: "https://www.instagram.com/ghostsavvystudios",
  },
  {
    id: "linkedin",
    label: "LinkedIn",
    href: "https://www.linkedin.com/company/ghostsavvystudios",
  },
] as const;

export const contactBand = {
  eyebrow: "Your next chapter starts here",
  heading: ["Have a good", "feeling about this?"],
  action: { label: "Let’s talk", href: "/contact" },
} as const;

export const footer = {
  explore: {
    label: "Explore",
    links: [
      { label: "Our work", href: "/work" },
      { label: "What we do", href: "/services" },
      { label: "Insights", href: "/insights" },
      { label: "Ghost Labs", href: "/ghost-labs" },
    ],
  },
  /* PLACEHOLDER — no mailing list is connected yet. The sign-up hands a
     pre-written request to the visitor's own mail app, addressed to `email`. */
  newsletter: {
    heading: "Notes from the studio, once a month.",
    placeholder: "Your email address",
    action: "Subscribe",
    subject: "Newsletter sign-up",
    note: {
      before: "By signing up you agree to our",
      link: { label: "Privacy Policy", href: "/privacy" },
      after: "We look after your data. Unsubscribe anytime.",
    },
    done: "Your mail app has the request ready. Send it and you're on the list.",
    invalid: "That doesn't look like an email address yet.",
  },
  /* PLACEHOLDER — none of these pages exist yet; each link 404s until it does. */
  legal: [
    { label: "Privacy", href: "/privacy" },
    { label: "Cookie policy", href: "/cookies" },
    { label: "Terms and conditions", href: "/terms" },
  ],
  top: "Back to top",
} as const;
