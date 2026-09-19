/**
 * Ghost Savvy Studios — the site, in order.
 *
 * One list, read two ways: the header takes the four routes that fit beside
 * the mark, and the menu takes all six and numbers them. Keeping both off the
 * same array is the only way the two navigations cannot disagree about what
 * a route is called — which is the failure the brand system exists to stop.
 *
 * The numbers in the menu are positional. They are not stored here, because
 * a number that can drift from its position is a number worth deleting.
 */

export interface NavItem {
  readonly label: string;
  readonly href: string;
  /** True when the route also sits inline in the header on wide viewports. */
  readonly inHeader: boolean;
}

export const siteNavigation = [
  { label: "Work", href: "/work", inHeader: true },
  { label: "Services", href: "/services", inHeader: true },
  { label: "Who we serve", href: "/who-we-serve", inHeader: false },
  { label: "About us", href: "/about", inHeader: true },
  { label: "Insights", href: "/insights", inHeader: false },
  { label: "Contact us", href: "/contact", inHeader: true },
] as const satisfies readonly NavItem[];

export const headerNavigation: readonly NavItem[] = siteNavigation.filter(
  (item) => item.inHeader
);
