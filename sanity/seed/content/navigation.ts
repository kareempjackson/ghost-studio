/**
 * Ghost Savvy Studios — the site, in order.
 *
 * One list, read two ways: the header takes the four routes that fit beside
 * the mark, and the menu takes all of them — with "Work with us" opening onto
 * the three ways to buy, "Who we serve" onto the six kinds of client (read
 * off lib/who-we-serve.ts, so the menu and the page cannot disagree), and the
 * studio's ventures in a smaller group below. Keeping both off the same
 * array is the only way the two navigations cannot disagree about what a
 * route is called — which is the failure the brand system exists to stop.
 *
 * The numbers in the menu are positional. They are not stored here, because
 * a number that can drift from its position is a number worth deleting.
 */

import { audienceSlug } from "@/lib/links";
import { whoWeServePage } from "./who-we-serve";

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
  /** A heading and a line of introduction over the routes, when they open. */
  readonly intro?: { readonly label: string; readonly deck: string };
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
  {
    label: "Who we serve",
    href: "/who-we-serve",
    inHeader: false,
    intro: {
      label: "Different needs. A shared starting point",
      deck: "Find the work that fits your organisation",
    },
    children: whoWeServePage.audiences.items.map((audience) => ({
      label: audience.name.join(" "),
      href: `/who-we-serve#${audienceSlug(audience)}`,
    })),
  },
  { label: "About us", href: "/about", inHeader: true },
  { label: "Insights", href: "/insights", inHeader: false },
  { label: "Contact us", href: "/contact", inHeader: true },
];

export interface VentureLink extends NavLink {
  /** The pill's colour in the menu, and the ink set on it. */
  readonly ground: string;
  readonly ink: string;
}

/** The studio's other ventures: a row of pills at the foot of the menu. */
export const ventureNavigation = {
  label: "More from Ghost Savvy",
  links: [
    { label: "Ghost Labs", href: "/ghost-labs", ground: "#0e0d0b", ink: "#ffffff" },
    { label: "Ghost Gives", href: "/ghost-gives", ground: "#63e3c2", ink: "#0e0d0b" },
    { label: "Ghost U", href: "/ghost-u", ground: "#ebe3fa", ink: "#0e0d0b" },
  ],
} as const satisfies { label: string; links: readonly VentureLink[] };

/** The menu's bottom-right corner: one way to start a conversation. */
export const menuContact = { label: "Have something in mind?" } as const;

/** The label over the one piece of work the menu carries. */
export const menuFeatureLabel = "Selected work";

export const headerNavigation: readonly NavItem[] = siteNavigation.filter(
  (item) => item.inHeader,
);
