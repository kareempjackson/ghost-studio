/**
 * Ghost Savvy Studios — selected work, as the home page shows it.
 *
 * The client's name goes on the card, not the discipline: the studio is
 * called Ghost for a reason. What the studio did sits underneath, small.
 *
 * PLACEHOLDER, in two parts:
 *
 * 1. Every `image` points at the hero poster. Drop the real captures into
 *    `public/media/` and change the line. Plates are cropped with
 *    object-cover at a near-square ratio.
 * 2. The comp labels the third card "Barbados Pharmaceuticals" again, but its
 *    plate is a different client's mark. `Maryann` is carried over from the
 *    earlier comp and needs confirming before this ships.
 */

const PLACEHOLDER = "/media/hero-poster.jpg";

export interface Project {
  readonly slug: string;
  /** The client, as they write it themselves. */
  readonly name: string;
  /** What the studio did, in three words or fewer. */
  readonly scope: string;
  readonly image: string;
}

export const selectedWork = {
  tag: "Selected work",
  items: [
    {
      slug: "barbados-pharmaceuticals",
      name: "Barbados Pharmaceuticals",
      scope: "Brand and digital",
      image: PLACEHOLDER,
    },
    {
      slug: "amh-project-solutions",
      name: "AMH",
      scope: "Brand and digital",
      image: PLACEHOLDER,
    },
    {
      /* PLACEHOLDER — confirm the name and slug. */
      slug: "maryann",
      name: "Maryann",
      scope: "Brand and digital",
      image: PLACEHOLDER,
    },
  ],
} as const satisfies { tag: string; items: readonly Project[] };

/** The way through to the full list, set in the band under the cards. */
export const workAction = { label: "Explore our work", href: "/work" } as const;

export const projectHref = (slug: string) => `/work/${slug}`;
