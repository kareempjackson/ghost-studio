/**
 * Ghost Savvy Studios — the site, in order.
 *
 * One list, read two ways: the header takes the four routes that fit beside
 * the mark, and the menu takes all of them — with "Work with us" opening onto
 * the three ways to buy, and the studio's ventures in a smaller group below. Keeping both off the
 * same array is the only way the two navigations cannot disagree about what
 * a route is called — which is the failure the brand system exists to stop.
 *
 * The numbers in the menu are positional. They are not stored here, because
 * a number that can drift from its position is a number worth deleting.
 */

export interface NavLink {
  readonly label: string;
  readonly href: string;
}

export interface NavItem extends NavLink {
  /** True when the route also sits inline in the header on wide viewports. */
  readonly inHeader: boolean;
  /**
   * Routes that sit under this one. In the menu the item becomes a toggle
   * that opens them in place; `href` is where the group itself lives.
   */
  readonly children?: readonly NavLink[];
}

export const siteNavigation: readonly NavItem[] = [
  { label: "Work", href: "/work", inHeader: true },
  { label: "Services", href: "/services", inHeader: true },
  { label: "Our approach", href: "/our-approach", inHeader: false },
  {
    label: "Work with us",
    href: "/services",
    inHeader: false,
    children: [
      { label: "Build", href: "/build" },
      { label: "Engage", href: "/engage" },
      { label: "Integrate", href: "/integrate" },
    ],
  },
  { label: "Who we serve", href: "/who-we-serve", inHeader: false },
  { label: "About us", href: "/about", inHeader: true },
  { label: "Insights", href: "/insights", inHeader: false },
  { label: "Contact us", href: "/contact", inHeader: true },
];

/** The studio's other ventures: a smaller group under the menu's routes. */
export const ventureNavigation = {
  label: "More from Ghost Savvy",
  links: [
    { label: "Ghost Labs", href: "/ghost-labs" },
    { label: "Ghost Gives", href: "/ghost-gives" },
    { label: "Ghost U", href: "/ghost-u" },
  ],
} as const satisfies { label: string; links: readonly NavLink[] };

export const headerNavigation: readonly NavItem[] = siteNavigation.filter(
  (item) => item.inHeader,
);
