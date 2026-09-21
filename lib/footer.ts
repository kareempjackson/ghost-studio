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
  motto: ["Independent minds.", "Shared ambition."],
  summary: [
    "Strategy, design and engineering.",
    "Built together. Built to last.",
  ],
  explore: {
    label: "Explore",
    links: [
      { label: "Our work", href: "/work" },
      { label: "What we do", href: "/services" },
      { label: "Journal", href: "/journal" },
    ],
  },
  more: {
    label: "More from Ghost Savvy",
    links: [
      { label: "Ghost Labs", href: "/labs" },
      { label: "Ghost Gives", href: "/gives" },
      { label: "Ghost U", href: "/u" },
    ],
  },
  start: {
    label: "Let’s make a start",
    links: [
      { label: "Tell us about your project", href: "/contact" },
      { label: "Send an email", href: `mailto:${email}` },
    ],
  },
  signoff: "Built to be handed over.",
  top: "Back to top",
} as const;
